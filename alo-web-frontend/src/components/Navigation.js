import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
    const [menus, setMenus] = useState([
        { id: 1, icon: "./icon/ic_message.png", onPress: () => navigate("/me") },
        { id: 2, icon: "./icon/ic_round-perm-contact-calendar.png", onPress: () => navigate("/contact") },
        { id: 3, icon: "./icon/ic_outline-cloud.png" },
        { id: 4, icon: "./icon/weui_setting-outlined.png" }
    ]);
    const [selectedMenu, setSelectedMenu] = useState(menus[0]);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const navigate = useNavigate();
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            {/* Sidebar Navigation */}
            <div className="w-20 bg-blue-600 text-white flex flex-col items-center py-4 px-4 relative">
                <div className="cursor-pointer">
                    <img src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/361366862_1607093663105601_7835049158388472986_n.jpg"
                        className="rounded-full" />
                </div>
                <div className="flex flex-col mt-20">
                    {menus.map((menu) => (
                        <a
                            key={menu.id}
                            onClick={() => { setSelectedMenu(menu); menu.onPress?.(); }}
                            className={`cursor-pointer p-2 ${selectedMenu.id === menu.id ? 'bg-[#0043A8] hover:bg-[#5591eccb]' : 'hover:bg-[#5591eccb]'} rounded-lg mb-2`}
                        >
                            <img src={menu.icon} className="w-9 h-9 object-contain" />
                        </a>
                    ))}
                </div>
                <div className="flex flex-col mt-auto relative" ref={settingsRef}>
                    <a
                        onClick={() => setShowSettings(!showSettings)}
                        className="cursor-pointer p-2 hover:bg-[#5591eccb] hover:rounded-lg mb-2"
                    >
                        <img src="./icon/weui_setting-outlined.png" className="w-9 h-9 object-contain" />
                    </a>

                    {showSettings && (
                        <div className="absolute left-full top-[-30px] bg-white text-black shadow-md rounded-lg w-[200px] p-2">
                            <div
                                className="flex flex-row items-center cursor-pointer hover:bg-gray-200 px-2"
                                onClick={() => { setShowProfileModal(true); setShowSettings(false); }}
                            >
                                <i className="fas fa-user"></i>
                                <p className="p-2"> Thông tin cá nhân </p>
                            </div>
                            <div className="flex flex-row items-center cursor-pointer hover:bg-gray-200 px-2">
                                <i className="fas fa-sign-out-alt"></i>
                                <p className="p-2 text-red-600"> Đăng xuất </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Hiển Thị Thông Tin Cá Nhân */}
            {showProfileModal &&
                <ProfileModal setShowProfileModal={setShowProfileModal} setShowUpdateModal={setShowUpdateModal} />
            }

            {/* Modal Cập Nhật Thông Tin Cá Nhân */}
            {showUpdateModal &&
                <UpdateProfileModal setShowProfileModal={setShowProfileModal} setShowUpdateModal={setShowUpdateModal} />
            }
        </>
    );
};

