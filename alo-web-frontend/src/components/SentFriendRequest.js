import { React, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelFriendRequest, cancelFriendRequestSent, getFriendsRequestSent } from '../redux/slices/FriendSlice';
import socket from '../utils/socket';

export default function SentFriendRequest() {
  const dispatch = useDispatch();
  const userLogin = JSON.parse(localStorage.getItem("userLogin"));
  const friendsRequestSent = useSelector((state) => state.friend.friendsRequestSent);
  const [isShowRequestSent, setIsShowRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCancle, setIsCancle] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);

  useEffect(() => {
    // Fetch the list of sent friend requests when the component mounts
    const fetchSentFriendRequests = async () => {
      try {
        setLoading(true);
        await dispatch(getFriendsRequestSent());
      } catch (error) {
        console.log("Error fetching sent friend requests: ", error);
      } finally {
        setLoading(false);
        setIsShowRequestSent(true);
        console.log("friendsRequestSent: ", friendsRequestSent);        
      }
    };

    fetchSentFriendRequests();
  }, []);

  const handleCancleFriendRequest = async (friend) => {
    setIsCancle(true);
    setItemCancel(friend);
    try {
      const request = {
        userId: userLogin.id,
        friendId: friend.userId === userLogin.id ? friend.friendId : friend.userId,
      };

      const result = await dispatch(cancelFriendRequest(request));
            const friendResult = result.payload.data ? result.payload.data : null;
            if (friendResult && friendResult.status === -1) {
                socket.emit("cancel-friend-request", friendResult); // Gửi sự kiện hủy lời mời đến server
                await dispatch(cancelFriendRequestSent({userId: friendResult.userId, friendId: friendResult.friendId})); // Cập nhật lại danh sách bạn bè đã gửi lời mời
            }
            else {
                console.error("Lỗi khi hủy lời mời kết bạn:", result.payload?.message);
            }
    } catch (error) {
      console.error("Error canceling friend request: ", error);
    } finally {
      setIsCancle(false);
    }
  }


  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      {/* header */}
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_invitation_community.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Lời mời kết bạn đã gửi</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-5">
          {
            friendsRequestSent && (
              <h2 className="text-lg font-semibold mb-4" onClick={() => setIsShowRequestSent(!isShowRequestSent)}>
                Lời mời đã gửi ({friendsRequestSent.length}) <span>{isShowRequestSent ? "▼" : "▶"}</span>
              </h2>
            )
          }

          {
            isShowRequestSent && (
              <>
                {(friendsRequestSent.length === 0 && !loading) ? (
                  <div className="flex justify-center items-center w-full h-full">
                    <span className="text-gray-500">Không có lời mời kết bạn nào</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {friendsRequestSent.map((item) => (
                      <div key={item.userId === userLogin.id ? item.friendId : item.userId} className="bg-white rounded-lg shadow p-4">
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
                              await handleCancleFriendRequest(item);
                            }}
                            className="px-4 py-1 rounded-[5px] hover:bg-red-600 hover:text-white w-[98%] h-[38px] bg-gray-300 font-bold text-gray-700">
                            {
                              isCancle && itemCancel.friendId === item.friendId ? (
                                <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                              ) : (
                                "Hủy lời mời"
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

        </div>

        {loading && (
          <div className="flex justify-center items-center">
            <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
          </div>
        )
        }
      </div>

    </div>
  );
}