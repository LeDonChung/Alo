import { toast } from "react-toastify";

const showToast = (message, type = "info", options = {}) => {
    const defaultOptions = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        ...options,
    };

    switch (type) {
        case "success":
            toast.success(message, defaultOptions);
            break;
        case "error":
            toast.error(message, defaultOptions);
            break;
        case "warn":
            toast.warn(message, defaultOptions);
            break;
        case "info":
            toast.info(message, defaultOptions);
            break;
        default:
            toast(message, defaultOptions);
            break;
    }
};


export const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
}
export const calculateSalePrice = (price, discount) => {
    return price - (price * discount / 100);
}

export // Hàm loại bỏ dấu
const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD") // Tách tổ hợp ký tự Unicode
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export default showToast;