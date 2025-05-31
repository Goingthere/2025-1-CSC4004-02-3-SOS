import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = ({ setIsLoggedIn }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 🔷 로그인 요청 함수
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userId, password: password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 토큰과 닉네임 저장
        localStorage.setItem('access', data.access_token);
        localStorage.setItem('refresh', data.refresh_token);
        localStorage.setItem('nickname', data.user.nickname); // 🔹 닉네임 저장

        setErrorMessage('');
        setIsLoggedIn(true); // 로그인 성공 시 상태 업데이트
        navigate('/home');
      } else {
        if (data.error === '존재하지 않는 아이디입니다.') {
          setErrorMessage('❗ 존재하지 않는 아이디입니다.');
        } else if (data.error === '비밀번호가 일치하지 않습니다.') {
          setErrorMessage('❗ 비밀번호가 일치하지 않습니다.');
        } else {
          setErrorMessage('❗ 로그인에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setErrorMessage('❗ 서버와의 연결에 실패했습니다.');
    }
  };

  return (
    <body style={{ overflow: 'hidden' }}>
      {/* 🔷 로그인 폼 */}
      <div className="login">
        <h1 className="title-login">Login</h1>

        <form onSubmit={handleLogin}>
          <div className="inputID">
            <h5>ID</h5>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Your ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          <div className="inputPW">
            <h5>Password</h5>
            <div className="input-group">
              <input
                type="password"
                className="form-control"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 🔷 에러 메시지 출력 */}
          {errorMessage && (
            <div className="alert alert-danger mt-3 py-2 text-center" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="btn btn-primary"><b>Login</b></button>
          </div>
        </form>

        {/* 🔷 링크 모음 */}
        <div className="login-link-container mb-3">
          <div className="box"><a href="/signup">Sign Up</a></div>
          <div className="box"><a href="/forgot-id">Forgot ID?</a></div>
          <div className="box"><a href="/forgot-pw">Forgot Password?</a></div>
        </div>
      </div>
    </body>
  );
};

export default Login;
