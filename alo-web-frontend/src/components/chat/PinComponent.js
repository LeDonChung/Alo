// import React, { useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { removePin } from '../../redux/slices/ConversationSlice';
// import socket from '../../utils/socket';

// const PinComponentWeb = ({ conversation, pins, scrollToMessage }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPin, setSelectedPin] = useState(null);
//   const dispatch = useDispatch();
//   const userLogin = useSelector((state) => state.user.userLogin);

//   // Hàm lấy đuôi file
//   const getFileExtension = useCallback((filename = '') => {
//     const parts = filename.split('.');
//     return parts[parts.length - 1].toLowerCase();
//   }, []);

//   // Hàm lấy tên file gốc
//   const extractOriginalName = useCallback((fileUrl) => {
//     const fileNameEncoded = fileUrl.split('/').pop();
//     const fileNameDecoded = decodeURIComponent(fileNameEncoded);
//     const parts = fileNameDecoded.split(' - ');
//     return parts[parts.length - 1];
//   }, []);

//   // Hàm lấy thông tin thành viên
//   const getMember = useCallback(
//     (memberId) => {
//       return (
//         conversation.members.find((member) => member.id === memberId) || {
//           fullName: 'Ẩn danh',
//           avatarLink: 'https://via.placeholder.com/40',
//         }
//       );
//     },
//     [conversation.members]
//   );

//   // Xử lý mở rộng/thu gọn danh sách ghim
//   const handleToggleExpand = useCallback(() => {
//     setExpanded((prev) => !prev);
//   }, []);

//   // Xử lý xóa ghim
//   const handleDeletePin = useCallback(
//     async (pin) => {
//       try {
//         await dispatch(
//           removePin({ conversationId: conversation.id, messageId: pin.messageId })
//         ).unwrap();
//         socket.emit('remove-pin', {
//           conversation,
//           messageId: pin.messageId,
//         });
//         setModalVisible(false);
//       } catch (error) {
//         console.error('Error removing pin:', error);
//       }
//     },
//     [conversation, dispatch]
//   );

//   // Render một mục ghim
//   const renderPinItem = (pinItem, index, showToggle = false) => {
//     // Kiểm tra xem pinItem.message có tồn tại không
//     if (!pinItem.message) {
//       return (
//         <div
//           key={index}
//           className="flex items-center bg-white mx-2 mt-2 p-3 rounded-lg shadow-md border border-blue-500"
//         >
//           <svg
//             className="w-6 h-6 text-blue-500 mr-2"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//             />
//           </svg>
//           <div className="flex-1">
//             <p className="text-sm text-gray-500">Tin nhắn không khả dụng</p>
//             <p className="text-xs text-gray-500">
//               Tin nhắn của {getMember(pinItem.senderId || '')?.fullName}
//             </p>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div
//         key={index}
//         className="flex items-center bg-white mx-2 mt-2 p-3 rounded-lg shadow-md border border-blue-500 cursor-pointer hover:bg-gray-50"
//         onClick={() => {
//           scrollToMessage(pinItem.messageId);
//           setSelectedPin(pinItem);
//           handleToggleExpand();
//         }}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           setSelectedPin(pinItem);
//           setModalVisible(true);
//         }}
//       >
//         <svg
//           className="w-6 h-6 text-blue-500 mr-2"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//           />
//         </svg>
//         <div className="flex-1">
//           {pinItem.message.messageType === 'file' && (
//             <p className="text-sm text-gray-800 truncate">
//               [File] {extractOriginalName(pinItem.message.fileLink)}
//             </p>
//           )}
//           {pinItem.message.messageType === 'image' && (
//             <div className="flex items-center">
//               <p className="text-sm text-gray-800">[Ảnh]</p>
//               <img
//                 src={pinItem.message.fileLink}
//                 alt="Pinned Image"
//                 className="ml-2 w-12 h-12 rounded-md object-cover"
//                 loading="lazy"
//               />
//             </div>
//           )}
//           {pinItem.message.messageType === 'sticker' && (
//             <div className="flex items-center">
//               <p className="text-sm text-gray-800">[Sticker]</p>
//               <img
//                 src={pinItem.message.fileLink}
//                 alt="Pinned Sticker"
//                 className="ml-2 w-12 h-12 rounded-md object-cover"
//                 loading="lazy"
//               />
//             </div>
//           )}
//           {pinItem.message.messageType === 'text' && (
//             <p className="text-sm text-gray-800 truncate">{pinItem.message.content}</p>
//           )}
//           <p className="text-xs text-gray-500">
//             Tin nhắn của {getMember(pinItem.message.senderId)?.fullName}
//           </p>
//         </div>
//         {showToggle && pins.length > 1 && (
//           <div
//             className="flex items-center bg-white border border-blue-500 rounded-full px-3 py-1 ml-2"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleToggleExpand();
//             }}
//           >
//             <p className="text-sm font-bold text-gray-800">+{pins.length - 1}</p>
//             <svg
//               className={`w-4 h-4 ml-1 text-blue-500 ${expanded ? 'rotate-180' : ''}`}
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div
//       className={`mt-2 ${expanded ? 'bg-white p-2 rounded-lg border border-blue-500 shadow-md' : ''}`}
//     >
//       {expanded && (
//         <p className="text-base font-medium text-gray-800 pl-2">
//           Danh sách ghim
//         </p>
//       )}
//       {pins.length > 0 && renderPinItem(pins[0], 0, true)}
//       {expanded &&
//         pins.slice(1).map((pinItem, index) => renderPinItem(pinItem, index + 1))}
//       {expanded && (
//         <div className="flex justify-center mt-4">
//           <button
//             className="flex items-center text-blue-500 hover:text-blue-700"
//             onClick={handleToggleExpand}
//           >
//             <p className="text-sm">Thu gọn</p>
//             <svg
//               className="w-5 h-5 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M5 15l7-7 7 7"
//               />
//             </svg>
//           </button>
//         </div>
//       )}
//       {modalVisible && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-4 w-full max-w-sm">
//             <p className="text-lg font-semibold mb-4">Tùy chọn ghim</p>
//             <button
//               className="w-full text-left py-2 hover:bg-gray-100"
//               onClick={() => {
//                 scrollToMessage(selectedPin.messageId);
//                 setModalVisible(false);
//                 if (expanded) handleToggleExpand();
//               }}
//             >
//               Xem tin nhắn
//             </button>
//             <button
//               className="w-full text-left py-2 text-red-500 hover:bg-gray-100"
//               onClick={() => handleDeletePin(selectedPin)}
//             >
//               Xóa ghim
//             </button>
//             <button
//               className="w-full text-left py-2 mt-2 hover:bg-gray-100"
//               onClick={() => setModalVisible(false)}
//             >
//               Hủy
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PinComponentWeb;