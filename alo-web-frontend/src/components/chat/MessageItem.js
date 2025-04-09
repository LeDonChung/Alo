import React, { useState, useEffect } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from "lightgallery/plugins/video";

const MessageItem = ({ message, isUserMessage, isLastMessage, showAvatar }) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });

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

  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mt-4`} onContextMenu={handleContextMenu}>
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
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => console.log(message)}>Trả lời</li>
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Chia sẻ</li>
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Copy tin nhắn</li>
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Ghim tin nhắn</li>
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Xem chi tiết</li>
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Thu hồi</li>
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

      <div className={`flex flex-col ${isUserMessage ? "items-end" : "items-start"} ${message.messageType !== 'image' && 'p-3'} rounded-lg shadow-md ${isUserMessage && 'bg-blue-100'}`}>
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
      </div>
    </div>
  );
};

export default MessageItem;
