import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const RegisterInformationPage = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    password: '',
    rePassword: '',
  });
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { phoneNumber } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInfo.password !== userInfo.rePassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    const userRegister = {
      phoneNumber,
      fullName: userInfo.fullName,
      password: userInfo.password,
      rePassword: userInfo.rePassword,
    };

    console.log('Sending register request:', userRegister);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userRegister),
      });
      const data = await response.json();
      console.log('Response from server:', data);

      if (response.ok) {
        alert('Đăng ký thành công!');
        navigate('/login');
      } else {
        setError(data.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại!');
      console.error('Fetch error:', err);
    }
  };

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
                value={phoneNumber || ''}
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
                value={userInfo.fullName}
                onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
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
                value={userInfo.password}
                onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
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
                value={userInfo.rePassword}
                onChange={(e) => setUserInfo({ ...userInfo, rePassword: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
            >
              Đăng ký
            </button>
          </form>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <a href="#" className="hover:underline">Đăng nhập</a>
            <a href="#" className="hover:underline">Quên mật khẩu</a>
          </div>
        </div>
      </div>
    </div>
  );
};