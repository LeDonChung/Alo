import React from 'react';

const ChatInput = ({ inputMessage, setInputMessage, handlerSendMessage, isSending }) => {
  return (
    <div className="bg-white p-4 border-t border-gray-200 overflow-y-auto max-h-[2000px] scrollable">
      {/* Các button input ở đây */}
      <form className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage.content}
          onChange={(e) => setInputMessage({ ...inputMessage, content: e.target.value })}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border rounded-lg"
        />
        {isSending ? (
          <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        ) : (
          <button 
            onClick={handlerSendMessage}
            type="button" 
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;