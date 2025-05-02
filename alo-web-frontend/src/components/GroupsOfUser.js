import groupFriendData from '../data/groupFriendData';
import { React, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { faMagnifyingGlass, faChevronDown, faChevronRight, faTag } from "@fortawesome/free-solid-svg-icons";
import { removeVietnameseTones } from '../utils/AppUtils';


const categoryList = [
  { id: 1, name: "Bạn thân", color: "#ff6347" },
  { id: 2, name: "Đồng nghiệp", color: "#1e90ff" },
  { id: 3, name: "Gia đình", color: "#32cd32" },
  { id: 4, name: "Quen biết", color: "#8a2be2" },
];

const typeFilter = [
  { id: 1, name: "Tên (A-Z)", key: "asc" },
  { id: 2, name: "Tên (Z-A)", key: "desc" },
  { id: 3, name: "Hoạt động (cũ → mới)", key: "old" },
  { id: 4, name: "Hoạt động (mới → cũ)", key: "new" },
]




export default function GroupsOfUser() {
  const dispatch = useDispatch();
  const conversations = useSelector(state => state.conversation.conversations);
  const [categories, setCategories] = useState(categoryList);
  const [typeFilters, setTypeFilters] = useState(typeFilter);

  const [groups, setGroups] = useState([]); // Danh sách nhóm đã được lọc từ conversations
  const [groupCharList, setGroupCharList] = useState([]); // Danh sách nhóm đã được phân loại và sắp xếp


  const [openCategory, setOpenCategory] = useState(false);
  const [openTypeFilter, setOpenTypeFilter] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState({ id: 0, name: "Tất cả" });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState(typeFilters[3]);
  const [textSearch, setTextSearch] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const filterGroups = conversations.filter((group) => {
      return group.isGroup === true;
    });
    setGroups(filterGroups);
  }, [conversations]);

  // Lọc danh sách nhóm theo tên A-Z hoặc Z-A
  // Lọc danh sách nhóm theo theo thời gian tạo

  const groupAndSortOldAndNew = (groupList) => {
    // Hàm so sánh theo ngày tạo (giả sử createDate dạng ISO string hoặc timestamp hợp lệ)
    const compareByDate = (a, b) => {
      const dateA = new Date(a.lastMessage ? a.lastMessage.timestamp : a.createdAt);
      const dateB = new Date(b.lastMessage ? b.lastMessage.timestamp : b.createdAt);
      return dateA - dateB;
    };
    let sortedList = [...groupList];
    const sortOrder = selectedTypeFilter.key;
    if (sortOrder === 'old') {
      sortedList.sort((a, b) => compareByDate(a, b)); // Cũ nhất -> Mới nhất
    } else if (sortOrder === 'new') {
      sortedList.sort((a, b) => compareByDate(b, a)); // Mới nhất -> Cũ nhất
    }

    let groupedList = [];
    groupedList = [{
      id: 1,
      char: null, // Không có ký tự nhóm
      list: sortedList,
    }];

    return groupedList;
  }

  const groupAndSortByStartChar = (groupList) => {
    if (groupList && groupList.length > 0) {
      const sortedList = [...groupList].sort((a, b) => { // Changed from [...friends] to [...groupListSorted]
        const aName = a.name;
        const bName = b.name;
        const nameA = removeVietnameseTones(aName).toLowerCase();
        const nameB = removeVietnameseTones(bName).toLowerCase();

        if (nameA < nameB) return selectedTypeFilter.key === 'asc' ? -1 : 1;
        if (nameA > nameB) return selectedTypeFilter.key === 'asc' ? 1 : -1;
        return 0;
      });

      const groupedObject = sortedList.reduce((acc, gr) => {
        const frName = gr.name;
        const firstChar = removeVietnameseTones(frName).charAt(0).toUpperCase();

        if (!acc[firstChar]) acc[firstChar] = [];
        acc[firstChar].push(gr);
        return acc;
      }, {});

      // Đưa về dạng mảng
      const resultList = Object.entries(groupedObject).map(([char, list], index) => ({
        id: index + 1,
        char,
        list,
      }));
      return resultList;
    }
  }


  useEffect(() => {
    const fillter = () => {
      if (selectedTypeFilter.key === 'old' || selectedTypeFilter.key === 'new') {
        const groupList = groupAndSortOldAndNew(groups);
        setGroupCharList(groupList);
      } else {
        const groupList = groupAndSortByStartChar(groups);
        setGroupCharList(groupList);
      }
    }

    fillter();

  }, [selectedTypeFilter, selectedCategory, textSearch, groups]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenCategory(false); // Tự đóng khi click bên ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#EBECF0]">
      {/* header */}
      <div className="flex items-center p-3 h-[75px] bg-white">
        <img src="./icon/ic_community_list.png" className="w-[30px] h-[30px] ml-4" />
        <span className="ml-4 font-semibold text-[18px]">Danh sách nhóm và cộng đồng</span>
      </div>

      {/* main */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-gray-600 font-semibold mt-5 mb-5 w-[98%] mx-auto" >Nhóm và cộng đồng ({groups.length})</p>

        {
          groups && (
            <div className="w-[98%] flex flex-1 flex-col mx-auto bg-white h-auto rounded-lg">
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
                  className="pl-2 pr-2 bg-white rounded-[5px] h-[35px] w-1/5 hover:bg-gray-100 border border-gray-200 ml-2 focus:outline-gray-200 focus:border-none focus:ring-0"
                  value={selectedTypeFilter?.id}
                  onChange={(e) => {
                    const selectedItem = typeFilters.find((item) => item.id === parseInt(e.target.value));
                    setSelectedTypeFilter(selectedItem); // Cập nhật state
                  }}
                >
                  {typeFilters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>


                {/* filter category */}
                <div ref={dropdownRef} className="relative inline-block text-left w-1/5 min-w-[150px] ml-2">
                  {/* Button hiển thị nội dung chọn */}
                  <button
                    onClick={() => setOpenCategory(!openCategory)}
                    className="pl-2 pr-2 bg-white rounded-[5px] h-[35px] w-full hover:bg-gray-100 border border-gray-200 flex justify-between items-center"
                  >

                    <span>{selectedCategory.name}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" size="15" />
                  </button>

                  {/* Dropdown content */}
                  {openCategory && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                      {/* Option: Tất cả */}
                      <div
                        onClick={() => {
                          setSelectedCategory({ id: 0, name: "Tất cả" });
                          setOpenCategory(false);
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedCategory.id === 0 ? "font-semibold" : ""
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
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setOpenCategory(false);
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
                          setOpenCategory(false);
                        }}
                        className="px-4 py-2 text-blue-500 cursor-pointer hover:bg-gray-100"
                      >
                        Quản lý thẻ phân loại
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* List group */}
              <div className="flex flex-col w-[98%] mx-auto mb-5">
                {
                  groupCharList && groupCharList.map((groupChar) => (
                    <div key={groupChar.id} className="flex flex-col w-full">
                      {
                        groupChar.char && (
                          <div className="flex items-center p-2">
                            <span className="font-semibold text-gray-600">{groupChar.char}</span> {/* Tên ký tự nhóm, nếu có */}
                          </div>
                        )
                      }

                      {/* Danh sách group */}
                      <div className="flex flex-col">
                        {
                          groupChar.list && groupChar.list.map((group) => (
                            <div key={group.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                              {/* Left - Avatar + Thông tin */}
                              <div className="flex items-center">
                                {/* Avatar */}
                                <img src={group.avatar} alt={group.name} className="w-[40px] h-[40px] rounded-full object-cover" />

                                {/* Tên nhóm + Số lượng thành viên + Category */}
                                <div className="flex flex-col ml-2">
                                  {/* Tên nhóm */}
                                  <span className="font-semibold">{group.name}</span>

                                  {/* Số lượng thành viên + Category nếu có */}
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{group.memberUserIds.length} thành viên</span>
                                    {group.category && (
                                      <div className="flex items-center">
                                        <FontAwesomeIcon icon={faTag} style={{ color: group.category.color }} size="15" />
                                        <span className="text-sm ml-1">
                                          {group.category.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
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