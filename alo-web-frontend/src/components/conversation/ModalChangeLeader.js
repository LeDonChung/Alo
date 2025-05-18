import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { changeLeader, updatePermissions } from "../../redux/slices/ConversationSlice";
import socket from "../../utils/socket";
import showToast, { removeVietnameseTones } from "../../utils/AppUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import ModalOutGroup from "./ModalOutGroup";
import { addMessage, sendMessage, updateMessage } from "../../redux/slices/MessageSlice";


const ModalChangeLeader = ({ isOpen, onClose, conversation, leaderId, cancel, setNewLeaderId, isOnlyChangeLeader, userLogin }) => {
    const [search, setSearch] = useState("");
    const listMember = conversation.members.filter((member) => member.id !== leaderId);
    const [members, setMembers] = useState(listMember);
    const listViceLeader = conversation.roles.filter((role) => role.role === "vice_leader")[0].userIds;
    const dispatch = useDispatch();
    const [leader, setLeader] = useState(members[0].id);

    useEffect(() => {
        if (search === "") {
            setMembers(listMember);
        } else {
            const searchText = removeVietnameseTones(search);
            const filteredMembers = listMember.filter((member) => {
                const memberName = removeVietnameseTones(member.fullName);
                return memberName.toLowerCase().includes(searchText.toLowerCase())
            });
            setMembers(filteredMembers);
        }
    }, [search]);

    const [isLoading, setIsLoading] = useState(false);
    if (!isOpen) return null;

    const handlerChangeLeader = async () => {
        if (isOnlyChangeLeader) {
            setIsLoading(true);
            // chuyeern quyen truong nhom
            await dispatch(changeLeader({ conversationId: conversation.id, memberUserId: leader })).unwrap()
                .then(async (result) => {
                    const requestId = Date.now() + Math.random();
                    const message = {
                        id: requestId,
                        requestId: requestId,
                        senderId: userLogin.id,
                        conversationId: conversation.id,
                        content: `${userLogin.fullName} đã bổ nhiệm ${members.find((member) => member.id === leader).fullName} làm trưởng nhóm mới`,
                        messageType: "system",
                        timestamp: Date.now(),
                        seen: [],
                        sender: userLogin,
                    }

                    dispatch(addMessage(message));

                    const sendRes = await dispatch(sendMessage({ message, file: null })).unwrap();
                    const sentMessage = {
                        ...sendRes.data,
                        sender: userLogin,
                    };

                    dispatch(updateMessage(sentMessage));
                    socket.emit('send-message', {
                        conversation,
                        message: sentMessage,
                    });

                    socket.emit("update-roles", { conversation: result.data });
                    await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.data.roles }));
                });

            setIsLoading(false);
        } else {

            setNewLeaderId(leader);
        }
        onClose();

    }
    return (
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${isOpen ? "block" : "hidden"
            } flex justify-center items-center`}>
            <div className="bg-white rounded-lg shadow-lg w-[500px] p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Chọn trưởng nhóm mới</h2>
                    <button onClick={cancel} className="text-gray-500 hover:text-gray-800">
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
                    <h3 className="text-sm font-semibold mb-2">Danh sách thành viên</h3>
                    <ul className="space-y-2 max-h-[450px] overflow-y-auto">
                        {
                            members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-2 ">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="selectedMember"
                                            value={member.id}
                                            onChange={() => {
                                                setLeader(member.id);
                                            }}
                                            checked={leader === member.id}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />

                                        <div className="flex items-center relative">
                                            <img
                                                src={member.avatarLink ? member.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                                                alt={member.fullName}
                                                className="w-11 h-11 rounded-full mr-4"
                                            />
                                            <span className="text-xm font-semibold">{member.fullName}</span>

                                            {
                                                listViceLeader.includes(member.id) && (
                                                    <>
                                                        <div className="flex items-center justify-center text-sm bg-slate-500 rounded-full px-2 py-1 w-4 h-4 absolute bottom-1 left-8">
                                                            <FontAwesomeIcon icon={faKey} className="text-white text-[9px]" />
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </label>
                                </div>
                            ))
                        }
                    </ul>
                </div>

                <div className="mb-4">
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={cancel}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-200 cursor-pointer"
                        >
                            Hủy
                        </button>

                        <button
                            onClick={(e) => handlerChangeLeader()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-700 cursor-pointer"
                        >
                            {
                                isLoading ? (
                                    <div className="flex items-center justify-center w-full h-4">
                                        <div
                                            className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"
                                            aria-hidden="true"
                                        ></div>
                                    </div>
                                ) : (
                                    "Chọn và tiếp tục"
                                )
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalChangeLeader;