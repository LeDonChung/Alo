import { React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { friendInvitations, friendRecommendations } from '../data/friendInvitationData';
import { useDispatch, useSelector } from 'react-redux';
import { acceptFriendRequest, addFriend, getFriendsRequest, rejectFriendRequest, removeFriend, removeFriendRequest, setFriends, setFriendsRequest } from '../redux/slices/FriendSlice';
import showToast from '../utils/AppUtils';
import socket from '../utils/socket';
import { getAllConversation } from '../redux/slices/ConversationSlice';

const listType = [
  { id: 1, name: "Từ cửa sổ trò chuyện" },
  { id: 2, name: "Từ nhóm trò chuyện" },
  { id: 3, name: "Muốn kết bạn" },
  { id: 4, name: "Tìm kiếm qua số điện thoại" }
];

const typeRecommend = [
  { id: 1, name: "Có thể bạn quen" },
  { id: 2, name: "Nhóm chung" },
];

export default function InvitationFriend() {
  const dispatch = useDispatch();
  const friends = useSelector(state => state.friends);
  const friend = useSelector(state => state.friend);
  const userLogin = JSON.parse(localStorage.getItem("userLogin"));
  const friendRecommendationsData = friendRecommendations;
  const friendsRequest = useSelector(state => state.friend.friendsRequest);
  const [recommendList, setRecommendList] = useState(friendRecommendationsData);
  const [showListInvitation, setShowListInvitation] = useState(true);
  const [showListRecommend, setShowListRecommend] = useState(false);
  const [changeInvitation, setChangeInvitation] = useState(false);
  // Track loading state for each friend request item
  const [itemLoading, setItemLoading] = useState({});

  useEffect(() => {
    const fetchFriendInvitation = async () => {
      try {
        setItemLoading(prev => ({ ...prev, global: true }));
        await dispatch(getFriendsRequest());
      } catch (error) {
        console.log(error);
      }
      setItemLoading(prev => ({ ...prev, global: false }));
    };

    fetchFriendInvitation();
  }, [changeInvitation, dispatch]);

  const handleAcceptFriend = async (item) => {
    try {
      // Set loading state for this specific item
      setItemLoading(prev => ({ ...prev, [item.userId]: { ...prev[item.userId], accept: true } }));
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];
      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };

      const res = await dispatch(acceptFriendRequest(friendUpdate)).unwrap();
      if (res.data.status === 1) {
        // Update friends request list
        const updatedFriendsRequest = friendsRequest.filter(
          (value) => !(item.friendId === value.friendId && item.userId === value.userId)
        );
        dispatch(setFriendsRequest(updatedFriendsRequest));

        // Update friends list
        dispatch(addFriend({
          ...friendUpdate,
          friendInfo: {
            id: item.senderId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
          }
        }));

        setChangeInvitation(prev => !prev);
        showToast("Giờ đây các bạn đã trở thành bạn bè.", "success");

        // Emit socket events
        socket.emit('accept-friend-request-for-me', {
          userId: userLogin.id,
          friendId: friendId,
          updatedFriendsRequest: updatedFriendsRequest,
          friendInfo: {
            id: item.senderId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
          }
        });

        socket.emit('accept-friend-request', {
          userId: friendUpdate.userId,
          friendId: friendUpdate.friendId,
          friendInfo: userLogin
        });

        await dispatch(getAllConversation());
      }
    } catch (error) {
      console.log(error);
      showToast("Đã xảy ra lỗi khi chấp nhận lời mời.", "error");
    } finally {
      // Clear loading state for this item
      setItemLoading(prev => ({ ...prev, [item.userId]: { ...prev[item.userId], accept: false } }));
    }
  };

  const handleRejectFriend = async (item) => {
    try {
      // Set loading state for this specific item
      setItemLoading(prev => ({ ...prev, [item.userId]: { ...prev[item.userId], reject: true } }));
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];
      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };

      const res = await dispatch(rejectFriendRequest(friendUpdate)).unwrap();
      if (res.data) {
        // Update friends request list
        const updatedFriendsRequest = friendsRequest.filter(
          (value) => !(item.friendId === value.friendId && item.userId === value.userId)
        );
        dispatch(setFriendsRequest(updatedFriendsRequest));
        setChangeInvitation(prev => !prev);
        socket.emit('reject-friend-request-for-me', {
          userId: userLogin.id,
          friendId: friendId,
          updatedFriendsRequest: updatedFriendsRequest,
        });
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      // Clear loading state for this item
      setItemLoading(prev => ({ ...prev, [item.userId]: { ...prev[item.userId], reject: false } }));
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      {/* Header */}
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_invitation_friend.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Lời mời kết bạn</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Lời mời kết bạn */}
        <div className="mb-5">
          {friendsRequest && (
            <h2
              className="text-lg font-semibold mb-4 cursor-pointer"
              onClick={() => setShowListInvitation(!showListInvitation)}
            >
              Lời mời đã nhận ({friendsRequest.length}) <span>{showListInvitation ? "▼" : "▶"}</span>
            </h2>
          )}
          {showListInvitation && (
            <>
              {(friendsRequest.length === 0 && !itemLoading.global) ? (
                <div className="flex justify-center items-center w-full h-full">
                  <span className="text-gray-500">Không có lời mời kết bạn nào</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friendsRequest.map((item) => (
                    <div key={item.userId} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center mb-3">
                        <img
                          src={item.avatarLink ? item.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"}
                          alt="atv_default_avatar"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-semibold">{item.fullName}</p>
                          <span className="text-xs font-[13px] text-gray-500">
                            {new Date(item.requestDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3 w-[98%] h-[70px] bg-[#EBECF0] rounded-[5px] p-2 border border-gray-300 overflow-y-auto">
                        <p className="text-gray-700">{item.contentRequest}</p>
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={() => handleRejectFriend(item)}
                          className="px-4 py-1 rounded-[5px] hover:bg-gray-300 w-[47%] h-[38px] bg-[#EBECF0] font-bold"
                          disabled={itemLoading[item.userId]?.reject}
                        >
                          {itemLoading[item.userId]?.reject ? (
                            <div className="mx-auto animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
                          ) : (
                            "Từ chối"
                          )}
                        </button>
                        <button
                          onClick={() => handleAcceptFriend(item)}
                          className="px-4 py-1 rounded-[5px] hover:bg-[#005AE0] hover:text-white w-[47%] h-[38px] bg-blue-100 font-bold text-blue-600"
                          disabled={itemLoading[item.userId]?.accept}
                        >
                          {itemLoading[item.userId]?.accept ? (
                            <div className="mx-auto animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
                          ) : (
                            "Đồng ý"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {itemLoading.global && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}