import React from 'react';

const FriendList = ({ friends, onSelectFriend }) => {
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 p-4 overflow-y-auto max-h-[2000px] scrollable">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm bạn bè"
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="space-y-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <img
              src={friend.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-2"
            />
            <div>
              <p className="font-semibold">{friend.name}</p>
              <p className="text-sm text-gray-500">{friend.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;