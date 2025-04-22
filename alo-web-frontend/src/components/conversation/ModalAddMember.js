import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import socket from "../../utils/socket";
import { removeVietnameseTones } from "../../utils/AppUtils";
import { useSelector } from "react-redux";
import showToast from "../../utils/AppUtils";
import { addMemberGroup, addMemberToGroup } from "../../redux/slices/ConversationSlice";

const ModalAddMember = ({ isOpen, onClose, userLogin, conversation }) => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");
    const friends = useSelector((state) => state.friend.friends);
    const [memberSelected, setMemberSelected] = useState([]);
    const [memberInfo, setMemberInfo] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState(friends);
    const conversations = useSelector((state) => state.conversation.conversations);



    const handleAddMember = async (e) => {
        e.preventDefault();
        console.log("conversations", conversations);
        if (memberSelected.length > 0) {
            try {
                const resp = await dispatch(addMemberToGroup({ conversationId: conversation.id, memberUserIds: memberSelected }));
                await dispatch(addMemberGroup({ conversationId: conversation.id, memberUserIds: memberSelected, memberInfo: memberInfo }));
                const result = resp.payload.data;
                console.log("result", result);
                showToast("Thêm thành viên thành công!", 'success');
                onClose();
            } catch (error) {
                showToast(error.message, 'error');
            } 
        }
    }

    const handleClickMember = (friend) => {
        if (conversation.memberUserIds.includes(friend.friendInfo.id)) return;
        setMemberSelected((prev) =>
            prev.includes(friend.friendId)
                ? prev.filter((id) => id !== friend.friendId)
                : [...prev, friend.friendId]
        );
        setMemberInfo((prev) =>
            prev.includes(friend.friendInfo)
                ? prev.filter((fr) => fr.id !== friend.friendInfo.id)
                : [...prev, friend.friendInfo]
        );
    }

    return (
        <>
            <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${isOpen ? "block" : "hidden"
                } flex justify-center items-center`}>
                <div className="bg-white rounded-lg shadow-lg w-[600px] p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Thêm thành viên</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            ✖
                        </button>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-none"
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-2">Danh sách bạn bè</h3>
                        <ul className="space-y-2 max-h-[500px] overflow-y-auto">
                            {
                                filteredFriends.map((friend) => (
                                    <li key={friend.friendInfo.id}
                                        className={`flex items-center mb-2 hover:bg-gray-100 px-2 py-[5px] hover:rounded-md ${!conversation.memberUserIds.includes(friend.friendInfo.id) ? "cursor-pointer" : ""}`}
                                        onClick={() => handleClickMember(friend)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={memberSelected.includes(friend.friendInfo.id) || conversation.memberUserIds.includes(friend.friendInfo.id)}
                                            disabled={conversation.memberUserIds.includes(friend.friendInfo.id)}
                                            className="mr-4"
                                        />
                                        <div className="flex items-center">
                                            <img
                                                src={friend.friendInfo.avatarLink ? friend.friendInfo.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                                                alt={friend.fullName}
                                                className="w-11 h-11 rounded-full mr-4"
                                            />
                                            <span className="text-xm font-semibold">{friend.friendInfo.fullName}</span>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={onClose}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-200 cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button onClick={(e) => handleAddMember(e)}
                                type="button"
                                className={`bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer ${memberSelected.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
                                disabled={memberSelected.length === 0}>
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalAddMember;