import { use, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import showToast, { removeVietnameseTones } from "../../utils/AppUtils";
import socket from "../../utils/socket";
import { useDispatch } from "react-redux";
import { changeLeader, leaveGroup, removeConversation, updatePermissions } from "../../redux/slices/ConversationSlice";
import ModalChangeLeader from "./ModalChangeLeader";


const ModalOutGroup = ({ isOpen, onClose, conversation, userLogin, newLeaderId, leaderId, member }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleOutGroup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("leader old: ", leaderId);
        console.log("new leader: ", newLeaderId);


        if (newLeaderId === leaderId) {
            // thanh vien out
            try {
                await dispatch(leaveGroup({ conversationId: conversation.id })).unwrap()
                    .then(async (result) => {
                        await dispatch(removeConversation({ conversationId: conversation.id }));
                        showToast("Bạn đã rời khỏi nhóm " + conversation.name + " .", 'info');
                        socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });
                    });


            } catch (error) {
                showToast(error.message, 'error');
            }
        } else {
            // thanh vien out
            try {
                // chuyeern quyen truong nhom
                await dispatch(changeLeader({ conversationId: conversation.id, memberUserId: newLeaderId })).unwrap()
                    .then(async (result) => {
                        socket.emit("update-roles", { conversation: result.data });
                        await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.data.roles }));

                        await dispatch(leaveGroup({ conversationId: conversation.id })).unwrap()
                            .then(async (result) => {
                                await dispatch(removeConversation({ conversationId: conversation.id }));
                                showToast("Bạn đã rời khỏi nhóm " + conversation.name + " .", 'info');
                                socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });
                            });
                        console.log("Updated roles: ", result.data.roles);

                    });



            } catch (error) {
                showToast(error.message, 'error');
            }
        }

        setIsLoading(false);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <>
            <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${isOpen ? "block" : "hidden"} flex justify-center items-center`}>
                <div className="bg-white rounded-lg shadow-lg w-[400px] p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Rời nhóm và xóa cuộc trò chuyện</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            ✖
                        </button>
                    </div>

                    <p className="text-sm text-gray-700">Bạn sẽ không thể xem lại tin nhắn trong nhóm này sau khi rời nhóm.</p>

                    <div className="mb-4">
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={onClose}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-200 cursor-pointer"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={(e) => { handleOutGroup(e) }}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg mr-2 hover:bg-red-700 cursor-pointer"
                            >
                                {
                                    isLoading ? (
                                        <div className="flex items-center justify-center w-full h-4">
                                            <div
                                                className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"
                                                aria-hidden="true"
                                            ></div>
                                        </div>
                                    ) : (
                                        "Rời nhóm"
                                    )
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}





export default ModalOutGroup;