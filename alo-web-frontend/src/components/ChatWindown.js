import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance } from '../api/APIClient';
import socket from '../utils/socket';
import { getMessagesByConversationId,setMessages, setMessageUpdate } from '../redux/slices/MessageSlice';
import RightSlidebar from './RightSlideBarChat';
import ChatHeader from './chat/ChatHeader';
import ChatContent from './chat/ChatContent';
import ChatInput from './chat/ChatInput';
import PinComponentWeb  from './chat/PinComponent';

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
  const [highlightedId, setHighlightedId] = useState(null); 
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

  const getFriend = (conversation) => {
    const friend = conversation.members.find((member) => member.id !== userLogin.id);
    return friend;
  };

  const handleGetLastLogout = async (userId) => {
    await axiosInstance.get(`/api/user/get-profile/${userId}`).then((res) => {
      setLastLogout(res.data.data.lastLogout);
    });
  };  

  const scrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth' });
      setHighlightedId(messageId); // Tô sáng tin nhắn
      setTimeout(() => {
        setHighlightedId(null); // Xóa tô sáng sau 3 giây
      }, 3000);
    } else {
      console.warn(`Message with ID message-${messageId} not found in the DOM`);
    }
  };

  useEffect(() => {
    socket.emit("join_conversation", conversation.id);

    if (!conversation.isGroup) {
      const friend = conversation.memberUserIds.find((member) => member !== userLogin.id);
      handleGetLastLogout(friend);
    }
  }, [conversation, userLogin.id]);
 
  useEffect(() => {
    socket.on('receive-message', (message) => {
      dispatch(setMessages([...messages, message]));
    });
  }, [messages, dispatch]);

  useEffect(() => {
    dispatch(getMessagesByConversationId(conversation.id));
  }, [conversation, limit, dispatch]);
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


  return (
    <>
      <div className="w-3/4 flex flex-col">
        <ChatHeader
          conversation={conversation}
          userLogin={userLogin}
          lastLogout={lastLogout}
          getFriend={getFriend}
          getLastLoginMessage={getLastLoginMessage}
          isFriendOnline={isFriendOnline}
        />
        {conversation.pineds && conversation.pineds.length > 0 && (
        <div className="bg-gray-100 px-4">
          <PinComponentWeb
            conversation={conversation}
            pins={conversation.pineds}
            scrollToMessage={scrollToMessage}
          />
        </div>
      )}

        <div className="flex-1 p-4 overflow-y-auto bg-gray-100" style={{ overflowAnchor: 'none' }}>

          <ChatContent
            messages={messages}
            isLoadMessage={isLoadMessage}
            conversation={conversation}
            userLogin={userLogin}
            getFriend={getFriend}
            conversations={conversations}
            highlightedId={highlightedId}
          />
        </div>


        <ChatInput
          isSending={isSending}
          getFriend={getFriend}
        />
      </div>

      <RightSlidebar
        conversation={conversation}
        userLogin={userLogin}
        getFriend={getFriend}
        messages={messages}
      />
    </>
  );
};
export default ChatWindow;