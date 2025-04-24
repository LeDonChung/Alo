import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Pressable, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { axiosInstance } from '../../../api/APIClient';
import { setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice';
import socket from '../../../utils/socket';
import { v4 as uuidv4 } from 'uuid';
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
  updateSeenAllMessage,
  searchMessages,
  navigateToPreviousResult,
  navigateToNextResult,
  resetSearch,
  clearMessages,
} from '../../redux/slices/MessageSlice';
import { removePin, clearHistoryMessages, memberLeaveGroup, updateLastMessage } from '../../redux/slices/ConversationSlice';
import HeaderComponent from '../../components/chat/HeaderComponent';
import InputComponent from '../../components/chat/InputComponent';
import MessageItem from '../../components/chat/MessageItem';
import ImageViewerComponent from '../../components/chat/ImageViewComponent';
import { FlatList } from 'react-native-gesture-handler';
import StickerPicker from '../../components/chat/StickerPicker';
import { ActivityIndicator } from 'react-native-paper';
import { getFriend, getUserRoleAndPermissions, showToast } from '../../../utils/AppUtils';
import { MenuComponent } from '../../components/chat/MenuConponent';
import MessageDetailModal from '../../components/chat/MessageDetailModal';
import ForwardMessageModal from '../../components/chat/ForwardMessageModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const friend = getFriend(
    conversation,
    conversation?.memberUserIds.find(item => item !== userLogin.id)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchResults = useSelector((state) => state.message.searchResults);
  const currentSearchIndex = useSelector((state) => state.message.currentSearchIndex);
  const isSearching = useSelector((state) => state.message.isSearching);
  const error = useSelector((state) => state.message.error);

  if (!userLogin.id) {
    console.warn('User not logged in');
    showToast('error', 'bottom', 'Thông báo', 'Vui lòng đăng nhập lại.', 2000);
    navigation.navigate('Login');
    return null;
  }

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });
    return () =>
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
  }, [navigation]);

  const isFriendOnline = userId => userOnlines.includes(userId);

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
      console.error('Error sending message:', err);
      showToast('error', 'bottom', 'Thông báo', 'Gửi tin nhắn thất bại.', 2000);
    }
  };

  const handleSendImage = async newMessage => handlerSendMessage(newMessage);
  const handleSendFile = async newMessage => handlerSendMessage(newMessage);

  const handleStickerSelect = async stickerUrl => {
    const newMessage = {
      content: '',
      messageType: 'sticker',
      fileLink: stickerUrl,
    };
    handlerSendMessage(newMessage);
    setIsStickerPickerVisible(false);
  };

  useEffect(() => {
    const handlerReceiveMessage = async message => {
      if (!message || !message.id || !message.sender || !message.sender.id) {
        console.warn('Invalid socket message:', message);
        return;
      }
      dispatch(addMessage(message));
      await dispatch(seenOne(message.id))
        .unwrap()
        .then(res => {
          const data = res.data;
          socket.emit('seen-message', {
            messages: [data],
            conversation: conversation,
          });
        })
        .catch(err => console.error('Error marking message as seen:', err));
    };
    socket.on('receive-message', handlerReceiveMessage);

    return () => socket.off('receive-message', handlerReceiveMessage);
  }, [conversation.id]);

  useEffect(() => {
    socket.on('users-online', ({ userIds }) => {
      dispatch(setUserOnlines(userIds));
    });
    return () => socket.off('users-online');
  }, []);

  useEffect(() => {
    const handleClearHistoryMessages = (data) => {
      if (data.conversationId === conversation.id) {
        dispatch(clearMessages());

        dispatch(clearHistoryMessages({
          conversationId: data.conversationId,
          conversation: data.conversation
        }));
        showToast('info', 'top', 'Thông báo', 'Lịch sử trò chuyện đã được xóa.');
      }
    };
    socket.on('clear-history-messages', handleClearHistoryMessages);
    return () => socket.off('clear-history-messages', handleClearHistoryMessages);
  }, [conversation.id, dispatch]);



  useEffect(() => {
    const handlerInitMessage = async () => {
      await dispatch(getMessagesByConversationId(conversation.id))
        .unwrap()
        .then(async res => {
          const unseenMessages = res.data
            .filter(message => {
              const seen = message.seen || [];
              return !seen.some(seenUser => seenUser.userId === userLogin.id);
            })
            .map(message => message.id);

          if (unseenMessages?.length > 0) {
            await dispatch(seenAll(unseenMessages))
              .unwrap()
              .then(res => {
                const data = res.data;
                dispatch(updateSeenAllMessage(data));
                socket.emit('seen-message', {
                  messages: data,
                  conversation: conversation,
                });
              });
          }
        });
    };

    handlerInitMessage();
  }, [conversation.id, userLogin.id]);

  useEffect(() => {
    const handleGetLastLogoutX = async userId => {
      if (userId === friend.id) {
        await handleGetLastLogout(userId);
      }
    };
    socket.on('user-offline', handleGetLastLogoutX);

    return () => socket.off('user-offline', handleGetLastLogoutX);
  }, [friend.id]);

  const getLastLoginMessage = lastLogout => {
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

  const handleGetLastLogout = async userId => {
    await axiosInstance.get(`/api/user/get-profile/${userId}`).then(res => {
      setLastLogout(res.data.data.lastLogout);
    });
  };
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleMemberLeave = (data) => {
        const { conversationId, userId, userName, updatedConversation } = data;

        if (conversation.id === conversationId) {
            dispatch(memberLeaveGroup({
                conversationId,
                userId,
                updatedConversation
            }));

            if (userId === userLogin.id) {
                showToast('success', 'bottom', 'Thông báo', 'Bạn đã rời khỏi nhóm thành công');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'home' }],
                });
            } else {
                const systemMessage = {
                    id: uuidv4(),
                    conversationId,
                    sender: {
                        id: 'system',
                        fullName: 'Hệ thống',
                    },
                    content: `${userName} đã rời khỏi nhóm`,
                    contentType: 'notification',
                    messageType: 'notification',
                    timestamp: new Date().toISOString(),
                    status: 0,
                };
                dispatch(addMessage(systemMessage));
                dispatch(updateLastMessage({
                    conversationId,
                    message: systemMessage
                }));
            }
        }
    };

    socket.on('member-leave-group', handleMemberLeave);

    return () => socket.off('member-leave-group', handleMemberLeave);
}, [socket, conversation, dispatch, userLogin.id, navigation]);

