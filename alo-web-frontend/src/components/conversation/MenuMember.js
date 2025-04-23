import { useDispatch } from "react-redux";
import { addViceLeader, removeViceLeader, setViceLeader, updatePermissions } from "../../redux/slices/ConversationSlice";
import showToast from "../../utils/AppUtils";
import { useState } from "react";



const MenuMember = ({ leaderId, viceLeaderIds, member, conversation, isOpen, onClose, userLogin }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    if (!isOpen) return null;

    const handleAddViceLeader = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const resp = await dispatch(addViceLeader({ conversationId: conversation.id, memberUserId: member.id }));
            const result = resp.payload?.data;
            await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.roles }));
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
                                            <div className="w-full cursor-pointer" onClick={onClose}>
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
                                            <div className="w-full cursor-pointer" onClick={onClose}>
                                                <p className="text-sm text-gray-700 px-4 py-2 hover:bg-gray-100">Xóa khỏi nhóm</p>
                                            </div>
                                        )
                                    )
                                )
                            }

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

export default MenuMember;