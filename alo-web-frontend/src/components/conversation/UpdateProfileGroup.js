import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import showToast from "../../utils/AppUtils";
import { updateProfileGroup, updateProfileGroupById } from "../../redux/slices/ConversationSlice";
import socket from "../../utils/socket";
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


export default function UpdateProfileGroup({ onClose, conversation }) {
    const dispatch = useDispatch();
    const [groupName, setGroupName] = useState(conversation.name);
    const [avatarFile, setAvatarFile] = useState(null);
    const [defaultAvatarUrl, setDefaultAvatarUrl] = useState(conversation.avatar);
    const [isLoading, setIsLoading] = useState(false);
    const [showDefaultImages, setShowDefaultImages] = useState(false);

    const handlerUpdateProfileGroup = async () => {
        try {
            if (!groupName) {
                showToast("Tên nhóm không được để trống.", "info")
                return;
            }
            let data = {
                name: groupName,
            }

            console.log('data', data)
            setIsLoading(true);

            if(!avatarFile) {
                data.avatar = defaultAvatarUrl;
                console.log("defaultAvatarUrl", defaultAvatarUrl)
            }
            console.log("data", data)
            console.log("avatarFile", avatarFile)

            await dispatch(updateProfileGroup({
                conversationId: conversation.id,
                data: data,
                file: avatarFile ? avatarFile : null
            })).unwrap().then((res) => {
                dispatch(updateProfileGroupById(res.data));
                showToast('Cập nhật ảnh đại diện nhóm thành công.', 'info');
                socket.emit('update_profile_group', {
                    conversation: res.data
                });

            })
        } catch (error) {
            console.error('Error updating group avatar:', error);
            showToast('error', 'top', 'Lỗi', error.message || 'Cập nhật ảnh đại diện nhóm thất bại');
        }
        setIsLoading(false);
        onClose()
    }
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

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-auto relative p-4">
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
                    onClick={onClose}
                >
                    ✖
                </button>

                <h2 className="text-lg font-semibold mb-2 text-center">Chỉnh sửa thông tin nhóm</h2>
                <div className="flex items-center justify-center border-b border-gray-300 mb-4">
                    <div className="relative">
                        <div className="h-[50px] w-[50px]" >
                            <img
                                src={
                                    avatarFile
                                        ? URL.createObjectURL(avatarFile)
                                        : defaultAvatarUrl || defaultGroupImages[0]
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

                <button
                    className={`p-2 rounded text-white w-full mt-4 ${!isLoading
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}
                    onClick={handlerUpdateProfileGroup}
                >
                    {isLoading ? "Đang cập nhật..." : "Sửa"}
                </button>
            </div>
        </div>
    );
}