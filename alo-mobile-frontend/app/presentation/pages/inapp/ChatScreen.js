import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Pressable, View } from 'react-native';
import { axiosInstance } from '../../../api/APIClient';
import { setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice';
import socket from '../../../utils/socket';
import {
  addMessage,
  getMessagesByConversationId,
  handlerUpdateReaction,
  removeAllReaction,
  seenAll,
  seenOne,
  sendMessage,
  updateMessage,
  setMessageParent,
  updateSeenAllMessage
} from '../../redux/slices/MessageSlice';
import { removePin } from '../../redux/slices/ConversationSlice';
import HeaderComponent from '../../components/chat/HeaderComponent';
import InputComponent from '../../components/chat/InputComponent';
import MessageItem from '../../components/chat/MessageItem';
import ImageViewerComponent from '../../components/chat/ImageViewComponent';
import { FlatList } from 'react-native-gesture-handler';
import StickerPicker from '../../components/chat/StickerPicker';
import { ActivityIndicator } from 'react-native-paper';
import { getFriend, showToast } from '../../../utils/AppUtils';
import { MenuComponent } from '../../components/chat/MenuConponent';
import MessageDetailModal from '../../components/chat/MessageDetailModal';
import ForwardMessageModal from '../../components/chat/ForwardMessageModal';

export const ChatScreen = ({ route, navigation }) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isStickerPickerVisible, setIsStickerPickerVisible] = useState(false);
  const isLoadMessage = useSelector(state => state.message.isLoadMessage);
  const messages = useSelector(state => state.message.messages);
  const messageParent = useSelector(state => state.message.messageParent);
  const [inputMessage, setInputMessage] = useState({
    messageType: 'text',
    content: '',
  });
  const [lastLogout, setLastLogout] = useState(null);
  const userLogin = useSelector(state => state.user.userLogin);
  const userOnlines = useSelector(state => state.user.userOnlines);
  const dispatch = useDispatch();

  const conversation = useSelector(state => state.conversation.conversation);
  const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id));

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

    const requestId = Date.now() + Math.random();

    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content,
      messageType,
      timestamp: Date.now(),
      seen: [],
      requestId,
      status: -1,
    };

    if (messageParent) {
      if (messageParent.status === 1) {
        showToast('error', 'bottom', 'Thông báo', 'Tin nhắn gốc đã bị thu hồi, không thể trả lời.', 2000);
        dispatch(setMessageParent(null));
        return;
      }
      message.messageParent = messageParent.id;
    }

    const newMessageTemp = {
      ...message,
      sender: userLogin,
    };

    if (messageParent) {
      newMessageTemp.messageParent = messageParent;
    }

    if (messageType === 'file' || messageType === 'image') {
      newMessageTemp.fileLink = file.uri;
    } else if (messageType === 'sticker') {
      newMessageTemp.fileLink = messageData.fileLink;
      message.fileLink = messageData.fileLink;
    }

    try {
      dispatch(addMessage(newMessageTemp));
      dispatch(setMessageParent(null));
      setInputMessage({ content: '', messageType: 'text', fileLink: '', file: null });

      const res = await dispatch(sendMessage({ message, file })).unwrap();
      const sentMessage = {
        ...res.data,
        sender: userLogin,
      };


      socket.emit('send-message', {
        conversation,
        message: sentMessage,
      });

      dispatch(updateMessage(sentMessage));

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSendImage = async (newMessage) => {
    handlerSendMessage(newMessage);
  };

  const handleSendFile = async (newMessage) => {
    console.log("newMessage", newMessage);
    handlerSendMessage(newMessage);
  };

  const handleStickerSelect = async (stickerUrl) => {
    const newMessage = {
      content: '',
      messageType: 'sticker',
      fileLink: stickerUrl,
    };
    handlerSendMessage(newMessage);
    setIsStickerPickerVisible(false);
  };

  useEffect(() => {
    const handlerReceiveMessage = async (message) => {
      console.log("MESSAGE", message);
      dispatch(addMessage(message));
      await dispatch(seenOne(message.id)).unwrap().then((res) => {
        const data = res.data;
        socket.emit('seen-message', {
          messages: [data],
          conversation: conversation
        });
      });
    };
    socket.on('receive-message', handlerReceiveMessage);

    return () => {
      socket.off('receive-message', handlerReceiveMessage);
    };
  }, [conversation.id]);

  useEffect(() => {
    socket.on("users-online", ({ userIds }) => {
      dispatch(setUserOnlines(userIds));
    });
  }, []);

  useEffect(() => {
    const handlerInitMessage = async () => {
      await dispatch(getMessagesByConversationId(conversation.id)).unwrap().then(async (res) => {
        console.log("hi");
        const unseenMessages = res.data.filter((message) => {
          const seen = message.seen || [];
          return !seen.some((seenUser) => seenUser.userId === userLogin.id);
        }).map((message) => message.id);

        if (unseenMessages.length > 0) {
          await dispatch(seenAll(unseenMessages)).unwrap().then((res) => {
            const data = res.data;
            dispatch(updateSeenAllMessage(data));
            socket.emit('seen-message', {
              messages: data,
              conversation: conversation
            });
          });
        }
      });
    };

    handlerInitMessage();
  }, []);

  useEffect(() => {
    const handleGetLastLogoutX = async (userId) => {
      if (userId === friend.id) {
        console.log('getLastLogout', userId);
        await handleGetLastLogout(userId);
      }
    };
    socket.on('user-offline', handleGetLastLogoutX);

    return () => {
      socket.off('user-offline', handleGetLastLogoutX);
    };
  }, []);

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
    const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);
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
        socket.emit("unpin-message", {
          conversation: conversation,
          pin: res.payload.data
        });
        showToast('success', 'bottom', "Thông báo", res.payload.message);
      });
    } catch (error) {
      showToast('error', 'bottom', "Thông báo", error.message);
    }
  };

  const handlerRemoveAllAction = (message) => {
    try {
      const updatedReaction = {};

      Object.entries(message.reaction || {}).forEach(([type, data]) => {
        const filteredUsers = data.users.filter(userId => userId !== userLogin.id);
        const quantity = filteredUsers.length;

        if (quantity > 0) {
          updatedReaction[type] = {
            quantity,
            users: filteredUsers
          };
        }
      });

      console.log("Reaction after removing all of mine:", updatedReaction);

      dispatch(handlerUpdateReaction({
        messageId: message.id,
        updatedReaction
      }));

      dispatch(removeAllReaction({
        messageId: message.id,
      }))
        .unwrap()
        .then(res => {
          socket.emit('update-reaction', {
            conversation,
            message: res.data
          });
        })
        .catch(err => {
          console.error("Error while removing all reactions:", err);
        });
    } catch (error) {
      console.error("Error in handlerRemoveAllAction:", error);
    }
  };

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F3F3', position: 'relative' }}>
      <HeaderComponent
        isFriendOnline={isFriendOnline}
        getLastLoginMessage={getLastLoginMessage}
        lastLogout={lastLogout}
        scrollToMessage={scrollToMessage}
        onDeletePin={onDeletePin}
      />
      {isLoadMessage ? (
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
              setSelectedImage={setSelectedImage}
              setIsImageViewVisible={setIsImageViewVisible}
              showAvatar={() => showAvatar(index)}
              showTime={() => showTime(index)}
              setIsShowMenuInMessage={setIsShowMenuInMessage}
              setSelectedMessage={setSelectedMessage}
              isHighlighted={highlightedId === item.id}
              handlerRemoveAllAction={handlerRemoveAllAction}
              flatListRef={flatListRef}
              scrollToMessage={scrollToMessage}
            />
          )}
          keyExtractor={(item, index) => item.id?.toString() + item.timestamp?.toString() || index.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          inverted
        />
      )}
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
        messageParent={messageParent}
        clearMessageParent={() => dispatch(setMessageParent(null))}
        friend={friend}
      />
      {isStickerPickerVisible && (
        <StickerPicker onStickerSelect={handleStickerSelect} />
      )}
      {isShowMenuInMessage && (
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
              setShowDetailModal={setShowDetailModal}
              setShowForwardModal={setShowForwardModal}
            />
          </Pressable>
        </Modal>
      )}
      <MessageDetailModal
        visible={showDetailModal}
        onClose={() => {
          setIsShowMenuInMessage(false);
          setShowDetailModal(false);
        }}
        message={selectedMessage}
      />
      <ForwardMessageModal
        visible={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setIsShowMenuInMessage(false);
        }}
        message={selectedMessage}
      />
    </View>
  );
};

export default ChatScreen;