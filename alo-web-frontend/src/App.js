import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OTPPage } from './pages/OTPPage';
import { RegisterInformationPage } from './pages/RegisterInformationPage';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import CreateGroupPage from './pages/CreateGroup';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getFriends } from './redux/slices/FriendSlice';

function App() {
  const dispatch = useDispatch();
  const init = async () => {
    await dispatch(getFriends())
  }
  useEffect(() => {
    init(); 
  }, []);
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        {/* Auth Routes - Không có Navigation */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/register-info" element={<RegisterInformationPage />} />
          <Route path="/create-group" element={<CreateGroupPage/>} />
        </Route>

        {/* Main Routes - Có Navigation */}
        <Route element={<MainLayout />}>
          <Route path="/me" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
