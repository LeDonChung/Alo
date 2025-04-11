import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native';
import { axiosInstance } from '../../../api/APIClient';
import { setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice';
import socket from '../../../utils/socket';
import { getMessagesByConversationId, sendMessage, setMessages } from '../../redux/slices/MessageSlice';
import HeaderComponent from '../../components/chat/HeaderComponent';
import InputComponent  from '../../components/chat/InputComponent';
import  MessageItem  from '../../components/chat/MessageItem';
import ImageViewerComponent  from '../../components/chat/ImageViewComponent';

import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import StickerPicker from '../../components/chat/StickerPicker';

import Icon from 'react-native-vector-icons/MaterialIcons';

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

    await dispatch(sendMessage({ message, file })).then((res) => {
      dispatch(setMessages([...messages, res.payload.data]));
      message.sender = userLogin;
      socket.emit('send-message', {
        conversation: conversation,
        message: message
      });
      setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
    });
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
    console.log("conversationId", conversation);
    console.log("friend", friend.id);
    console.log("userOnlines", userOnlines);
    console.log("userLogin", userLogin);
    console.log("isFriendOnline", isFriendOnline(friend.id));
    console.log("messages", messages);
  }, [conversation, friend, userOnlines]);

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
      <FlatList
        data={messageSort}
        renderItem={({ item, index }) => (
          <MessageItem
            item={item}
            index={index}
            messageSort={messageSort}
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
        handlerSendMessage={handlerSendMessage}
      />
      {isStickerPickerVisible && (
        <StickerPicker onStickerSelect={handleStickerSelect} />
      )}
      
    </View>
  );
};

export default ChatScreen;