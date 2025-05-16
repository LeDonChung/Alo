import groupFriendData from '../data/groupFriendData';
import { React, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { faMagnifyingGlass, faChevronDown, faChevronRight, faTag } from "@fortawesome/free-solid-svg-icons";
import { removeVietnameseTones } from '../utils/AppUtils';
import SelectTypeFilter from './friend/SelectTypeFilter';
import SelectCategoryFilter from './friend/SelectCategoryFilter';


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

  const groupAndSortOldAndNew = (groupList) => {
    // Hàm so sánh theo ngày tạo hoặc thời gian của lastMessage (giả sử createDate dạng ISO string hoặc timestamp hợp lệ)
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
      const sortedList = [...groupList].sort((a, b) => {
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
      if (conversations && textSearch === "") {
        if (selectedTypeFilter.key === 'old' || selectedTypeFilter.key === 'new') {
          const groupList = groupAndSortOldAndNew(groups);
          setGroupCharList(groupList);
        } else {
          const groupList = groupAndSortByStartChar(groups);
          setGroupCharList(groupList);
        }
      } else {
        let groupsDefault = [];
        if (conversations) {
          if (selectedTypeFilter.key === 'old' || selectedTypeFilter.key === 'new') {
            groupsDefault = groupAndSortOldAndNew(groups);
            const newGroups = groupsDefault[0].list.filter((group) => {
              const groupName = removeVietnameseTones(group.name).toLowerCase();
              const searchText = removeVietnameseTones(textSearch).toLowerCase();
              return groupName.includes(searchText);
            });
            groupsDefault[0].list = newGroups;
            setGroupCharList(groupsDefault);
          } else {
            groupsDefault = groupAndSortByStartChar(groups);
            const newGroups = groupsDefault.map((group) => {
              const newList = group.list.filter((groupItem) => {
                const groupName = removeVietnameseTones(groupItem.name).toLowerCase();
                const searchText = removeVietnameseTones(textSearch).toLowerCase();
                return groupName.includes(searchText);
              });
              return newList.length > 0 ? { ...group, list: newList } : null;
            }).filter(group => group !== null);
            setGroupCharList(newGroups);
          }
        }
      }
    }
    fillter();

  }, [selectedTypeFilter, selectedCategory, groups, textSearch]);


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
                <SelectTypeFilter selectFilter={selectedTypeFilter} setSelectFilter={setSelectedTypeFilter} listTypeFilter={typeFilters} />


                {/* filter category */}
                <SelectCategoryFilter
                  selectCategory={selectedCategory}
                  setSelectCategory={setSelectedCategory}
                  listCategory={categories}
                  dropdownRef={dropdownRef}
                  open={openCategory} setOpen={setOpenCategory} />
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