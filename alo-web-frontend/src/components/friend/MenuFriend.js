import { faChevronRight, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalShowInfoFriend from "./ModalShowInfoFriend";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setConversation } from "../../redux/slices/ConversationSlice";
import showToast from "../../utils/AppUtils";
import { blockFriend, removeFriend, unblockFriend, unfriend, updateFriend } from "../../redux/slices/FriendSlice";
import socket from "../../utils/socket";

const MenuFriend = ({ friend, conversations, listCategory, setSelectCategory, setOpen, userLogin }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [detailFriend, setDetailFriend] = useState(null);
    const [isOpenConfirm, setIsOpenConfirm] = useState(false);
    const [isShowInfoFriend, setIsShowInfoFriend] = useState(false);
    const [isUnfriend, setIsUnfriend] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const detailRef = useRef(null); 

    const handleNavigateChat = async (e, friendInfo) => {
        e.preventDefault();
        try {
            const conversation = conversations.find((conversation) => {
                return conversation.memberUserIds.includes(userLogin.id) && conversation.memberUserIds.includes(friendInfo.id) && conversation.memberUserIds.length === 2;
            });
            await dispatch(setConversation(conversation));
            navigate('/me')
        } catch (error) {
            console.error("Error navigating to chat:", error);
            showToast("Đã xảy ra lỗi khi mở cuộc trò chuyện. Vui lòng thử lại.", "error");
        }
    }

    const handleUnfriend = async (item) => {
        try {
            if (isOpenConfirm) {
                const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];

                const friendUpdate = {
                    userId: userLogin.id,
                    friendId: friendId
                };

                const res = await dispatch(unfriend(friendUpdate)).unwrap();

                if (res.data && res.data.status === 4) {

                    dispatch(removeFriend(friendUpdate));
                    setIsOpenConfirm(false);
                    socket.emit("unfriend-request", friendUpdate);
                    showToast("Đã hủy kết bạn thành công.", "success");
                }
            }
        } catch (error) {
            console.error("Error unfriending:", error);
            showToast("Đã xảy ra lỗi khi xóa kết bạn. Vui lòng thử lại.", "error");
        }
    };

    const handleBlockFriend = async (id) => {
        try {
            const friendUpdate = {
                userId: userLogin.id,
                friendId: id
            }
            // Chặn bạn
            const friendResp = await dispatch(blockFriend(friendUpdate));
            const friendResult = friendResp.payload.data ? friendResp.payload.data : null;
            if (friendResult && friendResult.status === 3) {
                // Cập nhật danh sách bạn bè trong Redux
                await dispatch(updateFriend({ friendId: id, status: 3, userId: userLogin.id }));
                setOpenDetail(false);
                // socket
                socket.emit("block-request", friendUpdate);
            }

        } catch (error) {
            console.error("Error blocking friend:", error);
            // Hiển thị thông báo lỗi
            showToast("Đã xảy ra lỗi khi chặn bạn. Vui lòng thử lại.", "error");
        }
    }

    const handleUnblockFriend = async (id) => {
        console.log("unblock friend", id);
        try {
            const friendUpdate = {
                userId: userLogin.id,
                friendId: id
            }
            // Chặn bạn
            const friendResp = await dispatch(unblockFriend(friendUpdate));
            const friendResult = friendResp.payload.data ? friendResp.payload.data : null;
            if (friendResult && friendResult.status === 1) {
                setOpenDetail(false);
                // socket
                socket.emit("unblock-friend", friendUpdate);
            }
        } catch (error) {
            console.error("Error unblocking friend:", error);
            // Hiển thị thông báo lỗi
            showToast("Đã xảy ra lỗi khi bỏ chặn bạn. Vui lòng thử lại.", "error");
        }
    }
    return (
        <div className="relative">
            <button
                className="cursor-pointer text-lg font-bold"
                onClick={() => {
                    setDetailFriend(friend);
                    setOpenDetail(!openDetail);
                }}
            >
                <FontAwesomeIcon icon={faEllipsis} />
            </button>
            {openDetail && detailFriend.friendInfo.id === friend.friendInfo.id && (
                <div className="absolute left-[-200px] mt-1 w-[200px] bg-white rounded-lg shadow-lg">
                    <button
                        onClick={() => {
                            console.log("Xem thông tin bạn bè", friend.friendInfo);
                            setIsShowInfoFriend(true);
                        }}
                        className="w-full flex items-center justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2">
                        <span className="">Xem thông tin</span>
                    </button>
                    {
                        isShowInfoFriend && (
                            <ModalShowInfoFriend
                                isOpen={isShowInfoFriend}
                                onClose={() => {
                                    setIsShowInfoFriend(false);
                                    setOpenDetail(false);
                                }}
                                handleNavigateChat={handleNavigateChat}
                                friendInfo={friend.friendInfo}
                                conversations={conversations}
                            />
                        )
                    }

                    <div className="px-4 relative group py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2">
                        <div className="flex items-center justify-between cursor-pointer hover:bg-gray-100">
                            <span>Phân loại</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-500" size="15" />
                        </div>

                        {/* Submenu: Danh sách phân loại */}
                        <div className="absolute left-[-200px] top-0 ml-1 w-[180px] bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                            {listCategory.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectCategory(cat);
                                        setOpen(false);
                                    }}
                                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    <span
                                        className="inline-block w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: cat.color }}
                                    ></span>
                                    <span>{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2">
                        <span>Đặt tên gợi nhớ</span>
                    </button>
                    <>
                        <button
                            type="button"
                            className="w-full flex items-center justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2"
                            onClick={() => {
                                if (friend.friendInfo.status === 3) {
                                    handleUnblockFriend(friend.friendId);
                                }
                                else {
                                    handleBlockFriend(friend.friendId);
                                }
                            }}
                        >
                            <span>{friend.friendInfo.status === 3 ? 'Bỏ chặn' : 'Chặn người này'}</span>
                        </button>
                    </>
                    <>
                        <button
                            type="button"
                            className="w-full flex items-center text-red-700 justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2"
                            onClick={() => {
                                console.log("button xóa kết bạn");
                                setIsOpenConfirm(true); // Mở modal xác nhận
                            }}
                        >
                            <span>Xóa kết bạn</span>

                        </button>

                        {/* Modal confirm unfriend */}
                        {isOpenConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white rounded-lg p-4 shadow-lg w-[300px]">
                                    <p className="text-center text-gray-800">{`Bạn có chắc chắn muốn hủy kết bạn với ${friend.friendInfo.fullName}`}</p>
                                    <div className="flex justify-between mt-4">
                                        <button
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            onClick={async () => {
                                                setIsUnfriend(true);
                                                await handleUnfriend(friend)
                                                setIsUnfriend(false);
                                            }}
                                        >
                                            {
                                                isUnfriend ? (
                                                    <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
                                                ) : (
                                                    "Đồng ý"
                                                )
                                            }
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                            onClick={() => setIsOpenConfirm(false)}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>

                </div>
            )}
        </div>
    );
}

export default MenuFriend;