useEffect(() => {
    socket.emit('join_conversation', conversation.id);

    if (!conversation.isGroup) {
      const friendId = conversation?.memberUserIds.find(member => member !== userLogin.id);
      handleGetLastLogout(friendId);
    }

    return () => socket.emit('leave_conversation', conversation.id);
    dispatch(resetSearch());
  }, [conversation, userLogin.id]);

  const [messageSort, setMessageSort] = useState([]);

  useEffect(() => {
    const sortedMessages = [...messages]
      .filter(message => message.status !== 2)
      .sort((a, b) => b.timestamp - a.timestamp);
    setMessageSort(sortedMessages);
    
  }, [messages, conversation.lastMessage, conversation.pineds]);

  
  const showAvatar = index => {
    if (index === messageSort?.length - 1) return true;
    const nextMessage = messageSort[index + 1];
    return nextMessage ? nextMessage.senderId !== messageSort[index].senderId : true;
  };

  const [isShowMenuInMessage, setIsShowMenuInMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const showTime = index => {
    if (index === messageSort?.length - 1) return false;
    const nextMessage = messageSort[index - 1];
    return nextMessage ? nextMessage.senderId !== messageSort[index].senderId : true;
  };

  const [highlightedId, setHighlightedId] = useState(null);
  const flatListRef = useRef(null);
  const scrollToMessage = messageId => {
    const index = messageSort.findIndex(msg => msg.id === messageId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setHighlightedId(messageId);
      setTimeout(() => setHighlightedId(null), 3000);
    }
  };

  useEffect(() => {
    socket.emit('login', userLogin?.id);
  }, [userLogin?.id]);

  const onDeletePin = async pin => {
    try {
      await dispatch(removePin({ conversationId: conversation.id, messageId: pin.messageId })).then(res => {
        socket.emit('unpin-message', {
          conversation: conversation,
          pin: res.payload.data,
        });
        showToast('success', 'bottom', 'Thông báo', res.payload.message);
      });
    } catch (error) {
      showToast('error', 'bottom', 'Thông báo', error.message);
    }
  };

  const handlerRemoveAllAction = message => {
    try {
      const updatedReaction = {};

      Object.entries(message.reaction || {}).forEach(([type, data]) => {
        const filteredUsers = data.users.filter(userId => userId !== userLogin.id);
        const quantity = filteredUsers?.length;

        if (quantity > 0) {
          updatedReaction[type] = {
            quantity,
            users: filteredUsers,
          };
        }
      });

      dispatch(
        handlerUpdateReaction({
          messageId: message.id,
          updatedReaction,
        })
      );

      dispatch(removeAllReaction({ messageId: message.id }))
        .unwrap()
        .then(res => {
          socket.emit('update-reaction', {
            conversation,
            message: res.data,
          });
        })
        .catch(err => {
          console.error('Error while removing all reactions:', err);
        });
    } catch (error) {
      console.error('Error in handlerRemoveAllAction:', error);
    }
  };

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  const openDetailModal = message => {
    if (!message || !message.sender || !message.sender.id) {
      console.warn('Invalid message for detail modal:', message);
      showToast('error', 'bottom', 'Thông báo', 'Không thể xem chi tiết tin nhắn.', 2000);
      return;
    }
    setSelectedMessage(message);
    setShowDetailModal(true);
  };

  const handleSearch = (keyword) => {
    if (keyword.trim()) {
      dispatch(searchMessages({ keyword }));
    } else {
      dispatch(resetSearch());
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  const handlePrevious = () => {
    if (currentSearchIndex > 0) {
      dispatch(navigateToPreviousResult());
      const messageId = searchResults[currentSearchIndex - 1].id;
      scrollToMessage(messageId);
    }
  };

  const handleNext = () => {
    if (currentSearchIndex < searchResults?.length - 1) {
      dispatch(navigateToNextResult());
      const messageId = searchResults[currentSearchIndex + 1].id;
      scrollToMessage(messageId);
    }
  };

  useEffect(() => {
    if (searchResults?.length > 0 && !isSearching) {
      const messageId = searchResults[currentSearchIndex].id;
      scrollToMessage(messageId);
    }
  }, [searchResults, isSearching]);
  const getItemLayout = (data, index) => {

    const averageHeight = 80;
    return {
      length: averageHeight,
      offset: averageHeight * index,
      index,
    };
  };
  //đém tin nhắn mới nhất là 1
  const reversedIndex = searchResults?.length - currentSearchIndex;

  return (
    conversation && (
      <View style={{ flex: 1, backgroundColor: '#F3F3F3', position: 'relative' }}>
        <HeaderComponent
          isFriendOnline={isFriendOnline}
          getLastLoginMessage={getLastLoginMessage}
          lastLogout={lastLogout}
          scrollToMessage={scrollToMessage}
          onDeletePin={onDeletePin}
          onSearch={() => setIsSearchVisible(true)}
          isSearchVisible={isSearchVisible}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsSearchVisible={setIsSearchVisible}
        />
        {error && isSearchVisible && searchResults?.length === 0 && (
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#FF0000', margin: 10 }}>
            {error}
          </Text>
        )}

        {isSearchVisible && searchResults?.length > 0 && !isSearching && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#EDEDED',
          }}>
            <Text style={{ fontSize: 14, color: '#888', textAlign: 'left', flex: 1 }}>
              {`Kết quả thứ ${reversedIndex}/${searchResults?.length}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <TouchableOpacity
                onPress={handleNext}
                disabled={currentSearchIndex === searchResults?.length - 1}
                style={{ padding: 10 }}
              >
                <Icon name="arrow-upward" size={24} color={currentSearchIndex === searchResults?.length - 1 ? '#ccc' : '#007AFF'} />

              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrevious}
                disabled={currentSearchIndex === 0}
                style={{ padding: 10 }}
              >
                <Icon name="arrow-downward" size={24} color={currentSearchIndex === 0 ? '#ccc' : '#007AFF'} />

              </TouchableOpacity>
            </View>
          </View>
        )}
        {isLoadMessage || (isSearching && isSearchVisible) ? (
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
                isHighlighted={highlightedId === item.id || searchResults.some((result) => result.id === item.id)}
                handlerRemoveAllAction={handlerRemoveAllAction}
                flatListRef={flatListRef}
                scrollToMessage={scrollToMessage}
                searchKeyword={searchQuery}
              />
            )}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : `temp-${index}-${item.timestamp || Date.now()}`
            }
            contentContainerStyle={{ paddingVertical: 10 }}
            inverted
            getItemLayout={getItemLayout}
          />
        )}
        <ImageViewerComponent
          isImageViewVisible={isImageViewVisible}
          selectedImage={selectedImage}
          setIsImageViewVisible={setIsImageViewVisible}
        />
        {
          conversation.isGroup ? (
            <>
              {
                getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.sendMessage ? (
                  <>
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
                  </>
                ) : (
                  <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 8, margin: 10 }}>
                    <Text style={{ color: '#000', fontWeight: '500', textAlign: 'center' }}>Chỉ <Text style={{ color: 'red' }}>trưởng / phó nhóm</Text> được gửi tin nhắn vào nhóm.</Text>
                  </View>
                )
              }
            </>
          ) : (
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
          )
        }
        {isStickerPickerVisible && <StickerPicker onStickerSelect={handleStickerSelect} />}
        {isShowMenuInMessage && (
          <Modal visible={isShowMenuInMessage} transparent={true} animationType="none">
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
        {
          selectedMessage && (
            <MessageDetailModal
              visible={showDetailModal}
              onClose={() => {
                setIsShowMenuInMessage(false);
                setShowDetailModal(false);
              }}
              message={selectedMessage}
            />
          )
        }
        <ForwardMessageModal
          visible={showForwardModal}
          onClose={() => {
            setShowForwardModal(false);
            setIsShowMenuInMessage(false);
          }}
          message={selectedMessage}
        />
      </View>
    )
  );
};

export default ChatScreen;