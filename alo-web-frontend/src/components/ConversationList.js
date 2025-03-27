import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import socket from '../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import { setUserOnlines } from '../redux/slices/UserSlice';
import { setConversation, updateLastMessage } from '../redux/slices/ConversationSlice';

const ConversationList = () => {
  const userOnlines = useSelector(state => state.user.userOnlines);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("users-online", ({ userIds }) => {
      dispatch(setUserOnlines(userIds));
    });
  }, []);

  const isFriendOnline = (userId) => {
    return userOnlines.includes(userId);
  };

  const userLogin = useSelector(state => state.user.userLogin);

  const getFriend = (conversation) => {
    const friend = conversation.members.find((member) => member.id !== userLogin.id);
    return friend;
  }

  const conversations = useSelector(state => state.conversation.conversations);

  const showLastMessage = (conversation) => {
    if (conversation.lastMessage) {
      let message = conversation.lastMessage.content;
      if (conversation.lastMessage.messageType === 'sticker') {
        message = 'Sticker';
      } else if (conversation.lastMessage.messageType === 'image') {
        message = 'Hình ảnh';
      }
      if (conversation.lastMessage.senderId === userLogin.id) {
        return "Bạn: " + message;
      } else {
        return getFriend(conversation).fullName + ": " + message;
      }
    }
  }

  useEffect(() => {
    socket.on('update-last-message', (conversationId, message) => {
      console.log('update-last-message', conversationId, message);
      dispatch(updateLastMessage({ conversationId, message }));
    });

  }, []);

  const getLastTimeMessage = (time) => {
    const now = new Date();
    const timeX = new Date(time);
    const diffInMs = now - timeX;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHours = Math.floor(diffInMin / 60);

    if (diffInSec < 60) {
      return `Vài giây`;
    } else if (diffInMin < 60) {
      return `${diffInMin} phút`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ`;
    } else {
      return `${timeX.toLocaleDateString('vi-VN')}`;
    }
  }
  const selectedConversation = useSelector(state => state.conversation.conversation);
  return (
    <div className=" bg-white border-r border-gray-200 py-4 overflow-y-auto max-h-[2000px] scrollable">
      <div>
        {conversations.map((conversation) => (
          !conversation.isGroup &&
          <div
            key={conversations.id}
            onClick={() => {
              if (selectedConversation) {
                socket.emit("leave_conversation", selectedConversation.id);
              }
              dispatch(setConversation(conversation));
            }}
            className={`flex py-4 justify-between items-center p-2 hover:bg-gray-100 cursor-pointer ${conversation.id === selectedConversation?.id ? 'bg-gray-100' : ''}`}
          >
            <div className='flex items-center'>
              {
                !conversation.isGroup && (
                  <img
                    src={getFriend(conversation).avatarLink ? getFriend(conversation).avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full mr-2"
                  />
                )
              }
              <div>
                <p className="font-semibold">{getFriend(conversation).fullName}</p>
                <p className="text-sm text-gray-500">{
                  showLastMessage(conversation)
                }</p>
              </div>
            </div>
            <div className='mb-auto'>
              <p className="text-sm text-gray-500">{
                conversation.lastMessage && getLastTimeMessage(conversation.lastMessage.timestamp)
              }</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
