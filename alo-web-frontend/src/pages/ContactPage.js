import { useState } from "react";
import { Navigation } from "../components/Navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import FriendsOfUser from "../components/FriendsOfUser";
import GroupsOfUser from "../components/GroupsOfUser";
import InvitationFriend from "../components/InvitationFriend";
import InvitationGroup from "../components/InvitationGroup";

const menu = [
    { id: 1, name: "Danh sách bạn bè", icon: "./icon/ic_friend_list.png", showView: () => <FriendsOfUser/> },
    { id: 2, name: "Danh sách nhóm và cộng đồng", icon: "./icon/ic_community_list.png", showView: () => <GroupsOfUser/> },
    { id: 3, name: "Lời mời kết bạn", icon: "./icon/ic_invitation_friend.png", showView: () => <InvitationFriend/> },
    { id: 4, name: "Lời mời vào nhóm và cộng đồng", icon: "./icon/ic_invitation_community.png", showView: () => <InvitationGroup/> },
];

export default function ContactPage() {
    const [selectMenu, setSelectMenu] = useState(menu[0]);

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
                    <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-100">
                        <img src="./icon/ic_add_friend.png" />
                    </button>
                    <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-100">
                        <img src="./icon/ic_create_group.png" />
                    </button>
                </div>

                {/* menu */}
                <div className="flex flex-col">
                    {menu.map((item) => (
                        <button key={item.id} className={`flex items-center p-3 hover:bg-gray-100 ${selectMenu.id === item.id ? "bg-blue-100" : ""}`} onClick={() => { setSelectMenu(item); }}>
                            <img src={item.icon} alt={item.name} className="w-[30px] h-[30px]" />
                            <span className="ml-4 font-medium">{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col text-gray-700">
                {
                    selectMenu && selectMenu.showView()
                }
            </div>
        </div>
    );
}
