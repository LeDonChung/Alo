import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage, forwardMessage } from "../../redux/slices/MessageSlice";
import socket from "../../utils/socket";
import { removeVietnameseTones } from "../../utils/AppUtils";

import { useSelector } from "react-redux";
import showToast from "../../utils/AppUtils";
const ModalForwardMessage = ({ isOpen, onClose, message, conversations }) => {
    const dispatch = useDispatch();
    const userLogin = JSON.parse(localStorage.getItem("userLogin"));
    const [selectedConversations, setSelectedConversations] = useState([]);
    const [conversationIds, setConversationIds] = useState([]);
    const [search, setSearch] = useState("");

    const [conversationList, setConversationList] = useState(conversations);

    useEffect(() => {
        if (search === '') {
            setConversationList(conversations);
        } else {
            const searchText = removeVietnameseTones(search);
            const filteredConversations = conversations.filter((conversation) => {
                if (conversation.isGroup) {
                    const groupName = removeVietnameseTones(conversation.name);

                    return groupName.toLowerCase().includes(searchText.toLowerCase());
                } else {
                    const friend = conversation.members.find((member) => member.id !== userLogin.id);
                    const friendName = removeVietnameseTones(friend.fullName);
                    return friendName.toLowerCase().includes(search.toLowerCase());
                }
            });
            setConversationList(filteredConversations);
        }
    }, [search])

    const getFileIcon = useCallback((extension) => {
        switch (extension) {
            case 'pdf':
                return <img src="/icon/ic_pdf.png" alt="PDF" loading="lazy" />;
            case 'xls':
            case 'xlsx':
                return <img src="/icon/ic_excel.png" alt="EXCEL" loading="lazy" />;
            case 'doc':
            case 'docx':
                return <img src="/icon/ic_work.png" alt="WORD" loading="lazy" />;
            case 'ppt':
            case 'pptx':
                return <img src="/icon/ic_ppt.png" alt="PPT" loading="lazy" />;
            case 'zip':
            case 'rar':
                return <img src="/icon/ic_zip.png" alt="ZIP" loading="lazy" />;
            case 'txt':
                return <img src="/icon/ic_txt.png" alt="TXT" loading="lazy" />;
            case 'mp4':
                return <img src="/icon/ic_video.png" alt="VIDEO" loading="lazy" />;
            default:
                return (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#999" />
                        <text x="12" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                            FILE
                        </text>
                    </svg>
                );
        }
    }, []);

    const getFileExtension = useCallback((filename = '') => {
        const parts = filename.split('.');
        return parts[parts.length - 1].toLowerCase();
    }, []);

    const extractOriginalName = useCallback((fileUrl) => {
        const fileNameEncoded = fileUrl.split('/').pop();
        const fileNameDecoded = decodeURIComponent(fileNameEncoded);
        const parts = fileNameDecoded.split(' - ');
        return parts[parts.length - 1];
    }, []);

    const conversation = useSelector(state => state.conversation.conversation);
    const handleForward = async (e) => {
        e.preventDefault();
        if (conversationIds.length === 0) {
            showToast("Vui lòng chọn ít nhất một cuộc trò chuyện để chia sẻ.", "success");
            return;
        }
        // Kiểm tra nếu message ở cuộc trò chuyện hiện tại thì addMessage
        const index = conversationIds.findIndex((id) => id === conversation.id);

        if (index !== -1) {
            dispatch(addMessage({
                ...message,
                senderId: userLogin.id,
                sender: userLogin,
                reaction: [],
                seen: [{
                    userId: userLogin.id,
                    seenTime: new Date().getTime(),
                }],
                timestamp: new Date().getTime(),
            }));
        }
        onClose();
        try {
            await dispatch(forwardMessage({
                messageId: message.id,
                conversationIds: conversationIds
            })).unwrap().then((res) => {
                const messages = res.data;
                messages.forEach((message) => {
                    const conversationFind = conversations.find((conversation) => conversation.id === message.conversationId)
                    socket.emit("send-message", {
                        conversation: conversationFind,
                        message: message,
                    });
                })
            });
        } catch (error) {
            console.error("Error forwarding message:", error);
        } finally {

        }

    }


    return (
        <div
            className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${isOpen ? "block" : "hidden"
                } flex justify-center items-center`}>
            <div className="bg-white rounded-lg shadow-lg w-[600px] p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Chia sẻ</h2>
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

                <div >
                    <h3 className="text-sm font-semibold mb-2">Gần đây</h3>
                    <ul className="space-y-2  max-h-[400px] overflow-auto">
                        {conversationList.map((conversation) => (
                            <li key={conversation.id}
                                className="flex items-center mb-2 hover:bg-gray-100 px-2 py-[5px] hover:rounded-md cursor-pointer"
                                onClick={() => {
                                    setConversationIds((prev) =>
                                        prev.includes(conversation.id)
                                            ? prev.filter((id) => id !== conversation.id)
                                            : [...prev, conversation.id]
                                    );
                                    setSelectedConversations((prev) =>
                                        prev.includes(conversation)
                                            ? prev.filter((cvt) => cvt.id !== conversation.id)
                                            : [...prev, conversation]
                                    );
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={conversationIds.includes(conversation.id)}
                                    className="mr-4"
                                />
                                {
                                    conversation.isGroup ? (
                                        (() => {
                                            return (
                                                <div className="flex items-center">
                                                    <img
                                                        src={conversation.avatar ? conversation.avatar : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                                                        alt={conversation.name}
                                                        className="w-11 h-11 rounded-full mr-4"
                                                    />
                                                    <span className="text-xm font-semibold">{conversation.name}</span>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        (() => {
                                            const friend = conversation.members.find((member) => member.id !== userLogin.id);

                                            return (
                                                <div className="flex items-center">
                                                    <img
                                                        src={friend.avatarLink ? friend.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                                                        alt={friend.fullName}
                                                        className="w-11 h-11 rounded-full mr-4"
                                                    />
                                                    <span className="text-xm font-semibold">{friend.fullName}</span>
                                                </div>
                                            );
                                        })()
                                    )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4">
                    <span className="font-medium">Chia sẻ {message.messageType === 'text' ? "tin nhắn" : message.messageType === 'sticker' ? "nhãn dán" : message.messageType === 'file' ? "tệp tin" : "hình ảnh"}</span>
                    {
                        message.messageType === 'text' ? (
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-600">{message.content}</span>
                            </div>
                        ) : (
                            <>
                                {
                                    message.messageType === 'file' ? (
                                        <div className="flex items-center mt-2">
                                            {getFileIcon(getFileExtension(message.fileLink))}
                                            <span className="text-sm text-gray-600 ml-2">{extractOriginalName(message.fileLink)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center mt-2">
                                            <img src={message.fileLink} alt="Shared content" className="w-36 h-36 rounded-lg" />
                                        </div>
                                    )
                                }
                            </>
                        )
                    }

                </div>

                <div className="mb-4">
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={onClose}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-200 cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button onClick={(e) => handleForward(e)}
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 cursor-pointer"
                            disabled={selectedConversations.length === 0}>
                            Chia sẻ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalForwardMessage;