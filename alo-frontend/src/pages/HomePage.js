import { useState } from "react";
import { Navigation } from "../components/Navigation";

const messages = [
    { id: 1, name: "Công túa lùi lùi", message: "aloooo", time: "38 phút", avatar: "https://via.placeholder.com/40" },
    { id: 2, name: "Bố", message: "Con ơi", time: "20 phút", avatar: "https://via.placeholder.com/40" },
    { id: 3, name: "CNM", message: "Hello", time: "Vài giây", avatar: "https://via.placeholder.com/40" }
];

export default function HomePage() {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div className="flex h-screen">

            {/* Left Bar */} 
            <div className="w-[25rem] bg-white border-r border-gray-300 flex flex-col">
                
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center flex-col text-gray-700">
                <h1 className="text-2xl font-bold">Chào mừng đến với Alo</h1>
                <p className="text-center px-4 mt-2">Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè...</p>
                <i class="fas fa-mobile-alt "></i>
                <p className="text-blue-600 font-semibold cursor-pointer">Trải nghiệm xuyên suốt</p>
                <p className="text-sm opacity-70 px-6 text-center">Kết nối và giải quyết công việc trên mọi thiết bị với dữ liệu luôn được đồng bộ</p>
            </div>
        </div>
    );
}
