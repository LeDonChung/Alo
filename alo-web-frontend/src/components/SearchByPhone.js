import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFriendByPhoneNumber } from "../redux/slices/FriendSlice";

export const SearchByPhone = (isOpenAdd) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const friend = useSelector(state => state.friend.friend);
    const dispatch = useDispatch();
    const userLogin = useSelector(state => state.user.userLogin);
    const [info, setInfo] = useState(null);
    const [isShowInfo, setIsShowInfo] = useState(false);

    useEffect(() => {
    }, [info, isOpenAdd]);

    const handleSearch = async () => {
        if (!phoneNumber) return;
        try {
            const result = await dispatch(getFriendByPhoneNumber(phoneNumber));
            const user = result.payload?.data?.phoneNumber ? result.payload.data : null;
            setInfo(user); // Đặt dữ liệu người dùng vào state
            setIsShowInfo(true); // Hiển thị thông tin nguoi dùng
        } catch (error) {
            console.error("Lỗi khi tìm kiếm bạn bè:", error);
        }
    };


    if (!isOpenAdd) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-4 shadow-lg w-[300px]">
                    <div className="flex items-center justify-between">
                        <p className="text-start text-[18px] font-medium text-gray-800">{isShowInfo ? "Thông tin người dùng" : "Thêm bạn"} </p>
                        <button onClick={() => isOpenAdd.onClose()} className="hover:text-white hover:bg-gray-500 w-6 h-6 flex items-center justify-center rounded-full">
                            X
                        </button>
                    </div>

                    {
                        !isShowInfo && (
                            <>
                                <input
                                    className="w-full border-b border-gray-300 focus:outline-none focus:border-gray-400 mt-4"
                                    placeholder="Nhập số điện thoại"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => isOpenAdd.onClose()}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                        onClick={() => handleSearch()}
                                    >
                                        Tìm kiếm
                                    </button>
                                </div>
                            </>
                        )
                    }
                    {
                        isShowInfo && (
                            <>
                                {
                                    info !== null && (
                                        <>
                                            <div className="flex items-center justify-center">
                                                <img src="./avt_default.jpg" alt="avatar" className="w-20 h-20 rounded-full" />

                                            </div>
                                            <p className="text-center text-gray-800 font-semibold mt-2">{info.fullName}</p>
                                            <p className="text-center text-gray-500 mt-1">{info.phoneNumber}</p>
                                        </>
                                    )
                                }
                                {
                                    info === null && (
                                        <p className="text-center text-gray-800 font-semibold mt-2">Không tìm thấy người dùng</p>
                                    )
                                }
                                <div className="flex justify-between mt-4">
                                    <button
                                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                        onClick={() => setIsShowInfo(false)}
                                    >
                                        Quay lại
                                    </button>
                                    {
                                        info !== null && (
                                            <button
                                                className={`px-4 py-2 ${info?.status === -1 ? 'bg-blue-500' : 'bg-red-700'} text-gray-800 rounded hover:${info?.status === -1 ? 'bg-blue-700' : 'bg-red-800'} text-white`}
                                                onClick={() => { }}
                                            >
                                                {info?.status === -1 ? "Gửi kết bạn" : info?.status === 0 ? "Hủy yêu cầu" : "Hủy kết bạn"}
                                            </button>
                                        )
                                    }
                                </div>
                            </>
                        )
                    }

                </div>
            </div>
        </>
    );
};