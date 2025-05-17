import React, { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import showToast, { getUserRoleAndPermissions } from '../../utils/AppUtils';
import { useDispatch } from 'react-redux';
import { changeTokenGroup, disbandGroup, removeConversation, updateAllowJoinGroupByLink, updateAllowPinMessageGroup, updateAllowSendMessageGroup, updateAllowUpdateProfileGroup, updatePermissions, updateToken } from '../../redux/slices/ConversationSlice';
import socket from '../../utils/socket';

const GroupManagement = ({ setIsSetting }) => {
  const conversation = useSelector((state) => state.conversation.conversation);
  const memberRole = conversation.roles.find((role) => role.role === 'member');
  const [isChangeProfileApproval, setIsChangeProfileApproval] = useState(memberRole.permissions.changeGroupInfo);
  const [isMessageLabeling, setIsMessageLabeling] = useState(memberRole.permissions.pinMessages);
  const [isSendMessage, setIsSendMessage] = useState(memberRole.permissions.sendMessage);
  const [isJoinGroupByLink, setIsJoinGroupByLink] = useState(memberRole.permissions.joinGroupByLink);
  const [isLinkUsage, setIsLinkUsage] = useState(false);
  const userLogin = useSelector((state) => state.user.userLogin);
  const { permissions, role } = getUserRoleAndPermissions(conversation, userLogin.id); // Destructure role and permissions
  const dispatch = useDispatch();

  // Check if the user is a 'member' to disable checkboxes
  const isMember = role === 'member';

  const handlerDisbandGroup = async () => {
    // Add confirmation prompt
    const isConfirmed = window.confirm(`Bạn có muốn xóa nhóm ${conversation.name || 'này'} hay không?`);
    if (!isConfirmed) {
      return; // Exit if user cancels
    }

    try {
      await dispatch(disbandGroup({ conversationId: conversation.id })).unwrap().then((res) => {
        socket.emit('disband-group', { conversation: conversation });
        dispatch(removeConversation({ conversationId: conversation.id }));
        showToast('Giải tán nhóm thành công.', 'success');
      });
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra trong quá trình giải tán nhóm. Vui lòng thử lại.', 'error');
    }
  };

  useEffect(() => {
    const handlerAllowPermisstion = async () => {
      try {
        await dispatch(updateAllowUpdateProfileGroup({
          conversationId: conversation.id,
          allow: isChangeProfileApproval
        })).unwrap().then((res) => {
          const roles = res.data.roles;
          setIsChangeProfileApproval(isChangeProfileApproval);
          dispatch(updatePermissions({ conversationId: res.data.id, roles }));
          socket.emit('update-roles', { conversation: res.data });
        });
      } catch (error) {
        setIsChangeProfileApproval(!isChangeProfileApproval);
        showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
      }
    };
    if (isChangeProfileApproval !== memberRole.permissions.changeGroupInfo && !isMember) {
      handlerAllowPermisstion();
    }
  }, [isChangeProfileApproval, isMember]);

  useEffect(() => {
    const handlerAllowPermisstion = async () => {
      try {
        await dispatch(updateAllowSendMessageGroup({
          conversationId: conversation.id,
          allow: isSendMessage
        })).unwrap().then((res) => {
          const roles = res.data.roles;
          dispatch(updatePermissions({ conversationId: res.data.id, roles }));
          setIsSendMessage(isSendMessage);
          socket.emit('update-roles', { conversation: res.data });
        });
      } catch (error) {
        setIsSendMessage(!isSendMessage);
        showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
      }
    };
    if (isSendMessage !== memberRole.permissions.sendMessage && !isMember) {
      handlerAllowPermisstion();
    }
  }, [isSendMessage, isMember]);

  useEffect(() => {
    const handlerAllowPermisstion = async () => {
      try {
        await dispatch(updateAllowJoinGroupByLink({
          conversationId: conversation.id,
          allow: isJoinGroupByLink
        })).unwrap().then((res) => {
          const roles = res.data.roles;
          dispatch(updatePermissions({ conversationId: res.data.id, roles }));
          setIsJoinGroupByLink(isJoinGroupByLink);
          socket.emit('update-roles', { conversation: res.data });
        });
      } catch (error) {
        setIsJoinGroupByLink(!isJoinGroupByLink);
        showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
      }
    };
    if (isJoinGroupByLink !== memberRole.permissions?.joinGroupByLink && !isMember) {
      handlerAllowPermisstion();
    }
  }, [isJoinGroupByLink, isMember]);

  useEffect(() => {
    setIsChangeProfileApproval(memberRole.permissions.changeGroupInfo);
    setIsMessageLabeling(memberRole.permissions.pinMessages);
    setIsSendMessage(memberRole.permissions.sendMessage);
  }, [memberRole]);

  useEffect(() => {
    const handlerAllowPermisstion = async () => {
      try {
        await dispatch(updateAllowPinMessageGroup({
          conversationId: conversation.id,
          allow: isMessageLabeling
        })).unwrap().then((res) => {
          const roles = res.data.roles;
          setIsMessageLabeling(isMessageLabeling);
          dispatch(updatePermissions({ conversationId: res.data.id, roles }));
          socket.emit('update-roles', { conversation: res.data });
        });
      } catch (error) {
        setIsMessageLabeling(!isMessageLabeling);
        showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
      }
    };
    if (isMessageLabeling !== memberRole.permissions.pinMessages && !isMember) {
      handlerAllowPermisstion();
    }
  }, [isMessageLabeling, isMember]);

  const handlerChangeToken = async () => {
    try {
      await dispatch(changeTokenGroup({ conversationId: conversation.id })).unwrap().then((res) => {
        const { token, id } = res.data;
        dispatch(updateToken({ conversationId: id, token }));
        socket.emit('update-token', res.data);
      });
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra trong quá trình đổi link tham gia nhóm. Vui lòng thử lại.', 'error');
    }
  }
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
      {
        isMember && (
          <div className="flex items-center justify-center py-4 bg-gray-100 mb-4">
            <p className="text-red-500 font-semibold">
              Tính năng chỉ dùng cho quản trị viên.
            </p>
          </div>
        )
      }
      {/* Member Permissions Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Cho phép các thành viên trong nhóm:</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isChangeProfileApproval}
              onChange={() => setIsChangeProfileApproval(!isChangeProfileApproval)}
              className="h-5 w-5 text-blue-600 rounded"
              disabled={isMember} // Disable if user is a member
            />
            <span className="text-gray-700">Thay đổi tên & ảnh đại diện của nhóm</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isMessageLabeling}
              onChange={() => setIsMessageLabeling(!isMessageLabeling)}
              className="h-5 w-5 text-blue-600 rounded"
              disabled={isMember} // Disable if user is a member
            />
            <span className="text-gray-700">Ghim tin nhắn</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSendMessage}
              onChange={() => setIsSendMessage(!isSendMessage)}
              className="h-5 w-5 text-blue-600 rounded"
              disabled={isMember} // Disable if user is a member
            />
            <span className="text-gray-700">Gửi tin nhắn</span>
          </label>
        </div>
      </div>

      {/* New Member Approval Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-700">Cho phép dùng link tham gia nhóm</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isJoinGroupByLink}
              onChange={() => setIsJoinGroupByLink(!isJoinGroupByLink)}
              className="sr-only peer"
              disabled={isMember} // Disable if user is a member
            />
            <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${isMember ? '' : 'peer-checked:bg-blue-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isJoinGroupByLink && !isMember ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
        </div>
        {isJoinGroupByLink && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value={`alo/g/${conversation.token}`}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="p-2 rounded-full hover:bg-gray-200" disabled={isMember} onClick={() => {
              const host = window.location.origin + '/g/';
              const fullLink = host + conversation.token;

              navigator.clipboard.writeText(fullLink).then(() => {
                showToast('Đã sao chép liên kết nhóm vào clipboard', 'success');
              });
            }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200" disabled={isMember} onClick={() => {
              handlerChangeToken();
            }}>
              <svg fill="#000000" width="19px" height="19px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M1,12A11,11,0,0,1,17.882,2.7l1.411-1.41A1,1,0,0,1,21,2V6a1,1,0,0,1-1,1H16a1,1,0,0,1-.707-1.707l1.128-1.128A8.994,8.994,0,0,0,3,12a1,1,0,0,1-2,0Zm21-1a1,1,0,0,0-1,1,9.01,9.01,0,0,1-9,9,8.9,8.9,0,0,1-4.42-1.166l1.127-1.127A1,1,0,0,0,8,17H4a1,1,0,0,0-1,1v4a1,1,0,0,0,.617.924A.987.987,0,0,0,4,23a1,1,0,0,0,.707-.293L6.118,21.3A10.891,10.891,0,0,0,12,23,11.013,11.013,0,0,0,23,12,1,1,0,0,0,22,11Z"></path></g></svg>
            </button>
          </div>
        )}
      </div>


      <div className="mt-6">
        <button
          onClick={() => handlerDisbandGroup()}
          className={`w-full py-1 bg-red-100 text-red-600 font-semibold rounded-lg transition-colors ${isMember ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-200'}`}
          disabled={isMember}
        >
          Giải tán nhóm
        </button>
      </div>
    </div>
  );
};

export default GroupManagement;