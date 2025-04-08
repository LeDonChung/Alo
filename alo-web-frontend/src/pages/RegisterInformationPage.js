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
  const [validPassword, setValidPassword] = useState('');
  const [validFullName, setValidFullName] = useState('');
  const [validPhone, setValidPhone] = useState('');
  const [validRePassword, setValidRePassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;
    const regexHoTen = /^[A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s[A-ZÀ-Ỹ][a-zà-ỹ]+)*$/;
    const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;

    let errors = false;
    if (!regexPassword.test(userRegister.password.trim())) {
      setValidPassword('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt, không chứa khoảng trắng.');
      errors = true;
    }

    if (!regexHoTen.test(userRegister.fullName.trim())) {
      setValidFullName('Họ tên không hợp lệ.');
      errors = true;

    }

    if (!regexPhone.test(userRegister.phoneNumber.trim())) {
      setValidPhone('Số điện thoại không hợp lệ.');
      errors = true;
    }

    if (userRegister.password.trim() !== userRegister.rePassword.trim()) {
      setValidRePassword('Mật khẩu không khớp.');
      errors = true;
    }

    if (errors) {
      setIsLoading(false);
      return;
    }


    setIsLoading(true);

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
            <div className="mt-4 relative">
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
            <div className="mt-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-user"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="text"
                id="fullName"
                placeholder="Họ và tên"
                value={userRegister.fullName}
                onChange={(e) => {
                  setValidFullName('');
                  dispatch(setUserRegister({ ...userRegister, fullName: e.target.value }));
                }}
              />
            </div>
            {validFullName && <p className="text-red-500 text-sm mt-1">{validFullName}</p>}

            <div className="mt-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-lock"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="password"
                id="password"
                placeholder="Mật khẩu"
                value={userRegister.password}
                onChange={(e) => {
                  setValidPassword('');
                  dispatch(setUserRegister({ ...userRegister, password: e.target.value }));
                }}
              />
            </div>
            {validPassword && <p className="text-red-500 text-sm mt-1">{validPassword}</p>}

            <div className="mt-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-lock"></i>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                type="password"
                id="rePassword"
                placeholder="Nhập lại mật khẩu"
                value={userRegister.rePassword}
                onChange={(e) => {
                  setValidRePassword('');
                  dispatch(setUserRegister({ ...userRegister, rePassword: e.target.value }));
                }}
              />
            </div>
            {validRePassword && <p className="text-red-500 text-sm mt-1">{validRePassword}</p>}

            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
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