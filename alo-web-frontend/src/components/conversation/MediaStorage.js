import React from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';

const MediaStorage = ({ photosGroupByDate, filesGroupByDate, searchImage, setSearchImage, setIsSetting, getFileExtension, getFileIcon, extractOriginalName, handleDownload }) => {
  return (
    <div className="w-full bg-white border-l border-gray-200 px-2 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-300">
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
        <h3 className="flex-1 text-center text-lg font-semibold text-gray-800">Kho lưu trữ</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setSearchImage(true)}
          className={`flex-1 text-center py-2 font-medium text-sm transition-colors ${
            searchImage ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Ảnh/Video
        </button>
        <button
          onClick={() => setSearchImage(false)}
          className={`flex-1 text-center py-2 font-medium text-sm transition-colors ${
            !searchImage ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Files
        </button>
      </div>

      {/* Nội dung tab */}
      <div className="space-y-4">
        {searchImage ? (
          <div>
            {photosGroupByDate.length > 0 ? (
              photosGroupByDate.map((group, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{group.date}</h4>
                  <LightGallery
                    plugins={[lgZoom, lgThumbnail]}
                    mode="lg-slide"
                    elementClassNames="grid grid-cols-4 gap-2"
                  >
                    {group.messages.map((message, index) => (
                      <a key={index} href={message.fileLink}>
                        <img
                          src={message.fileLink}
                          alt="Hình ảnh"
                          className="w-full h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </LightGallery>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">Không có ảnh/video</p>
            )}
          </div>
        ) : (
          <div>
            {filesGroupByDate.length > 0 ? (
              filesGroupByDate.map((group, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{group.date}</h4>
                  <div className="space-y-2">
                    {group.messages.map((message, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        {getFileIcon(getFileExtension(message.fileLink))}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {extractOriginalName(message.fileLink)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownload(message.fileLink)}
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                          title="Tải xuống"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">Không có file</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaStorage;