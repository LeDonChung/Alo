import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, setUserRegister } from '../redux/slices/RegisterSlice';
import showToast from '../utils/AppUtils';

export const RegisterInformationPage = () => {
  const userRegister = useSelector((state) => state.register.userRegister);

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (userRegister.password !== userRegister.rePassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    const data = {
      phoneNumber: userRegister.phoneNumber,
      fullName: userRegister.fullName,
      password: userRegister.password,
      rePassword: userRegister.rePassword,
    };
    await dispatch(register(data)).unwrap().then((response) => {
      showToast('Đăng ký thành công', 'success');
      navigate('/login');
    }).catch((error) => {
      console.log("❌ Lỗi đăng ký:", error);
      showToast(error.message, 'error');
    });
    setIsLoading(false);
  }
  return (
    <div className="bg-blue-100 flex items-center justify-center min-h-screen">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Alo</h1>
          <p className="text-center font-medium mb-6">
            Đăng ký tài khoản Alo để kết nối với ứng dụng Alo Web
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="border-b border-gray-300 mb-6">
            <h2 className="text-center font-medium pb-2">Hoàn tất đăng ký</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-mobile-alt"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="text"
                id="phone"
                value={userRegister.phoneNumber || ''}
                disabled
              />
            </div>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-user"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="text"
                id="fullName"
                placeholder="Họ và tên"
                value={userRegister.fullName}
                onChange={(e) => dispatch(setUserRegister({ ...userRegister, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="mb-6 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-lock"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="password"
                id="password"
                placeholder="Mật khẩu"
                value={userRegister.password}
                onChange={(e) => dispatch(setUserRegister({ ...userRegister, password: e.target.value }))}
                required
              />
            </div>
            <div className="mb-6 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-lock"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="password"
                id="rePassword"
                placeholder="Nhập lại mật khẩu"
                value={userRegister.rePassword}
                onChange={(e) => dispatch(setUserRegister({ ...userRegister, rePassword: e.target.value }))}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
            >
              {
                isLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full border-t-2 border-b-2 border-white w-4 h-4"></div>
                  </div>
                ) : (
                  "Đăng ký"
                )
              }
            </button>
          </form>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <a href="#" className="hover:underline"
              onClick={() => {
                navigate('/login');
              }}
            >Đăng nhập</a>
            <a href="#" className="hover:underline">Quên mật khẩu</a>
          </div>
        </div>
      </div>
    </div>
  );
};