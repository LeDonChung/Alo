import React from 'react';

const MessageItem = ({ message, isUserMessage, isLastMessage, showAvatar, userLogin }) => {
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mt-4`}>
      {!isUserMessage && (
        <div className="flex-shrink-0 mr-2" style={{ width: '32px' }}>
          {showAvatar && (
            <img
              src={message.sender?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>
      )}

      <div className={`flex flex-col ${isUserMessage ? "items-end" : "items-start"} p-3 rounded-lg shadow-md max-w-xs ${isUserMessage && 'bg-blue-100'}`}>
        {message.messageType === 'text' && (
          <p className="text-sm text-gray-800">{message.content}</p>
        )}
        {isLastMessage && (
          <div className="text-xs text-gray-400 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;