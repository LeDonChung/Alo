import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { removeAllReaction, setMessageUpdate } from '../../redux/slices/MessageSlice';
import socket from '../../utils/socket';

const ModalReaction = ({ message, conversation, userLogin, onClose, isOpen }) => {
  const [selectedReactionTab, setSelectedReactionTab] = useState(null);
  const dispatch = useDispatch();

  // Memoize danh sách reactions
  const reactions = useMemo(
    () => [
      { type: 'like', icon: '👍' },
      { type: 'love', icon: '❤️' },
      { type: 'laugh', icon: '😆' },
      { type: 'wow', icon: '😮' },
      { type: 'sad', icon: '😭' },
      { type: 'angry', icon: '😠' },
    ],
    []
  );

  // Tạo emoji map
  const emojiMap = useMemo(() => {
    return reactions.reduce((map, r) => {
      map[r.type] = r.icon;
      return map;
    }, {});
  }, [reactions]);

  // Lấy danh sách reaction
  const extractReactions = useCallback(
    (reactionObj) => {
      if (!reactionObj) return [];
      return Object.entries(reactionObj)
        .map(([type, { quantity }]) => ({
          type,
          emoji: emojiMap[type] || '❓',
          count: quantity,
        }))
        .filter((r) => r.count > 0);
    },
    [emojiMap]
  );

  // Lấy danh sách người dùng đã reaction
  const getUserReactions = useCallback(
    (reactionObj) => {
      const userMap = {};
      if (!reactionObj || typeof reactionObj !== 'object') return [];

      Object.entries(reactionObj).forEach(([type, { users }]) => {
        users.forEach((userId) => {
          if (!userMap[userId]) {
            userMap[userId] = {
              id: userId,
              emojis: [],
              rawTypes: [],
            };
          }
          userMap[userId].emojis.push(emojiMap[type] || '❓');
          userMap[userId].rawTypes.push(type);
        });
      });

      return Object.values(userMap);
    },
    [emojiMap]
  );

  // Lấy thông tin thành viên
  const getMember = useCallback(
    (userId) => {
      return (
        conversation.members.find((m) => m.id === userId) || {
          fullName: 'Ẩn danh',
          avatarLink: 'https://via.placeholder.com/40',
        }
      );
    },
    [conversation.members]
  );

  // Lọc danh sách người dùng theo tab
  const userReactions = useMemo(() => {
    return getUserReactions(message.reaction).filter(
      (user) => !selectedReactionTab || user.rawTypes.includes(selectedReactionTab)
    );
  }, [message.reaction, selectedReactionTab, getUserReactions]);

  // Lấy top 3 reaction
  const extractedReactions = useMemo(
    () => extractReactions(message.reaction),
    [message.reaction, extractReactions]
  );

  // Lấy reaction của người dùng hiện tại
  const myReaction = useMemo(
    () => getUserReactions(message.reaction).find((u) => u.id === userLogin.id),
    [message.reaction, getUserReactions, userLogin.id]
  );

  // Xóa tất cả reaction của người dùng hiện tại
  const handleRemoveAllReactions = useCallback(async () => {
    try {
      const updatedReaction = {};
      Object.entries(message.reaction || {}).forEach(([type, data]) => {
        const filteredUsers = data.users.filter((userId) => userId !== userLogin.id);
        const quantity = filteredUsers.length;
        if (quantity > 0) {
          updatedReaction[type] = { quantity, users: filteredUsers };
        }
      });

      dispatch(setMessageUpdate({ messageId: message.id, reaction: updatedReaction }));
      await dispatch(removeAllReaction({ messageId: message.id }))
        .unwrap()
        .then((res) => {
          socket.emit('update-reaction', { conversation, message: res.data });
        });
      onClose();
    } catch (error) {
      console.error('Error removing reactions:', error);
    }
  }, [message, userLogin.id, dispatch, conversation, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold mb-4">Tương tác</h3>
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          <button
            className={`px-4 py-2 ${selectedReactionTab === null ? 'border-b-2 border-black font-bold' : ''}`}
            onClick={() => setSelectedReactionTab(null)}
          >
            Tất cả ({extractedReactions.reduce((total, { count }) => total + count, 0)})
          </button>
          {extractedReactions.map(({ type, emoji, count }) => (
            <button
              key={type}
              className={`px-4 py-2 flex items-center ${selectedReactionTab === type ? 'border-b-2 border-black font-bold' : ''}`}
              onClick={() => setSelectedReactionTab(type)}
            >
              {emoji} {count}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {userReactions.length > 0 ? (
            userReactions.map((user) => {
              const displayedEmojis = selectedReactionTab
                ? user.rawTypes.includes(selectedReactionTab)
                  ? [emojiMap[selectedReactionTab]]
                  : []
                : user.emojis;
              return (
                <div key={user.id} className="flex items-center py-2">
                  <img
                    src={getMember(user.id).avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3"
                    loading="lazy"
                  />
                  <p className="flex-1 text-sm">{getMember(user.id).fullName}</p>
                  <p className="text-sm">{displayedEmojis.join(' ')}</p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">Không có tương tác nào.</p>
          )}
        </div>
        {myReaction && (
          <button
            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
            onClick={handleRemoveAllReactions}
          >
            Xóa tất cả tương tác của bạn
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalReaction;