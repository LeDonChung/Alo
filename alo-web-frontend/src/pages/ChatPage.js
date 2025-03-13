import React, { useState } from 'react';
import FriendList from '../components/FriendList';
// import ChatWindown from './components/ChatWindown';
import RightSlidebar from '../components/RightSlideBarChat';
import ChatWindown from '../components/ChatWindown';

const ChatPage = () => {
  // Danh sách bạn bè mẫu
  const friends = [
    { id: 1, name: 'Cô gái Lụa Lụa', lastMessage: 'Bạn: alo alo', avatar: 'https://stc-zlogin.zdn.vn/images/banner_icon.svg' },
    { id: 2, name: 'Bố', lastMessage: 'Con ơi', avatar: 'https://stc-zlogin.zdn.vn/images/banner_icon.svg' },
    { id: 3, name: 'CNM', lastMessage: 'Hello', avatar: 'https://stc-zlogin.zdn.vn/images/banner_icon.svg' },
    { id: 4, name: 'Tuấn Kiệt', lastMessage: 'Hello', avatar: 'https://stc-zlogin.zdn.vn/images/banner_icon.svg' },
  ];

  // Trạng thái bạn đang chat
  const [selectedFriend, setSelectedFriend] = useState(friends[0]);

  return (
    <div className="flex h-full">
      {/* Danh sách bạn bè (bên trái) */}
      <FriendList friends={friends} onSelectFriend={setSelectedFriend} />

      {/* Khu vực chat (giữa) */}
      <ChatWindown selectedFriend={selectedFriend} />

      {/* Tab bên phải (Ảnh/Video, File, Link, Thiệp mừng) */}
      <RightSlidebar />
    </div>
  );
};

export default ChatPage;