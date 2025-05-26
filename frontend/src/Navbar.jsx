import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    // 로그아웃 시 토큰 삭제 및 상태 리셋
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home"><b>SOS</b></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="#">AllGames</Link>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown">
                Community
              </Link>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Notion</a></li>
                <li><a className="dropdown-item" href="#">Figma</a></li>
                <li><a className="dropdown-item" href="#">GitHub</a></li>
              </ul>
            </li>
          </ul>

          <button type="button" className="btn btn-light me-2 position-relative">
            <i className="fa-solid fa-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">!</span>
          </button>

          {isLoggedIn ? (
            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle ms-2" type="button" data-bs-toggle="dropdown">
                <b>Hello, User!</b>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="#">WishList</Link></li>
                <li><Link className="dropdown-item" to="#">Account</Link></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
                <li><Link className="dropdown-item text-danger" to="#">DeleteID</Link></li>
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
