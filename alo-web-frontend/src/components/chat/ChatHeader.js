import React from "react";
import PinComponentWeb from "./PinComponent";
import { useEffect, useState } from "react";

const ChatHeader = ({ conversation, userLogin, lastLogout, getFriend, getLastLoginMessage, isFriendOnline, scrollToMessage }) => {

  const [timeDisplay, setTimeDisplay] = useState('Chưa truy cập');

  // Cập nhật timeDisplay mỗi phút dựa trên lastLogout
  useEffect(() => {
    const updateTimeDisplay = () => {
      setTimeDisplay(getLastLoginMessage(lastLogout));
    };
 
    // Gọi lần đầu
    updateTimeDisplay();

    // Cập nhật mỗi phút
    const intervalId = setInterval(updateTimeDisplay, 60 * 1000);

    // Cleanup interval
    return () => clearInterval(intervalId);
  }, [lastLogout]);
  if (conversation.isGroup) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        
      
      <img
        src={getFriend(conversation).avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
        alt="Avatar"
        className="w-10 h-10 rounded-full mr-2"
      />
      <div>
        <p className="font-semibold">{getFriend(conversation).fullName}</p>
        <p className="text-sm text-gray-500">
          {isFriendOnline(conversation.memberUserIds.find(v => v !== userLogin.id))
            ? 'Đang hoạt động' 
            : timeDisplay}
        </p>
      </div>
      <div className="ml-auto flex space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3l2 4-3 2a16 16 0 007 7l2-3 4 2v3a2 2 0 01-2 2h-3a19 19 0 01-9-4 19 19 0 01-4-9V5z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 1 0-1.15 1.15L21 21z" />
          </svg>
        </button>
      </div>
      {/* Danh sách ghim */}
      {conversation.pineds && conversation.pineds.length > 0 && (
        <PinComponentWeb
          conversation={conversation}
          pins={conversation.pineds}
          scrollToMessage={scrollToMessage}
        />
      )}
    </div>
  );
};

export default ChatHeader;