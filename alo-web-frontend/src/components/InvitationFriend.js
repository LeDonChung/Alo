import { React, useState, useEffect, useRef, use } from 'react';
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
]

const typeRecommend = [
  { id: 1, name: "Có thể bạn quen" },
  { id: 2, name: "Nhóm chung" },
]

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

  const [loading, setLoading] = useState(false);


  // useEffect(() => {

  //   const fetchFriendInvitation = async () => {
  //     try {
  //       setLoading(true);
  //       await dispatch(getFriendsRequest());
  //     } catch (error) {
  //       console.log(error);
  //     }
  //     setLoading(false);

  //   };


  //   fetchFriendInvitation();
  // }, [changeInvitation]);

  const handleAcceptFriend = async (item) => {
    try {
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];
      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };

      const res = await dispatch(acceptFriendRequest(friendUpdate)).unwrap();
      if (res.data.status === 1) {
        // Cập nhật danh sách lời mời
        const updatedFriendsRequest = friendsRequest.filter(
          (value) => !(item.friendId === value.friendId && item.userId === value.userId)
        );
        dispatch(setFriendsRequest(updatedFriendsRequest));

        // Cập nhật danh sách bạn bè (đảm bảo không bị ghi đè)
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


        // Gửi thông báo đến các socketId của userLogin và yêu cầu cập nhật danh sách bạn bè, danh sách lời mời
        socket.emit('accept-friend-request-for-me', {
          userId: userLogin.id,
          friendId: friendId,
          updatedFriendsRequest: updatedFriendsRequest, // để cập nhật danh sách lời mời
          friendInfo: { // để cập nhật danh sách bạn bè
            id: item.senderId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
          }

        });

        console.log("friendUpdate", friendUpdate);
        

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
    }
  };

  const handleRejectFriend = async (item) => {
    try {
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];
      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };

      const res = await dispatch(rejectFriendRequest(friendUpdate)).unwrap();
      if (res.data) {
        // Cập nhật danh sách lời mời
        const updatedFriendsRequest = friendsRequest.filter(
          (value) => !(item.friendId === value.friendId && item.userId === value.userId)
        );
        dispatch(setFriendsRequest(updatedFriendsRequest));
        setChangeInvitation(prev => !prev);
        socket.emit('reject-friend-request-for-me', {
          userId: userLogin.id,
          friendId: friendId,
          updatedFriendsRequest: updatedFriendsRequest, // để cập nhật danh sách lời mời
        });
      }

    } catch (error) {
      showToast(error.message, "error");
    }
  };





  const [isRejected, setIsRejected] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      {/* header */}
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_invitation_friend.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Lời mời kết bạn</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Loi moi ket ban */}
        <div className="mb-5">
          {
            friendsRequest && (
              <h2 className="text-lg font-semibold mb-4" onClick={() => setShowListInvitation(!showListInvitation)}>
                Lời mời đã nhận ({friendsRequest.length}) <span>{showListInvitation ? "▼" : "▶"}</span>
              </h2>
            )
          }
          {
            showListInvitation && (
              <>
                {(friendsRequest.length === 0 && !loading) ? (
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
                            <span className="text-xs font-[13px] text-gray-500">{new Date(item.requestDate).toLocaleDateString()} {/*- <span>{item.type.name}</span>*/} </span>
                          </div>
                        </div>
                        <div className="mb-3 w-[98%] h-[70px] bg-[#EBECF0] rounded-[5px] p-2 border border-gray-300 overflow-y-auto">
                          <p className="text-gray-700">{item.contentRequest}</p>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={async () => {
                              setIsRejected(true);
                              await handleRejectFriend(item)
                              setIsRejected(false);
                            }}
                            className="px-4 py-1 rounded-[5px] hover:bg-gray-300 w-[47%] h-[38px] bg-[#EBECF0] font-bold">
                            {
                              isRejected ? (
                                <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
                              ) : (
                                "Từ chối"
                              )
                            }
                          </button>
                          <button
                            onClick={async () => {
                              setIsAccepted(true);
                              await handleAcceptFriend(item)
                              setIsAccepted(false);
                            }}
                            className="px-4 py-1 rounded-[5px] hover:bg-[#005AE0] hover:text-white w-[47%] h-[38px] bg-blue-100 font-bold text-blue-600">
                            {
                              isAccepted ? (
                                <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
                              ) : (
                                "Đồng ý"
                              )
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )


          }

          {loading && (
            <div className="flex justify-center items-center">
              <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
            </div>
          )
          }
        </div>


        {/* Goi y ket ban */}
        <div className="mb-5">
          {
            recommendList.length > 0 && (
              <h2 className="text-lg font-semibold mb-4" onClick={() => setShowListRecommend(!showListRecommend)}>
                Gợi ý kết bạn ({recommendList.length}) <span>{showListRecommend ? "▼" : "▶"}</span>
              </h2>
            )
          }
          {
            showListRecommend && (
              <>
                {recommendList && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendList.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center mb-3">
                          <img
                            src={item.user.avatar}
                            alt={item.user.fullName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-semibold">{item.user.fullName}</p>
                            <span className="text-xs font-[13px] text-gray-500">
                              {item.type.id === 1 ? (
                                <span>{item.type.name}</span>
                              ) : (
                                <span>{item.countGroup} {item.type.name}</span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button className="px-4 py-1 rounded-[5px] hover:bg-gray-300 w-[47%] h-[38px] bg-[#EBECF0] font-bold">
                            Bỏ qua
                          </button>
                          <button className="px-4 py-1 rounded-[5px] hover:bg-gray-300 w-[47%] h-[38px] bg-[#EBECF0] font-bold">
                            Kết bạn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          }
        </div>

      </div>
    </div>
  );
}