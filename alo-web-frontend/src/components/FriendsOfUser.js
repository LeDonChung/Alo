import { React, useState, useEffect, useRef, use } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faChevronDown, faChevronRight, faTag, faCircleXmark, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux';
import { blockFriend, getFriends, unfriend } from '../redux/slices/FriendSlice';
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
  const listFr = useSelector(state => state.friend.friends);
  const friend = useSelector(state => state.friend.friend);
  const userLogin = localStorage.getItem("userLogin") ? JSON.parse(localStorage.getItem("userLogin")) : null;
  const [listCategory, setListCategory] = useState(categoryList);
  const [listTypeFilter, setListTypeFilter] = useState(typeFilter);
  const [textSearch, setTextSearch] = useState("");
  const [selectFilter, setSelectFilter] = useState(typeFilter[0]);
  const [selectCategory, setSelectCategory] = useState({ id: 0, name: "Tất cả" });
  const [groupFriendList, setGroupFriendList] = useState([]);
  const [detailFriend, setDetailFriend] = useState(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);

  const handleUnfriend = async (id) => {
    try {
      if (isOpenConfirm) {
        // Xóa bạn
        await dispatch(unfriend({ userId: userLogin.id, friendId: id }));
        setIsOpenConfirm(false);
        // Hiển thị thông báo thành công
        showToast("Xóa kết bạn thành công!", "success");
      }

    } catch (error) {
      console.error("Error unfriending:", error);
      // Hiển thị thông báo lỗi
      showToast("Đã xảy ra lỗi khi xóa kết bạn. Vui lòng thử lại.", "error");
    }
  };

  const handleBlockFriend = async (id) => {
    console.log("block friend", id);
    try {
      // Chặn bạn
      await dispatch(blockFriend({ userId: userLogin.id, friendId: id }));
      setOpenDetail(false);
      // Hiển thị thông báo thành công
      showToast("Chặn bạn thành công!", "success");
    } catch (error) {
      console.error("Error blocking friend:", error);
      // Hiển thị thông báo lỗi
      showToast("Đã xảy ra lỗi khi chặn bạn. Vui lòng thử lại.", "error");
    }
  }

  //detail friend
  const [openDetail, setOpenDetail] = useState(false);
  const detailRef = useRef(null);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const fetchFriends = async () => {
      try {
        await dispatch(getFriends());

      } catch (error) {
        console.log(error);
      }
    };
    fetchFriends();
  }, [dispatch, friend]);

  // Lọc danh sách bạn bè theo tên A-Z hoặc Z-A
  const groupAndSortFriends = (friends, sortOrder) => {
    // Sắp xếp
    const sortedList = [...friends].sort((a, b) => {
      const nameA = removeVietnameseTones(a.fullName);
      const nameB = removeVietnameseTones(b.fullName);
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    // Gom nhóm
    const groupedObject = sortedList.reduce((acc, friend) => {
      const firstChar = removeVietnameseTones(friend.fullName).charAt(0);
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
  };

  // Lọc danh sách bạn bè theo phân loại a-z hoặc z-a khi thay đổi selectFilter
  useEffect(() => {
    if (listFr?.length > 0) {
      setGroupFriendList(groupAndSortFriends(listFr, selectFilter.id === 1 ? 'asc' : 'desc'));
    }
  }, [selectFilter, selectCategory, listFr]);


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
    if (textSearch === "") {
      setGroupFriendList(groupAndSortFriends(listFr, selectFilter.id === 1 ? 'asc' : 'desc'));
    } else {
      const groupDefault = groupAndSortFriends(listFr, selectFilter.id === 1 ? 'asc' : 'desc');
      const newGroup = groupDefault
        .map((group) => {
          const newList = group.list.filter((friend) => {
            const friendName = removeVietnameseTones(friend.fullName.toLowerCase());
            const searchText = removeVietnameseTones(textSearch.toLowerCase());
            return friendName.includes(searchText);
          });
          return newList.length > 0 ? { ...group, list: newList } : null;
        })
        .filter((group) => group !== null); // Loại bỏ các nhóm rỗng

      setGroupFriendList(newGroup);
    }
  }, [textSearch, listFr, selectFilter]);

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_friend_list.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Danh sách bạn bè</span>
      </div>


      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-gray-600 font-semibold mt-5 mb-5 w-[98%] mx-auto" >Bạn bè ({listFr.length})</p>
        {
          listFr && (
            <div className="w-[98%] flex flex-1 flex-col mx-auto bg-white h-auto rounded-lg" >
              {/* search, filter friend */}
              <div className="flex items-center p-3 h-[75px]">

                {/* input search */}
                <div className="flex items-center p-2 bg-white rounded-[5px] h-[35px] w-3/5 hover:bg-gray-100 border border-gray-200">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" size="35" />
                  <input type="text" placeholder="Tìm bạn"
                    className="pl-2 bg-[#EBECF0] h-[30px] focus:outline-none focus:border-none focus:ring-0 w-[95%] hover:bg-gray-100 bg-white"
                    value={textSearch} onChange={(e) => setTextSearch(e.target.value)} />
                  {textSearch && (
                    <FontAwesomeIcon icon={faCircleXmark} className="text-gray-500" size="15" onClick={() => setTextSearch("")} />
                  )}

                </div>


                {/* filter type */}
                <select
                  className="pl-2 pr-2 bg-white rounded-[5px] h-[35px] w-1/5 hover:bg-gray-100 border border-gray-200 ml-2"
                  value={selectFilter?.id}
                  onChange={(e) => {
                    const selectedItem = listTypeFilter.find((item) => item.id === parseInt(e.target.value));

                    setSelectFilter(selectedItem); // Cập nhật state
                  }}
                >
                  {listTypeFilter.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>


                {/* filter category */}
                <div ref={dropdownRef} className="relative inline-block text-left w-1/5 min-w-[150px] ml-2">
                  {/* Button hiển thị nội dung chọn */}
                  <button
                    onClick={() => setOpen(!open)}
                    className="pl-2 pr-2 bg-white rounded-[5px] h-[35px] w-full hover:bg-gray-100 border border-gray-200 flex justify-between items-center"
                  >

                    <span>{selectCategory.name}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" size="15" />
                  </button>

                  {/* Dropdown content */}
                  {open && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                      {/* Option: Tất cả */}
                      <div
                        onClick={() => {
                          setSelectCategory({ id: 0, name: "Tất cả" });
                          setOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectCategory.id === 0 ? "font-semibold" : ""
                          }`}
                      >
                        Tất cả
                      </div>

                      {/* Phân loại có submenu */}
                      <div className="relative group">
                        <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100">
                          <span>Phân loại</span>
                          <FontAwesomeIcon icon={faChevronRight} className="text-gray-500" size="15" />
                        </div>

                        {/* Submenu: Danh sách phân loại */}
                        <div className="absolute left-[-180px] top-0 ml-1 w-[180px] bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                          {listCategory.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setSelectCategory(cat);
                                setOpen(false);
                              }}
                              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: cat.color }}
                              ></span>
                              <span>{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quản lý thẻ phân loại */}
                      <div
                        onClick={() => {
                          alert("Quản lý thẻ phân loại");
                          setOpen(false);
                        }}
                        className="px-4 py-2 text-blue-500 cursor-pointer hover:bg-gray-100"
                      >
                        Quản lý thẻ phân loại
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col w-full mx-auto mb-5 px-2">
                {
                  groupFriendList && groupFriendList.map((group) => (
                    <div key={group.id} className="flex flex-col">
                      <div className="flex items-center p-2">
                        <span className="font-semibold text-gray-600">{group.char}</span>
                      </div>
                      <div className="flex flex-col">
                        {
                          group.list && group.list.map((friend) => (
                            <div key={friend.id} className="flex items-center justify-between w-full hover:bg-gray-100 rounded-md p-2">
                              <div className="flex items-center">
                                <img src="https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" className="w-[40px] h-[40px] rounded-full" />
                                <div className="flex flex-col ml-2">
                                  <span className="font-semibold">{friend.fullName}</span>
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
                              <div className="relative">
                                <button
                                  className="cursor-pointer text-lg font-bold"
                                  onClick={() => {
                                    setDetailFriend(friend);
                                    setOpenDetail(!openDetail);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEllipsis} />
                                </button>
                                {openDetail && detailFriend.id === friend.id && (
                                  <div className="absolute left-[-200px] mt-1 w-[200px] bg-white rounded-lg shadow-lg">
                                    <button className="w-full flex items-center justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2">
                                      <span className="">Xem thông tin</span>
                                    </button>
                                    <div className="px-4 relative group py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2">
                                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        <span>Phân loại</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-500" size="15" />
                                      </div>

                                      {/* Submenu: Danh sách phân loại */}
                                      <div className="absolute left-[-200px] top-0 ml-1 w-[180px] bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                                        {listCategory.map((cat) => (
                                          <div
                                            key={cat.id}
                                            onClick={() => {
                                              setSelectCategory(cat);
                                              setOpen(false);
                                            }}
                                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                                          >
                                            <span
                                              className="inline-block w-3 h-3 rounded-full mr-2"
                                              style={{ backgroundColor: cat.color }}
                                            ></span>
                                            <span>{cat.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <button className="w-full flex items-center justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2">
                                      <span>Đặt tên gợi nhớ</span>
                                    </button>
                                    <>
                                      <button
                                        type="button"
                                        className="w-full flex items-center justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2"
                                        onClick={() => handleBlockFriend(friend.id)}
                                      >
                                        <span>Chặn người này</span>
                                      </button>
                                    </>
                                    <>
                                      <button
                                        type="button"
                                        className="w-full flex items-center text-red-700 justify-start px-4 py-2 cursor-pointer hover:bg-gray-100 hover:-mx-[2px] mx-2"
                                        onClick={() => {
                                          console.log("button xóa kết bạn");
                                          setIsOpenConfirm(true); // Mở modal xác nhận
                                        }}
                                      >
                                        <span>Xóa kết bạn</span>

                                      </button>

                                      {/* Modal confirm unfriend */}
                                      {isOpenConfirm && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                          <div className="bg-white rounded-lg p-4 shadow-lg w-[300px]">
                                            <p className="text-center text-gray-800">{`Bạn có chắc chắn muốn hủy kết bạn với ${friend.fullName}`}</p>
                                            <div className="flex justify-between mt-4">
                                              <button
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                                onClick={() => handleUnfriend(friend.id)}
                                              >
                                                Đồng ý
                                              </button>
                                              <button
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                                onClick={() => setIsOpenConfirm(false)}
                                              >
                                                Hủy
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  </div>


                                )}
                              </div>


                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))
                }

              </div>
            </div>
          )
        }


      </div>
    </div>
  );
}