const ProfileModal = ({ setShowProfileModal, setShowUpdateModal }) => {
    return <>
        {/* Overlay Làm Mờ */}
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>

        {/* Modal */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                {/* Header */}
                <div className="relative">
                    <img src="https://scontent.fsgn5-11.fna.fbcdn.net/v/t39.30808-6/481277216_985909300308093_4742343866089400123_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeEoEkh615fyiqp1PKg40J1s5JwefEZk1mnknB58RmTWaf5C0FTkujUiPR_TZCQ94u4MmOVePPOhRNh85NFvhxTI&_nc_ohc=JoeWX6x0iLsQ7kNvgGLVmWh&_nc_oc=Adg03KVym67JwLnpwFtcCvK5dCxoWiNP7XJpFxBavK1C451hhYfwlI53QzsMAkJkGwk&_nc_zt=23&_nc_ht=scontent.fsgn5-11.fna&_nc_gid=A1yrXDnfJ8CYq6OH6V1Sjkb&oh=00_AYHdyAA_BmyxbAYK3KQ3w8z5e_emxL9rH6dQK_TE5AqTUQ&oe=67D34D70" className="w-full h-32 object-cover rounded-t-lg" />
                    <button className="absolute top-3 right-3 text-gray-700" onClick={() => setShowProfileModal(false)}>✖</button>
                </div>
                {/* Avatar & Info */}
                <div className="flex flex-col items-center -mt-10">
                    <div className="relative">
                        <img src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/361366862_1607093663105601_7835049158388472986_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHz7ozXp0uEkg8_8aP3F_G0dGypT0NHxzF0bKlPQ0fHMU8Z-vVpgHrcTKUwML8riSvvHuPzsyKki6cPi7L4FKV2&_nc_ohc=sj-rv_0SUekQ7kNvgHjVpBh&_nc_oc=Adgboh_OmgECvDCda593qS-qfoaB2hq_a8tsEWp7o4k1oTfjeLeFDGQR3Iv6-xj3ozw&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=A5UqF3B-2Bh8FUxhtakPWEv&oh=00_AYHD3BZT6e2iJbwg-O5UJ8TkAhqj3dhW6FzOTczGM72ySA&oe=67D34EA3" className="w-20 h-20 rounded-full border-4 border-white" />
                        <div className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full cursor-pointer items-center justify-center my-auto">
                            <span>📷</span>
                        </div>
                    </div>
                    <h2 className="text-lg font-semibold mt-2 py-2">Lê Đôn Chùng</h2>
                </div>
                {/* Thông tin cá nhân */}
                <div className="p-4 border-t-4">
                    <div className="text-gray-700 space-y-2">
                        <p><strong className="mr-6">Giới tính:</strong> Nam</p>
                        <p><strong className="mr-4">Ngày sinh:</strong> 01/08/2003</p>
                        <p><strong className="mr-2">Điện thoại:</strong> +84 867 713 557</p>
                        <p className="text-sm text-gray-500">Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này.</p>
                    </div>
                    <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => { setShowProfileModal(false); setShowUpdateModal(true); }}
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    </>
}

const UpdateProfileModal = ({ setShowProfileModal, setShowUpdateModal }) => {
    const [name, setName] = useState("Lê Đôn Chùng");
    const [selectedDay, setSelectedDay] = useState("01");
    const [selectedMonth, setSelectedMonth] = useState("08");
    const [selectedYear, setSelectedYear] = useState("2003");
    const [gender, setGender] = useState("Nam");

    // Tạo danh sách ngày dựa trên tháng & năm
    const [days, setDays] = useState([]);

    useEffect(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        setDays(Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0")));
    }, [selectedMonth, selectedYear]);

    // Danh sách tháng
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

    // Danh sách năm từ 1970 đến 2025
    const years = Array.from({ length: 56 }, (_, i) => (2025 - i).toString());

    return (
        <>
            <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            <div className="fixed inset-0 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-[400px] p-4">
                    <div className="flex items-center">
                        <button
                            className="text-gray-600 mr-2"
                            onClick={() => { setShowUpdateModal(false); setShowProfileModal(true); }}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h2 className="text-lg font-semibold text-center flex-1">Cập nhật thông tin</h2>
                    </div>
                    <div className="p-4">
                        {/* Nhập tên hiển thị */}
                        <label className="block mb-2">Tên hiển thị</label>
                        <input
                            type="text"
                            className="border w-full p-2 rounded"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />



                        {/* Chọn giới tính */}
                        <label className="block mt-4 mb-2">Giới tính</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Nam"
                                    checked={gender === "Nam"}
                                    onChange={() => setGender("Nam")}
                                    className="mr-2"
                                />
                                Nam
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Nữ"
                                    checked={gender === "Nữ"}
                                    onChange={() => setGender("Nữ")}
                                    className="mr-2"
                                />
                                Nữ
                            </label>
                        </div>
                        {/* Chọn ngày sinh */}
                        <label className="block mt-4 mb-2">Ngày sinh</label>
                        <div className="flex space-x-2">
                            <select className="border p-2 rounded" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                {days.map(day => <option key={day}>{day}</option>)}
                            </select>
                            <select className="border p-2 rounded" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                {months.map(month => <option key={month}>{month}</option>)}
                            </select>
                            <select className="border p-2 rounded" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                {years.map(year => <option key={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>



                    {/* Nút cập nhật */}
                    <div className="flex justify-between mt-4">
                        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowUpdateModal(false)}>
                            Hủy
                        </button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Cập nhật
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};