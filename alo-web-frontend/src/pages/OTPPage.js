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
        const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
        if (!regexPhone.test(userRegister.phoneNumber.trim())) {
            showToast('Số điện thoại không hợp lệ.', 'error');
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

        const regexOtp = /\d{6}/;
        if (!regexOtp.test(otp.trim())) {
            showToast('OTP không hợp lệ.', 'error');
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
        <div className="bg-blue-100 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
            <div>
              <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">Alo</h1>
              <p className="text-center font-medium mb-6 text-sm md:text-base">
                Đăng ký tài khoản Alo để kết nối với ứng dụng Alo Web
              </p>
            </div>
      
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10">
              <div className="border-b border-gray-300 mb-6">
                <h2 className="text-center font-medium pb-2 text-base md:text-lg">Nhập mã OTP</h2>
              </div>
      
              <div>
                <div className="mb-4 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i className="fas fa-mobile-alt"></i>
                  </span>
                  <input
                    value={userRegister.phoneNumber || ''}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm md:text-base"
                    type="text"
                    id="phone"
                    placeholder="Số điện thoại"
                    disabled
                  />
                </div>
      
                <div className="mb-4 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <img src="./icon/ic_otp.png" alt="ICON OTP" className="w-5 h-5" />
                  </span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm md:text-base"
                    type="number"
                    id="otp"
                    placeholder="Nhập OTP"
                  />
                </div>
      
                <button
                  onClick={handlerResendOtp}
                  className={`mt-3 w-full py-2 rounded-xl text-sm md:text-base transition duration-200 ${
                    canResend
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!canResend}
                >
                  {canResend ? 'Gửi lại OTP' : `Gửi lại OTP trong ${timer} giây`}
                </button>
      
                <button
                  onClick={handlerVerifyOtp}
                  type="button"
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200 text-sm md:text-base"
                >
                  Tiếp tục
                </button>
              </div>
      
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <a href="/login" className="hover:underline">
                  Đăng nhập
                </a>
                <a href="#" className="hover:underline">
                  Quên mật khẩu
                </a>
              </div>
            </div>
          </div>
        </div>
      );
      
};