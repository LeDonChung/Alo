import { React, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faChevronDown, faChevronRight, faTag } from "@fortawesome/free-solid-svg-icons";
import friendData from '../data/friendData';

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


export default function FriendsOfUser() {
  const friendList = friendData;
  const [listFriend, setListFriend] = useState(friendList);
  const [listCategory, setListCategory] = useState(categoryList);
  const [listTypeFilter, setListTypeFilter] = useState(typeFilter);
  const [textSearch, setTextSearch] = useState("");
  const [selectFilter, setSelectFilter] = useState(typeFilter[0]);
  const [selectCategory, setSelectCategory] = useState({ id: 0, name: "Tất cả" });
  const [open, setOpen] = useState(false);
  const [groupFriendList, setGroupFriendList] = useState([]);

  const dropdownRef = useRef(null);

  // Lọc danh sách bạn bè theo tên A-Z hoặc Z-A
  const groupAndSortFriends = (friends, sortOrder) => {
    // Hàm chuẩn hóa ký tự
    const normalizeName = (name) => {
      return name
        .normalize('NFD') // Tách dấu
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/Đ/g, 'D') // Chuyển Đ thành D
        .replace(/đ/g, 'd') // Chuyển đ thành d
        .toUpperCase(); // Viết hoa để so sánh
    };

    // Sắp xếp
    const sortedList = [...friends].sort((a, b) => {
      const nameA = normalizeName(a.name);
      const nameB = normalizeName(b.name);
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Gom nhóm
    const groupedObject = sortedList.reduce((acc, friend) => {
      const firstChar = normalizeName(friend.name).charAt(0);
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

    console.log("Group friend list: ", groupList);
    return groupList;
  };



  useEffect(() => {
    setGroupFriendList(groupAndSortFriends(listFriend, selectFilter.id === 1 ? 'asc' : 'desc'));
  }, [selectFilter, selectCategory]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false); // Tự đóng khi click bên ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_friend_list.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Danh sách bạn bè</span>
      </div>


      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-gray-600 font-semibold mt-5 mb-5 w-[98%] mx-auto" >Bạn bè ({listFriend.length})</p>
        {
          listFriend && (
            <div className="w-[98%] flex flex-1 flex-col mx-auto bg-white h-auto rounded-lg" >
              {/* search, filter friend */}
              <div className="flex items-center p-3 h-[75px]">

                {/* input search */}
                <div className="flex items-center p-2 bg-white rounded-[5px] h-[35px] w-3/5 hover:bg-gray-100 border border-gray-200">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" size="35" />
                  <input type="text" placeholder="Tìm bạn"
                    className="pl-2 bg-[#EBECF0] h-[30px] focus:outline-none focus:border-none focus:ring-0 w-[95%] hover:bg-gray-100 bg-white"
                    value={textSearch} onChange={(e) => setTextSearch(e.target.value)} />
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

                      {/* Divider */}
                      <div className="border-t my-1"></div>

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

              <div className="flex flex-col w-[98%] mx-auto mb-5">
                {
                  groupFriendList && groupFriendList.map((group) => (
                    <div key={group.id} className="flex flex-col">
                      <div className="flex items-center p-2">
                        <span className="font-semibold text-gray-600">{group.char}</span>
                      </div>
                      <div className="flex flex-col">
                        {
                          group.list && group.list.map((friend) => (
                            <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                              <div className="flex items-center">
                                <img src={friend.avatar} className="w-[40px] h-[40px] rounded-full" />
                                <div className="flex flex-col ml-2">
                                  <span className="font-semibold">{friend.name}</span>
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
                              <span className="cursor-pointer text-lg font-bold">⋮</span>
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