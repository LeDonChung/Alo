import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { useDispatch } from 'react-redux';

const ChatContent = ({ messages, isLoadMessage, conversation, userLogin, getFriend, loadMoreMessages, conversations, messageRefs, scrollToMessage }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isScrolledToTop, setIsScrolledToTop] = useState(false);
  const [scrollToParent, setScrollToParent] = useState(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessages = (messageId) => {
    scrollToMessage(messageId);
    setHighlightedMessage(messageId);
  };

  const handleScroll = () => {
    console.log("Scrolling");
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
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
      scrollToMessages(scrollToParent);
      setScrollToParent(null);
    }
  }, [scrollToParent]);

  useEffect(() => {
    if (highlightedMessage) {
      const timer = setTimeout(() => setHighlightedMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedMessage]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
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
    <div ref={chatContainerRef}>
      {messages.map((message, index) => {
        const isUserMessage = message.sender.id === userLogin.id;
        const isLastMessage = index === messages.length - 1 || messages[index + 1]?.sender.id !== message.sender.id;
        const showAvatar = index === 0 || messages[index - 1]?.sender.id !== message.sender.id;

        return (
          (message && !message.removeOfme?.includes(userLogin.id)) && (
            <div
              key={message.id + message.timestamp + Math.random()}
              ref={(el) => (messageRefs.current[message.id] = el)}
            >
              <MessageItem
                message={message}
                isUserMessage={isUserMessage}
                isLastMessage={isLastMessage}
                showAvatar={showAvatar}
                conversation={conversation}
                userLogin={userLogin}
                conversations={conversations}
                isHighlighted={highlightedMessage === message.id}
                onClickParent={() => {
                  if (message.messageParent?.id) {
                    setScrollToParent(message.messageParent.id);
                  }
                }}
              />
            </div>
          )
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContent;