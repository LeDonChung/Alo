import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
    const [menus, setMenus] = useState([
        { id: 1, icon: "./icon/ic_message.png", onPress: () => navigate("/me") },
        { id: 2, icon: "./icon/ic_round-perm-contact-calendar.png", onPress: () => navigate("/contact") },
        { id: 3, icon: "./icon/ic_outline-cloud.png" },
        { id: 4, icon: "./icon/weui_setting-outlined.png" }
    ]);
    const [selectedMenu, setSelectedMenu] = useState(menus[0]);
    const navigate = useNavigate();
    return (
        <div className="w-20 bg-blue-600 text-white flex flex-col items-center py-4 px-4">
            <div>
                <img src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/361366862_1607093663105601_7835049158388472986_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHz7ozXp0uEkg8_8aP3F_G0dGypT0NHxzF0bKlPQ0fHMU8Z-vVpgHrcTKUwML8riSvvHuPzsyKki6cPi7L4FKV2&_nc_ohc=atTS0e2_I_YQ7kNvgG-4UfP&_nc_oc=AdhQ45n-gUooR83lgzOQlfYVeFXvJchQQuVF3l7FoDVFUmUHdXTq6DfSAoAq_39ul60&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=A4JRAqgmDrJLaNf7T4acNZ1&oh=00_AYDFFpYBS60tBz6d8TXU_BglA-foT_3uT1CkJb3_XZGmIw&oe=67C700A3" className="rounded-full" />
            </div>
            <div className="flex flex-col mt-20">

                {
                    menus.map((menu) => {
                        return (
                            selectedMenu.id === menu.id ? (
                                <a onClick={() => setSelectedMenu(menu)} className="cursor-pointer p-2 bg-[#0043A8] hover:bg-[#5591eccb] rounded-lg mb-2">
                                    <img src={menu.icon} className="w-9 h-9 object-contain" />
                                </a>
                            ) : (
                                <a onClick={() => {setSelectedMenu(menu); menu.onPress(); }} className="cursor-pointer p-2 hover:bg-[#5591eccb] hover:rounded-lg mb-2">
                                    <img src={menu.icon} className="w-9 h-9 object-contain" />
                                </a>
                            )
                        )
                    })
                }
            </div>
            <div className="flex flex-col mt-auto">
                <a className="cursor-pointer p-2 hover:bg-[#5591eccb] hover:rounded-lg mb-2">
                    <img src="./icon/weui_setting-outlined.png" className="w-9 h-9 object-contain" />
                </a>
            </div>
        </div >
    )
}