import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import showToast, { getFriend, getUserRoleAndPermissions } from '../utils/AppUtils';
import GroupMembers from './conversation/GroupMember';
import GroupManagement from './conversation/GroupManager';
import MediaStorage from './conversation/MediaStorage';
import { SearchInfo } from './conversation/SearchInfo';
import { setConversation, removeAllHistoryMessages, handlerRemoveHistoryMessage } from '../redux/slices/ConversationSlice';
import socket from '../utils/socket';
import { clearAllMessages } from '../redux/slices/MessageSlice';
import ModalAddMember from './conversation/ModalAddMember';
import UpdateProfileGroup from './conversation/UpdateProfileGroup';
import ModalOutGroup from './conversation/ModalOutGroup';
import ModalChangeLeader from './conversation/ModalChangeLeader';




const RightSlidebar = ({ search, setSearch, scrollToMessage }) => {

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.user.userLogin);
  const conversation = useSelector(state => state.conversation.conversation);
  const messages = useSelector(state => state.message.messages);
  const [isOpenModalAddMember, setIsOpenModalAddMember] = useState(false);

  // rời nhóm
  const [isOpenOutGroup, setIsOpenOutGroup] = useState(false);
  const [isOpenChangeLeader, setIsOpenChangeLeader] = useState(false);
  const leaderId = conversation.isGroup && conversation.roles.find(role => role.role === 'leader')?.userIds[0];
  const [newLeaderId, setNewLeaderId] = useState(leaderId);

  // Hàm lấy icon theo loại file
  const getFileIcon = (extension) => {
    const icons = {
      pdf: '/icon/ic_pdf.png',
      xls: '/icon/ic_excel.png',
      xlsx: '/icon/ic_excel.png',
      doc: '/icon/ic_word.png',
      docx: '/icon/ic_word.png',
      ppt: '/icon/ic_ppt.png',
      pptx: '/icon/ic_ppt.png',
      zip: '/icon/ic_zip.png',
      rar: '/icon/ic_zip.png',
      txt: '/icon/ic_txt.png',
      mp4: '/icon/ic_video.png',
    };
    return (
      <img
        src={icons[extension] || '/icon/ic_file.png'}
        alt={extension || 'File'}
        className="w-6 h-6"
      />
    );
  };

  // Hàm xử lý tải file
  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hàm lấy phần mở rộng file
  const getFileExtension = (filename = '') => {
    const parts = filename.split('.');
    return parts[parts.length - 1]?.toLowerCase() || '';
  };

  // Hàm trích xuất tên file gốc
  const extractOriginalName = (fileUrl) => {
    const fileNameEncoded = fileUrl.split('/').pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(' - ');
    return parts[parts.length - 1];
  };

  // State cho ảnh và file
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [photosGroupByDate, setPhotosGroupByDate] = useState([]);
  const [filesGroupByDate, setFilesGroupByDate] = useState([]);
  const [isSetting, setIsSetting] = useState(!search);
  const [searchImage, setSearchImage] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showMediaStorage, setShowMediaStorage] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [isOpenUpdateProfileGroup, setIsOpenUpdateProfileGroup] = useState(false);
  const [membersWithRoles, setMembersWithRoles] = useState([]);
  // Kiểm tra quyền của conversation 
  let memberRole = conversation.roles?.find(role => role.role === 'member');

  // Hàm xử lý xóa lịch sử trò chuyện
  const handleRemoveAllHistoryMessages = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      await dispatch(removeAllHistoryMessages({ conversationId: conversation.id })).unwrap().then((res) => {
        console.log("API call successful, emitting socket event");

        // Xóa messages trong state local
        dispatch(clearAllMessages());
        dispatch(handlerRemoveHistoryMessage({ conversation: conversation }))

        // Emit socket event để thông báo cho các clients khác
        socket.emit('remove-all-history-messages', { conversation: conversation });

        showToast('Đã xóa toàn bộ lịch sử trò chuyện thành công!', 'success');
      })

    } catch (error) {
      console.error("Error in removeAllHistoryMessages:", error);
      showToast(`${error.message}` || 'Lỗi không xác định.', 'error');
    }
  };




  // Cập nhật state khi messages hoặc conversation thay đổi
  useEffect(() => {
    // Photos (hiển thị tối đa 8 ảnh mới nhất)
    const sortedImages = messages
      .filter(m => m.messageType === 'image')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
    setPhotos(sortedImages);

    // Files (hiển thị tối đa 3 file mới nhất)
    const sortedFiles = messages
      .filter(m => m.messageType === 'file')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
    setFiles(sortedFiles);

    // Links (hiển thị tối đa 3 link mới nhất)
    const sortedLinks = messages
      .filter(m => m.messageType === 'link')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
    setLinks(sortedLinks);

    // Nhóm ảnh theo ngày
    const photosGrouped = messages
      .filter(m => m.messageType === 'image')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
      }, {});
    setPhotosGroupByDate(
      Object.entries(photosGrouped).map(([date, messages]) => ({
        date,
        messages,
      }))
    );

    // Nhóm file theo ngày
    const filesGrouped = messages
      .filter(m => m.messageType === 'file')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
      }, {});
    setFilesGroupByDate(
      Object.entries(filesGrouped).map(([date, messages]) => ({
        date,
        messages,
      }))
    );
  }, [messages, conversation]);

  //Cập nhật danh sách thành viên với vai trò
  useEffect(() => {
    if (conversation?.isGroup && conversation?.members && conversation?.roles) {
      const membersWithRolesData = conversation.members.map(member => {
        // Tìm vai trò của thành viên trong conversation.roles
        const roleObj = conversation.roles.find(role => role.userIds.includes(member.id));
        return {
          ...member,
          role: roleObj ? roleObj.role : 'member', // Mặc định là member nếu không tìm thấy
        };
      });
      setMembersWithRoles(membersWithRolesData);
    }
  }, [conversation]);

  //Lấy vai trò và quyền của userLogin
  const userRole = conversation?.roles?.find(role => role.userIds.includes(userLogin.id));
  const userPermissions = userRole?.permissions || {};

  // Lấy thông tin bạn bè
  const friend = getFriend(
    conversation,
    conversation?.memberUserIds?.find(item => item !== userLogin.id)
  );

  useEffect(() => {
    if (isSetting) {
      setShowMembers(false);
      setShowManagement(false);
      setShowMediaStorage(false);
      setSearch(false)
    }
  }, [isSetting])

  useEffect(() => {
    if (search) {
      setIsSetting(false);
    }
  }, [search])
  const [isOnlyChangeLeader, setIsOnlyChangeLeader] = useState(false);
  const handlerShowProfileGroup = () => {
    if (!getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.changeGroupInfo) {
      showToast('Bạn không có quyền thay đổi thông tin nhóm', 'error');
      return;
    }
    setIsOpenUpdateProfileGroup(true)
  }
  const renderContent = () => {
    return (
      <div className="w-1/4 bg-white border-l border-gray-200 p-2 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-300">
        <div className="space-y-6">
          {
            search && !isSetting && (
              <SearchInfo
                search={search}
                setIsSetting={setIsSetting}
                setSearch={setSearch}
                scrollToMessage={scrollToMessage} />
            )
          }
          {
            !isSetting && showMediaStorage && (
              <MediaStorage
                photosGroupByDate={photosGroupByDate}
                filesGroupByDate={filesGroupByDate}
                searchImage={searchImage}
                setSearchImage={setSearchImage}
                setIsSetting={setIsSetting}
                getFileExtension={getFileExtension}
                getFileIcon={getFileIcon}
                extractOriginalName={extractOriginalName}
                handleDownload={handleDownload}
              />
            )
          }

          {
            !isSetting && showMembers && (
              <GroupMembers
                conversation={conversation}
                userLogin={userLogin}
                setIsSetting={setIsSetting}
                membersWithRoles={membersWithRoles}
              />
            )
          }
          {
            !isSetting && showManagement && (
              <GroupManagement
                setIsSetting={setIsSetting}
              />
            )
          }
          {
            isSetting && (
              <>
                {/* Thông tin nhóm */}
                <div className="border-b border-gray-200 pb-4">
                  {
                    conversation.isGroup ? (
                      <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">Thông tin nhóm</h3>
                    ) : (
                      <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">Thông tin cuộc trò chuyện</h3>
                    )
                  }
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      {
                        conversation.isGroup ? (
                          <img
                            onClick={() => handlerShowProfileGroup()}
                            src={conversation.avatar || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full border border-gray-200 cursor-pointer"
                          />
                        ) : (
                          <img
                            src={friend?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full border border-gray-200"
                          />
                        )
                      }

                      {conversation.isGroup && (
                        <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                          {conversation.memberUserIds.length}
                        </span>
                      )}
                    </div>
                    {
                      conversation.isGroup ? (
                        <p className="text-sm font-bold text-gray-900 cursor-pointer" onClick={() => handlerShowProfileGroup()}>{conversation.name}</p>
                      ) : (
                        <p className="text-sm font-bold text-gray-900 cursor-pointer">{friend?.fullName || 'Không xác định'}</p>
                      )
                    }
                    {
                      isOpenUpdateProfileGroup && <UpdateProfileGroup onClose={() => {
                        setIsOpenUpdateProfileGroup(false);
                      }} conversation={conversation} userLogin={userLogin} />
                    }
                    <div className="flex space-x-4 mt-4">
                      <button className="flex flex-col items-center text-gray-600 hover:text-blue-500 transition-colors">
                        <div className="rounded-full bg-gray-200 p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                        </div>
                        <span className="text-sm mt-1">Tắt thông báo</span>
                      </button>
                      <button className="flex flex-col items-center text-gray-600 hover:text-blue-500 transition-colors">
                        <div className="rounded-full bg-gray-200 p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
                          </svg>
                        </div>
                        <span className="text-sm mt-1">Ghim hội thoại</span>
                      </button>
                      {conversation.isGroup ? (
                        <>
                          <button
                            onClick={() => { setIsOpenModalAddMember(true) }}
                            className="flex flex-col items-center text-gray-600 hover:text-blue-500 transition-colors"
                          >
                            <div className="rounded-full bg-gray-200 p-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                            </div>
                            <span className="text-sm mt-1">Thêm thành viên</span>
                          </button>
                          <ModalAddMember isOpen={isOpenModalAddMember} onClose={() => { setIsOpenModalAddMember(false) }} userLogin={userLogin} conversation={conversation} />

                          <button
                            onClick={() => {
                              setIsSetting(false);
                              setShowManagement(true);
                            }}
                            className="flex flex-col items-center text-gray-600 hover:text-blue-500 transition-colors"
                          >
                            <div className="rounded-full bg-gray-200 p-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className="text-sm mt-1">Quản lý nhóm</span>
                          </button>
                        </>
                      ) : (
                        <button className="flex flex-col items-center text-gray-600 hover:text-blue-500 transition-colors">
                          <div className="rounded-full bg-gray-200 p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm mt-1">Tạo nhóm</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thành viên nhóm */}
                {
                  conversation.isGroup && (
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-800 mb-2">Thành viên nhóm</h3>
                        <div className="rounded-full hover:bg-gray-200 p-2 cursor-pointer">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3  cursor-pointer hover:bg-slate-200 py-3 px-2" onClick={() => {
                        setIsSetting(false);
                        setShowMembers(true);
                      }}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-sm text-gray-700">{conversation.memberUserIds.length} thành viên</p>
                      </div>

                      {
                        memberRole && memberRole.permissions?.joinGroupByLink && (
                          <div className="mt-2 ">
                            <div className='flex space-x-3 cursor-pointer hover:bg-slate-200 py-3 px-2 items-center' onClick={() => {
                              const host = window.location.origin + '/g/';
                              const fullLink = host + conversation.token;

                              navigator.clipboard.writeText(fullLink).then(() => {
                                showToast('Đã sao chép liên kết nhóm vào clipboard', 'success');
                              });
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
                                <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                                <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                              </svg>
                              <div className='flex-1'>

                                <p className="text-sm ">
                                  Link tham gia nhóm
                                </p>
                                <p className="text-xs  truncate text-blue-500">alo.me/g/{conversation.token}</p>
                              </div>
                              <svg width="26px" height="26px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M17.676 14.248C17.676 15.8651 16.3651 17.176 14.748 17.176H7.428C5.81091 17.176 4.5 15.8651 4.5 14.248V6.928C4.5 5.31091 5.81091 4 7.428 4H14.748C16.3651 4 17.676 5.31091 17.676 6.928V14.248Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.252 20H17.572C19.1891 20 20.5 18.689 20.5 17.072V9.75195" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                              <svg width="26px" height="26px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8.0001 10.1308C9.61344 8.97671 11.4547 8.57075 13 8.57075V6.22616C13 5.26817 13 4.78917 13.2952 4.65662C13.5903 4.52407 13.9484 4.8423 14.6644 5.47875L18.6367 9.00968C20.2053 10.404 20.9896 11.1012 20.9896 11.9993C20.9896 12.8975 20.2053 13.5946 18.6367 14.989L14.6644 18.5199C13.9484 19.1563 13.5903 19.4746 13.2952 19.342C13 19.2095 13 18.7305 13 17.7725V15.4279C9.4 15.4279 5.5 17.1422 4 19.9993C4 17.5676 4.37726 15.621 5.0001 14.0735" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            </div>
                          </div>
                        )
                      }

                    </div>

                  )
                }


                {/* Ảnh/Video */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Ảnh</h3>
                    <div className="rounded-full hover:bg-gray-200 p-2 cursor-pointer"
                      onClick={() => {
                        setIsSetting(false);
                        setShowMediaStorage(true);
                        setSearchImage(true);
                      }}
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                  </div>
                  {photos.length > 0 ? (
                    <>
                      <LightGallery
                        plugins={[lgZoom, lgThumbnail]}
                        mode="lg-slide"
                        elementClassNames="grid grid-cols-4 gap-2"
                      >
                        {photos.map((message, index) => (
                          <a key={index} href={message.fileLink}>
                            <img
                              src={message.fileLink}
                              alt="Hình ảnh"
                              className="w-full h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </LightGallery>
                      <button
                        onClick={() => {
                          setIsSetting(false)
                          setShowMediaStorage(true)
                          setSearchImage(true);
                        }}
                        className="w-full mt-2 font-medium text-black bg-gray-300 hover:bg-gray-400 p-1 rounded-sm flex items-center justify-center">
                        Xem tất cả
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">Không có ảnh/video</p>
                  )}
                </div>

                {/* File */}
                {/* Tab Files */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">File</h3>
                    <div className="rounded-full hover:bg-gray-200 p-2 cursor-pointer"
                      onClick={() => {
                        setIsSetting(false);
                        setShowMediaStorage(true);
                        setSearchImage(false);
                      }}
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                  </div>
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
                    {
                      files.length > 0 ? (
                        <button
                          onClick={() => {
                            setIsSetting(false)
                            setShowMediaStorage(true)
                            setSearchImage(false);
                          }}

                          className="w-full mt-2 font-medium text-black bg-gray-300 hover:bg-gray-400 p-1 rounded-sm flex items-center justify-center">
                          Xem tất cả
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">Không có file</p>
                      )
                    }
                  </div>

                </div>

                {conversation.isGroup && (
                  <div className="border-b border-gray-200 pb-4">
                    <div className="space-y-2">
                      {/* Chỉ hiển thị "Xóa lịch sử trò chuyện" nếu user là leader */}
                      {userRole?.role === 'leader' && (
                        <>
                          <button
                            onClick={handleRemoveAllHistoryMessages} className="w-full flex items-center space-x-3 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-sm">Xóa lịch sử trò chuyện</span>
                          </button>
                          <button
                            onClick={() => {
                              if (userLogin.id === leaderId) {
                                setIsOpenChangeLeader(true);
                                setIsOnlyChangeLeader(true);
                              }
                            }} className="w-full flex items-center space-x-3 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            {/* icon nhóm trưởng */}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 
                                      1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.371 1.24.588 
                                      1.81l-3.976 2.89a1 1 0 00-.364 1.118l1.518 
                                      4.674c.3.921-.755 1.688-1.54 1.118L12 
                                      17.347l-3.969 2.746c-.785.57-1.84-.197-1.54-1.118l1.518-4.674a1 
                                      1 0 00-.364-1.118l-3.976-2.89c-.783-.57-.38-1.81.588-1.81h4.91a1 
                                      1 0 00.95-.69l1.518-4.674z" />
                            </svg>

                            <span className="text-sm">Chuyển quyền nhóm trưởng</span>
                          </button>
                        </>
                      )}
                      {/* Hiển thị "Rời nhóm" cho tất cả thành viên */}
                      <button
                        onClick={() => {
                          if (userLogin.id === leaderId) {
                            setIsOnlyChangeLeader(false);
                            setIsOpenChangeLeader(true);
                          }
                          else {
                            setIsOpenOutGroup(true);
                          }
                        }}
                        className="w-full flex items-center space-x-3 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm">Rời nhóm</span>
                      </button>


                      <ModalOutGroup
                        isOpen={isOpenOutGroup}
                        onClose={() => {
                          setIsOpenOutGroup(false);
                        }}
                        conversation={conversation}
                        newLeaderId={newLeaderId}
                        leaderId={leaderId}
                        userLogin={userLogin}
                        member={userLogin}
                      />

                      <ModalChangeLeader
                        isOpen={isOpenChangeLeader}
                        onClose={() => {
                          setIsOpenChangeLeader(false);
                          if (isOnlyChangeLeader) {
                            setIsOpenChangeLeader(false);
                          } else {
                            setIsOpenOutGroup(true);
                          }
                        }}
                        isOnlyChangeLeader={isOnlyChangeLeader}
                        conversation={conversation}
                        leaderId={leaderId}
                        userLogin={userLogin}
                        cancel={() => {
                          setIsOpenChangeLeader(false);
                        }}
                        setNewLeaderId={setNewLeaderId}
                      />

                    </div>
                  </div>
                )}

              </>
            )
          }


        </div>
      </div>
    )
  }



  return (
    renderContent()
  );
};

export default RightSlidebar;