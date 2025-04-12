import { React, useState, useEffect, useRef, use } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { friendInvitations, friendRecommendations } from '../data/friendInvitationData';
import { useDispatch, useSelector } from 'react-redux';
import { acceptFriendRequest, getFriendsRequest, rejectFriendRequest } from '../redux/slices/FriendSlice';
import showToast from '../utils/AppUtils';
import socket from '../utils/socket';

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
  const [invitationList, setInvitationList] = useState([]);
  const [recommendList, setRecommendList] = useState(friendRecommendationsData);

  const [showListInvitation, setShowListInvitation] = useState(true);
  const [showListRecommend, setShowListRecommend] = useState(false);

  const [changeInvitation, setChangeInvitation] = useState(false);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleCancleFriendRequest = (data) => {
      if (data.senderId !== userLogin.id) {
        const newInvitation = invitationList.filter(item => item.userId !== data.senderId || item.friendId !== data.senderId);
        setInvitationList(newInvitation);
        setChangeInvitation(!changeInvitation);
      }
    };
    socket.on("receive-cancle-friend-request", handleCancleFriendRequest);
    return () => {
      socket.off("receive-cancle-friend-request", handleCancleFriendRequest);
    };
  }, []);

  useEffect(() => {

    const fetchFriendInvitation = async () => {
      try {
        setLoading(true);
        const resp = await dispatch(getFriendsRequest());
        setInvitationList(resp.payload.data);

      } catch (error) {
        console.log(error);
      }
      setLoading(false);

    };


    fetchFriendInvitation();
  }, [changeInvitation]);

  const handleRejectFriend = async (userId) => {
    try {
      const friendUpdate = { userId: userLogin.id, friendId: userId }
      const resp = await dispatch(rejectFriendRequest(friendUpdate));
      const data = resp.payload.data;
      if (data.status === 2) {
        setChangeInvitation(!changeInvitation);
        socket.emit('reject-friend-request', friendUpdate);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleAcceptFriend = async (userId) => {
    try {
      const friendUpdate = { userId: userLogin.id, friendId: userId }
      const resp = await dispatch(acceptFriendRequest(friendUpdate));
      const data = resp.payload.data;
      if (data.status === 1) {
        setChangeInvitation(!changeInvitation);
        showToast("Giờ đây các bạn đã trở thành bạn bè.", "success");
        socket.emit('accept-friend-request', friendUpdate);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const handleReceiveFriendRequest = async (data) => {
      if (data.senderId !== userLogin.id) {
        const newInvitation = {
          userId: data.userId,
          fullName: data.fullName,
          avatarLink: data.avatarLink,
          contentRequest: data.contentRequest,
          requestDate: data.requestDate
        };
        setInvitationList((prev) => [newInvitation, ...prev]);
      }
    };

    socket.on("receive-friend-request", handleReceiveFriendRequest);

    return () => {
      socket.off("receive-friend-request", handleReceiveFriendRequest);
    };
  }, []);


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
            invitationList && (
              <h2 className="text-lg font-semibold mb-4" onClick={() => setShowListInvitation(!showListInvitation)}>
                Lời mời đã nhận ({invitationList.length}) <span>{showListInvitation ? "▼" : "▶"}</span>
              </h2>
            )
          }
          {
            showListInvitation && (
              <>
                {(invitationList.length === 0 && !loading) ? (
                  <div className="flex justify-center items-center w-full h-full">
                    <span className="text-gray-500">Không có lời mời kết bạn nào</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {invitationList.map((item) => (
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
                            onClick={() => handleRejectFriend(item.userId)}
                            className="px-4 py-1 rounded-[5px] hover:bg-gray-300 w-[47%] h-[38px] bg-[#EBECF0] font-bold">
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleAcceptFriend(item.userId)}
                            className="px-4 py-1 rounded-[5px] hover:bg-[#005AE0] hover:text-white w-[47%] h-[38px] bg-blue-100 font-bold text-blue-600">
                            Đồng ý
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