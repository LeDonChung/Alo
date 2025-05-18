import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getConversationByToken, joinGroupByLink } from "../redux/slices/ConversationSlice";
import { QRCodeCanvas } from 'qrcode.react';
import { useParams } from "react-router-dom";
import showToast from "../utils/AppUtils";
import socket from "../utils/socket";
import { addMessage, sendMessage, updateMessage } from "../redux/slices/MessageSlice";

export const GroupInfo = () => {
    const { token } = useParams();
    const dispatch = useDispatch();
    const conversationInvite = useSelector((state) => state.conversation.conversationInvite);
    const userLogin = localStorage.getItem("userLogin") ? JSON.parse(localStorage.getItem("userLogin")) : null;
    useEffect(() => {
        const handlerGetConversation = async () => {
            const tokenJwt = localStorage.getItem("accessToken");
            if (!tokenJwt) {
                // 2s sau sẽ chuyển về trang login
                showToast("Bạn cần đăng nhập để vào nhóm này", "error");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                try {
                    await dispatch(getConversationByToken(token)).unwrap().then((res) => {
                    })
                } catch (error) {
                    console.error("Error fetching conversation:", error);
                    // link bị hỏng hoặc không tồn tại
                    showToast("Link nhóm không tồn tại hoặc đã hết hạn", "error");
                    // goback
                    setTimeout(() => {
                        window.history.back();
                    }, 2000);
                }
            }
        };
        handlerGetConversation();
    }, [token]);

    const handlerJoinGroup = async () => {
        // Kiểm tra quyền của conversation 
        let memberRole = conversationInvite.roles.find(role => role.role === 'member');
        if (memberRole && !memberRole.permissions?.joinGroupByLink) {
            showToast("Hiện tại cuộc trò chuyện không cho phép tham gia bằng link nhóm.", "error");
            return;
        }
        try {
            // Tham gia nhóm
            await dispatch(joinGroupByLink({ conversationId: conversationInvite.id })).unwrap().then(async (res) => {

                const message = {
                    senderId: userLogin.id,
                    conversationId: conversationInvite.id,
                    content: `${userLogin.fullName} đã tham gia nhóm bằng link`,
                    messageType: "system",
                    timestamp: Date.now(),
                    seen: [],
                    sender: userLogin,
                }

                dispatch(addMessage(message));

                const sendRes = await dispatch(sendMessage({ message, file: null })).unwrap();
                const sentMessage = {
                    ...sendRes.data,
                    sender: userLogin,
                };

                dispatch(updateMessage(sentMessage));
                socket.emit('send-message', {
                    conversation: conversationInvite,
                    message: sentMessage,
                });

                showToast("Tham gia nhóm thành công", "success");
                // dùng socket yêu cầu những người trong nhóm thêm member vào nhóm
                //socket
                socket.emit("add-members-to-group", {
                    conversation: {
                        ...res.data,
                        memberUserIds: res.data.memberUserIds.filter((member) => member !== userLogin.id),
                        members: res.data.members.filter((member) => member.id !== userLogin.id),
                        roles: res.data.roles
                    }, memberSelected: [userLogin.id], memberInfo: [userLogin]
                });
                setTimeout(() => {
                    window.location.href = `/me`;
                }, 2000);

            })
        } catch (error) {
            console.error("Error joining group:", error);
            showToast(error.message || "Tham gia nhóm thất bại", "error");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center  px-3">
                <h1 className="text-blue-500 text-xl font-bold">Alo</h1>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center">
                {conversationInvite && (
                    <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-6 max-w-[800px] w-full">
                        {/* Left Section: Group Info */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={conversationInvite.avatar}
                                    alt="Group Avatar"
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {conversationInvite.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">Nhóm</p>
                                </div>
                            </div>
                            <button
                                className="mt-4 w-32 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition"
                                onClick={() => {
                                    handlerJoinGroup()
                                }} // Replace with actual join logic
                            >
                                <span>Tham gia nhóm</span>
                            </button>

                        </div>

                        {/* Right Section: QR Code */}
                        <div className="flex-shrink-0">
                            <QRCodeCanvas className="mx-auto mb-4" value={token} size={150} />
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                Mở Alo, bấm quét QR để đi vào nhóm này
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white p-4 text-center text-xs text-gray-500">
                © Copyright 2021 Zalo Group. All Rights Reserved.
            </footer>
        </div>
    );
};