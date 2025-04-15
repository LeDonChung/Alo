import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { useDispatch } from 'react-redux';

const ChatContent = ({ messages, isLoadMessage, conversation, userLogin, getFriend, loadMoreMessages }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isScrolledToTop, setIsScrolledToTop] = useState(false);
  const messageRefs = useRef({}); // Object lưu trữ các ref của từng tin nhắn
  const [scrollToParent, setScrollToParent] = useState(null); // Lưu tin nhắn cha cần cuộn tới
  const [highlightedMessage, setHighlightedMessage] = useState(null); // Lưu tin nhắn cần làm nổi bật

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cuộn tới tin nhắn cụ thể
  const scrollToMessage = (messageId) => {
    const messageRef = messageRefs.current[messageId];
    if (messageRef) {
      messageRef.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessage(messageId); // Đánh dấu tin nhắn đã cuộn tới
    }
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
    if (scrollToParent) {
      scrollToMessage(scrollToParent);
      setScrollToParent(null); // Reset sau khi cuộn
    }
  }, [scrollToParent]);

  // Xóa highlight sau khi nháy 3-5 lần
  useEffect(() => {
    if (highlightedMessage) {
      const timer = setTimeout(() => setHighlightedMessage(null), 3000); // Xóa highlight sau 3 giây
      return () => clearTimeout(timer);
    }
  }, [highlightedMessage]);

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
        const isLastMessage = index === messages.length - 1 || messages[index + 1]?.sender.id !== message.sender.id;
        
        const showAvatar = index === 0 || messages[index - 1]?.sender.id !== message.sender.id;

        return (
          <div
            key={message.id}
            ref={(el) => (messageRefs.current[message.id] = el)} // Lưu ref vào object
          >
            <MessageItem
              message={message}
              isUserMessage={isUserMessage}
              isLastMessage={isLastMessage}
              showAvatar={showAvatar}
              conversation={conversation}
              userLogin={userLogin}
              isHighlighted={highlightedMessage === message.id} // Kiểm tra xem tin nhắn có được làm nổi bật không
              onClickParent={() => {
                if (message.messageParent?.id) {
                  setScrollToParent(message.messageParent.id); // Đặt tin nhắn cha cần cuộn tới
                }
              }}
            />
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContent;
