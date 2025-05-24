import React from "react";
import { Link } from "react-router-dom"; // Link 추가

const Home = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">
          <a className="navbar-brand" href="/home">
            <b>SOS</b>
          </a>
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
                <a className="nav-link" href="#">
                  AllGames
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Community
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#">
                      Notion
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Figma
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      GitHub
                    </a>
                  </li>
                </ul>
              </li>
            </ul>

            {/* 알림 아이콘 */}
            <button type="button" className="btn btn-light me-2 position-relative">
              <i className="fa-solid fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                !<span className="visually-hidden">unread messages</span>
              </span>
            </button>

            {/* 로그인 버튼 */}
            <Link to="/login" className="btn btn-light ms-2">  {/* Link 컴포넌트 사용 */}
              <b>Login</b>
            </Link>
          </div>
        </div>
      </nav>

      <h1>임시 메인 페이지 입니다.</h1>
    </div>
  );
};

export default Home;
