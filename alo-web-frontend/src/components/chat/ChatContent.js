import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { getFriend } from '../../utils/AppUtils';
import { useSelector } from 'react-redux';

const ChatContent = ({ isLoadMessage, messageRefs, scrollToMessage }) => {
  const conversation = useSelector((state) => state.conversation.conversation);
  const userLogin = useSelector((state) => state.user.userLogin);
  const messages = useSelector((state) => state.message.messages);
  const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id))

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
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0) {
        setIsScrolledToTop(true);
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
      conversation && friend && (
        <div className="text-center text-gray-500">
          {
            !conversation.isGroup ? (
              <p>Nhập tin nhắn để bắt đầu trò chuyện với {friend.fullName}</p>
            ) : (
              <p>Nhập tin nhắn để bắt đầu trò chuyện với nhóm {conversation.name}</p>
            )
          }
        </div>
      )
    );
  }

  return (
    <div ref={chatContainerRef}> 
      {messages.filter(m => m.status !== 2).map((message, index) => {
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