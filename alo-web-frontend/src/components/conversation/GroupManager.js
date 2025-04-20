import React from 'react';

const GroupManagement = ({ setIsSetting }) => {
  // Giả sử đây là các chức năng quản lý nhóm
  const managementOptions = [
    { name: 'Đổi tên nhóm', icon: 'edit' },
    { name: 'Đổi ảnh nhóm', icon: 'image' },
    { name: 'Rời nhóm', icon: 'log-out', color: 'text-red-500' },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-300">
      {/* Header */}
      <div className="flex items-center border-b border-gray-200 py-3 mb-4">
        <button
          onClick={() => setIsSetting(true)}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="flex-1 text-center text-lg font-semibold text-gray-800">Quản lý nhóm</h3>
      </div>

      {/* Các tùy chọn quản lý */}
      <div className="space-y-2">
        {managementOptions.map((option, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors ${option.color || 'text-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {option.icon === 'edit' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              )}
              {option.icon === 'image' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              )}
              {option.icon === 'log-out' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              )}
            </svg>
            <span className="text-sm">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupManagement;