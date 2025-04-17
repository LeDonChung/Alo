import React from 'react';

const ChatHeader = ({ conversation, userLogin, lastLogout, getFriend, getLastLoginMessage, isFriendOnline }) => {
  if (conversation.isGroup) return null;

  return (
    <div className="bg-[#007AFF] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={getFriend(conversation).avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
            alt="Avatar"
            className="w-10 h-10 rounded-full mr-4"
            loading="lazy"
          />
          <div>
            <p className="font-semibold text-white text-lg">{getFriend(conversation).fullName}</p>
            <p className="text-sm text-white opacity-80">
              {isFriendOnline(conversation.memberUserIds.find((v) => v !== userLogin.id))
                ? 'Đang hoạt động'
                : getLastLoginMessage(lastLogout)}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button className="p-2 hover:bg-blue-700 rounded-full transition">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3l2 4-3 2a16 16 0 007 7l2-3 4 2v3a2 2 0 01-2 2h-3a19 19 0 01-9-4 19 19 0 01-4-9V5z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-full transition">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-full transition">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-1.15 1.15L21 21z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;