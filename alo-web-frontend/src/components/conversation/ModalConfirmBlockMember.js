import { useState } from "react";
import { useDispatch } from "react-redux";
import { blockMember, removeMember, removeMemberGroup } from "../../redux/slices/ConversationSlice";
import socket from "../../utils/socket";
import showToast from "../../utils/AppUtils";
import { addMessage, sendMessage } from "../../redux/slices/MessageSlice";


const ModalConfirmBlockMember = ({ isOpen, onClose, member, conversation, closeMenu, userLogin }) => {
    const [confirm, setConfirm] = useState(false);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    if (!isOpen) return null;

    const handleRemoveMember = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (confirm) {
                await dispatch(blockMember({ conversationId: conversation.id, memberUserId: member.id })).unwrap()
                    .then(async (resp) => {
                        await dispatch(removeMember({ conversationId: conversation.id, memberUserId: member.id })).unwrap()
                            .then(async (result) => {

                                const requestId = Date.now() + Math.random();
                                const message = {
                                    id: requestId,
                                    requestId: requestId,
                                    senderId: userLogin.id,
                                    conversationId: conversation.id,
                                    content: `${member.fullName} đã được ${userLogin.fullName} xóa khỏi nhóm`,
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
                                socket.emit('send-message', {
                                    conversation,
                                    message: sentMessage,
                                });
                                await dispatch(removeMemberGroup({ conversationId: conversation.id, memberUserId: member.id }));
                                socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });

                            });
                    });
            } else {
                await dispatch(removeMember({ conversationId: conversation.id, memberUserId: member.id })).unwrap()
                    .then(async (result) => {
                        const requestId = Date.now() + Math.random();
                        const message = {
                            id: requestId,
                            requestId: requestId,
                            senderId: userLogin.id,
                            conversationId: conversation.id,
                            content: `${member.fullName} đã được ${userLogin.fullName} xóa khỏi nhóm`,
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
                        socket.emit('send-message', {
                            conversation,
                            message: sentMessage,
                        });

                        await dispatch(removeMemberGroup({ conversationId: conversation.id, memberUserId: member.id }));
                        socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });
                    });
            }
            setConfirm(false);
            onClose();
            closeMenu();

        } catch (error) {
            showToast(error.message, "error");
        }

        setIsLoading(false);
    }

    return (
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${isOpen ? "block" : "hidden"
            } flex justify-center items-center`}>
            <div className="bg-white rounded-lg shadow-lg w-[400px] p-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                    <h2 className="text-lg font-semibold">Xác nhận</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        ✖
                    </button>
                </div>
                {/* Add confirmation message here */}
                <p className="text-sm text-gray-700">Xóa thành viên {member.fullName} khỏi nhóm.</p>

                <div className="flex items-center mt-2">
                    <input
                        type="checkbox"
                        id="confirmAction"
                        name="confirmation"
                        checked={confirm}
                        onChange={(e) => setConfirm(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="confirmAction" className="ml-2 text-sm text-gray-700">
                        Chặn người này tham gia lại nhóm trong tương lai.
                    </label>
                </div>

                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="bg-gray-200 font-medium px-4 py-2 rounded hover:bg-gray-300 mr-2">Đóng</button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 font-medium rounded hover:bg-blue-600" onClick={(e) => { handleRemoveMember(e) }}>
                        {
                            isLoading ? (
                                <div
                                    className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"
                                    aria-hidden="true"
                                ></div>
                            ) : "Đồng ý"
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalConfirmBlockMember;