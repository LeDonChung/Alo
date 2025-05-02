import { React, useState, useEffect, useRef, use } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux';
import { setConversation } from '../redux/slices/ConversationSlice';
import { useNavigate } from 'react-router-dom';
import InputSearchName from './friend/InputSearchName';
import SelectTypeFilter from './friend/SelectTypeFilter';
import SelectCategoryFilter from './friend/SelectCategoryFilter';
import MenuFriend from './friend/MenuFriend';
import showToast, { removeVietnameseTones } from '../utils/AppUtils';

const categoryList = [
  { id: 1, name: "Bạn thân", color: "#ff6347" },
  { id: 2, name: "Đồng nghiệp", color: "#1e90ff" },
  { id: 3, name: "Gia đình", color: "#32cd32" },
  { id: 4, name: "Quen biết", color: "#8a2be2" },
];

const typeFilter = [
  { id: 1, name: "Tên (A-Z)" },
  { id: 2, name: "Tên (Z-A)" },
]

const details = [
  { id: 1, name: "Xem thông tin" },
  { id: 2, name: "Phân loại" },
  { id: 3, name: "Đặt tên gợi nhớ" },
  { id: 4, name: "Chặn người này" },
  { id: 5, name: "Xóa kết bạn" },
]

export default function FriendsOfUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const listFr = useSelector(state => state.friend.friends);
  const friend = useSelector(state => state.friend.friend);
  const conversations = useSelector((state) => state.conversation.conversations);
  const userLogin = localStorage.getItem("userLogin") ? JSON.parse(localStorage.getItem("userLogin")) : null;
  const [listCategory, setListCategory] = useState(categoryList);
  const [listTypeFilter, setListTypeFilter] = useState(typeFilter);
  const [textSearch, setTextSearch] = useState("");
  const [selectFilter, setSelectFilter] = useState(typeFilter[0]);
  const [selectCategory, setSelectCategory] = useState({ id: 0, name: "Tất cả" });
  const [groupFriendList, setGroupFriendList] = useState([]);
  const [isShowInfoFriend, setIsShowInfoFriend] = useState(false);
  const [loading, setLoading] = useState(false);
  const friends = useSelector(state => state.friend.friends);

  //detail friend
  const [openDetail, setOpenDetail] = useState(false);
  const detailRef = useRef(null);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  // useEffect(() => {
  //   setLoading(true);
  //   const fetchFriends = async () => {
  //     try {
  //       const result = await dispatch(getFriends());
  //       if (result.payload.status === 200) {
  //         setLoading(false);
  //       }

  //     } catch (error) {
  //       console.log(error);
  //       setLoading(false);
  //     }
  //   };
  //   fetchFriends();
  // }, []);

  // Lọc danh sách bạn bè theo tên A-Z hoặc Z-A
  const groupAndSortFriends = (friends, sortOrder) => {
    if (friends.length >= 0) {
      // Sắp xếp
      const sortedList = [...friends].sort((a, b) => {
        const aName = a.friendInfo.fullName;
        const bName = b.friendInfo.fullName;
        const nameA = removeVietnameseTones(aName).toLowerCase();
        const nameB = removeVietnameseTones(bName).toLowerCase();

        if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      // Gom nhóm
      const groupedObject = sortedList.reduce((acc, friend) => {
        const frName = friend.friendInfo.fullName;
        const firstChar = removeVietnameseTones(frName).charAt(0).toUpperCase();

        if (!acc[firstChar]) acc[firstChar] = [];
        acc[firstChar].push(friend);
        return acc;
      }, {});
      // Đưa về dạng mảng
      const groupList = Object.entries(groupedObject).map(([char, list], index) => ({
        id: index + 1,
        char,
        list,
      }));
      return groupList;
    }

  };

  // Lọc danh sách bạn bè theo phân loại a-z hoặc z-a khi thay đổi selectFilter
  useEffect(() => {
    if (!loading && listFr?.length > 0) {
      setGroupFriendList(groupAndSortFriends(listFr, selectFilter.id === 1 ? 'asc' : 'desc'));
    }
  }, [selectFilter, selectCategory, listFr, loading]);


  // Đóng dropdown khi click ra ngoài component của category select và detail select
  useEffect(() => {
    let isMounted = true; // Cờ để kiểm tra mount trạng thái
    const handleClickOutside = (event) => {
      if (!isMounted) return; // Dừng nếu component đã unmount
      if (dropdownRef?.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (detailRef?.current && !detailRef.current.contains(event.target)) {
        setOpenDetail(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, openDetail]);



  // Lọc danh sách bạn bè theo tên bằng input search
  useEffect(() => {
    if (!loading && textSearch === "") {
      setGroupFriendList(groupAndSortFriends(listFr, selectFilter.id === 1 ? 'asc' : 'desc'));
    } else {
      if (!loading) {
        const groupDefault = groupAndSortFriends(listFr, selectFilter.id === 1 ? 'asc' : 'desc');
        const newGroup = groupDefault
          .map((group) => {
            const newList = group.list.filter((friend) => {
              const friendName = removeVietnameseTones(friend.friendInfo.fullName.toLowerCase());
              console.log("friendName", friendName);

              const searchText = removeVietnameseTones(textSearch.toLowerCase());
              return friendName.includes(searchText);
            });
            return newList.length > 0 ? { ...group, list: newList } : null;
          })
          .filter((group) => group !== null); // Loại bỏ các nhóm rỗng

        setGroupFriendList(newGroup);
      }
    }
  }, [textSearch, listFr, selectFilter]);

  const handleNavigateChat = async (e, friendInfo) => {
    e.preventDefault();
    try {
      const conversation = conversations.find((conversation) => {
        return conversation.memberUserIds.includes(userLogin.id) && conversation.memberUserIds.includes(friendInfo.id) && conversation.memberUserIds.length === 2;
      });
      await dispatch(setConversation(conversation));
      navigate('/me')
    } catch (error) {
      console.error("Error navigating to chat:", error);
      showToast("Đã xảy ra lỗi khi mở cuộc trò chuyện. Vui lòng thử lại.", "error");
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_friend_list.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Danh sách bạn bè</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-gray-600 font-semibold mt-5 mb-5 w-[98%] mx-auto" >Bạn bè ({listFr ? listFr.length : 0})</p>
        {
          listFr && (
            <div className="w-[98%] flex flex-1 flex-col mx-auto bg-white h-auto rounded-lg" >
              {/* Header - Tìm kiếm bạn bè */}
              {/* search, filter friend */}
              <div className="flex items-center p-3 h-[75px]">
                {/* input search */}
                <InputSearchName textSearch={textSearch} setTextSearch={setTextSearch} />

                {/* filter type */}
                <SelectTypeFilter selectFilter={selectFilter} setSelectFilter={setSelectFilter} listTypeFilter={listTypeFilter} />


                {/* filter category */}
                <SelectCategoryFilter
                  selectCategory={selectCategory}
                  setSelectCategory={setSelectCategory}
                  listCategory={listCategory}
                  dropdownRef={dropdownRef}
                  open={open} setOpen={setOpen} />
              </div>

              <div className="flex flex-col w-full mx-auto mb-5 px-2">
                {
                  !loading ? (

                    groupFriendList.length > 0 ? groupFriendList.map((group) => (
                      <div key={group.id} className="flex flex-col">
                        <div className="flex items-center p-2">
                          <span className="font-semibold text-gray-600">{group.char}</span>
                        </div>
                        <div className="flex flex-col">
                          {
                            group.list && group.list.map((friend) => (
                              <div key={friend.friendId}
                                className="flex items-center justify-between w-full hover:bg-gray-100 rounded-md p-2">
                                <div className="flex items-center cursor-pointer w-[98%]" onClick={(e) => handleNavigateChat(e, friend.friendInfo)}>
                                  <img src={friend.friendInfo.avatarLink ? friend.friendInfo.avatarLink : "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg"} className="w-[40px] h-[40px] rounded-full" />
                                  <div className="flex flex-col ml-2">
                                    <span className="font-semibold">{friend.friendInfo.fullName}</span>
                                    {
                                      friend.category && (
                                        <div className="flex items-center">
                                          <FontAwesomeIcon icon={faTag} style={{ color: friend.category.color }} size="15" />
                                          <span className="text-sm ml-1">
                                            {friend.category.name}
                                          </span>
                                        </div>
                                      )
                                    }
                                  </div>
                                </div>
                                {/* Right - Icon 3 chấm */}
                                <MenuFriend friend={friend}
                                  conversations={conversations}
                                  listCategory={listCategory}
                                  setSelectCategory={setSelectCategory}
                                  setOpen={setOpen}
                                  userLogin={userLogin}
                                />
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )) : (
                      <div className="flex justify-center items-center w-full h-full">
                        <span className="text-gray-500">Không có bạn bè nào</span>
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center items-center">
                      <div className="bg-blue animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-4 h-4"></div>
                    </div>
                  )
                }

              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}