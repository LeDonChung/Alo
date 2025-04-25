import React, { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import showToast, { getUserRoleAndPermissions } from '../../utils/AppUtils';
import { useDispatch } from 'react-redux';
import { disbandGroup, removeConversation, updateAllowPinMessageGroup, updateAllowSendMessageGroup, updateAllowUpdateProfileGroup, updatePermissions } from '../../redux/slices/ConversationSlice';
import socket from '../../utils/socket';

const GroupManagement = ({ setIsSetting }) => {
  const conversation = useSelector((state) => state.conversation.conversation);
  const memberRole = conversation.roles.find((role) => role.role === 'member');
  const [isChangeProfileApproval, setIsChangeProfileApproval] = useState(memberRole.permissions.changeGroupInfo);
  const [isMessageLabeling, setIsMessageLabeling] = useState(memberRole.permissions.pinMessages);
  const [isSendMessage, setIsSendMessage] = useState(memberRole.permissions.sendMessage);
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
              checked={isLinkUsage}
              onChange={() => setIsLinkUsage(!isLinkUsage)}
              className="sr-only peer"
              disabled={isMember} // Disable if user is a member
            />
            <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${isMember ? '' : 'peer-checked:bg-blue-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isLinkUsage && !isMember ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
        </div>
        {isLinkUsage && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value="zalo.me/g/proxcu147"
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-700"
            />
            <button className="p-2 rounded-full hover:bg-gray-200" disabled={isMember}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200" disabled={isMember}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-2 0V6a2 2 0 012-2h2a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Other Sections */}
      <div className={`cursor-pointer hover:bg-gray-200 py-2 ${isMember ? 'pointer-events-none opacity-50' : ''}`}>
        <h4 className="text-sm font-semibold text-gray-700">Chặn khỏi nhóm</h4>
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