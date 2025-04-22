/* eslint-disable jsx-a11y/alt-text */
import { useState, useRef, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, getProfile, logout, setUserLogin, setUserOnlines, updateLastLogin, updateProfile, uploadAvatar, uploadBackground } from "../redux/slices/UserSlice";
import showToast from "../utils/AppUtils";
import socket from "../utils/socket";
import { addPinToConversation, getAllConversation, removePinToConversation, updateLastMessage, addConversation, setConversation, updateProfileGroupById } from "../redux/slices/ConversationSlice";
import { setMessageRemoveOfMe, setMessages, setMessageUpdate, updateSeenAllMessage, addMessage, seenOne } from "../redux/slices/MessageSlice";
import { addFriend, addFriendsRequest, getFriends, getFriendsRequest, removeFriend, setFriends, setFriendsRequest } from "../redux/slices/FriendSlice";
export const Navigation = () => {
    const dispatch = useDispatch();
    const userLogin = useSelector((state) => state.user.userLogin);

    // ============= HANDLE SOCKET LOGOUT ==============
    const handleLogout = async () => {
        await dispatch(logout()).unwrap().then((res) => {
            // remove 
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userLogin');
            setShowProfileModal(false);
            setShowSettings(false);
            showToast("Đăng xuất thành công", "success");
            socket.emit("logout", userLogin?.id);
            navigate("/login");
        });
    }


    useEffect(() => {
        const handleLogoutChangedPassword = () => {
            showToast("Phiên đăng nhập đã hết.", "error");
            handleLogout();
        };

        socket.on("logout-changed-password", handleLogoutChangedPassword);

        return () => {
            socket.off("logout-changed-password", handleLogoutChangedPassword);
        };
    }, []);


    const init = async () => {
        console.log("HIIII")
        if (!userLogin) {
            const user = JSON.parse(localStorage.getItem('userLogin'));
            const accessToken = localStorage.getItem('accessToken');
            if (user && accessToken) {
                console.log("SAVE")
                dispatch(setUserLogin(user));
            } else {
                window.location.href = '/login';
            }
        }
        dispatch(getAllConversation());
        dispatch(getFriends());
        dispatch(getFriendsRequest())
    }

    useEffect(() => {
        socket.emit('login', userLogin?.id);
    }, [userLogin?.id]);
    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const handleUpdateMessage = async (data) => {
            const ms = data.message;
            const cvt = data.conversation;
            await dispatch(setMessageUpdate({ messageId: ms.id, status: ms.status }));
            await dispatch(updateLastMessage({ conversationId: cvt.id, message: ms }));
        }
        socket.on('receive-update-message', handleUpdateMessage);
        return () => {
            socket.off('receive-update-message', handleUpdateMessage);
        };
    }, [userLogin?.id, dispatch]);



    const friends = useSelector((state) => state.friend.friends);
    // ============= HANDLE SOCKET FRIEND ==============
    useEffect(() => {
        const handleReceiveAcceptFriendRequest = async (data) => {
            dispatch(addFriend(data));
        };
        socket.on("receive-accept-friend", handleReceiveAcceptFriendRequest);
        return () => {
            socket.off("receive-accept-friend", handleReceiveAcceptFriendRequest);
        };
    }, []);
    useEffect(() => {
        const handleReceiveUnfriendRequest = async (data) => {
            console.log("Receive Unfriend WEB", data);
            dispatch(removeFriend({
                userId: data.friendId,
                friendId: data.userId
            }));

        };
        socket.on("receive-unfriend", handleReceiveUnfriendRequest);
        return () => {
            socket.off("receive-unfriend", handleReceiveUnfriendRequest);
        };
    }, []);
    useEffect(() => {
        const handleRejectFriendRequestForMe = async (data) => {
            console.log("Receive Reject Friend For Me", data);
            dispatch(setFriendsRequest(data.updatedFriendsRequest));
        }
        socket.on("receive-reject-friend-for-me", handleRejectFriendRequestForMe);
        return () => {
            socket.off("receive-reject-friend-for-me", handleRejectFriendRequestForMe);
        };
    }, [])

    useEffect(() => {
        const handleReceiveAcceptFriendRequestForMe = async (data) => {
            console.log("Receive Accept Friend For Me", data);
            dispatch(setFriendsRequest(data.updatedFriendsRequest));
            dispatch(addFriend({
                userId: data.userId,
                friendInfo: data.friendInfo,
                friendId: data.friendId
            }));
        };
        socket.on("receive-accept-friend-for-me", handleReceiveAcceptFriendRequestForMe);
        return () => {
            socket.off("receive-accept-friend-for-me", handleReceiveAcceptFriendRequestForMe);
        };
    }, []);
    useEffect(() => {
        const handlerUpdateLastMessage = async (conversationId, message) => {
            console.log('update-last-message', conversationId, message);
            await dispatch(updateLastMessage({ conversationId, message }));
        }

        socket.on('update-last-message', handlerUpdateLastMessage);

        return () => {
            socket.off('update-last-message', handlerUpdateLastMessage);
        }
    }, []);
    useEffect(() => {
        socket.on("users-online", ({ userIds }) => {
            dispatch(setUserOnlines(userIds));
        });
    }, []);
    const messages = useSelector((state) => state.message.messages);
    useEffect(() => {
        console.log("Messages", messages);
    }, [messages]);




    const friendsRequest = useSelector((state) => state.friend.friendsRequest);
    useEffect(() => {
        const handleReceiveFriendRequest = async (data) => {
            console.log('Receive Friend', data);
            dispatch(addFriendsRequest(data));
            showToast("Bạn có lời mời kết bạn mới từ " + data.fullName, "success");
            await dispatch(getAllConversation());
        };

        socket.on("receive-friend-request", handleReceiveFriendRequest);

        return () => {
            socket.off("receive-friend-request", handleReceiveFriendRequest);
        };
    }, []);
    useEffect(() => {
        const handleCancleFriendRequest = (data) => {
            console.log('Cancle Friend', data);
            const updatedList = friendsRequest.filter((item) => item.senderId !== data.senderId);
            dispatch(setFriendsRequest(updatedList));
        };
        socket.on("receive-cancle-friend-request", handleCancleFriendRequest);
        return () => {
            socket.off("receive-cancle-friend-request", handleCancleFriendRequest);
        };
    }, []);
    const conversation = useSelector((state) => state.conversation.conversation);
    useEffect(() => {
        const handleReceiveSeenMessage = async (data) => {
            console.log('receive-seen-message', data);
            dispatch(updateSeenAllMessage(data.messages));
        }
        socket.on('receive-seen-message', handleReceiveSeenMessage);

        return () => {
            socket.off('receive-seen-message', handleReceiveSeenMessage);
        }
    }, [])
    useEffect(() => {
        const handlerRemoveOfMe = async (data) => {
            const { messageId, userId } = data;
            dispatch(setMessageRemoveOfMe({ messageId: messageId, userId: userId }));
        }
        socket.on('receive-remove-of-me', handlerRemoveOfMe);
        return () => {
            socket.off('receive-remove-of-me', handlerRemoveOfMe);
        }
    }, [])
    const [menus, setMenus] = useState([
        { id: 1, icon: "./icon/ic_message.png", onPress: () => navigate("/me") },
        { id: 2, icon: "./icon/ic_round-perm-contact-calendar.png", onPress: () => navigate("/contact") },
        { id: 3, icon: "./icon/ic_outline-cloud.png" },
    ]);
    const [selectedMenu, setSelectedMenu] = useState(menus[0]);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const navigate = useNavigate();
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleUnPinMessage = (data) => {
            const { conversation, pin } = data;
            console.log("Received unpin message:", conversation, pin);
            dispatch(removePinToConversation(pin));
        }
        socket.on("receive-unpin-message", handleUnPinMessage);

        return () => {
            socket.off("receive-unpin-message", handleUnPinMessage);
        }
    }, []);

    useEffect(() => {
        const handleReceivePinMessage = (data) => {
            console.log("Received pin message:", data);
            const { conversation, pin } = data;
            console.log("Received pin message:", conversation, pin);

            dispatch(addPinToConversation(pin));
            showToast("Đã có ghim mới.", "info");
        }
        socket.on("receive-pin-message", handleReceivePinMessage);

        return () => {
            socket.off("receive-pin-message", handleReceivePinMessage);
        }
    }, []);

    //lắng nghe sự kiện tạo nhóm từ server
    useEffect(() => {
        socket.on("receive-create-group", ({ conversation }) => {
            console.log("Nhận được sự kiện receive-create-group:", conversation);
            dispatch(addConversation(conversation));
            const conversationId = conversation.id;
            socket.emit("join_conversation", conversationId);
            console.log(`Tham gia phòng nhóm ${conversationId}`);
        });

        socket.on("error", (error) => {
            console.error("Lỗi từ server qua socket:", error);
        });

        return () => {
            socket.off("receive-create-group");
            socket.off("error");
        };
    }, [dispatch]);

    // // Lắng nghe sự kiện server
    //   useEffect(() => {
    //     socket.on('receive-remove-all-history-messages', (data) => {
    //       const { conversationId } = data;
    //       if (conversationId === conversation.id) {
    //         dispatch(setConversation({ ...conversation, messages: [], lastMessage: null }));
    //         setPhotos([]);
    //         setFiles([]);
    //         setLinks([]);
    //         setPhotosGroupByDate([]);
    //         setFilesGroupByDate([]);
    //         alert('Lịch sử trò chuyện đã được xóa bởi trưởng nhóm.');
    //       }
    //     });
    
    //     return () => {
    //       socket.off('receive-remove-all-history-messages');
    //     };
    //   }, [conversation, dispatch]);


    useEffect(() => {
        const handlerReceiveUpdatedConversation = async (data) => {
          console.log("Receive updated profile conversation", data);
          const conversation = data.conversation;
          await dispatch(updateProfileGroupById(conversation));
        }
    
        socket.on("receive_update_profile_group", handlerReceiveUpdatedConversation);
    
        return () => {
          socket.off("receive_update_profile_group", handlerReceiveUpdatedConversation);
        }
      }, []);
    return (
        <>
            {/* Sidebar Navigation */}
            <div className="w-20 bg-blue-600 text-white flex flex-col items-center py-4 px-4 relative">
                <div className="cursor-pointer" onClick={() => setShowProfileModal(true)}>
                    <img src={userLogin?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                        className="rounded-full w-12 h-12 bg-cover" />
                </div>
                <div className="flex flex-col mt-20">
                    {menus.map((menu) => (
                        <a
                            key={menu.id}
                            onClick={() => { setSelectedMenu(menu); menu.onPress?.(); }}
                            className={`cursor-pointer p-2 ${selectedMenu.id === menu.id ? 'bg-[#0043A8] hover:bg-[#5591eccb]' : 'hover:bg-[#5591eccb]'} rounded-lg mb-2`}
                        >
                            <img src={menu.icon} className="w-9 h-9 object-contain" />
                        </a>
                    ))}
                </div>
                <div className="flex flex-col mt-auto relative" ref={settingsRef}>
                    <a
                        onClick={() => setShowSettings(!showSettings)}
                        className="cursor-pointer p-2 hover:bg-[#5591eccb] hover:rounded-lg mb-2"
                    >
                        <img src="./icon/weui_setting-outlined.png" className="w-9 h-9 object-contain" />
                    </a>

                    {showSettings && (
                        <div className="absolute left-full top-[-100px] bg-white text-black shadow-md rounded-lg w-[200px] p-2">
                            <div
                                className="flex flex-row items-center cursor-pointer hover:bg-gray-200 px-2"
                                onClick={() => { setShowProfileModal(true); setShowSettings(false); }}
                            >
                                <i className="fas fa-user"></i>
                                <p className="p-2"> Thông tin cá nhân </p>
                            </div>
                            <div
                                className="flex flex-row items-center cursor-pointer hover:bg-gray-200 px-2"
                                onClick={() => { setShowChangePasswordModal(true); setShowSettings(false); }}
                            >
                                <i className="fas fa-lock"></i>
                                <p className="p-2"> Đổi mật khẩu </p>
                            </div>
                            <div className="flex flex-row items-center cursor-pointer hover:bg-gray-200 px-2" onClick={async () => {
                                await dispatch(logout()).unwrap().then((res) => {
                                    // remove 
                                    localStorage.removeItem('accessToken');
                                    localStorage.removeItem('refreshToken');
                                    localStorage.removeItem('userLogin');
                                    setShowProfileModal(false);
                                    setShowSettings(false);
                                    showToast("Đăng xuất thành công", "success");
                                    socket.emit("logout", userLogin?.id);
                                    navigate("/login");
                                });
                            }}>
                                <i className="fas fa-sign-out-alt"></i>
                                <p className="p-2 text-red-600"> Đăng xuất </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Hiển Thị Thông Tin Cá Nhân */}
            {showProfileModal &&
                <ProfileModal setShowProfileModal={setShowProfileModal} setShowUpdateModal={setShowUpdateModal} />
            }

            {/* Modal Hiển Thị Đổi Mật Khẩu */}
            {showChangePasswordModal &&
                <ChangePasswordModal setShowChangePasswordModal={setShowChangePasswordModal} />
            }

            {/* Modal Cập Nhật Thông Tin Cá Nhân */}
            {showUpdateModal &&
                <UpdateProfileModal setShowProfileModal={setShowProfileModal} setShowUpdateModal={setShowUpdateModal} />
            }
        </>
    );
};

const ChangePasswordModal = ({ setShowChangePasswordModal }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const userLogin = useSelector((state) => state.user.userLogin);

    const inputOldPasswordRef = useRef(null);
    const inputNewPasswordRef = useRef(null);
    const inputConfirmPasswordRef = useRef(null);


    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [validNewPassword, setValidNewPassword] = useState("");
    const [validConfirmPassword, setValidConfirmPassword] = useState("");
    const [validOldPassword, setValidOldPassword] = useState("");


    const handlerActionChangePasswordProfile = async (e) => {
        e.preventDefault();
        const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;
        let errors = false;

        if (oldPassword.trim() === "") {
            setValidOldPassword("Vui lòng nhập mật khẩu cũ.");
            inputOldPasswordRef.current.focus();
            errors = true;
        } else {
            if (!regexPassword.test(newPassword.trim())) {
                setValidNewPassword("Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt, không chứa khoảng trắng.");
                inputNewPasswordRef.current.focus();
                errors = true;
            }

            if (newPassword.trim() !== confirmPassword.trim()) {
                setValidConfirmPassword("Mật khẩu không khớp.");
                inputConfirmPasswordRef.current.focus();
                errors = true;
            }
        }



        if (errors) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const data = {
            phoneNumber: userLogin.phoneNumber,
            oldPassword: oldPassword,
            newPassword: newPassword,
        };

        try {
            await dispatch(changePassword(data)).unwrap().then((res) => {
                showToast("Đổi mật khẩu thành công", "success");
                setIsLoading(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setShowChangePasswordModal(false);
                socket.emit("request-logout-changed-password", userLogin?.id);
            })
        } catch (e) {
            console.log(e.message);
            showToast(e.message, "error");
            inputOldPasswordRef.current.focus();
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            {userLogin && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <form id="updateProfile" onSubmit={(e) => handlerActionChangePasswordProfile(e)}>
                        <div className="bg-white rounded-lg shadow-lg w-[400px] p-4">
                            <div className="flex items-center">
                                <button
                                    className="text-gray-600 mr-2"
                                    onClick={() => { setShowChangePasswordModal(false); }}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                </button>
                                <h2 className="text-lg font-semibold text-center flex-1">Đổi mật khẩu</h2>
                            </div>
                            <div className="p-4">
                                {/* Nhập tên hiển thị */}
                                <label className="block mb-2">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="border w-full p-2 rounded"
                                    value={userLogin.phoneNumber}
                                    disabled
                                />

                                <label className="block mt-4 mb-2">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    className="w-full pl-2 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-0"
                                    placeholder="Mật khẩu cũ"
                                    value={oldPassword}
                                    ref={inputOldPasswordRef}
                                    onChange={(e) => {
                                        setValidOldPassword("");
                                        setOldPassword(e.target.value);
                                    }}
                                />
                                {validOldPassword && <p className="text-red-500 text-sm mt-1">{validOldPassword}</p>}

                                <label className="block mt-4 mb-2">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full pl-2 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-0"
                                    placeholder="Mật khẩu mới"
                                    value={newPassword}
                                    ref={inputNewPasswordRef}
                                    onChange={(e) => {
                                        setValidNewPassword("");
                                        setNewPassword(e.target.value);
                                    }}
                                />
                                {validNewPassword && <p className="text-red-500 text-sm mt-1">{validNewPassword}</p>}

                                <label className="block mt-4 mb-2">Nhập lại mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full pl-2 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-0"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    ref={inputConfirmPasswordRef}
                                    onChange={(e) => {
                                        setValidConfirmPassword("");
                                        setConfirmPassword(e.target.value);
                                    }}
                                />
                                {validConfirmPassword && <p className="text-red-500 text-sm mt-1">{validConfirmPassword}</p>}


                                {/* Nút cập nhật */}
                                <div className="flex justify-between mt-4">
                                    <button
                                        className="bg-gray-400 text-white px-4 py-2 rounded"
                                        onClick={() => setShowChangePasswordModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                            </div>
                                        ) : (
                                            "Cập nhật"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export const ProfileModal = ({ setShowProfileModal, setShowUpdateModal }) => {
    const dispatch = useDispatch();
    const userLogin = useSelector((state) => state.user.userLogin);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const fileBackgroundRef = useRef(null);

    const handlerBackgroundClick = () => {
        fileBackgroundRef.current.click();
    }

    const handleFileBackgroundChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsLoading(true);
            await handleBackgroundUpload(file);
            await dispatch(getProfile());
            setIsLoading(false);
        }
    }

    const handleBackgroundUpload = async (file) => {
        dispatch(uploadBackground(file))
    }

    // Hàm xử lý sự kiện khi chọn ảnh
    const handleCameraClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsLoading(true);
            await handleImageUpload(file);
            await dispatch(getProfile());
            setIsLoading(false);
        }
    };

    // Hàm xử lý upload ảnh
    const handleImageUpload = async (file) => {
        dispatch(uploadAvatar(file))
    };

    return <>
        {/* Overlay Làm Mờ */}
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>

        {/* Modal */}
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                {/* Header */}
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileBackgroundRef}
                        onChange={handleFileBackgroundChange}
                        id="fileBackground"
                    />

                    <img onClick={handlerBackgroundClick}
                        src={
                            userLogin?.backgroundLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"
                        } className="w-full h-32 object-cover rounded-t-lg cursor-pointer" />
                    <button className="absolute top-3 right-3 text-gray-700" onClick={() => setShowProfileModal(false)}>✖</button>
                </div>
                {/* Avatar & Info */}
                <div className="flex flex-col items-center -mt-10">
                    <div className="relative">
                        <img src={
                            userLogin?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"
                        } className="w-20 h-20 rounded-full border-4 border-white" />

                        <div
                            className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full cursor-pointer flex items-center justify-center"
                            onClick={handleCameraClick}
                        >
                            📷
                        </div>
                        {/* Ẩn input và kích hoạt khi bấm vào icon */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            id="fileInput"
                        />
                    </div>
                    <h2 className="text-lg font-semibold mt-2 py-2">{userLogin.fullName}</h2>
                </div>
                {/* Thông tin cá nhân */}
                <div className="p-4 border-t-4">
                    <div className="text-gray-700 space-y-2">
                        <p><strong className="mr-6">Giới tính:</strong> {userLogin.gender !== undefined ? userLogin.gender : "Chưa cập nhật"}</p>
                        <p><strong className="mr-4">Ngày sinh: </strong> {
                            userLogin.birthDay !== undefined ? new Date(userLogin.birthDay).toLocaleDateString("vi-VN") : "Chưa cập nhật"
                        }</p>
                        <p><strong className="mr-2">Điện thoại:</strong> {
                            userLogin.phoneNumber
                        }</p>
                        <p className="text-sm text-gray-500">Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này.</p>
                    </div>
                    <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => { setShowProfileModal(false); setShowUpdateModal(true); }}
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    </>

}

export const UpdateProfileModal = ({ setShowProfileModal, setShowUpdateModal }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const userLogin = useSelector((state) => state.user.userLogin);
    const [name, setName] = useState(userLogin ? userLogin.fullName : "");

    // Xác định ngày sinh từ userLogin hoặc mặc định là ngày hôm nay
    let initialBirthday;
    if (userLogin && userLogin.birthDay) {
        initialBirthday = new Date(userLogin.birthDay); // Giả sử birthDay là chuỗi "YYYY-MM-DD"
    } else {
        initialBirthday = new Date(); // Mặc định là ngày hôm nay
    }

    const [selectedDay, setSelectedDay] = useState(initialBirthday.getDate().toString().padStart(2, '0'));
    const [selectedMonth, setSelectedMonth] = useState((initialBirthday.getMonth() + 1).toString().padStart(2, '0')); // Tháng bắt đầu từ 0
    const [selectedYear, setSelectedYear] = useState(initialBirthday.getFullYear().toString());
    const [gender, setGender] = useState(userLogin ? userLogin.gender : "Nam"); // Mặc định là "Nam"

    console.log(selectedDay, selectedMonth, selectedYear, userLogin, initialBirthday);

    // Tạo danh sách ngày dựa trên tháng & năm
    const [days, setDays] = useState([]);

    // Danh sách tháng
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

    // Danh sách năm từ 1970 đến 2025
    const years = Array.from({ length: 56 }, (_, i) => (2025 - i).toString());

    // Tính lại số ngày trong tháng khi tháng hoặc năm thay đổi
    useEffect(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth - 1, 0).getDate(); // -1 vì tháng trong JS bắt đầu từ 0
        setDays(Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0")));
        // Đảm bảo selectedDay không vượt quá số ngày trong tháng
        if (parseInt(selectedDay) > daysInMonth) {
            setSelectedDay(daysInMonth.toString().padStart(2, '0'));
        }
    }, [selectedMonth, selectedYear]);

    const handlerActionUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const userUpdate = {
            fullName: name,
            gender: gender,
            birthDay: `${selectedYear}-${selectedMonth}-${selectedDay}`
        };

        try {
            await dispatch(updateProfile(userUpdate));
            setIsLoading(false);
            showToast("Cập nhật thông tin thành công", "success");
            setShowUpdateModal(false);
        } catch (error) {
            setIsLoading(false);
            showToast("Có lỗi khi cập nhật thông tin", "error");
            console.error("Error updating profile:", error);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            {userLogin && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <form id="updateProfile" onSubmit={(e) => handlerActionUpdateProfile(e)}>
                        <div className="bg-white rounded-lg shadow-lg w-[400px] p-4">
                            <div className="flex items-center">
                                <button
                                    className="text-gray-600 mr-2"
                                    onClick={() => { setShowUpdateModal(false); setShowProfileModal(true); }}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                </button>
                                <h2 className="text-lg font-semibold text-center flex-1">Cập nhật thông tin</h2>
                            </div>
                            <div className="p-4">
                                {/* Nhập tên hiển thị */}
                                <label className="block mb-2">Tên hiển thị</label>
                                <input
                                    type="text"
                                    className="border w-full p-2 rounded"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />

                                {/* Chọn giới tính */}
                                <label className="block mt-4 mb-2">Giới tính</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Nam"
                                            checked={gender === "Nam"}
                                            onChange={() => setGender("Nam")}
                                            className="mr-2"
                                        />
                                        Nam
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Nữ"
                                            checked={gender === "Nữ"}
                                            onChange={() => setGender("Nữ")}
                                            className="mr-2"
                                        />
                                        Nữ
                                    </label>
                                </div>

                                {/* Chọn ngày sinh */}
                                <label className="block mt-4 mb-2">Ngày sinh</label>
                                <div className="flex space-x-2">
                                    {/* Chọn ngày */}
                                    <select
                                        className="border p-2 rounded"
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                    >
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                    {/* Chọn tháng */}
                                    <select
                                        className="border p-2 rounded"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        {months.map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                    {/* Chọn năm */}
                                    <select
                                        className="border p-2 rounded"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Nút cập nhật */}
                            <div className="flex justify-between mt-4">
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                    onClick={() => setShowUpdateModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                                        </div>
                                    ) : (
                                        "Cập nhật"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};