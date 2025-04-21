import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFriends } from "../redux/slices/FriendSlice";
import FriendsOfUser from "../components/FriendsOfUser";
import { text } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faUpload } from "@fortawesome/free-solid-svg-icons";
import { SearchByPhone } from "../components/SearchByPhone";
import { removeVietnameseTones } from "../utils/AppUtils";
import { getAllConversation, createGroup, addConversation } from "../redux/slices/ConversationSlice";
import { userLogin } from "../utils/AppUtils";
import socket from "../utils/socket";

// Thêm: Danh sách ảnh mặc định cho nhóm
const defaultGroupImages = [
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/1_family.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/2_family.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/3_family.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/4_work.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/5_work.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/6_work.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/7_friends.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/8_friends.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/9_friends.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/10_school.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/11_school.jpg",
    "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/12_school.jpg",
];


export default function CreateGroupPage({ isOpenGroup, onClose }) {
    const dispatch = useDispatch();
    const friends = useSelector((state) => state.friend.friends);
    const [selected, setSelected] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [textSearch, setTextSearch] = useState(""); // Quản lý textSearch trong CreateGroupPage
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const [defaultAvatarUrl, setDefaultAvatarUrl] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDefaultImages, setShowDefaultImages] = useState(false);
    const userLogin = useSelector((state) => state.user.userLogin);
    const friendsFromRedux = useSelector((state) => state.friend.friends);



    
    // useEffect(() => {
    //     if (socket && userLogin.id) {
    //         socket.emit("join", userLogin.id);
    //         console.log(`Tham gia phòng user:${userLogin.id}`);
    //     }

    //     return () => {
    //     };
    // }, [userLogin.id]);

    // Lấy danh sách bạn bè 
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                await dispatch(getFriends());
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bạn bè:", error);
                setError("Không thể tải danh sách bạn bè.");
            }
        };
        fetchFriends();
    }, [dispatch]);

    //Cập nhật DS bạn bè từ redux
    useEffect(() => {
        if (friendsFromRedux?.length > 0) {
            let filtered = friendsFromRedux;

            if (textSearch) {
                filtered = friendsFromRedux.filter((friend) => {
                    const friendName = removeVietnameseTones(
                        friend.friendInfo.fullName.toLowerCase()
                    );
                    const searchText = removeVietnameseTones(textSearch.toLowerCase());
                    return friendName.includes(searchText);
                });
            }

            setFilteredFriends(filtered);
        } else {
            setFilteredFriends([]);
        }
    }, [friendsFromRedux, textSearch]);



    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Hàm xử lý chọn file ảnh từ máy
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setDefaultAvatarUrl(null);
        }
        setShowDefaultImages(false);
    };

    // Hàm xử lý chọn ảnh mặc định
    const handleDefaultImageSelect = (url) => {
        setDefaultAvatarUrl(url);
        setAvatarFile(null);
        setShowDefaultImages(false);
    };

    // Hàm hiển thị/ẩn danh sách ảnh mặc định
    const toggleDefaultImages = () => {
        setShowDefaultImages((prev) => !prev);
    };

    // Hàm tạo nhóm
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError("Tên nhóm không được để trống.");
            return;
        }
        if (selected.length < 2) {
            setError("Phải chọn ít nhất 2 thành viên.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await dispatch(
                createGroup({
                    name: groupName,
                    memberUserIds: [...selected, userLogin.id],
                    file: avatarFile,
                    avatar: defaultAvatarUrl,
                })
            ).unwrap();

            dispatch(addConversation(result.data));

            console.log("Gửi sự kiện create_group:", result.data);
            socket.emit("create_group", { conversation: result.data });

            const conversationId = result.data.id;
            socket.emit("join_conversation", conversationId);
            console.log(`Tham gia phòng nhóm ${conversationId}`);
            onClose();
        } catch (err) {
            console.error("Lỗi khi tạo nhóm:", err);
            setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-auto relative p-4">
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
                    onClick={onClose}
                >
                    ✖
                </button>

                <h2 className="text-lg font-semibold mb-2 text-center">Tạo nhóm</h2>
                <div className="flex items-center justify-between border-b border-gray-300 mb-4">
                    <div className="relative">
                        <div>
                            <img
                                src={
                                    avatarFile
                                        ? URL.createObjectURL(avatarFile)
                                        : defaultAvatarUrl || "./icon/ic_create_group.png"
                                }
                                alt="Avatar"
                                className="w-[40px] h-[40px] rounded-full cursor-pointer"
                                onClick={toggleDefaultImages}
                                title="Chọn ảnh đại diện"
                            />
                        </div>
                        {/* Thêm: Input file ẩn để chọn ảnh từ máy */}
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <input
                        type="text"
                        placeholder="Nhập tên nhóm..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="border p-2 rounded w-full mb-4"
                    />
                </div>

                {/* Thêm: Hiển thị danh sách ảnh mặc định */}
                {showDefaultImages && (
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold mb-2">Cập nhật ảnh đại diện</h3>
                        {/* Thêm: Nút tải lên từ máy tính hiển thị cùng lúc với danh sách ảnh mặc định */}
                        <label
                            htmlFor="avatar-upload"
                            className="flex items-center bg-blue-500 text-white text-sm px-3 py-1 rounded cursor-pointer hover:bg-blue-600 mb-2 w-"
                        >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Tải lên từ máy tính
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                        <h3 className="text-sm font-semibold mb-2">Bộ sưu tập</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {defaultGroupImages.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Default ${index + 1}`}
                                    className={`w-[50px] h-[50px] rounded-full cursor-pointer hover:opacity-80 ${defaultAvatarUrl === url ? "border-2 border-blue-500" : ""
                                        }`}
                                    onClick={() => handleDefaultImageSelect(url)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <input
                    className="border p-2 rounded w-full mb-4"
                    type="text"
                    placeholder="Nhập tên, số điện thoại hoặc danh sách số điện thoại"
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                />
                {textSearch && (
                    <FontAwesomeIcon
                        icon={faCircleXmark}
                        className="text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        size="lg"
                        onClick={() => setTextSearch("")}
                    />
                )}


                {/* Danh sách bạn bè */}
                <div className="flex flex-col overflow-auto max-h-[300px]">
                    {filteredFriends.length === 0 && !isLoading ? (
                        <p className="text-center text-gray-500">Không có bạn bè nào.</p>
                    ) : (
                        filteredFriends.map((friend) => (
                            <button
                                key={friend.friendId}
                                className="flex items-center p-3 hover:bg-gray-100"
                                onClick={() => toggleSelect(friend.friendId)}
                            >
                                <img
                                    src={
                                        friend.friendInfo.avatarLink ||
                                        "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"
                                    }
                                    alt={friend.friendInfo.fullName}
                                    className="w-[30px] h-[30px] rounded-full"
                                />
                                <span className="ml-4 font-medium flex-1">
                                    {friend.friendInfo.fullName}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(friend.friendId)}
                                    readOnly
                                    className="cursor-pointer"
                                />
                            </button>
                        ))
                    )}
                </div>

                <button
                    className={`p-2 rounded text-white w-full mt-4 ${selected.length >= 2 && groupName.trim() && !isLoading
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}
                    disabled={selected.length < 2 || !groupName.trim() || isLoading}
                    onClick={handleCreateGroup}
                >
                    {isLoading ? "Đang tạo..." : "Tạo nhóm"}
                </button>
            </div>
        </div>
    );
}