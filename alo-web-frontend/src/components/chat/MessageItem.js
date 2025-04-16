import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from 'lightgallery/plugins/video';
import { useDispatch } from 'react-redux';
import { setMessageParent, setMessageUpdate, updateMessageStatus } from '../../redux/slices/MessageSlice';
import { batch } from 'react-redux';
import socket from '../../utils/socket';

const MessageItem = ({
  message,
  isUserMessage,
  isLastMessage,
  showAvatar,
  onClickParent,
  isHighlighted,
  conversation,
  userLogin,
  conversations,
}) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLightGallery, setShowLightGallery] = useState(false);
  const showReactionsRef = useRef(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const dispatch = useDispatch();

  // Memoize danh sách reactions
  const reactions = useMemo(
    () => [
      { type: 'like', icon: '👍' },
      { type: 'love', icon: '❤️' },
      { type: 'laugh', icon: '😆' },
      { type: 'wow', icon: '😮' },
      { type: 'sad', icon: '😭' },
      { type: 'angry', icon: '😠' },
    ],
    []
  );

  // Memoize các hàm xử lý sự kiện
  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        messageId: message.id,
      });
    },
    [message.id]
  );

  const handleClickOutside = useCallback(() => {
    setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

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

  const handleDownload = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Lỗi khi tải file.');
    }
  }, []);

  const handleAnswer = useCallback(() => {
    dispatch(setMessageParent(message));
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    showReactionsRef.current = false;
    forceUpdate();
  }, [message, dispatch]);

  const handleCopy = useCallback(() => {
    let content = '';
    if (message.messageType === 'text') {
      content = message.content;
    } else if (message.messageType === 'image') {
      content = message.fileLink;
    }
    navigator.clipboard
      .writeText(content)
      .then(() => console.log('Nội dung đã được sao chép!'))
      .catch((err) => console.error('Lỗi khi sao chép:', err));
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  }, [message]);

  const handleMessageRecall = useCallback(async () => {
    try {
      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
      const resp = await dispatch(updateMessageStatus({ messageId: message.id, status: 1 }));
      const messageUpdate = resp.payload.data;
      batch(() => {
        dispatch(setMessageUpdate({ messageId: messageUpdate.id, status: messageUpdate.status }));
      });
      socket.emit('updateMessage', { message: messageUpdate, conversation });
    } catch (error) {
      console.error('Error recalling message:', error);
    }
  }, [message.id, conversation, dispatch]);

  const handleShareMessage = useCallback(() => {
    // TODO: Thêm logic chia sẻ tin nhắn
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  }, []);

  const handleViewDetails = useCallback(() => {
    setShowDetailsModal(true);
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  }, []);

  const formatMessageDateTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN')} • ${time}`;
  }, []);

  const getSenderInfo = useCallback(() => {
    if (message.senderId === userLogin.id) {
      return {
        fullName: 'Bạn',
        avatarLink: userLogin.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
      };
    }
    const sender = conversation?.members?.find((member) => member.id === message.senderId) || message.sender;
    return {
      fullName: sender?.fullName || 'Thành viên',
      avatarLink: sender?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
    };
  }, [message.senderId, userLogin.id, conversation]);

  const senderInfo = getSenderInfo();

  return (
    <div className={`flex flex-col ${isUserMessage ? 'justify-end' : 'justify-start'} mt-4 group`}>
      <div
        className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mt-4 group`}
        onContextMenu={handleContextMenu}
      >
        {/* Context Menu */}
        {contextMenu.visible && contextMenu.messageId === message.id && (
          <div
            className="absolute bg-white border rounded-md shadow-lg p-2 z-50"
            style={{ top: contextMenu.y, left: isUserMessage ? contextMenu.x - 180 : contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="text-sm text-gray-700">
              <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleAnswer}>
                Trả lời
              </li>
              <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleShareMessage}>
                Chia sẻ
              </li>
              {message.messageType !== 'file' && message.messageType !== 'sticker' && (
                <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleCopy}>
                  Copy tin nhắn
                </li>
              )}
              {message.messageType === 'image' && (
                <li
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleDownload(message.fileLink)}
                >
                  Lưu về máy
                </li>
              )}
              <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Ghim tin nhắn</li>
              <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleViewDetails}>
                Xem chi tiết
              </li>
              {message.senderId === userLogin.id && (
                <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleMessageRecall}>
                  Thu hồi
                </li>
              )}
              <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-red-500">Xóa chỉ ở phía tôi</li>
            </ul>
          </div>
        )}

        {/* Avatar */}
        {!isUserMessage && (
          <div className="flex-shrink-0 mr-2" style={{ width: '32px' }}>
            {showAvatar && (
              <img
                src={message.sender?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
                alt="avatar"
                className="w-8 h-8 rounded-full"
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* Nội dung tin nhắn */}
        <div
          className={`flex flex-col relative items-start max-w-[50%] ${
            message.messageType !== 'image' && 'p-3'
          } rounded-lg shadow-md ${isUserMessage ? 'bg-blue-100' : 'bg-white'} ${
            isHighlighted && 'border-2 border-yellow-500 animate-flash'
          }`}
        >
          {showAvatar && !isUserMessage && (
            <p className="text-sm text-gray-500 font-medium max-w-xs mb-3">{message.sender?.fullName}</p>
          )}

          {message.messageParent && (message.status === 0 || message.status === -1 || message.status === 'uploading') && (
            <div
              className={`flex items-center space-x-2 mb-2 ${isUserMessage ? 'bg-blue-200' : 'bg-gray-200'} p-2 rounded-md cursor-pointer`}
              onClick={onClickParent}
            >
              {message.messageParent.status === 0 && message.messageParent.messageType === 'image' && (
                <img
                  src={message.messageParent.fileLink}
                  alt=""
                  className="w-11 h-11 object-cover rounded-lg mx-2"
                  loading="lazy"
                />
              )}
              {message.messageParent.status === 0 && message.messageParent.messageType === 'sticker' && (
                <img
                  src={message.messageParent.fileLink}
                  alt=""
                  className="w-11 h-11 object-cover rounded-lg mx-2"
                  loading="lazy"
                />
              )}
              {message.messageParent.status === 0 && message.messageParent.messageType === 'file' && (
                message.messageParent.fileLink.includes('.mp4') ? (
                  <video
                    src={message.messageParent.fileLink}
                    className="w-11 h-11 object-cover rounded-lg mx-2"
                    controls
                    loading="lazy"
                  />
                ) : (
                  <div>{getFileIcon(getFileExtension(message.messageParent.fileLink))}</div>
                )
              )}
              <div>
                <p className="text-sm text-gray-800 max-w-xs font-semibold">
                  {message.messageParent.sender.fullName}
                </p>
                <div className="text-gray-500 font-normal">
                  {message.messageParent.messageType === 'text' && <p>{message.messageParent.content}</p>}
                  {message.messageParent.messageType === 'image' && <p className="">[Hình ảnh]</p>}
                  {message.messageParent.messageType === 'file' && (
                    <p className="">[File] {extractOriginalName(message.messageParent.fileLink)}</p>
                  )}
                  {message.messageParent.messageType === 'sticker' && <p className="">[Sticker]</p>}
                </div>
              </div>
            </div>
          )}

          {(message.status === 0 ||
            message.status === -1 ||
            message.status === 'uploading' ||
            message.status === 'error') && (
            <>
              {message.status === 'uploading' && (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path d="M4 12a8 8 0 018-8" fill="currentColor" />
                  </svg>
                  <span>Đang gửi {message.fileName || 'nội dung'}...</span>
                  {message.messageType === 'image' && (
                    <img
                      src={message.fileLink}
                      alt={message.fileName || 'Hình ảnh'}
                      className="w-20 h-20 object-cover rounded-lg ml-2"
                      loading="lazy"
                    />
                  )}
                </div>
              )}
              {message.status === 'error' && (
                <div className="text-red-500">Lỗi gửi {message.fileName || 'nội dung'}</div>
              )}
              {(message.status === 0 || message.status === -1) && (
                <>
                  {message.messageType === 'text' && <p className="text-sm text-gray-800">{message.content}</p>}
                  {message.messageType === 'sticker' && (
                    <img src={message.fileLink} alt="sticker" className="w-20 h-20" loading="lazy" />
                  )}
                  {message.messageType === 'image' && (
                    <div onClick={() => setShowLightGallery(true)}>
                      {message.fileLink.includes('.mp4') ? (
                        <video
                          src={message.fileLink}
                          controls
                          className="max-w-full max-h-96 cursor-pointer object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={message.fileLink}
                          alt="Hình ảnh"
                          className="max-w-full max-h-96 cursor-pointer object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}
                  {showLightGallery && message.messageType === 'image' && (
                    <LightGallery
                      plugins={[lgZoom, lgThumbnail, lgVideo]}
                      mode="lg-fade"
                      onClose={() => setShowLightGallery(false)}
                    >
                      <a href={message.fileLink} data-lg-size="1280-720">
                        {message.fileLink.includes('.mp4') ? (
                          <video
                            src={message.fileLink}
                            controls
                            className="max-w-full max-h-96 cursor-pointer object-cover"
                          />
                        ) : (
                          <img
                            src={message.fileLink}
                            alt="Hình ảnh"
                            className="max-w-full max-h-96 cursor-pointer object-cover"
                          />
                        )}
                      </a>
                    </LightGallery>
                  )}
                  {message.messageType === 'file' && (
                    message.fileLink.includes('.mp4') ? (
                      <div className="flex items-center space-x-3 rounded-lg w-full max-w-sm cursor-pointer">
                        <a href={message.fileLink} data-lg-size="1280-720">
                          <video
                            src={message.fileLink}
                            controls
                            className="max-w-full max-h-96 cursor-pointer object-cover"
                            loading="lazy"
                          />
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
                            <img src="/icon/ic_download.png" alt="Tải xuống" loading="lazy" />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  {isLastMessage && (
                    <div className={`text-xs text-gray-400 mt-2 ${message.messageType === 'image' && 'mx-2 mb-2'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div
                    className="absolute bottom-[-10px] right-[-10px] group/reaction hidden group-hover:flex items-center justify-center bg-white rounded-full shadow-lg cursor-pointer transition duration-200"
                    onMouseEnter={() => {
                      showReactionsRef.current = true;
                      forceUpdate();
                    }}
                    onMouseLeave={() => {
                      showReactionsRef.current = false;
                      forceUpdate();
                    }}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center p-1 bg-white rounded-full shadow cursor-pointer transition duration-200">
                        <img
                          src="https://res-zalo.zadn.vn/upload/media/2019/1/25/iconlike_1548389696575_103596.png"
                          width={15}
                          height={15}
                          alt="like"
                          loading="lazy"
                        />
                      </div>
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
                      {showReactionsRef.current && (
                        <div
                          className={`absolute ${
                            isUserMessage
                              ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                              : 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                          } flex items-center justify-center bg-white p-2 rounded-full shadow-lg z-10 w-fit`}
                        >
                          {reactions.map((item, index) => (
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
            </>
          )}

          {message.status === 1 && (
            <p className={`text-sm text-gray-400 max-w-xs ${message.messageType !== 'text' ? 'p-3' : ''}`}>
              Tin nhắn đã được thu hồi
            </p>
          )}
        </div>

        {showDetailsModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowDetailsModal(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold mb-4">Thông tin tin nhắn</h3>
              <div className="flex items-center mb-4">
                <img
                  src={senderInfo.avatarLink}
                  alt="avatar"
                  className="w-10 h-10 rounded-full mr-3"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold">{senderInfo.fullName}</p>
                  <p className="text-sm text-gray-500">{formatMessageDateTime(message.timestamp)}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                {message.status === 0 ? (
                  <>
                    {message.messageType === 'text' && <p className="text-gray-800 break-words">{message.content}</p>}
                    {message.messageType === 'image' && (
                      message.fileLink.includes('.mp4') ? (
                        <video
                          src={message.fileLink}
                          controls
                          className="max-w-full max-h-64 rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={message.fileLink}
                          alt="Hình ảnh"
                          className="max-w-full max-h-64 rounded-lg"
                          loading="lazy"
                        />
                      )
                    )}
                    {message.messageType === 'sticker' && (
                      <img
                        src={message.fileLink}
                        alt="Sticker"
                        className="max-w-32 max-h-32 rounded-lg"
                        loading="lazy"
                      />
                    )}
                    {message.messageType === 'file' && !message.fileLink.includes('.mp4') && (
                      <div className="flex items-center space-x-2">
                        {getFileIcon(getFileExtension(message.fileLink))}
                        <p className="text-gray-800 break-words">{extractOriginalName(message.fileLink)}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-800">Tin nhắn đã được thu hồi</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isUserMessage && isLastMessage && (
        <>
          {message.status === 'uploading' ? (
            <p className="ml-auto rounded-full mt-2 text-center px-5 bg-[#b6bbc5] text-white text-xs">Đang gửi</p>
          ) : message.status === 'error' ? (
            <p className="ml-auto rounded-full mt-2 text-center px-5 bg-red-500 text-white text-xs">Lỗi gửi</p>
          ) : (
            <p className="ml-auto rounded-full mt-2 text-center px-5 bg-[#b6bbc5] text-white text-xs">
              {message.status === -1 ? 'Đang gửi' : 'Đã nhận'}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default MessageItem;