import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFriends } from "../redux/slices/FriendSlice"; 

export default function CreateGroupPage({ isOpenGroup, onClose }) {
    const dispatch = useDispatch();
    const friends = useSelector((state) => state.friend.friends);
    const [selected, setSelected] = useState([]);
    const [groupName, setGroupName] = useState("");

    // Lấy danh sách bạn bè 
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                await dispatch(getFriends()); // Dispatch action để lấy danh sách bạn bè
            } catch (error) {
                console.log("Error fetching friends:", error);
            }
        };
        fetchFriends(); 
    }, []);



    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
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

                <h2 className="text-lg font-semibold mb-2 text-center">Tạo nhóm</h2>
                <input
                    type="text"
                    placeholder="Nhập tên nhóm..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                />

                {/* Danh sách bạn bè */}
                <div className="flex flex-col overflow-auto max-h-[300px]">
                    {friends.length === 0 ? (
                        <p className="text-center text-gray-500">Đang tải danh sách...</p>
                    ) : (
                        friends.map((friend) => (
                            <button
                                key={friend.id}
                                className="flex items-center p-3 hover:bg-gray-100"
                                onClick={() => toggleSelect(friend.id)}
                            >
                                <img
                                    src={friend.friendInfo.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                                    alt={friend.friendInfo.fullName}
                                    className="w-[30px] h-[30px] rounded-full"
                                />
                                <span className="ml-4 font-medium flex-1">{friend.friendInfo.fullName}</span>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(friend.friendId)}
                                    readOnly
                                />
                            </button>
                        ))
                    )}
                </div>

                <button
                    className={`p-2 rounded text-white w-full mt-4 ${
                        selected.length ? "bg-blue-500" : "bg-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!selected.length}
                >
                    Tạo nhóm
                </button>
            </div>
        </div>
    );
}