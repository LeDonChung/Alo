import React from 'react';

const RightSlidebar = () => {
  // Dữ liệu mẫu cho các tab
  const photos = [
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
    "https://stc-zlogin.zdn.vn/images/banner_icon.svg",
  ];

  const files = [
    { name: 'Nhóm-B.docx', size: '78.3 KB' },
    { name: 'Nhóm-B.docx', size: '78.3 KB' },
    { name: 'Nhóm-B.docx', size: '78.3 KB' },
  ];
  const links = [
    { name: 'Nhóm-B.docx', size: '78.3 KB' },
    { name: 'Nhóm-B.docx', size: '78.3 KB' },
    { name: 'Nhóm-B.docx', size: '78.3 KB' },
  ];
  const security = [
    { name: 'Tin nhắn tự xóa' },
    { name: 'Ẩn trò chuyện' },
  ];

  return (
    // <div className="w-64 bg-gray-200 p-4 overflow-y-auto max-h-[400px] scrollable">
    <div className=" w-1/4 bg-white border-l border-gray-200 p-4 overflow-y-auto max-h-[2000px] scrollable">
      <div className="space-y-4">
        {/* Phần Thông tin hội thoại */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-semibold text-center mb-2">Thông tin hội thoại</h3>
          <div className="flex flex-col items-center">
            <img
              src="https://stc-zlogin.zdn.vn/images/banner_icon.svg" // Thay bằng avatar thật
              alt="Avatar"
              className="w-20 h-20 rounded-full mb-2"
            />
            <p className="font-semibold text-lg">Cô gái Lụa Lụa</p>
            <div className="flex space-x-4 mt-4">
              <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span>Tắt thông báo</span>
              </button>
              <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Bỏ ghim hội thoại</span>
              </button>
              <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 18h-5v-2a3 3 0 015.356-1.857M7 18v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>Tạo nhóm trò chuyện</span>
              </button>
            </div>
          </div>
        </div>
        {/* Tab Photos/Videos */}
        <div className="border-b border-gray-200 pb-2">
          <h3 className="font-semibold">Ảnh/Video</h3>
          <div className="grid grid-cols-3 gap-2 mt-2 overflow-y-auto max-h-64">
            {photos.map((src, index) => (
              <img key={index} src={src} alt={`Ảnh ${index + 1}`} className="w-full h-20 object-cover rounded" />
            ))}
          </div>
        </div>

        {/* Tab Files */}
        <div className="border-b border-gray-200 pb-2">
          <h3 className="font-semibold">File</h3>
          <div className="mt-2 overflow-y-auto max-h-32">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <span>{file.name} ({file.size})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Links */}
        <div className="border-b border-gray-200 pb-2">
          <h3 className="font-semibold">Link</h3>
          <div className="mt-2 overflow-y-auto max-h-32">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex items-center p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                <span>{link.name} ({link.size})</span>
              </div>
            ))}
          </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Xóa lịch sử trò chuyện
          </button>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default RightSlidebar;
