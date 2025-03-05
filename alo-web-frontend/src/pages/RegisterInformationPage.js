import React, { useState } from 'react';
import { Link } from 'react-router-dom';
export const RegisterInformationPage = () => {
    const [userLogin, setUserLogin] = useState({
        username: '',
        password: ''
    })
    return <>
        <body class="bg-blue-100 flex items-center justify-center min-h-screen">

            <div>
                <div>
                    <h1 class="text-2xl font-bold text-center text-blue-600 mb-2">Alo</h1>
                    <p class="text-center font-medium mb-6">Đăng nhập tài khoản Alo để kết nối với ứng dụng Alo Web</p>
                </div>
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">

                    <div class="border-b border-gray-300 mb-6">
                        <h2 class="text-center font-medium pb-2">Đăng nhập với mật khẩu</h2>
                    </div>
                    <form>
                        <div class="mb-4 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i class="fas fa-mobile-alt "></i>
                            </span>
                            <input class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded" type="text" id="phone" placeholder="Số điện thoại" />
                        </div>
                        <div class="mb-4 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i class="fas fa-user "></i>
                            </span>
                            <input class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded" type="text" id="fullName" placeholder="Họ và tên" />
                        </div>
                        <div class="mb-6 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded" type="password" id="password" placeholder="Mật khẩu" />
                        </div>
                        <div class="mb-6 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded" type="password" id="rePassword" placeholder="Nhập lại mật khẩu" />
                        </div>
                        <button class="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200">Đăng ký</button>
                    </form>
                    <div class="flex justify-between mt-4 text-sm text-gray-600">
                        <a href="#" class="hover:underline">Đăng ký</a>
                        <a href="#" class="hover:underline">Quên mật khẩu</a>
                    </div>
                </div>
            </div>

        </body>
    </>
}