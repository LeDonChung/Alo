import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFriendByPhone, sendFriendRequest, unblockFriend, unfriend, cancelFriendRequest, rejectFriendRequest, acceptFriendRequest } from "../redux/slices/FriendSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import showToast from "../utils/AppUtils";
import socket from "../utils/socket";
export const SearchByPhone = (isOpenAdd) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const friend = useSelector(state => state.friend.friend);
    const dispatch = useDispatch();
    const userLogin = JSON.parse(localStorage.getItem('userLogin'));
    const [info, setInfo] = useState(null);
    const [isShowInfo, setIsShowInfo] = useState(false);

    // content mời kết bạn
    const [isOpenModalContent, setIsOpenModalContent] = useState(false);
    const [contentInvite, setContentInvite] = useState('Mình tìm kiếm bạn qua số điện thoại. Kết bạn với mình nhé!');

    // xac nhan xoa ban be
    const [isOpenConfirm, setIsOpenConfirm] = useState(false);
    const [isLoadingPhone, setIsLoadingPhone] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
    }, [info, isOpenAdd]);

    useEffect(() => {
        const handleRejectFriendRequest = (data) => {
            if (data.friendId === userLogin.id) {
                handleSearch();
            }
        };
        socket.on("receive-reject-friend", handleRejectFriendRequest);
        return () => {
            socket.off("receive-reject-friend", handleRejectFriendRequest);
        };
    }, []);

    useEffect(() => {
        const handleAcceptFriendRequest = (data) => {
            if (data.friendId === userLogin.id) {
                handleSearch();
            }
        };
        socket.on("receive-accept-friend", handleAcceptFriendRequest);
        return () => {
            socket.off("receive-accept-friend", handleAcceptFriendRequest);
        };
    }, []);

    const handleSearch = async () => {
        setIsLoadingPhone(true);
        if (!phoneNumber) return;
        try {
            const result = await dispatch(getFriendByPhone(phoneNumber));
            const user = result.payload?.data?.phoneNumber ? result.payload.data : null;
            setInfo(user); // Đặt dữ liệu người dùng vào state
            setIsShowInfo(true); // Hiển thị thông tin nguoi dùng
        } catch (error) {
            console.error("Lỗi khi tìm kiếm bạn bè:", error);
        }
        setIsLoadingPhone(false);
    };

    const sendFriend = async () => {
        setIsLoading(true);
        const request = {
            userId: userLogin.id,
            friendId: info.friendId,
            contentRequest: contentInvite,
        };

        try {
            const result = await dispatch(sendFriendRequest(request));
            const friendResult = result.payload.data ? result.payload.data : null;
            if (friendResult && friendResult.status === 0) {
                socket.emit("send-friend-request", friendResult)
                setIsOpenModalContent(false);
                setContentInvite('Mình tìm kiếm bạn qua số điện thoại. Kết bạn với mình nhé!');
                setIsShowInfo(false); // Hiển thị thông tin nguoi dùng
                setInfo(null); // Đặt dữ liệu người dùng vào state
                handleSearch(); // Tìm kiếm lại bạn bè
            } else {
                console.error("Lỗi khi gửi lời mời kết bạn:", result.payload?.message);
            }
        } catch (error) {
            console.error("Lỗi khi gửi lời mời kết bạn:", error);
        }
        setIsLoading(false);
    }

    const handleUnfriend = async (id) => {
        setIsLoading(true);
        const request = {
            userId: userLogin.id,
            friendId: id,
        };
        try {
            const result = await dispatch(unfriend(request));
            const friendResult = result.payload.data ? result.payload.data : null;

            if (friendResult && friendResult.status === 4) {
                socket.emit("unfriend-request", friendResult); // Gửi sự kiện hủy kết bạn đến server
                setIsOpenConfirm(false); // Đóng modal xác nhận
                setIsOpenModalContent(false); // Đóng modal nội dung mời kết bạn
                setInfo(null); // Đặt dữ liệu người dùng vào state
                setIsShowInfo(false); // Hiển thị thông tin nguoi dùng
                handleSearch();
            } else {
                console.error("Lỗi khi hủy kết bạn:", result.payload?.message);
            }
        } catch (error) {
            console.error("Lỗi khi hủy kết bạn:", error);
        }
        setIsLoading(false);
    }

    const handleUnblock = async (id) => {
        setIsLoading(true);
        const request = {
            userId: userLogin.id,
            friendId: id,
        };
        try {
            const result = await dispatch(unblockFriend(request));
            const friendResult = result.payload.data ? result.payload.data : null;
            if (friendResult && friendResult.status === 1) {
                socket.emit("unblock-friend", friendResult); // Gửi sự kiện mở chặn đến server
                setIsShowInfo(false);
                handleSearch();
            }
        } catch (error) {
            console.error("Lỗi khi mở chặn bạn bè:", error);
        }
        setIsLoading(false);
    }

    const handleCancel = async (id) => {
        setIsLoading(true);
        const request = {
            userId: userLogin.id,
            friendId: id,
        };
        try {
            const result = await dispatch(cancelFriendRequest(request));
            const friendResult = result.payload.data ? result.payload.data : null;
            if (friendResult && friendResult.status === -1) {
                socket.emit("cancel-friend-request", friendResult); // Gửi sự kiện hủy lời mời đến server
                await handleSearch();
            }
            else {
                console.error("Lỗi khi hủy lời mời kết bạn:", result.payload?.message);
            }
        } catch (error) {
            console.error("Lỗi khi hủy lời mời kết bạn:", error);
        }
        setIsLoading(false);
    }

    const handleAcceptFriend = async (id) => {
        setIsLoading(true);
        const request = {
            userId: userLogin.id,
            friendId: id,
        };
        try {

            const result = await dispatch(acceptFriendRequest(request));
            const friendResult = result.payload.data ? result.payload.data : null;
            if (friendResult && friendResult.status === 1) {
                socket.emit("accept-friend-request", friendResult); // Gửi sự kiện chấp nhận lời mời đến server
                handleSearch(); // Tìm kiếm lại bạn bè
            } else {
                console.error("Lỗi khi chấp nhận lời mời kết bạn:", result.payload?.message);
            }
        } catch (error) {
            console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
        }
        setIsLoading(false);
    }

    const handleRejectFriend = async (id) => {
        setIsLoading(true);
        const request = {
            userId: userLogin.id,
            friendId: id,
        };
        try {
            const result = await dispatch(rejectFriendRequest(request));
            const friendResult = result.payload.data ? result.payload.data : null;
            if (friendResult && friendResult.status === 2) {
                socket.emit("reject-friend-request", friendResult); // Gửi sự kiện từ chối lời mời đến server
                handleSearch(); // Tìm kiếm lại bạn bè
            } else {
                console.error("Lỗi khi từ chối lời mời kết bạn:", result.payload?.message);
            }
        } catch (error) {
            console.error("Lỗi khi từ chối lời mời kết bạn:", error);
        }
        setIsLoading(false);
    }

    const handleClick = () => {
        if (info.status === -1 || info.status === 4 || info.status === 2) {
            // Gửi lời mời kết bạn
            setIsOpenModalContent(true);
            setIsShowInfo(false);
        } else if (info.status === 0) {
            if (info.senderId === userLogin.id) {
                // Hủy lời mời
                handleCancel(info.friendId);
            } else {
                // Từ chối lời mời
                handleRejectFriend(info.friendId);
            }
        } else if (info.status === 3) {
            // Mở chặn
            handleUnblock(info.friendId);
            isOpenAdd.onClose(); // Đóng modal
        }
        else {
            // Hủy kết bạn
            setIsOpenConfirm(true);
            setIsOpenModalContent(false);
            setIsShowInfo(false);
        }
    };

    if (!isOpenAdd) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-4 shadow-lg w-[400px]">
                    <div className="flex items-center justify-between">

                        {
                            isShowInfo && (
                                <button onClick={() => setIsShowInfo(false)} className="hover:text-white hover:bg-gray-500 w-6 h-6 flex items-center justify-center rounded-full">
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                            )
                        }

                        <p className="text-start text-[18px] font-medium text-gray-800">{isShowInfo ? "Thông tin người dùng" : "Thêm bạn"} </p>
                        <button onClick={() => isOpenAdd.onClose()} className="hover:text-white hover:bg-gray-500 w-6 h-6 flex items-center justify-center rounded-full">
                            X
                        </button>
                    </div>

                    {
                        !isShowInfo && !isOpenModalContent && (
                            <>
                                <input
                                    className="w-full border-b border-gray-300 focus:outline-none focus:border-gray-400 mt-4"
                                    placeholder="Nhập số điện thoại"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => isOpenAdd.onClose()}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-gray-800 rounded  hover:bg-blue-600 text-white"
                                        onClick={() => handleSearch()}
                                    >
                                        {isLoadingPhone ? (
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                            </div>
                                        ) : (
                                            "Tìm kiếm"
                                        )}
                                    </button>
                                </div>
                            </>
                        )
                    }
                    {
                        isShowInfo && !isOpenModalContent && (
                            <>
                                {
                                    info !== null && (
                                        <>
                                            <div className="flex items-center justify-center">
                                                <img src={info.avatarLink ? info.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"} alt="avatar" className="w-20 h-20 rounded-full" />
                                            </div>
                                            <p className="text-center text-gray-800 font-semibold mt-2">{info.fullName}</p>
                                            <p className="text-center text-gray-500 mt-1">{info.phoneNumber}</p>
                                        </>
                                    )
                                }
                                {
                                    info === null && (
                                        <p className="text-center text-gray-800 font-semibold mt-2">Không tìm thấy người dùng</p>
                                    )
                                }
                                <div className="flex justify-between mt-4">

                                    {
                                        info !== null && (

                                            <>
                                                <button
                                                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                                    onClick={() => { }}
                                                >
                                                    Nhắn tin
                                                </button>
                                                <button
                                                    className={`px-4 py-2 ${info?.status === -1 ? 'bg-blue-500' : info?.status === 3 ? 'bg-sky-500' : info?.status === 0 ? "bg-red-700" :
                                                        info?.status === 2 ? "bg-blue-500" : info?.status === 4 ? "bg-blue-500" : 'bg-red-700'} text-gray-800 rounded 
                                                    hover:${info?.status === -1 ? 'bg-blue-700' : info?.status === 3 ? 'bg-sky-800' : info?.status === 0 ? "bg-red-800" :
                                                            info?.status === 2 ? "bg-blue-700" : info?.status === 4 ? "bg-blue-700" : 'bg-red-800'} text-white`}
                                                    onClick={() => handleClick()}
                                                >
                                                    {isLoading && info?.status !== -1 && info?.status !== 2 && info?.status !== 4 ? (
                                                                <div className="flex justify-center items-center">
                                                                    <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                                                </div>
                                                            ) : (
                                                                info?.status === -1 ? "Gửi lời mời kết bạn" : info?.status === 3 ? "Mở chặn" : info?.status === 0 ? (info.senderId === userLogin.id ? "Hủy lời mời" : " Từ chối") : info?.status === 2 ? "Gửi lời mời kết bạn" : info?.status === 4 ? "Gửi lời mời kết bạn" : "Hủy kết bạn"
                                                            )}
                                                    
                                                </button>

                                                {
                                                    info?.status === 0 && info.senderId !== userLogin.id && (
                                                        <button
                                                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                                            onClick={() => handleAcceptFriend(info.friendId)}
                                                        >
                                                            {isLoading ? (
                                                                <div className="flex justify-center items-center">
                                                                    <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                                                </div>
                                                            ) : (
                                                                "Đồng ý"
                                                            )}
                                                        </button>
                                                    )
                                                }
                                            </>
                                        )
                                    }
                                </div>
                            </>
                        )
                    }

                    {
                        isOpenModalContent && !isShowInfo && (
                            <>
                                <p className="text-center text-gray-800 font-semibold mt-2">Nội dung lời mời kết bạn</p>
                                <textarea
                                    className="w-full border-b border-gray-300 focus:outline-none focus:border-gray-400 mt-4"
                                    placeholder="Nhập nội dung lời mời kết bạn"
                                    value={contentInvite}
                                    onChange={(e) => setContentInvite(e.target.value)}
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => {
                                            setIsOpenModalContent(false);
                                            setContentInvite('');
                                            setIsShowInfo(true);
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                        onClick={() => sendFriend()}
                                    >
                                        {isLoading ? (
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                            </div>
                                        ) : (
                                            "Gửi lời mời"
                                        )}
                                    </button>
                                </div>
                            </>
                        )
                    }

                </div>
            </div>

            {
                isOpenConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-4 shadow-lg w-[300px]">
                            <p className="text-center text-gray-800">{`Bạn có chắc chắn muốn hủy kết bạn với ${info.fullName}`}</p>
                            <div className="flex justify-between mt-4">
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => handleUnfriend(info.friendId)}
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                        </div>
                                    ) : (
                                        "Đồng ý"
                                    )}
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
                )
            }
        </>
    );
};