import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native';
import { axiosInstance } from '../../../api/APIClient';
import { setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice';
import socket from '../../../utils/socket';
import { getMessagesByConversationId, sendMessage, setMessages } from '../../redux/slices/MessageSlice';
import HeaderComponent from '../../components/chat/HeaderComponent';
import InputComponent from '../../components/chat/InputComponent';
import MessageItem from '../../components/chat/MessageItem';
import ImageViewerComponent from '../../components/chat/ImageViewComponent';

import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import StickerPicker from '../../components/chat/StickerPicker';
import { ActivityIndicator } from 'react-native-paper';


export const ChatScreen = ({ route, navigation }) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isStickerPickerVisible, setIsStickerPickerVisible] = useState(false); // State cho StickerPicker
  const isLoadMessage = useSelector(state => state.message.isLoadMessage);
  const limit = useSelector(state => state.message.limit);
  const messages = useSelector(state => state.message.messages);
  const [inputMessage, setInputMessage] = useState({
    messageType: 'text',
    content: '',
  });
  const [lastLogout, setLastLogout] = useState(null);
  const { conversation, friend } = route.params;
  const userLogin = useSelector(state => state.user.userLogin);
  const userOnlines = useSelector(state => state.user.userOnlines);
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none"
      }
    });
    return () => navigation.getParent()?.setOptions({
      tabBarStyle: undefined
    });
  }, [navigation]);

  const isFriendOnline = (userId) => {
    return userOnlines.includes(userId);
  };

  const handlerSendMessage = async () => {
    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content: inputMessage.content,
      messageType: inputMessage.messageType,
      fileLink: inputMessage.fileLink,
      timestamp: Date.now(),
      seen: []
    };

    const file = inputMessage.file;

    console.log('file', file);

    await dispatch(sendMessage({ message, file })).then((res) => {
      dispatch(setMessages([...messages, res.payload.data]));
      socket.emit('send-message', {
        conversation: conversation,
        message: res.payload.data
      });
      setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
    });
  };

  const handleSendImage = async (newMessage) => {
    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content: newMessage.content,
      messageType: newMessage.messageType,
      fileLink: newMessage.fileLink,
      timestamp: Date.now(),
      seen: []
    };
    const file = newMessage.file;

    await dispatch(sendMessage({ message, file })).then((res) => {
      const sentMessage = {
        ...res.payload.data,
        sender: userLogin
      }
      dispatch(setMessages([...messages, sentMessage]));
      socket.emit('send-message', {
        conversation: conversation,
        message: sentMessage
      });
    }
    );
    setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
  }

  const handleSendFile = async (file) => {
    console.log('file chat', file.uri);
    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content: '',
      messageType: 'file',
      fileLink: file.uri,
      timestamp: Date.now(),
      seen: []
    };
   
    await dispatch(sendMessage({ message, file })).then((res) => {
      const sentMessage = {
        ...res.payload.data,
        sender: userLogin
      }
      dispatch(setMessages([...messages, sentMessage]));
      socket.emit('send-message', {
        conversation: conversation,
        message: sentMessage
      });
    });
    setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
  };

  const handleStickerSelect = async (stickerUrl) => {
    dispatch(setInputMessage({ ...inputMessage, fileLink: stickerUrl, messageType: 'sticker' }))
    setShowStickerPicker(false);
  };

  useEffect(() => {
    if (inputMessage.messageType === 'sticker') {
      handlerSendMessage(inputMessage);
    }
  }, [inputMessage]);

  useEffect(() => {
    socket.on('receive-message', (message) => {
      dispatch(setMessages([...messages, message]));
    });
  }, [messages, dispatch]);


  useEffect(() => {
    socket.on("users-online", ({ userIds }) => {
      dispatch(setUserOnlines(userIds));
    });
  }, []);

  useEffect(() => {
    dispatch(getMessagesByConversationId(conversation.id));
  }, [conversation.id, limit, dispatch]);

  const getLastLoginMessage = (lastLogout) => {
    if (!lastLogout) return 'Chưa truy cập';
    const now = new Date();
    const logoutTime = new Date(lastLogout);
    const diffInMs = now - logoutTime;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHours = Math.floor(diffInMin / 60);

    if (diffInSec < 60) return `Truy cập ${diffInSec} giây trước`;
    if (diffInMin < 60) return `Truy cập ${diffInMin} phút trước`;
    if (diffInHours < 24) return `Truy cập ${diffInHours} giờ trước`;
    return `Truy cập ${logoutTime.toLocaleDateString('vi-VN')}`;
  };

  const handleGetLastLogout = async (userId) => {
    await axiosInstance.get(`/api/user/get-profile/${userId}`).then((res) => {
      setLastLogout(res.data.data.lastLogout);
    });
  };

  useEffect(() => {
    socket.emit("join_conversation", conversation.id);

    if (!conversation.isGroup) {
      const friend = conversation.memberUserIds.find((member) => member !== userLogin.id);
      handleGetLastLogout(friend);
    }

    return () => {
      socket.emit("leave_conversation", conversation.id);
    };
  }, [conversation, userLogin.id]);

  const [messageSort, setMessageSort] = useState([]);

  useEffect(() => {
    const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp); // Sắp xếp từ mới đến cũ
    setMessageSort(sortedMessages);
  }, [messages]);

  const showAvatar = (index) => {
    if (index === messageSort.length - 1) return true;

    const nextMessage = messageSort[index + 1];
    if (!nextMessage) return true;

    return nextMessage.senderId !== messageSort[index].senderId;
  };

  const showTime = (index) => {
    if (index === messageSort.length - 1) return false;

    const nextMessage = messageSort[index - 1];
    if (!nextMessage) return true;

    return nextMessage.senderId !== messageSort[index].senderId;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <HeaderComponent
        friend={friend}
        isFriendOnline={isFriendOnline}
        getLastLoginMessage={getLastLoginMessage}
        lastLogout={lastLogout}
        navigation={navigation}
        socket={socket}
        conversation={conversation}
        userLogin={userLogin}
      />
      {
        isLoadMessage ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={messageSort}
            renderItem={({ item, index }) => (
              <MessageItem
                item={item}
                userLogin={userLogin}
                friend={friend}
                setSelectedImage={setSelectedImage}
                setIsImageViewVisible={setIsImageViewVisible}
                showAvatar={() => showAvatar(index)}
                showTime={() => showTime(index)}
              />
            )}
            keyExtractor={(item, index) => item.id?.toString() || item.timestamp?.toString() || index.toString()}
            contentContainerStyle={{ paddingVertical: 10 }}
            inverted
          />
        )
      }
      <ImageViewerComponent
        isImageViewVisible={isImageViewVisible}
        selectedImage={selectedImage}
        setIsImageViewVisible={setIsImageViewVisible}
      />
      <InputComponent
        setIsStickerPickerVisible={setIsStickerPickerVisible}
        isStickerPickerVisible={isStickerPickerVisible}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handlerSendMessage={handleSendImage}
        handleSendFile={handleSendFile}
      />
      {isStickerPickerVisible && (
        <StickerPicker onStickerSelect={handleStickerSelect} />
      )}

    </View>
  );
};

export default ChatScreen;