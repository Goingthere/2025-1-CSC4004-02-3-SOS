import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const nickname = localStorage.getItem('nickname') || 'User';

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      // 실제 앱에서는 fetch로 대체 가능
      const dummyNotifications = [
        { message: '✅ 새로운 게임이 등록되었습니다.', read: false },
        { message: '📩 새로운 메시지가 도착했습니다.', read: false },
        { message: '🎮 인기 게임이 업데이트되었습니다.', read: true },
      ];
      setNotifications(dummyNotifications);
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(prev => !prev);
    if (!dropdownOpen) markAllAsRead(); // 드롭다운 열릴 때만 읽음 처리
  };

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
        localStorage.removeItem('nickname');
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

          {/* 🔔 알림 드롭다운 */}
          <div className="dropdown me-2">
            <button
              className="btn btn-light position-relative dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded={dropdownOpen}
              onClick={handleDropdownToggle}
            >
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  !
                </span>
              )}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              style={{ minWidth: '250px', maxHeight: '300px', overflowY: 'auto' }}
            >
              {notifications.length === 0 ? (
                <li className="dropdown-item text-muted">📭 새 알림이 없습니다.</li>
              ) : (
                notifications.map((note, index) => (
                  <li key={index} className={`dropdown-item ${!note.read ? 'fw-bold' : ''}`}>
                    {note.message}
                  </li>
                ))
              )}
              <li><hr className="dropdown-divider" /></li>
              <li className="dropdown-item text-center">
                <Link to="/notifications">🔔 모든 알림 보기</Link>
              </li>
            </ul>
          </div>

          {/* 로그인/로그아웃 영역 */}
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
