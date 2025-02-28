import React, { useState } from 'react';
export const OTPPage = () => {
    const [userLogin, setUserLogin] = useState({
        username: '',
        password: ''
    })
    return <>
        <body class="bg-blue-100 flex items-center justify-center min-h-screen">

            <div>
                <div>
                    <h1 class="text-2xl font-bold text-center text-blue-600 mb-2">Alo</h1>
                    <p class="text-center font-medium mb-6">Đăng ký tài khoản Alo để kết nối với ứng dụng Alo Web</p>
                </div>
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">

                    <div class="border-b border-gray-300 mb-6">
                        <h2 class="text-center font-medium pb-2">Nhập mã OTP</h2>
                    </div>
                    <form>
                        <div class="mb-4 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i class="fas fa-mobile-alt "></i>
                            </span>
                            <input class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded" type="text" id="phone" placeholder="Số điện thoại" />
                        </div>
                        <div class="mb-4 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                                <img src='./icon/ic_otp.png' alt='ICON OTP' />
                            </span>
                            <input class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded" type="text" id="phone" placeholder="OTP" />
                        </div>

                        <button class="mt-5 w-full text-blue-500 py-2 rounded-xl hover:text-blue-700 transition duration-200">Gửi lại OTP</button>

                        <button class="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200">Tiếp tục</button>
                    </form>
                    <div class="flex justify-between mt-4 text-sm text-gray-600">
                        <a href="#" class="hover:underline">Đăng nhập</a>
                        <a href="#" class="hover:underline">Quên mật khẩu</a>
                    </div>
                </div>
            </div>

        </body>
    </>
}