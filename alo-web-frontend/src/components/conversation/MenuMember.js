import { useDispatch, useSelector } from "react-redux";
import { addViceLeader, blockMember, removeMember, removeMemberGroup, removeViceLeader, setViceLeader, updatePermissions } from "../../redux/slices/ConversationSlice";
import showToast from "../../utils/AppUtils";
import { useState } from "react";
import socket from "../../utils/socket";
import ModalOutGroup from "./ModalOutGroup";
import ModalChangeLeader from "./ModalChangeLeader";
import ModalConfirmBlockMember from "./ModalConfirmBlockMember";
import { addMessage, sendMessage, updateMessage } from "../../redux/slices/MessageSlice";



const MenuMember = ({ leaderId, viceLeaderIds, member, conversation, isOpen, onClose, userLogin }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenConfirmBlock, setIsOpenConfirmBlock] = useState(false);
    const [isOpenOutGroup, setIsOpenOutGroup] = useState(false);
    const [isOpenChangeLeader, setIsOpenChangeLeader] = useState(false);
    const [newLeaderId, setNewLeaderId] = useState(leaderId);
    if (!isOpen) return null;

    const handleAddViceLeader = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const resp = await dispatch(addViceLeader({ conversationId: conversation.id, memberUserId: member.id }));
            const result = resp.payload?.data;
            await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.roles }));
            const requestId = Date.now() + Math.random();
            const message = {
                id: requestId,
                requestId: requestId,
                senderId: userLogin.id,
                conversationId: conversation.id,
                content: `${member.fullName} đã được bổ nhiệm thành phó nhóm`,
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
                conversation,
                message: sentMessage,
            });

            socket.emit("update-roles", { conversation: result });
            showToast("Bạn đã bổ nhiệm " + member.fullName + " làm phó nhóm!", "info");
            onClose();
        } catch (error) {
            showToast(error.message, "error");
        }
        setIsLoading(false);
    }

    const handleRemoveViceLeader = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const resp = await dispatch(removeViceLeader({ conversationId: conversation.id, memberUserId: member.id }));
            const result = resp.payload?.data;
            await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.roles }));
            const requestId = Date.now() + Math.random();
            const message = {
                id: requestId,
                requestId: requestId,
                senderId: userLogin.id,
                conversationId: conversation.id,
                content: `${member.fullName} không còn là phó nhóm`,
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
                conversation,
                message: sentMessage,
            });

            socket.emit("update-roles", { conversation: result });
            showToast("Bạn đã gỡ quyền phó nhóm của " + member.fullName + "!", "info");
            onClose();
        } catch (error) {
            showToast(error.message, "error");
        }
        setIsLoading(false);
    }

    return (
        <>
            <div className="absolute bg-white border border-gray-200 rounded-md shadow-lg z-10 right-10 mt-2 w-48">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center w-full h-16">
                            <div
                                className="w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin mx-auto"
                                aria-hidden="true"
                            ></div>
                        </div>
                    ) : (
                        <>
                            {/* User login is leader */}
                            {
                                userLogin.id === leaderId && (
                                    member.id === leaderId ? (
                                        <>
                                            <div className="w-full cursor-pointer" onClick={() => { setIsOpenChangeLeader(true) }}>
                                                <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Rời nhóm</p>
                                            </div>

                                        </>
                                    ) : (
                                        <>
                                            {
                                                viceLeaderIds.includes(member.id) ? (
                                                    <div className="w-full cursor-pointer" onClick={(e) => handleRemoveViceLeader(e)}>
                                                        <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Gỡ quyền phó nhóm</p>
                                                    </div>
                                                ) : (
                                                    <div className="w-full cursor-pointer" onClick={(e) => handleAddViceLeader(e)}>
                                                        <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Thêm phó nhóm</p>
                                                    </div>
                                                )
                                            }
                                            <div className="w-full cursor-pointer" onClick={() => {
                                                setIsOpenConfirmBlock(true);
                                            }}>
                                                <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Xóa khỏi nhóm</p>
                                            </div>
                                        </>
                                    )
                                )
                            }


                            {/* user login is vice_leader */}
                            {
                                viceLeaderIds.includes(userLogin.id) && (
                                    member.id === userLogin.id ? (
                                        <div className="w-full cursor-pointer" onClick={() => { setIsOpenOutGroup(true) }}>
                                            <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Rời nhóm</p>
                                        </div>
                                    ) : (
                                        member.id !== leaderId && (
                                            <div className="w-full cursor-pointer" onClick={() => {
                                                setIsOpenConfirmBlock(true);
                                            }}>
                                                <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Xóa khỏi nhóm</p>
                                            </div>
                                        )
                                    )
                                )
                            }

                            <ModalChangeLeader
                                isOpen={isOpenChangeLeader}
                                onClose={() => {
                                    setIsOpenChangeLeader(false);
                                    setIsOpenOutGroup(true);
                                }}
                                conversation={conversation}
                                leaderId={leaderId}
                                userLogin={userLogin}
                                cancel={() => {
                                    setIsOpenChangeLeader(false);
                                    onClose();
                                }}
                                setNewLeaderId={setNewLeaderId}
                            />

                            <ModalConfirmBlockMember
                                isOpen={isOpenConfirmBlock}
                                onClose={() => { setIsOpenConfirmBlock(false); }}
                                member={member}
                                conversation={conversation}
                                closeMenu={onClose}
                                userLogin={userLogin}
                            />

                            {/* user login is member */}
                            {
                                userLogin.id === member.id && member.id !== leaderId && !viceLeaderIds.includes(member.id) && (
                                    <div className="w-full cursor-pointer" onClick={() => { setIsOpenOutGroup(true) }}>
                                        <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Rời nhóm</p>
                                    </div>
                                )
                            }

                            <ModalOutGroup
                                isOpen={isOpenOutGroup}
                                onClose={() => {
                                    setIsOpenOutGroup(false);
                                    onClose();

                                }}
                                conversation={conversation}
                                newLeaderId={newLeaderId}
                                leaderId={leaderId}
                                userLogin={userLogin}
                                member={member}
                            />
                        </>
                    )
                }

            </div>
        </>
    )

}

export default MenuMember;