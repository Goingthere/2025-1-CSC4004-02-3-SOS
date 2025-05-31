import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  // localStorage 에 로그인 시 저장해둔 nickname이 있으면 꺼내오고, 없으면 'User' 대체
  const nickname = localStorage.getItem('nickname') || 'User';

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');

    if (!accessToken || !refreshToken) {
      alert('❗ 토큰 정보가 없습니다.');
      return;
    }

    try {
      const response = await fetch('/api/users/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('nickname'); // 로그아웃 시 닉네임도 제거
        setIsLoggedIn(false);
        alert(data.message || '✅ 로그아웃되었습니다.');
      } else {
        alert(data.error || '❗ 로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('❗ 서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home"><b>SOS</b></Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/allgames">AllGames</Link>
            </li>
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Community
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <a
                    className="dropdown-item"
                    href="https://www.notion.so/2025-1-SW-2-3-1b8ffaed2db28094a17fddf851e3df66?source=copy_link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Notion
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="https://www.figma.com/proto/9HbbRGpPaBIA1A6qwFQ7ZL/SOS-최종?node-id=0-1&t=QgChUARS6Jozmtqn-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Figma
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="https://github.com/Goingthere/2025-1-CSC4004-02-3-SOS"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          <button type="button" className="btn btn-light me-2 position-relative">
            <i className="fa-solid fa-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">!</span>
          </button>

          {isLoggedIn ? (
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle ms-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <b>Hello, {nickname}!</b>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="/wishlist">WishList</Link></li>
                <li><Link className="dropdown-item" to="/myaccount">Account</Link></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-light ms-2"><b>Login</b></Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
