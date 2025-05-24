import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserRegister } from '../redux/slices/RegisterSlice';
import showToast from '../utils/AppUtils';

export const RegisterPage = () => {
  const userRegister = useSelector((state) => state.register.userRegister);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();

    const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
    if (!regexPhone.test(userRegister.phoneNumber.trim())) {
      showToast('Số điện thoại không hợp lệ.', 'error');
      return;
    }
    if (!agree) {
      setError('Vui lòng đồng ý với các điều khoản sử dụng!');
      return;
    }

    navigate('/otp');
  };

  return (
    <div className="bg-blue-100 flex items-center justify-center min-h-screen px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div>
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">Alo</h1>
          <p className="text-center font-medium mb-6 text-sm md:text-base">
            Đăng ký tài khoản Alo để kết nối với ứng dụng Alo Web
          </p>
        </div>
  
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 md:p-10">
          <div className="border-b border-gray-300 mb-6">
            <h2 className="text-center font-medium pb-2 text-base md:text-lg">Đăng ký</h2>
          </div>
  
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <i className="fas fa-mobile-alt"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm md:text-base"
                type="text"
                id="phone"
                placeholder="Số điện thoại"
                value={userRegister.phoneNumber}
                onChange={(e) =>
                  dispatch(setUserRegister({ ...userRegister, phoneNumber: e.target.value }))
                }
              />
            </div>
  
            <div className="mb-6 flex items-center">
              <input
                id="xass"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="ml-2 text-sm md:text-base" htmlFor="xass">
                Tôi đồng ý với các điều khoản sử dụng
              </label>
            </div>
  
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
  
            <button
              type="submit"
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200 text-sm md:text-base"
            >
              Tiếp tục
            </button>
          </form>
  
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <a
              href="#"
              className="hover:underline"
              onClick={() => navigate('/login')}
            >
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