import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import FriendsOfUser from "../components/FriendsOfUser";
import GroupsOfUser from "../components/GroupsOfUser";
import InvitationFriend from "../components/InvitationFriend";
import ChatWindown from "../components/ChatWindown";
import { useDispatch, useSelector } from "react-redux";
import socket from "../utils/socket";
import { getFriends } from "../redux/slices/FriendSlice";
import ConversationList from "../components/ConversationList";
import { getAllConversation } from "../redux/slices/ConversationSlice";
import { setUserLogin } from "../redux/slices/UserSlice";
import { SearchByPhone } from "../components/SearchByPhone";
import CreateGroupPage from "./CreateGroup";
import SentFriendRequest from "../components/SentFriendRequest";
const menu = [
    { id: 1, name: "Danh sách bạn bè", icon: "./icon/ic_friend_list.png", showView: () => <FriendsOfUser /> },
    { id: 2, name: "Danh sách nhóm và cộng đồng", icon: "./icon/ic_community_list.png", showView: () => <GroupsOfUser /> },
    { id: 3, name: "Lời mời kết bạn", icon: "   ./icon/ic_invitation_friend.png", showView: () => <InvitationFriend /> },
];


export default function HomePage() {

    // Xử lý verify token
    const userLogin = useSelector(state => state.user.userLogin);

    const conversations = useSelector(state => state.conversation.conversations);

    const dispatch = useDispatch();

    const [isOpenAdd, setIsOpenAdd] = useState(false);
    const [isOpenGroup, setIsOpenGroup] = useState(false);

    useEffect(() => {
    }, [isOpenAdd]);

    const selectedConversation = useSelector(state => state.conversation.conversation);

    return (
        <div className="flex h-screen">

            {/* Left Bar */}
            <div className="w-[25rem] bg-white border-r border-gray-300 flex flex-col">
                {/* input search and add friend and create group */}
                <div className="flex items-center justify-between p-3 h-[75px]">
                    <div className="flex items-center p-2 bg-[#EBECF0] rounded-[5px] h-[32px] w-3/4 hover:bg-gray-100">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 w-[5%]" size="35" />
                        <input type="text" placeholder="Tìm kiếm" className="pl-2 bg-[#EBECF0] h-[30px] focus:outline-none focus:border-none focus:ring-0 w-[95%] hover:bg-gray-100" />
                    </div>
                    <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-100" onClick={() => setIsOpenAdd(true)}>
                        <img src="./icon/ic_add_friend.png" />
                    </button>

                    {
                        isOpenAdd && <SearchByPhone isOpenAdd={isOpenAdd} onClose={() => setIsOpenAdd(false)} />
                    }

                    <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-100" onClick={() => setIsOpenGroup(true)}>
                        <img src="./icon/ic_create_group.png" />    
                    </button>
                    {
                        isOpenGroup && <CreateGroupPage isOpenGroup={isOpenGroup} onClose={() => setIsOpenGroup(false)} />
                    }
                </div>

                {/* menu */}
                <div className="flex flex-col">
                    <ConversationList conversations={conversations} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex text-gray-700">
                {
                    selectedConversation ? <ChatWindown />
                        :
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-700">
                            <h1 className="text-2xl font-bold">Chào mừng đến với Alo</h1>
                            <p className="text-center px-4 mt-2">Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè...</p>
                            <i class="fas fa-mobile-alt "></i>
                            <p className="text-blue-600 font-semibold cursor-pointer">Trải nghiệm xuyên suốt</p>
                            <p className="text-sm opacity-70 px-6 text-center">Kết nối và giải quyết công việc trên mọi thiết bị với dữ liệu luôn được đồng bộ</p>
                        </div>
                }
            </div>
        </div>
    );
}
