import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { useDispatch } from 'react-redux';

const ChatContent = ({ messages, isLoadMessage, conversation, userLogin, getFriend, loadMoreMessages }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isScrolledToTop, setIsScrolledToTop] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    console.log("Scrolling");
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      // Nếu cuộn đến gần đầu
      console.log('Cuộn đến đầu'); 

      if (scrollTop === 0) {
        setIsScrolledToTop(true);
        console.log('Cuộn đến đầu'); 
      } else {
        setIsScrolledToTop(false);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Thêm sự kiện scroll khi component được mount
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    // Cleanup khi component unmount
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  if (isLoadMessage) {
    return (
      <div className="text-center text-gray-500">
        <p>Đang tải tin nhắn...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>Nhập tin nhắn để bắt đầu trò chuyện với {getFriend(conversation).fullName}</p>
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef} // Thêm style để scroll
    >
      {messages.map((message, index) => {
        const isUserMessage = message.sender.id === userLogin.id;
        const isLastMessage = index === messages.length - 1 || messages[index + 1].sender.id  !== message.sender.id;
        const showAvatar = index === 0 || messages[index - 1].sender.id  !== message.sender.id ;

        return (
          <MessageItem
            key={index}
            message={message}
            isUserMessage={isUserMessage}
            isLastMessage={isLastMessage}
            showAvatar={showAvatar}
          />
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContent;
