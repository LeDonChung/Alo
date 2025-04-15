import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance } from '../api/APIClient';
import socket from '../utils/socket';
import { getMessagesByConversationId, sendMessage, setInputMessage, setMessages } from '../redux/slices/MessageSlice';
import RightSlidebar from './RightSlideBarChat';
import ChatHeader from './chat/ChatHeader';
import ChatContent from './chat/ChatContent';
import ChatInput from './chat/ChatInput';

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

  


  

  useEffect(() => {
    socket.emit("join_conversation", conversation.id);

    if (!conversation.isGroup) {
      const friend = conversation.memberUserIds.find((member) => member !== userLogin.id);
      handleGetLastLogout(friend);
    }
  }, [conversation, userLogin.id]);

  

  useEffect(() => {
    dispatch(getMessagesByConversationId(conversation.id));
  }, [conversation, limit, dispatch]);
  const isFriendOnline = (userId) => {
    return userOnlines.includes(userId);
  };

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

        <div className="flex-1 p-4 overflow-y-auto bg-gray-100" style={{ overflowAnchor: 'none' }}>

          <ChatContent
            messages={messages}
            isLoadMessage={isLoadMessage}
            conversation={conversation}
            userLogin={userLogin}
            getFriend={getFriend}
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