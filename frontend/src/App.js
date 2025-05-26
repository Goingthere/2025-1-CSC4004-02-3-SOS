import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Navbar from "./Navbar"; // 네비게이션 바
import Home from "./Home"; // Home 컴포넌트 임포트
import Login from "./Login"; // Login 컴포넌트 임포트
import SignUp from "./SignUp";
import ForgotID from "./ForgotID";
import ForgotPW from "./ForgotPW";

const App = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      {/* 네비게이션 바: 로그인 상태와 상태 변경 함수 전달 */}
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <Routes>
        {/* 기본 경로('/')에 대한 리디렉션 */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 다른 페이지들 */}
        <Route path="/home" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-id" element={<ForgotID />} />
        <Route path="/forgot-pw" element={<ForgotPW />} />

        {/* 매칭되는 경로 없으면 홈으로 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
