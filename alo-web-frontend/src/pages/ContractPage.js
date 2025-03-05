import { useState } from "react";
import { Navigation } from "../components/Navigation";

const messages = [
    { id: 1, name: "Công túa lùi lùi", message: "aloooo", time: "38 phút", avatar: "https://via.placeholder.com/40" },
    { id: 2, name: "Bố", message: "Con ơi", time: "20 phút", avatar: "https://via.placeholder.com/40" },
    { id: 3, name: "CNM", message: "Hello", time: "Vài giây", avatar: "https://via.placeholder.com/40" }
];

export default function ContactPage() {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div className="flex h-screen">

            {/* Left Bar */}
            <div className="w-[25rem] bg-white border-r border-gray-300 flex flex-col">
                hi
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center flex-col text-gray-700">
            </div>
        </div>
    );
}
