import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Home from "./Home"; // Home 컴포넌트 임포트
import Login from "./Login"; // Login 컴포넌트 임포트
import SignUp from "./SignUp";
import ForgotID from "./ForgotID";
import ForgotPW from "./ForgotPW";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 기본 경로('/')에 대한 리디렉션 */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* 다른 페이지들 */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-id" element={<ForgotID />} />
        <Route path="/forgot-pw" element={<ForgotPW />} />

      </Routes>
    </Router>
  );
};

export default App;
