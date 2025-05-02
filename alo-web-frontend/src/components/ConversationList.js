import React from 'react';
import socket from '../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import { setConversation } from '../redux/slices/ConversationSlice';
import { getFriend } from '../utils/AppUtils';

const ConversationList = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.user.userLogin);

  const conversations = useSelector(state => state.conversation.conversations);  

  const showLastMessage = (conversation) => {
    if(conversation.lastMessage.status === 2) return;
    const friend = getFriend(conversation, conversation.lastMessage?.senderId)
    if (conversation.lastMessage) {
      let message = conversation.lastMessage.content;
      let messageStatus = conversation.lastMessage.status;

      if (conversation.lastMessage.messageType === 'sticker') {
        message = '[Sticker]';
      } else if (conversation.lastMessage.messageType === 'image') {
        message = '[Hình ảnh]';
      } else if (conversation.lastMessage.messageType === 'file') {
        message = '[Tệp tin]';
      } else if (conversation.lastMessage.messageType === 'video') {
        message = '[Video]';
      }
      if (conversation.lastMessage.senderId === userLogin.id) {
        return "Bạn: " + (messageStatus === 0 ? message : "Tin nhắn đã thu hồi");
      } else {
        console.log(friend);
        
        return (
          conversation.lastMessage
          && friend.fullName + ": " + (messageStatus === 0 ? message : "Tin nhắn đã thu hồi")
        );

      }
    }
  }


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
        {(conversations && conversations.length > 0) ? conversations.map((conversation) => {
          const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id))
          return (
            <div
              key={conversation.id}
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
                  !conversation.isGroup ? (
                    <img
                      src={friend.avatarLink ? friend.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full mr-2"
                    />
                  ) : (
                    <img
                      src={conversation.avatar ? conversation.avatar : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full mr-2"
                    />
                  )
                }
                <div>
                  {
                    !conversation.isGroup ? (
                      <p className="font-semibold">{friend.fullName}</p>
                    ) : (
                      <p className="font-semibold">{conversation.name}</p>
                    )
                  }

                  <p className="text-sm text-gray-500 truncate max-w-[270px]">
                    {
                      conversation.lastMessage && showLastMessage(conversation)
                    }
                  </p>
                </div>
              </div>
              <div className='mb-auto'>
                <p className="text-sm text-gray-500  " >{
                  conversation.lastMessage && getLastTimeMessage(conversation.lastMessage.timestamp)
                }</p>
              </div>
            </div>
          )
        }) : (
          <>
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-600 w-4 h-4"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
