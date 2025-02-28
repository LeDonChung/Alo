import { Outlet } from "react-router-dom";
import { Navigation } from "../components/Navigation";

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Navigation />
            <div className="flex-1"><Outlet /></div>
        </div>
    );
};

export default MainLayout;
