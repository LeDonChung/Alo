import { useDispatch, useSelector } from "react-redux";
import { addViceLeader, blockMember, removeMember, removeMemberGroup, removeViceLeader, setViceLeader, updatePermissions } from "../../redux/slices/ConversationSlice";
import showToast from "../../utils/AppUtils";
import { useState } from "react";
import socket from "../../utils/socket";



const MenuMember = ({ leaderId, viceLeaderIds, member, conversation, isOpen, onClose, userLogin }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenConfirmBlock, setIsOpenConfirmBlock] = useState(false);
    if (!isOpen) return null;

    const handleAddViceLeader = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const resp = await dispatch(addViceLeader({ conversationId: conversation.id, memberUserId: member.id }));
            const result = resp.payload?.data;
            await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.roles }));

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
                                        <div className="w-full cursor-pointer" onClick={onClose}>
                                            <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Rời nhóm</p>
                                        </div>
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
                                        <div className="w-full cursor-pointer" onClick={onClose}>
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

                            <ModalConfirmBlockMember
                                isOpen={isOpenConfirmBlock}
                                onClose={() => { setIsOpenConfirmBlock(false); }}
                                member={member}
                                conversation={conversation}
                                closeMenu={onClose}
                            />

                            {/* user login is member */}
                            {
                                userLogin.id === member.id && member.id !== leaderId && !viceLeaderIds.includes(member.id) && (
                                    <div className="w-full cursor-pointer" onClick={onClose}>
                                        <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Rời nhóm</p>
                                    </div>
                                )
                            }
                        </>
                    )
                }

            </div>
        </>
    )

}


const ModalConfirmBlockMember = ({ isOpen, onClose, member, conversation, closeMenu }) => {
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
                                await dispatch(removeMemberGroup({ conversationId: conversation.id, memberUserId: member.id }));
                                socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });
                                showToast("Bạn đã xóa " + member.fullName + " khỏi nhóm và chặn người này tham gia lại!", "info");
                            });
                    });
            } else {
                await dispatch(removeMember({ conversationId: conversation.id, memberUserId: member.id })).unwrap()
                    .then(async (result) => {
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

export default MenuMember;