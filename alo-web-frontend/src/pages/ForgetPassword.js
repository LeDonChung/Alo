import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { generateOtp, verifyOtp, forgetPassword } from '../redux/slices/UserSlice';
import showToast from '../utils/AppUtils';

export const ForgetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [errorPhone, setErrorPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
    const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;

    const handleGenerateOtp = async () => {
        if (!phoneNumber || !regexPhone.test(phoneNumber.trim())) {
            setErrorPhone('Số điện thoại không hợp lệ');
            return;
        }

        const formattedPhone = phoneNumber.startsWith('0')
            ? `+84${phoneNumber.slice(1)}`
            : phoneNumber;

        try {
            const response = await dispatch(generateOtp(formattedPhone)).unwrap();
            showToast(response.message, 'success');
            setTimer(60);
            setCanResend(false);
            setIsOtpSent(true);
        } catch (error) {
            showToast(error.message || 'Có lỗi khi gửi OTP', 'error');
        }
    };

    const handleResendOtp = (e) => {
        e.preventDefault();
        if (canResend) {
            handleGenerateOtp();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!phoneNumber || !regexPhone.test(phoneNumber.trim())) {
            setErrorPhone('Số điện thoại không hợp lệ');
            return;
        }
        if (!otp) {
            setErrorMessage('Vui lòng nhập mã OTP');
            return;
        }

        const formattedPhone = phoneNumber.startsWith('0') ? `+84${phoneNumber.slice(1)}` : phoneNumber;

        setLoading(true);
        try {
            await dispatch(verifyOtp({ phoneNumber: formattedPhone, otp })).unwrap();
            showToast('Xác thực OTP thành công!', 'success');
            setIsOtpVerified(true);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
            console.error("Error verifying OTP:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleForgetPassword = async (e) => {
        e.preventDefault();

        if (!phoneNumber || !regexPhone.test(phoneNumber.trim())) {
            setErrorPhone('Số điện thoại không hợp lệ');
            return;
        }
        if (!password || !regexPassword.test(password.trim())) {
            setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái in hoa, số và ký tự đặc biệt');
            return;
        }
        if (!isOtpVerified) {
            setErrorMessage('Vui lòng xác thực OTP trước.');
            return;
        }

        setLoading(true);
        try {
            const response = await dispatch(forgetPassword({
                phoneNumber,
                passwordNew: password
            })).unwrap();

            showToast(response.message, 'success');
            navigate('/login');
        } catch (error) {
            setErrorMessage(error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            console.error("Error resetting password:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (timer > 0 && isOtpSent) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, isOtpSent]);

    return (
        <div className="bg-blue-100 flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-center text-2xl font-bold text-blue-600 mb-6">Quên mật khẩu</h2>

                <div className="mb-4 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <i className="fas fa-mobile-alt"></i>
                    </span>
                    <input
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value.trim());
                            setErrorPhone('');
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                        type="text"
                        placeholder="Số điện thoại"
                    />
                </div>
                {errorPhone && <p className="text-red-500 text-sm mb-4">{errorPhone}</p>}

                <div className="mb-4 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <img src="./icon/ic_otp.png" alt="OTP" />
                    </span>
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.trim())}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                        type="text"
                        placeholder="Mã OTP"
                    />
                </div>

                {isOtpVerified && (
                    <div className="mb-4 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i className="fas fa-lock"></i>
                        </span>
                        <input
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrorMessage('');
                            }}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                            type="password"
                            placeholder="Mật khẩu mới"
                        />
                    </div>
                )}
                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

                {!isOtpSent ? (
                    <button
                        onClick={handleGenerateOtp}
                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Gửi OTP'}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleResendOtp}
                            className={`mt-4 w-full py-2 rounded-xl transition duration-200 ${canResend ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!canResend || loading}
                        >
                            {canResend ? 'Gửi lại OTP' : `Gửi lại OTP trong ${timer}s`}
                        </button>
                        {!isOtpVerified ? (
                            <button
                                onClick={handleVerifyOtp}
                                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác thực OTP'}
                            </button>
                        ) : (
                            <button
                                onClick={handleForgetPassword}
                                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                            </button>
                        )}
                    </>
                )}

                <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <a href="/login" className="hover:underline">Đăng nhập</a>
                    <a href="/register" className="hover:underline">Đăng ký</a>
                </div>
            </div>
        </div>
    );
};