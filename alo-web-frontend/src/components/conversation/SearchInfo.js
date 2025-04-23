import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const SearchInfo = ({ search, setSearch, setIsSetting, scrollToMessage }) => {
   const dispatch = useDispatch();
   const [searchText, setSearchText] = useState('');
   const [activeFilter, setActiveFilter] = useState(null);
   const [filteredMessages, setFilteredMessages] = useState([]);
   const [selectedSender, setSelectedSender] = useState(null);
   const [selectedDate, setSelectedDate] = useState(null);
   const [isFiltering, setIsFiltering] = useState(false);

   // Lấy dữ liệu từ Redux
   const conversation = useSelector((state) => state.conversation.conversation);
   const messages = useSelector((state) => state.message.messages);
   const userLogin = useSelector((state) => state.user.userLogin);

   // Biến để lưu trữ danh sách người gửi và ngày gửi duy nhất
   const [uniqueSenders, setUniqueSenders] = useState([]);
   const [uniqueDates, setUniqueDates] = useState([]);
   const [selectedMessageId, setSelectedMessageId] = useState(null);

   // Tạo danh sách người gửi và ngày gửi duy nhất khi messages thay đổi
   useEffect(() => {
      if (messages && messages.length > 0) {
         // Lấy danh sách người gửi duy nhất
         const senders = [...new Map(
            messages.map(msg => [msg.senderId, msg.sender])
         ).values()].filter(sender => sender);

         setUniqueSenders(senders);

         // Lấy danh sách ngày gửi duy nhất
         const dates = [...new Set(
            messages.map(msg => new Date(msg.timestamp).toLocaleDateString('vi-VN'))
         )];

         setUniqueDates(dates);
      }
   }, [messages]);

   // Xử lý tìm kiếm khi người dùng nhập
   useEffect(() => {
      if (!searchText && !selectedSender && !selectedDate) {
         setFilteredMessages([]);
         setIsFiltering(false);
         return;
      }

      setIsFiltering(true);

      // Lọc tin nhắn theo điều kiện tìm kiếm
      let filtered = [...messages];

      // Lọc theo từ khóa
      if (searchText.trim() !== '') {
         filtered = filtered.filter(msg =>
            (msg.text && msg.text.toLowerCase().includes(searchText.toLowerCase())) ||
            (msg.content && msg.content.toLowerCase().includes(searchText.toLowerCase()))
         );
      }

      // Lọc theo người gửi
      if (selectedSender) {
         filtered = filtered.filter(msg => msg.senderId === selectedSender.id);
      }

      // Lọc theo ngày
      if (selectedDate) {
         filtered = filtered.filter(msg => {
            const msgDate = new Date(msg.timestamp).toLocaleDateString('vi-VN');
            return msgDate === selectedDate;
         });
      }

      setFilteredMessages(filtered);
   }, [searchText, selectedSender, selectedDate, messages]);

   const handleSearch = (e) => {
      e.preventDefault();
      // Tìm kiếm đã được xử lý trong useEffect
   };

   const toggleSenderFilter = () => {
      setActiveFilter(activeFilter === 'sender' ? null : 'sender');
   };

   const toggleDateFilter = () => {
      setActiveFilter(activeFilter === 'date' ? null : 'date');
   };

   const selectSender = (sender) => {
      setSelectedSender(sender === selectedSender ? null : sender);
      setActiveFilter(null);
   };

   const selectDate = (date) => {
      setSelectedDate(date === selectedDate ? null : date);
      setActiveFilter(null);
   };

   // Format định dạng ngày giờ
   const formatDateTime = (dateString) => {
      const date = new Date(dateString);

      // Định dạng giờ (HH:MM)
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      // Định dạng ngày (dd/MM/yyyy)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() trả về 0-11
      const year = date.getFullYear();

      return `${hours}:${minutes} - ${day}/${month}/${year}`;
   };

   const jumpToMessage = (message) => {
      console.log("Scrolling to message:", message.id);
      scrollToMessage(message.id);
      const messageElement = document.getElementById(`message-${message.id}`);
      if (messageElement) {
         messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setSelectedMessageId(message.id);
   };

   const clearFilters = () => {
      setSelectedSender(null);
      setSelectedDate(null);
      setSearchText('');
      setActiveFilter(null);
      setIsFiltering(false);
   };

   console.log("Filtered messages:", filteredMessages.length);

   return (
      <div className="flex flex-col h-full bg-white">
         <div className="p-3 border-b border-gray-200 flex items-center">
            <h2 className="text-base font-semibold flex-1">Tìm kiếm trong trò chuyện</h2>
            <button
               className="text-gray-500 hover:text-gray-700 p-1"
               onClick={() => { setSearch(false); setIsSetting(true) }}
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>

         <div className="p-3 flex-1 overflow-y-auto">
            <form onSubmit={handleSearch} className="mb-3">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                  </div>
                  <input
                     type="text"
                     placeholder="Nhập từ khóa để tìm kiếm"
                     className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                     value={searchText}
                     onChange={(e) => setSearchText(e.target.value)}
                  />
               </div>
            </form>

            {/* Phần bộ lọc - thiết kế mới với hiển thị dọc khi có lọc được chọn */}
            <div className="flex flex-col text-xs text-gray-600 mb-3 gap-2">
               <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">Lọc theo:</span>
                  <div className="relative flex-1 min-w-0">
                     <button
                        onClick={toggleSenderFilter}
                        className={`flex items-center text-xs px-2 py-1 border ${selectedSender ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'} rounded-full w-full justify-between`}
                     >
                        <div className="flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                           <span className="truncate max-w-[70px]">
                              {selectedSender ? "Người gửi" : "Người gửi"}
                           </span>
                        </div>
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                     </button>

                     {activeFilter === 'sender' && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                           {uniqueSenders.map((sender) => (
                              <div
                                 key={sender.id}
                                 className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedSender?.id === sender.id ? 'bg-blue-50' : ''}`}
                                 onClick={() => selectSender(sender)}
                              >
                                 <div className="flex items-center">
                                    <img
                                       src={sender.avatarLink || "https://via.placeholder.com/30"}
                                       alt="avatar"
                                       className="w-5 h-5 rounded-full mr-2"
                                    />
                                    <span className="truncate">{sender.fullName}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="relative flex-1 min-w-0">
                     <button
                        onClick={toggleDateFilter}
                        className={`flex items-center text-xs px-2 py-1 border ${selectedDate ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'} rounded-full w-full justify-between`}
                     >
                        <div className="flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                           <span className="truncate max-w-[70px]">
                              {selectedDate ? "Ngày gửi" : "Ngày gửi"}
                           </span>
                        </div>
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                     </button>

                     {activeFilter === 'date' && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                           {uniqueDates.map((date) => (
                              <div
                                 key={date}
                                 className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedDate === date ? 'bg-blue-50' : ''}`}
                                 onClick={() => selectDate(date)}
                              >
                                 {date}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               {/* Active filters displayed on a new line */}
               {(selectedSender || selectedDate) && (
                  <div className="flex flex-wrap gap-2 mt-1">
                     {selectedSender && (
                        <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200 text-xs">
                           <img
                              src={selectedSender.avatarLink || "https://via.placeholder.com/30"}
                              alt="avatar"
                              className="w-4 h-4 rounded-full mr-1"
                           />
                           <span className="truncate max-w-[100px]">{selectedSender.fullName}</span>
                           <button
                              onClick={() => selectSender(selectedSender)}
                              className="ml-1 text-blue-500 hover:text-blue-700"
                           >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>
                     )}

                     {selectedDate && (
                        <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200 text-xs">
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                           <span>{selectedDate}</span>
                           <button
                              onClick={() => selectDate(selectedDate)}
                              className="ml-1 text-blue-500 hover:text-blue-700"
                           >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>
                     )}

                     {(selectedSender || selectedDate || searchText) && (
                        <button
                           onClick={clearFilters}
                           className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                        >
                           Xóa tất cả
                        </button>
                     )}
                  </div>
               )}
            </div>

            {!isFiltering && (
               <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-blue-100 rounded-full p-5 mb-3">
                     <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                  </div>
                  <p className="text-sm text-gray-600 text-center">Hãy nhập từ khóa để bắt đầu tìm kiếm</p>
                  <p className="text-xs text-gray-500 text-center">tin nhắn và file trong trò chuyện</p>
               </div>
            )}

            {isFiltering && filteredMessages.length === 0 && (
               <div className="text-center py-6 text-gray-500 text-sm">
                  Không tìm thấy kết quả phù hợp
               </div>
            )}

            {isFiltering && filteredMessages.length > 0 && (
               <div className="space-y-3 overflow-y-auto">
                  {filteredMessages.map(message => (
                     <div
                        key={message.id}
                        className={`p-2 border ${selectedMessageId === message.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-md hover:bg-gray-50 cursor-pointer text-xs`}
                        onClick={() => jumpToMessage(message)}
                     >
                        <div className="flex items-center mb-1">
                           <img
                              src={message.sender?.avatarLink || "https://via.placeholder.com/30"}
                              alt="avatar"
                              className="w-4 h-4 rounded-full mr-1"
                           />
                           <div className="flex-1 min-w-0">
                              <span className="font-medium text-xs truncate block">
                                 {message.sender?.fullName || "Người dùng"}
                              </span>
                           </div>
                           <span className="text-[10px] text-gray-500 ml-1 whitespace-nowrap">
                              {formatDateTime(message.timestamp)}
                           </span>
                        </div>
                        <p className="text-xs text-gray-700 break-words">
                           {/* Kiểm tra dữ liệu tin nhắn ở nhiều field khác nhau */}
                           {(message.text && message.text.length > 100
                              ? message.text.substring(0, 100) + "..."
                              : message.text) ||
                              (message.content && message.content.length > 100
                                 ? message.content.substring(0, 100) + "..."
                                 : message.content)}
                        </p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};