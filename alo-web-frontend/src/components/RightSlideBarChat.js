import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { getFriend } from '../utils/AppUtils';
// Tạo components/Icons.js
export const FileIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M13 2v7h7" />
  </svg>
);

export const DownloadIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const SearchIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const RightSlidebar = () => {
  const userLogin = useSelector(state => state.user.userLogin);
  const conversation = useSelector(state => state.conversation.conversation);
  const messages = useSelector(state => state.message.messages);
  function getFileIcon(extension) {
    switch (extension) {
      case 'pdf':
        return (
          <img src='/icon/ic_pdf.png' alt='PDF' />
        );
      case 'xls':
      case 'xlsx':
        return (
          <img src={'/icon/ic_excel.png'} alt='EXCEL' />
        );
      case 'doc':
      case 'docx':
        return (
          <img src={'/icon/ic_work.png'} alt='WORD' />
        );
      case 'ppt':
      case 'pptx':
        return (
          <img src={'/icon/ic_ppt.png'} alt='PPT' />
        );
      case 'zip':
      case 'rar':
        return (
          <img src={'/icon/ic_zip.png'} alt='ZIP' />
        );
      case 'txt':
        return (
          <img src={'/icon/ic_txt.png'} alt='TXT' />
        );
      case 'mp4':
        return (
          <img src={'/icon/ic_video.png'} alt='VIDEO' />
        );
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
            <text
              x="12"
              y="16"
              fill="#fff"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              FILE
            </text>
          </svg>
        );
    }
  }
  // Hàm xử lý tải file
  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Các message có messageType là image
  const [photos, setPhotos] = useState(() => {
    const photos = messages
      .filter((message) => message.messageType === 'image')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Nếu timestamp là số (hoặc thời gian dạng timestamp)
      .slice(0, 8);
    return photos;
  })

  const [files, setFiles] = useState(() => {
    const files = messages
      .filter((message) => message.messageType === 'file')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Nếu timestamp là số (hoặc thời gian dạng timestamp)
      .slice(0, 3);
    return files;
  });
  const [photosGroupByDate, setPhotosGroupByDate] = useState(() => {
    // Tạo đối tượng group theo ngày
    const grouped = messages.filter(m => m.messageType === 'image')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {});

    return Object.entries(grouped).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  });
  const [filesGroupByDate, setFilesGroupByDate] = useState(() => {
    const filesGroupByDate = messages.filter(m => m.messageType === 'file')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {});
    return filesGroupByDate
  });
  useEffect(() => {
    const sortedImages = messages
      .filter(m => m.messageType === 'image')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
    setPhotos(sortedImages)

    const sortedFiles = messages
      .filter(m => m.messageType === 'file')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
    setFiles(sortedFiles)

    const photosGroupByDate = messages.filter(m => m.messageType === 'image')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {});

    const dataX = Object.entries(photosGroupByDate).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));

    setPhotosGroupByDate(dataX);

    const filesGroupByDate = messages.filter(m => m.messageType === 'file')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {});

    const dataY = Object.entries(filesGroupByDate).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));

    setFilesGroupByDate(dataY);
  }, [messages, conversation]);

  const security = [
    { name: 'Tin nhắn tự xóa' },
    { name: 'Ẩn trò chuyện' },
  ];

  function getFileExtension(filename = '') {
    const parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  function extractOriginalName(fileUrl) {
    const fileNameEncoded = fileUrl.split("/").pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(" - ");
    return parts[parts.length - 1];
  }

  const [isSetting, setIsSetting] = useState(true);
  const [searchImage, setSearchImage] = useState(false);
  const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id))
  return (
    isSetting ? (
      <div className=" w-1/4 bg-white border-l border-gray-200 p-4 overflow-y-auto max-h-[2000px] scrollable">
        <div className="space-y-4">
          {/* Phần Thông tin hội thoại */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-center mb-2">Thông tin hội thoại</h3>
            <div className="flex flex-col items-center">
              {
                !conversation.isGroup ? (
                  <img
                    src={friend.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'} // Thay bằng avatar thật
                    alt="Avatar"
                    className="w-20 h-20 rounded-full mb-2"
                  />
                ) : (
                  <img
                    src={conversation.avatar || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'} // Thay bằng avatar thật
                    alt="Avatar"
                    className="w-20 h-20 rounded-full mb-2"
                  />
                )
              }
              {
                !conversation.isGroup ? (
                  <p className="font-semibold text-lg">{friend.fullName}</p>
                ) : (
                  <p className="font-semibold text-lg">{conversation.name}</p>
                )
              }
              <p className="font-semibold"></p>
              <div className="flex space-x-4 mt-4">
                <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Tắt thông báo</span>
                </button>
                <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Bỏ ghim hội thoại</span>
                </button>
                <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 18h-5v-2a3 3 0 015.356-1.857M7 18v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Tạo nhóm trò chuyện</span>
                </button>
              </div>
            </div>
          </div>
          {/* Tab Photos/Videos */}
          <div className="border-b border-gray-200 pb-2">
            <h3 className="font-semibold">Ảnh/Video</h3>

            <LightGallery plugins={[lgZoom, lgThumbnail]} mode="lg-slide" elementClassNames="grid grid-cols-4 gap-2 mt-2">

              {photos.map((message, index) => (
                <a key={index} href={message.fileLink}>
                  <img src={message.fileLink} alt="Hình ảnh" className='w-full h-[5rem] cursor-pointer object-cover border rounded-sm' />
                </a>
              ))}

            </LightGallery>
            <button
              onClick={() => {
                setIsSetting(false)
                setSearchImage(true)
              }}
              className="w-full mt-2 font-medium text-black bg-gray-300 hover:bg-gray-400 p-1 rounded-sm flex items-center justify-center">
              Xem tất cả
            </button>


          </div>

          {/* Tab Files */}
          <div className="border-b border-gray-200 pb-2">
            <h3 className="font-semibold">File</h3>
            <div className="mt-2 overflow-y-auto max-h-35">
              {files.map((message, index) => {
                return (
                  <div className="flex items-center space-x-3 rounded-lgw-full max-w-sm cursor-pointer my-2">
                    {getFileIcon(getFileExtension(message.fileLink))}

                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-semibold truncate max-w-full">
                        {extractOriginalName(message.fileLink)}
                      </div>
                      {/* <div className="text-sm text-gray-500">
                        {fileSize}
                        <span className="mx-1">•</span>
                        <span className="text-green-500">Đã có trên máy</span>
                      </div> */}
                    </div>

                    {/* Các nút hành động */}
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
              })}
            </div>
            <button
              onClick={() => {
                setIsSetting(false)
                setSearchImage(false)
              }}

              className="w-full mt-2 font-medium text-black bg-gray-300 hover:bg-gray-400 p-1 rounded-sm flex items-center justify-center">
              Xem tất cả
            </button>
          </div>


          {/* Tab Bảo mật */}
          <div className="pb-2">
            <h3 className="font-semibold">Thiết lập bảo mật</h3>
            <div className="mt-2 overflow-y-auto max-h-32">
              {security.map((security, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{security.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phần Xóa lịch sử trò chuyện */}
          <div className="border-t border-gray-200 pt-2">
            <button className="w-full text-red-500 hover:bg-red-50 p-2 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa lịch sử trò chuyện
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className=" w-1/4 bg-white border-l border-gray-200 p-4 overflow-y-auto max-h-[2000px] scrollable">
        <div className='flex flex-row items-center border-b py-[0.87rem] mx-[-1rem] px-4'>
          <button
            onClick={() => setIsSetting(true)}
            className="font-medium text-black rounded-full hover:bg-gray-300 p-1 flex items-center justify-center">
            <svg width="24px" height="24px" viewBox="-102.4 -102.4 1228.80 1228.80" fill="#000000" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="20.48"><path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill=""></path></g><g id="SVGRepo_iconCarrier"><path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill=""></path></g></svg>          </button>
          <h1 className='mx-auto font-bold'>
            Kho lưu trữ
          </h1>
        </div>
        <div className=''>
          <div className='flex'>
            <h1 onClick={() => setSearchImage(true)} className={`flex-1 text-center cursor-pointer font-medium py-2  ${searchImage && 'border-blue-500 text-blue-500 border-b-2'}`}>Ảnh/Video</h1>
            <h1 onClick={() => setSearchImage(false)} className={`flex-1 text-center cursor-pointer font-medium py-2 ${!searchImage && 'border-blue-500 text-blue-500 border-b-2'}`} >Files</h1>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tab Photos/Videos */}
          {
            searchImage ? (
              <div className="border-b border-gray-200 pb-2">
                {
                  photosGroupByDate.map((group, index) => {
                    return (
                      <div key={index}>
                        <h4 className="text-gray-900 mt-2 font-medium">{group.date}</h4>
                        <LightGallery plugins={[lgZoom, lgThumbnail]} mode="lg-slide" elementClassNames="grid grid-cols-4 gap-2 mt-2">
                          {group.messages.map((message, index) => (
                            <a key={index} href={message.fileLink}>
                              <img src={message.fileLink} alt="Hình ảnh" className='w-full h-[5rem] cursor-pointer object-cover border rounded-sm' />
                            </a>
                          ))}
                        </LightGallery>
                      </div>
                    )
                  })
                }

              </div>
            ) : (
              <div className="border-b border-gray-200 pb-2">
                {
                  filesGroupByDate.map((group, index) => {
                    console.log("group", group)
                    return (
                      <div key={index}>
                        <h4 className="text-gray-800 mt-2 font-medium">{group.date}</h4>
                        {
                          group.messages.map((message, index) => {
                            return (
                              <div className="flex items-center space-x-3 rounded-lgw-full max-w-sm cursor-pointer my-2">
                                {getFileIcon(getFileExtension(message.fileLink))}

                                <div className="flex-1 min-w-0">
                                  <div className="text-gray-900 font-semibold truncate max-w-full">
                                    {extractOriginalName(message.fileLink)}
                                  </div>
                                </div>

                                {/* Các nút hành động */}
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
                          })
                        }
                      </div>
                    )
                  })
                }

              </div>
            )
          }
        </div>
      </div>
    )
  );
};

export default RightSlidebar;
