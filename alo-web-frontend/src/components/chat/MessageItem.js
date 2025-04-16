import React, { useState, useEffect } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from "lightgallery/plugins/video";
import { useDispatch } from 'react-redux';
import { setMessageParent, setMessageUpdate, updateMessageStatus } from '../../redux/slices/MessageSlice';
import { getConversationById } from '../../redux/slices/ConversationSlice';
import socket from '../../utils/socket';

const MessageItem = ({ message, isUserMessage, isLastMessage, showAvatar, onClickParent, isHighlighted, conversation, userLogin, conversations }) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUpdateMessage = async (ms) => {
      await dispatch(setMessageUpdate({ messageId: ms.id, status: ms.status }));
    }

    socket.on('receive-update-message', handleUpdateMessage);
    return () => {
      socket.off('receive-update-message', handleUpdateMessage);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const handleContextMenu = (event) => {
    event.preventDefault();

    const clickedMessageId = message.id;

    if (contextMenu.messageId !== clickedMessageId) {
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        messageId: clickedMessageId
      });
    } else {
      setContextMenu((prev) => ({
        ...prev,
        visible: !prev.visible,
        x: event.clientX,
        y: event.clientY,
      }));
    }
  };

  const getFileExtension = (filename = '') => {
    const parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  const extractOriginalName = (fileUrl) => {
    const fileNameEncoded = fileUrl.split("/").pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(" - ");
    return parts[parts.length - 1];
  };

  const getFileIcon = (extension) => {
    switch (extension) {
      case 'pdf': return <img src='/icon/ic_pdf.png' alt='PDF' />;
      case 'xls':
      case 'xlsx': return <img src={'/icon/ic_excel.png'} alt='EXCEL' />;
      case 'doc':
      case 'docx': return <img src={'/icon/ic_work.png'} alt='WORD' />;
      case 'ppt':
      case 'pptx': return <img src={'/icon/ic_ppt.png'} alt='PPT' />;
      case 'zip':
      case 'rar': return <img src={'/icon/ic_zip.png'} alt='ZIP' />;
      case 'txt': return <img src={'/icon/ic_txt.png'} alt='TXT' />;
      case 'mp4': return <img src={'/icon/ic_video.png'} alt='VIDEO' />;
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#999" />
            <text x="12" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">FILE</text>
          </svg>
        );
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [reaction, setReaction] = useState([
    { type: 'like', icon: '👍' },
    { type: 'love', icon: '❤️' },
    { type: 'laugh', icon: '😆' },
    { type: 'wow', icon: '😮' },
    { type: 'sad', icon: '😭' },
    { type: 'angry', icon: '😠' },
  ]);

  const [showReactions, setShowReactions] = useState(false);

  const handleAnwer = () => {
    dispatch(setMessageParent(message));
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    setShowReactions(false);
  }

  const handleCopy = () => {
    let content = "";
    if (message.messageType === 'text') {
      content = message.content;
    } else if (message.messageType === 'image') {
      content = message.fileLink;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        console.log('Nội dung đã được sao chép vào clipboard!');
      }).catch(err => {
        console.error('Lỗi khi sao chép nội dung: ', err);
      });
    }
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  }

  const handleMessageRecall = async () => {
    try {
      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
      const resp = await dispatch(updateMessageStatus({ messageId: message.id, status: 1 }));
      const messageUpdate = resp.payload.data;
      await dispatch((setMessageUpdate({ messageId: messageUpdate.id, status: messageUpdate.status })));
      // const messageUpdate = message
      console.log("Thu hồi tin nhắn", messageUpdate);
      const objectValue = {
        message: messageUpdate,
        conversation: conversation,
      }
      console.log("objectValue", objectValue);

      socket.emit('updateMessage', objectValue);

    } catch (error) {
      console.log(error.message);

    }
  }

  const handleShareMessage = () => {

  }

  return (
    <div
      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mt-4 group`}
      onContextMenu={handleContextMenu}
    >
      {/* Context Menu */}
      {contextMenu.visible && contextMenu.messageId === message.id && (
        <div
          className="absolute bg-white border rounded-md shadow-lg p-2 z-50"
          style={{
            top: contextMenu.y,
            left: isUserMessage ? contextMenu.x - 180 : contextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="text-sm text-gray-700">
            {
              message.status === 0 && (
                <>
                  <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleAnwer()}>Trả lời</li>
                  <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleShareMessage()}>Chia sẻ</li>
                  {
                    message.messageType !== 'file' && message.messageType !== 'sticker' && (
                      <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleCopy()}>Copy tin nhắn</li>
                    )
                  }
                  {
                    message.messageType === 'image' && (
                      <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Lưu về máy</li>
                    )
                  }
                  <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Ghim tin nhắn</li>
                  <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Xem chi tiết</li>
                  {
                    message.senderId === userLogin.id && (
                      <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleMessageRecall()}>Thu hồi</li>
                    )
                  }
                </>
              )
            }
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-red-500">Xóa chỉ ở phía tôi</li>
          </ul>
        </div>
      )}

      {/* Avatar nếu không phải tin nhắn của user */}
      {!isUserMessage && (
        <div className="flex-shrink-0 mr-2" style={{ width: '32px' }}>
          {showAvatar && (
            <img
              src={message.sender?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>
      )}

      {/* Nội dung tin nhắn */}
      <div
        className={`flex flex-col relative 
          items-start 
          ${message.messageType !== 'image' && 'p-3'} rounded-lg shadow-md 
          ${isUserMessage && 'bg-blue-100'} ${isHighlighted && 'border-2 border-yellow-500 animate-flash'} `}
      >
        {(showAvatar && !isUserMessage) && (
          <p className='text-sm text-gray-500 font-medium max-w-xs mb-3'>{message.sender?.fullName}</p>
        )}

        {message.messageParent && message.status === 0 && (
          <div className={`flex items-center space-x-2 mb-2 ${isUserMessage ? 'bg-blue-200' : 'bg-gray-200'} p-2 rounded-md cursor-pointer`} onClick={onClickParent}>
            {message.messageParent.status === 0 && message.messageParent.messageType === 'image' && (
              <img
                src={message.messageParent.fileLink}
                alt=""
                className="w-11 h-11 object-cover rounded-lg mx-2"
              />
            )}
            {message.messageParent.status === 0 && message.messageParent.messageType === 'sticker' && (
              <img
                src={message.messageParent.fileLink}
                alt=""
                className="w-11 h-11 object-cover rounded-lg mx-2"
              />
            )}
            {message.messageParent.status === 0 && message.messageParent.messageType === 'file' && (
              message.messageParent.fileLink.includes('.mp4') ? (
                <video
                  src={message.messageParent.fileLink}
                  className="w-11 h-11 object-cover rounded-lg mx-2"
                  controls
                />
              ) : (
                <div>
                  {getFileIcon(getFileExtension(message.messageParent.fileLink))}
                </div>
              )
            )}
            <div>
              <p className="text-sm text-gray-800 max-w-xs font-semibold">{message.messageParent.sender.fullName}</p>

              <div className="text-gray-500 font-normal">
                {message.messageParent.messageType === 'text' && <p>{message.messageParent.content}</p>}
                {message.messageParent.messageType === 'image' && (
                  <p className="">[Hình ảnh]</p>
                )}
                {message.messageParent.messageType === 'file' && (
                  <p className="">[File] {extractOriginalName(message.messageParent.fileLink)}</p>
                )}
                {message.messageParent.messageType === 'sticker' && (
                  <p className="">[Sticker]</p>
                )}
              </div>
            </div>
          </div>
        )}

        {message.status === 0 && (
          <>
            {message.messageType === 'text' && (
              <p className="text-sm text-gray-800 max-w-xs">{message.content}</p>
            )}

            {message.messageType === 'sticker' && (
              <img src={message.fileLink} alt="sticker" className="w-20 h-20" />
            )}

            {message.messageType === 'image' && (
              <LightGallery plugins={[lgZoom, lgThumbnail, lgVideo]} mode="lg-fade">
                {[message.fileLink].map((img, index) => {
                  const isVideo = img.includes('.mp4');
                  return !isVideo ? (
                    <a key={index} href={img}>
                      <img src={img} alt="Hình ảnh" className='max-w-full max-h-96 cursor-pointer object-cover' />
                    </a>
                  ) : (
                    <a key={index} href={img} data-lg-size="1280-720">
                      <video src={img} controls className='max-w-full max-h-96 cursor-pointer object-cover' />
                    </a>
                  );
                })}
              </LightGallery>
            )}

            {message.messageType === 'file' && (
              message.fileLink.includes('.mp4') ? (
                <div className="flex items-center space-x-3 rounded-lg w-full max-w-sm cursor-pointer">
                  <a href={message.fileLink} data-lg-size="1280-720">
                    <video src={message.fileLink} controls className='max-w-full max-h-96 cursor-pointer object-cover' />
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-3 rounded-lg w-full max-w-sm cursor-pointer">
                  {getFileIcon(getFileExtension(message.fileLink))}
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-semibold truncate max-w-full">
                      {extractOriginalName(message.fileLink)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(message.fileLink)}
                      className="rounded-sm bg-white transition"
                      title="Tải xuống"
                    >
                      <img src="/icon/ic_download.png" alt="Tải xuống" />
                    </button>
                  </div>
                </div>
              )
            )}

            {isLastMessage && (
              <div className={`text-xs text-gray-400 mt-2 ${message.messageType === 'image' && "mx-2 mb-2"}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            <div
              className="absolute bottom-[-10px] right-[-10px] group/reaction hidden group-hover:flex items-center justify-center bg-white rounded-full shadow-lg cursor-pointer transition duration-200"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <div className="relative">
                {/* Nút Like */}
                <div className="flex items-center justify-center p-1 bg-white rounded-full shadow cursor-pointer transition duration-200">
                  <img
                    src="https://res-zalo.zadn.vn/upload/media/2019/1/25/iconlike_1548389696575_103596.png"
                    width={15}
                    height={15}
                    alt="like"
                  />
                </div>

                {/* Hover Bridge - Giữ hover giữa Like và Reaction */}
                <div
                  className="absolute"
                  style={{
                    top: isUserMessage ? '50%' : 'auto',
                    bottom: isUserMessage ? 'auto' : '100%',
                    left: isUserMessage ? 'auto' : '50%',
                    right: isUserMessage ? '100%' : 'auto',
                    transform: isUserMessage ? 'translateY(-50%)' : 'translateX(-50%)',
                    width: '30px',
                    height: '20px',
                    zIndex: 5,
                  }}
                ></div>

                {/* Reactions */}
                {showReactions && (
                  <div
                    className={`absolute ${isUserMessage
                      ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                      : 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                      } flex items-center justify-center bg-white p-2 rounded-full shadow-lg z-10 w-fit`}
                  >
                    {reaction.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 cursor-pointer"
                        onClick={() => console.log(item.type)}
                      >
                        <span className="text-lg">{item.icon}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {message.status === 1 && (
          <p className={`text-sm text-gray-400 max-w-xs ${message.messageType !== 'text' ? 'p-3' : ''}`}>Tin nhắn đã được thu hồi</p>
        )}

      </div>
    </div>
  );

};

export default MessageItem;
