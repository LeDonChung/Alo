import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setConversation } from "../../redux/slices/ConversationSlice";
import showToast from "../../utils/AppUtils";


const ModalShowInfoFriend = ({ friendInfo, isOpen, onClose, handleNavigateChat }) => {
    const dispatch = useDispatch();
    const userLogin = JSON.parse(localStorage.getItem("userLogin"));
    const navigate = useNavigate();

    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg w-96">
                    <div className="p-4 flex justify-between items-center border-gray-300">
                        <h2 className="text-lg font-semibold">Thông tin tài khoản</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-black float-right"
                        >
                            ✖
                        </button>
                    </div>
                    <div className="flex items-center gap-3 p4 ml-3">
                        <img
                            src={friendInfo.avatarLink ? friendInfo.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"} // Thay thế bằng ảnh đại diện
                            alt="Avatar"
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <h2 className="text-lg font-semibold">{friendInfo.fullName}</h2>
                        </div>
                    </div>


                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-3">Thông tin cá nhân</h2>
                        <ul className="text-sm text-gray-600">
                            <li>
                                <strong>Giới tính:</strong> {friendInfo.gender}
                            </li>
                            <li>
                                <strong>Ngày sinh:</strong> {friendInfo.birthday ? friendInfo.birthday : "--/--/----"}
                            </li>
                            <li>
                                <strong>Điện thoại:</strong> {friendInfo.phoneNumber ? friendInfo.phoneNumber : "**********"}
                            </li>
                        </ul>

                        <button
                            onClick={(e) => {handleNavigateChat(e, friendInfo)}}
                            className="w-full bg-blue-100 text-blue-700 py-2 rounded mt-4 hover:bg-blue-200 font-bold"
                        >
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalShowInfoFriend;