import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance } from '../api/APIClient';
import socket from '../utils/socket';
import { getMessagesByConversationId, seenAll, seenOne, setMessages, updateSeenAllMessage, setMessageUpdate, addMessage } from '../redux/slices/MessageSlice';
import RightSlidebar from './RightSlideBarChat';
import ChatHeader from './chat/ChatHeader';
import ChatContent from './chat/ChatContent';
import ChatInput from './chat/ChatInput';
import { getFriend } from '../utils/AppUtils';
import { setConversation } from '../redux/slices/ConversationSlice';

const ChatWindow = () => {
  const isSending = useSelector(state => state.message.isSending);
  const isLoadMessage = useSelector(state => state.message.isLoadMessage);
  const dispatch = useDispatch();
  const userOnlines = useSelector(state => state.user.userOnlines);
  const userLogin = useSelector(state => state.user.userLogin);
  const conversation = useSelector(state => state.conversation.conversation);
  const messages = useSelector(state => state.message.messages);
  const [lastLogout, setLastLogout] = useState(null);
  const limit = useSelector(state => state.message.limit);
  const conversations = useSelector(state => state.conversation.conversations);

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

  // Bắt sự kiện get last logout
  useEffect(() => {
    const handleGetLastLogoutX = async (userId) => {
      const friend = getFriend(conversation, userId);
      if (userId === friend.id) {
        await handleGetLastLogout(userId);
      }
    }

    socket.on('user-offline', handleGetLastLogoutX);

    return () => {
      socket.off('user-offline', handleGetLastLogoutX);
    }

  }, []);


  useEffect(() => {
    socket.emit("join_conversation", conversation.id);

    if (!conversation.isGroup) {
      const friend = conversation.memberUserIds.find((member) => member !== userLogin.id);
      handleGetLastLogout(friend);
    }
  }, [conversation, userLogin.id]);

  useEffect(() => {
    const handlerReceiveMessage = async (message) => {
      dispatch(addMessage(message));
      await dispatch(seenOne(message.id)).unwrap().then((res) => {
        const data = res.data;
        // emit seen message
        socket.emit('seen-message', {
          messages: [data],
          conversation: conversation
        });
      })
    }
    socket.on('receive-message', handlerReceiveMessage);

    return () => {
      socket.off('receive-message', handlerReceiveMessage);
    }
  }, []);


  useEffect(() => {
    const handlerInitMessage = async () => {
      await dispatch(getMessagesByConversationId(conversation.id)).unwrap().then(async (res) => {

        const unseenMessages = res.data.filter((message) => {
          const seen = message.seen || [];
          return !seen.some((seenUser) => seenUser.userId === userLogin.id);
        }).map((message) => message.id);

        if (unseenMessages.length > 0) {
          await dispatch(seenAll(unseenMessages)).unwrap().then((res) => {
            const data = res.data;
            dispatch(updateSeenAllMessage(data))
            // emit seen message
            socket.emit('seen-message', {
              messages: data,
              conversation: conversation
            })
          })
        }


      });

    }

    handlerInitMessage();
  }, [conversation.id]);
  const isFriendOnline = (userId) => {
    return userOnlines.includes(userId);
  };

  useEffect(() => {
    socket.on('receive-update-reaction', (message) => {
      dispatch(setMessageUpdate({
        messageId: message.id,
        reaction: message.reaction
      }));
    });

    return () => {
      socket.off('receive-update-reaction');
    };
  }, [dispatch]);

  const messageRefs = useRef({}); // Object lưu trữ các ref của từng tin nhắn

  // Cuộn tới tin nhắn cụ thể
  const scrollToMessage = (messageId) => {
    const messageRef = messageRefs.current[messageId];
    if (messageRef) {
      messageRef.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const [search, setSearch] = useState(false);


  // Lắng nghe sự kiện xóa lịch sử trò chuyện từ Socket.IO
  useEffect(() => {
    socket.on('receive-remove-all-history-messages', (data) => {
      const { conversationId } = data;
      if (conversationId === conversation.id) {
        // Cập nhật conversation để xóa danh sách tin nhắn
        dispatch(setConversation({ ...conversation, messages: [] }));
      }
    });

    return () => {
      socket.off('receive-remove-all-history-messages');
    };
  }, [conversation, dispatch]);

  return (
    <>
      <div className="w-3/4 flex flex-col">
        <ChatHeader
          lastLogout={lastLogout}
          getLastLoginMessage={getLastLoginMessage}
          isFriendOnline={isFriendOnline}
          scrollToMessage={scrollToMessage}
          search={search}
          setSearch={setSearch}
        />

        <div className="flex-1 p-4 overflow-y-auto bg-gray-100" style={{ overflowAnchor: 'none' }}>

          <ChatContent
            isLoadMessage={isLoadMessage}
            messageRefs={messageRefs}
            scrollToMessage={scrollToMessage}
          />
        </div>


        <ChatInput />
      </div>

      <RightSlidebar search={search} setSearch={setSearch}/>
    </>
  );
};
export default ChatWindow;