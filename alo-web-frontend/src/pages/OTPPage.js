import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { generateOtp, verifyOtp } from '../redux/slices/UserSlice';
import showToast from '../utils/AppUtils';

export const OTPPage = () => {
    const userRegister = useSelector((state) => state.register.userRegister);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const dispatch = useDispatch();

    const handlerGenerateOtp = async () => {
        if (!userRegister.phoneNumber) {
            showToast('Vui lòng nhập số điện thoại.', 'error');
            return; 
        }

        const phoneNumber = userRegister.phoneNumber.startsWith('0') ? `+84${userRegister.phoneNumber.slice(1)}` : userRegister.phoneNumber;
        try {
            const response = await dispatch(generateOtp(phoneNumber)).unwrap();
            showToast(response.message, 'success');
            setTimer(60); 
            setCanResend(false);
        } catch (error) {
            console.error("Error generating OTP:", error);
            showToast(error.message || 'Có lỗi xảy ra khi gửi OTP', 'error');
        }
    };

    const handlerResendOtp = (e) => {
        e.preventDefault();
        if (canResend) { 
            handlerGenerateOtp();
        }
    };

    const handlerVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            showToast('Vui lòng nhập OTP.', 'error');
            return; 
        }

        const phoneNumber = userRegister.phoneNumber.startsWith('0') ? `+84${userRegister.phoneNumber.slice(1)}` : userRegister.phoneNumber;
        try {
            const response = await dispatch(verifyOtp({ phoneNumber, otp })).unwrap();
            showToast(response.message, 'success');
            navigate('/register-info');
        } catch (error) {
            console.error("Error verifying OTP:", error);
            showToast(error.message || 'Có lỗi xảy ra khi xác thực OTP', 'error');
        }
    }
    useEffect(() => {
        handlerGenerateOtp();
    }, []); 

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true); // Cho phép resend khi timer hết
        }
        return () => clearInterval(interval); // Cleanup interval
    }, [timer]); // Chỉ chạy khi timer thay đổi

    return (
        <div className="bg-blue-100 flex items-center justify-center min-h-screen">
            <div>
                <div>
                    <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Alo</h1>
                    <p className="text-center font-medium mb-6">Đăng ký tài khoản Alo để kết nối với ứng dụng Alo Web</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                    <div className="border-b border-gray-300 mb-6">
                        <h2 className="text-center font-medium pb-2">Nhập mã OTP</h2>
                    </div>
                    <div>
                        <div className="mb-4 relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="fas fa-mobile-alt"></i>
                            </span>
                            <input
                                value={userRegister.phoneNumber || ''} // Đảm bảo không bị undefined
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                                type="text"
                                id="phone"
                                placeholder="Số điện thoại"
                                disabled
                            />
                        </div>
                        <div className="mb-4 relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                                <img src="./icon/ic_otp.png" alt="ICON OTP" />
                            </span>
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                                type="number"
                                id="otp"
                                placeholder="Nhập OTP"
                            />
                        </div>

                        <button
                            onClick={handlerResendOtp}
                            className={`mt-5 w-full py-2 rounded-xl transition duration-200 ${canResend
                                ? 'text-blue-500 hover:text-blue-700'
                                : 'text-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!canResend}
                        >
                            {canResend ? 'Gửi lại OTP' : `Gửi lại OTP trong ${timer} giây`}
                        </button>

                        <button 
                            onClick={(e) => handlerVerifyOtp(e)}
                            type='button'
                        className="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200">
                            Tiếp tục
                        </button>
                    </div>
                    <div className="flex justify-between mt-4 text-sm text-gray-600">
                        <a href="/login" className="hover:underline">Đăng nhập</a>
                        <a href="#" className="hover:underline">Quên mật khẩu</a>
                    </div>
                </div>
            </div>
        </div>
    );
};