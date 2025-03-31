import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFriends } from "../redux/slices/FriendSlice"; 
import FriendsOfUser from "../components/FriendsOfUser";
import { text } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { SearchByPhone } from "../components/SearchByPhone";
import { removeVietnameseTones } from "../utils/AppUtils";

export default function CreateGroupPage({ isOpenGroup, onClose }) {
    const dispatch = useDispatch();
    const friends = useSelector((state) => state.friend.friends);
    const [selected, setSelected] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [textSearch, setTextSearch] = useState(""); // Quản lý textSearch trong CreateGroupPage
    const [filteredFriends, setFilteredFriends] = useState([]);
    const friendsFromRedux = useSelector((state) => state.friend.friends);

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
                <button className="flex items-center p-5 hover:bg-gray-100">
                    <img
                        src="./icon/ic_create_group.png"
                        alt="Avatar"
                        className="w-[30px] h-[30px]"
                    />
                </button>
                <input
                    type="text"
                    placeholder="Nhập tên nhóm..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                />
                </div>
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
                    {filteredFriends.length === 0 ? (
                        <p className="text-center text-gray-500">Đang tải danh sách...</p>
                    ) : (
                        filteredFriends.map((friend) => (
                            <button
                                key={friend.friendId}
                                className="flex items-center p-3 hover:bg-gray-100"
                                onClick={() => toggleSelect(friend.friendId)}
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