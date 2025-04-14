import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Pressable, View } from 'react-native';
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
import { MenuComponent } from '../../components/chat/MenuConponent';
import { showToast } from '../../../utils/AppUtils';
import { removePin } from '../../redux/slices/ConversationSlice';


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
  const { friend } = route.params;
  const userLogin = useSelector(state => state.user.userLogin);
  const userOnlines = useSelector(state => state.user.userOnlines);
  const dispatch = useDispatch();

  const conversation = useSelector(state => state.conversation.conversation);
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

  const handlerSendMessage = async (customInputMessage = null) => {
    const messageData = customInputMessage || inputMessage;
    const { content, messageType, file } = messageData;

    // Lấy fileLink nếu có
    const fileLink = messageData.fileLink || (file ? file.uri : '');

    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content,
      messageType,
      fileLink,
      timestamp: Date.now(),
      seen: []
    };

    try {
      const response = await dispatch(sendMessage({ message, file })).then((res) => {
        const sentMessage = {
          ...res.payload.data,
          sender: userLogin
        };

        dispatch(setMessages([...messages, sentMessage]));
        socket.emit('send-message', {
          conversation,
          message: sentMessage
        });

      })


    } catch (err) {
      console.error("Error sending message:", err);
    }
    setInputMessage({ content: '', messageType: 'text', fileLink: '', file: null });

  };


  const handleSendImage = async (newMessage) => {
    handlerSendMessage(newMessage);
  };
  const handleSendFile = async (newMessage) => {
    console.log("newMessage", newMessage);
    handlerSendMessage(newMessage);
  };
  const handleStickerSelect = async (stickerUrl) => {
    dispatch(setInputMessage({ ...inputMessage, fileLink: stickerUrl, messageType: 'sticker' }))
    setShowStickerPicker(false);
  };

  useEffect(() => {
    if (inputMessage.messageType === 'sticker') {
      if (inputMessage.fileLink) {
        handlerSendMessage();
      }
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

  const [isShowMenuInMessage, setIsShowMenuInMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const showTime = (index) => {
    if (index === messageSort.length - 1) return false;

    const nextMessage = messageSort[index - 1];
    if (!nextMessage) return true;

    return nextMessage.senderId !== messageSort[index].senderId;
  };


  const [highlightedId, setHighlightedId] = useState(null);
  const flatListRef = useRef(null);
  const scrollToMessage = (messageId) => {
    const index = messageSort.findIndex(msg => msg.id === messageId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });

      setHighlightedId(messageId);

      setTimeout(() => {
        setHighlightedId(null);
      }, 3000);

    }
  };

  useEffect(() => {
    socket.emit('login', userLogin?.id);
  }, [userLogin?.id, dispatch]);

  const onDeletePin = async (pin) => {
    try {
      await dispatch(removePin({ conversationId: conversation.id, messageId: pin.messageId })).then((res) => {
        socket.emit("unpin-pin", {
          conversation: conversation,
          pin: res.payload.data
        });
        showToast('success', 'bottom', "Thông báo", res.payload.message)

      })

    } catch (error) {
      showToast('error', 'bottom', "Thông báo", error.message)
    }
  }
  return (

    <View style={{ flex: 1, backgroundColor: '#F3F3F3', position: 'relative' }}>
      <HeaderComponent
        friend={friend}
        isFriendOnline={isFriendOnline}
        getLastLoginMessage={getLastLoginMessage}
        lastLogout={lastLogout}
        navigation={navigation}
        socket={socket}
        conversation={conversation}
        userLogin={userLogin}
        scrollToMessage={scrollToMessage}
        onDeletePin={onDeletePin}
      />
      {
        isLoadMessage ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
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
                setIsShowMenuInMessage={setIsShowMenuInMessage}
                setSelectedMessage={setSelectedMessage}
                isHighlighted={highlightedId === item.id}
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
        handlerSendMessage={handlerSendMessage}
        handleSendFile={handleSendFile}
        handlerSendImage={handleSendImage}
      />
      {isStickerPickerVisible && (
        <StickerPicker onStickerSelect={handleStickerSelect} />
      )}

      {
        isShowMenuInMessage && (
          <Modal
            visible={isShowMenuInMessage}
            transparent={true}
            animationType="none"
          >
            <Pressable
              style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setIsShowMenuInMessage(false)}
            >
              <MenuComponent
                message={selectedMessage}
                showMenuComponent={setIsShowMenuInMessage}
              />
            </Pressable>
          </Modal>
        )
      }
    </View>
  );
};

export default ChatScreen;