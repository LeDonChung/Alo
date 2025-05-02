
import React from 'react';
const SelectTypeFilter = ({ selectFilter, setSelectFilter, listTypeFilter }) => {

    return (
        <select
            className="pl-2 pr-2 bg-white rounded-[5px] h-[35px] w-1/5 hover:bg-gray-100 border border-gray-200 ml-2 focus:outline-gray-200 focus:border-none focus:ring-0"
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
    )
};

export default SelectTypeFilter;