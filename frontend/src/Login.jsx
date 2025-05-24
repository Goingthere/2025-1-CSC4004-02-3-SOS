import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 🔷 임시 로그인 여부 설정 (true면 로그인 된 상태로 가정)
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // 🔷 로그인 요청 함수
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password: password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
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
    <div style={{ overflow: 'hidden' }}>
      {/* 🔷 네비게이션 바 */}
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">
          <a className="navbar-brand" href="/home"><b>SOS</b></a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#">AllGames</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                  aria-expanded="false">Community</a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">Notion</a></li>
                  <li><a className="dropdown-item" href="#">Figma</a></li>
                  <li><a className="dropdown-item" href="#">GitHub</a></li>
                </ul>
              </li>
            </ul>

            <button type="button" className="btn btn-light me-2 position-relative">
              <i className="fa-solid fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                !
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>

            {/* 🔷 로그인 여부에 따라 표시 변경 */}
            {isLoggedIn ? (
              <div className="dropdown">
                <button className="btn btn-light dropdown-toggle ms-2" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <b>Hello, User!</b>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><a className="dropdown-item" href="#">WishList</a></li>
                  <li><a className="dropdown-item" href="#">Account</a></li>
                  <li><a className="dropdown-item" href="#">Logout</a></li>
                  <li><a className="dropdown-item text-danger" href="#">DeleteID</a></li>
                </ul>
              </div>
            ) : (
              <a href="/login" className="btn btn-light ms-2"><b>Login</b></a>
            )}
          </div>
        </div>
      </nav>

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
    </div>
  );
};

export default Login;
