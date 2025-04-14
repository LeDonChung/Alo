// 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import socket from '../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import { setUserOnlines } from '../redux/slices/UserSlice';
import { setConversation, updateLastMessage } from '../redux/slices/ConversationSlice';

const ConversationList = () => {
    const userOnlines = useSelector(state => state.user.userOnlines);
    const dispatch = useDispatch();
    const userLogin = useSelector(state => state.user.userLogin);
    const conversations = useSelector(state => state.conversation.conversations);
    const selectedConversation = useSelector(state => state.conversation.conversation);

    // Lắng nghe danh sách người dùng online
    useEffect(() => {
        socket.on("users-online", ({ userIds }) => {
            dispatch(setUserOnlines(userIds));
        });

        return () => {
            socket.off("users-online");
        };
    }, [dispatch]);

    // Lắng nghe cập nhật tin nhắn cuối cùng
    useEffect(() => {
        socket.on('update-last-message', (conversationId, message) => {
            console.log('update-last-message', conversationId, message);
            dispatch(updateLastMessage({ conversationId, message }));
        });

        return () => {
            socket.off('update-last-message');
        };
    }, [dispatch]);

    // Kiểm tra trạng thái online của bạn bè
    const isFriendOnline = (userId) => {
        return userOnlines.includes(userId);
    };

    // Lấy thông tin bạn bè trong hội thoại cá nhân
    const getFriend = (conversation) => {
        if (!conversation.isGroup) {
            const friend = conversation.members.find((member) => member.id !== userLogin.id);
            return friend || {};
        }
        return null;
    };

    // Hàm lấy tên hội thoại cho header
    const getConversationName = (conversation) => {
        if (!conversation) return "Không xác định";
        return conversation.isGroup
            ? conversation.name || "Nhóm chat"
            : getFriend(conversation)?.fullName || "Không xác định";
    };


    // Hiển thị nội dung tin nhắn cuối cùng
    // const showLastMessage = (conversation) => {
    //     if (conversation.lastMessage) {
    //         let message = conversation.lastMessage.content;
    //         switch (conversation.lastMessage.messageType) {
    //             case 'sticker':
    //                 message = 'Sticker';
    //                 break;
    //             case 'image':
    //                 message = 'Hình ảnh';
    //                 break;
    //             case 'file':
    //                 message = 'Tệp tin';
    //                 break;
    //             case 'video':
    //                 message = 'Video';
    //                 break;
    //             default:
    //                 break;
    //         }
    //         if (conversation.lastMessage.senderId === userLogin.id) {
    //             return "Bạn: " + message;
    //         } else {
    //             // return (conversation.isGroup ? "" : getFriend(conversation)?.fullName) + ": " + message;
    //         }
    //     }
    //     return "Chưa có tin nhắn";
    // };
    // Hiển thị nội dung tin nhắn cuối cùng
    const showLastMessage = (conversation) => {
        if (!conversation?.lastMessage) {
            return "Chưa có tin nhắn";
        }

        let message = conversation.lastMessage.content;
        switch (conversation.lastMessage.messageType) {
            case 'sticker':
                message = 'Sticker';
                break;
            case 'image':
                message = 'Hình ảnh';
                break;
            case 'file':
                message = 'Tệp tin';
                break;
            case 'video':
                message = 'Video';
                break;
            default:
                break;
        }

        const senderId = conversation.lastMessage.senderId;
        if (senderId === userLogin.id) {
            return "Bạn: " + message;
        } else {
            if (conversation.isGroup) {
                // Tìm thành viên gửi tin nhắn trong danh sách members
                const sender = conversation.members?.find(member => member.id === senderId);
                return (sender?.fullName || "Thành viên") + ": " + message;
            } else {
                return getFriend(conversation)?.fullName + ": " + message;
            }
        }
    };

    // Định dạng thời gian tin nhắn cuối cùng
    const getLastTimeMessage = (time) => {
        const now = new Date();
        const timeX = new Date(time);
        const diffInMs = now - timeX;
        const diffInSec = Math.floor(diffInMs / 1000);
        const diffInMin = Math.floor(diffInSec / 60);
        const diffInHours = Math.floor(diffInMin / 60);

        if (diffInSec < 60) {
            return `Vài giây`;
        } else if (diffInMin < 60) {
            return `${diffInMin} phút`;
        } else if (diffInHours < 24) {
            return `${diffInHours} giờ`;
        } else {
            return `${timeX.toLocaleDateString('vi-VN')}`;
        }
    };

    // Xử lý chọn hội thoại
    const handleSelectConversation = (conversation) => {
        if (selectedConversation) {
            socket.emit("leave_conversation", selectedConversation.id);
        }
        dispatch(setConversation(conversation));
    };

    return (
        <div className="bg-white border-r border-gray-200 py-4 overflow-y-auto max-h-[calc(100vh-75px)] scrollable">
            {conversations.length === 0 ? (
                <p className="text-center text-gray-500 p-4">Chưa có cuộc hội thoại nào.</p>
            ) : (
                conversations.map((conversation) => (
                    <div
                        key={conversation.id} // Sửa lỗi key từ conversations.id thành conversation.id
                        onClick={() => handleSelectConversation(conversation)}
                        className={`flex py-4 justify-between items-center p-2 hover:bg-gray-100 cursor-pointer ${conversation.id === selectedConversation?.id ? 'bg-gray-100' : ''
                            }`}
                    >
                        <div className="flex items-center">
                            {/* Avatar */}
                            <img
                                src={
                                    conversation.isGroup
                                        ? (conversation.avatar || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg")
                                        : (getFriend(conversation)?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg")
                                }
                                alt={getConversationName(conversation)}
                                className="w-10 h-10 rounded-full mr-2"
                            />
                            {/* Tên và tin nhắn cuối */}
                            <div>
                                <p className="font-semibold">
                                    {getConversationName(conversation)}
                                </p>
                                <p className="text-sm text-gray-500 truncate max-w-[280px]">
                                    {showLastMessage(conversation)}
                                </p>
                            </div>
                        </div>
                        {/* Thời gian tin nhắn cuối */}
                        <div className="mb-auto">
                            <p className="text-sm text-gray-500">
                                {conversation.lastMessage && getLastTimeMessage(conversation.lastMessage.timestamp)}
                            </p>
                            {!conversation.isGroup && isFriendOnline(getFriend(conversation)?.id) && (
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block ml-2"></span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ConversationList;