import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removePin } from '../../redux/slices/ConversationSlice';
import socket from '../../utils/socket';

const PinComponentWeb = ({ conversation, pins, scrollToMessage }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [selectedPin, setSelectedPin] = useState(null);
  const dispatch = useDispatch();

  const getFileExtension = useCallback((filename = '') => {
    const parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  }, []);

  const extractOriginalName = useCallback((fileUrl) => {
    const fileNameEncoded = fileUrl.split('/').pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(' - ');
    return parts[parts.length - 1];
  }, []);

  const getMember = useCallback(
    (memberId) => {
      return (
        conversation.members.find((member) => member.id === memberId) || {
          fullName: 'Ẩn danh',
          avatarLink: 'https://via.placeholder.com/40',
        }
      );
    },
    [conversation.members]
  );

  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleDeletePin = useCallback(
    async (pin) => {
      try {
        await dispatch(
          removePin({ conversationId: conversation.id, messageId: pin.messageId })
        ).unwrap();
        socket.emit('remove-pin', {
          conversation,
          messageId: pin.messageId,
        });
        setModalVisible(false);
        setSelectedPin(null);
      } catch (error) {
        console.error('Error removing pin:', error);
      }
    },
    [conversation, dispatch]
  );

  const handleContextMenu = useCallback(
    (e, pin) => {
      e.preventDefault();
      setModalPosition({ x: e.clientX, y: e.clientY });
      setSelectedPin(pin);
      setModalVisible(true);
    },
    []
  );

  useEffect(() => {
    const handleClickOutside = () => {
      setModalVisible(false);
      setSelectedPin(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const renderPinItem = (pinItem, index, showToggle = false) => {
    if (!pinItem.message) {
      return (
        <div
          key={index}
          className="flex items-center bg-white mx-2 mt-2 p-3 rounded-lg shadow-md border border-blue-500"
        >
          <svg
            className="w-6 h-6 text-blue-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Tin nhắn không khả dụng</p>
            <p className="text-xs text-gray-500">
              Tin nhắn của {getMember(pinItem.senderId || '')?.fullName}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="flex items-center bg-white mx-2 mt-2 p-3 rounded-lg shadow-md border border-blue-500 cursor-pointer pin-item"
        onClick={() => {
          scrollToMessage(pinItem.messageId);
          handleToggleExpand();
        }}
        onContextMenu={(e) => handleContextMenu(e, pinItem)}
      >
        <svg
          className="w-6 h-6 text-blue-500 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <div className="flex-1">
          {pinItem.message.messageType === 'file' && (
            <p className="text-sm text-gray-800 truncate">
              [File] {extractOriginalName(pinItem.message.fileLink)}
            </p>
          )}
          {pinItem.message.messageType === 'image' && (
            <div className="flex items-center">
              <p className="text-sm text-gray-800">[Ảnh]</p>
              <img
                src={pinItem.message.fileLink}
                alt="Pinned Image"
                className="ml-2 w-12 h-12 rounded-md object-cover"
                loading="lazy"
              />
            </div>
          )}
          {pinItem.message.messageType === 'sticker' && (
            <div className="flex items-center">
              <p className="text-sm text-gray-800">[Sticker]</p>
              <img
                src={pinItem.message.fileLink}
                alt="Pinned Sticker"
                className="ml-2 w-12 h-12 rounded-md object-cover"
                loading="lazy"
              />
            </div>
          )}
          {pinItem.message.messageType === 'text' && (
            <p className="text-sm text-gray-800 truncate">{pinItem.message.content}</p>
          )}
          <p className="text-xs text-gray-500">
            Tin nhắn của {getMember(pinItem.message.senderId)?.fullName}
          </p>
        </div>
        {showToggle && pins.length > 1 && (
          <div
            className="flex items-center bg-white border border-blue-500 rounded-full px-3 py-1 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
          >
            <p className="text-sm font-bold text-gray-800">+{pins.length - 1}</p>
            <svg
              className={`w-4 h-4 ml-1 text-blue-500 toggle-icon ${expanded ? 'expanded' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`mt-2 pin-container ${expanded ? 'expanded' : ''}`}>
      {expanded && (
        <p className="text-base font-medium text-gray-800 pl-2">Danh sách ghim</p>
      )}
      {pins.length > 0 && renderPinItem(pins[0], 0, true)}
      {expanded && pins.slice(1).map((pinItem, index) => renderPinItem(pinItem, index + 1))}
      {expanded && (
        <div className="flex justify-center mt-4">
          <button
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={handleToggleExpand}
          >
            <p className="text-sm">Thu gọn</p>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      )}
      {modalVisible && (
        <div
          className="absolute bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50"
          style={{ top: modalPosition.y, left: modalPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="text-sm text-gray-700">
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (selectedPin) {
                  scrollToMessage(selectedPin.messageId);
                }
                setModalVisible(false);
                if (expanded) handleToggleExpand();
                setSelectedPin(null);
              }}
            >
              Xem tin nhắn
            </li>
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-red-500"
              onClick={() => handleDeletePin(selectedPin)}
            >
              Xóa ghim
            </li>
            <li className="border-t border-gray-200 my-1"></li>
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setModalVisible(false);
                setSelectedPin(null);
              }}
            >
              Hủy
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PinComponentWeb;