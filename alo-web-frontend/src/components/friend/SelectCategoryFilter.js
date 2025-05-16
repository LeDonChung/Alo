import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";

const SelectCategoryFilter = ({setOpen, open, selectCategory, setSelectCategory, listCategory, dropdownRef}) => {

    return(
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
    )
}

export default SelectCategoryFilter;