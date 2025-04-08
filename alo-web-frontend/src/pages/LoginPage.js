import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, login } from '../redux/slices/UserSlice';
import { useDispatch, useSelector } from 'react-redux';
import showToast from '../utils/AppUtils';
import socket from '../utils/socket.js';
export const LoginPage = () => {
    const [userLogin, setUserLogin] = useState({
        phoneNumber: "",
        password: ""
    })

    const error = useSelector(state => state.user.errorResponse);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        let errors = false;
        // Validate
        const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
        if (!regexPhone.test(userLogin.phoneNumber.trim())) {
            showToast('Số điện thoại không hợp lệ.', 'error');
            errors = true;
        }

        if(userLogin.password.trim() === "") {
            showToast('Mật khẩu không hợp lệ.', 'error');
            errors = true;
        }

        if (errors) {
            return;
        }

        setIsLoading(true);
        await dispatch(login(userLogin)).unwrap().then(async (response) => {
            showToast('Đăng nhập thành công', 'success');
            await dispatch(getProfile()).unwrap().then((response) => {

            }).catch((error) => {
                console.log("❌ Lỗi lấy thông tin người dùng:", error);
            });
            navigate('/me');
        }).catch((error) => {
            console.log("❌ Lỗi đăng nhập:", error);

            showToast('Tài khoản hoặc mật khẩu không chính xác', error);
        });
        setIsLoading(false);
    }

    return <>
        <div className="bg-blue-100 flex items-center justify-center min-h-screen">

            <div>
                <div>
                    <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Alo</h1>
                    <p className="text-center font-medium mb-6">Đăng nhập tài khoản Alo để kết nối với ứng dụng Alo Web</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">

                    <div className="border-b border-gray-300 mb-6">
                        <h2 className="text-center font-medium pb-2">Đăng nhập với mật khẩu</h2>
                    </div>
                    <div className="mb-4 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i className="fas fa-mobile-alt "></i>
                        </span>
                        <input className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                            value={userLogin.phoneNumber}
                            onChange={(e) => setUserLogin({ ...userLogin, phoneNumber: e.target.value })}
                            type="text" id="phone"
                            placeholder="Số điện thoại" />
                    </div>
                    <div className="mb-6 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i className="fas fa-lock"></i>
                        </span>
                        <input className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                            value={userLogin.password}
                            onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                            type="password"
                            id="password"
                            placeholder="Mật khẩu" />
                    </div>
                    <button type='button' onClick={e => handleSubmitLogin(e)} className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200">
                        {isLoading ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                            </div>
                        ) : (
                            "Đăng nhập với mật khẩu"
                        )}
                    </button>

                    <div className="flex justify-between mt-4 text-sm text-gray-600">
                        <Link to={'/register'} className="hover:underline">Đăng ký</Link>
                        <Link to={'/forget-password'} className="hover:underline">Quên mật khẩu</Link>
                    </div>
                </div>
            </div>

        </div>
    </>
}