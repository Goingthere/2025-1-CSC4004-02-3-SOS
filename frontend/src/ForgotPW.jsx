import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function ForgotPW() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/users/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        setResultMessage(data.message);
      } else {
        setResultMessage(data.error || "알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      setResultMessage("서버와의 연결에 실패했습니다.");
    }

    // 모달 표시
    const modal = new window.bootstrap.Modal(document.getElementById("forgotPWModal"));
    modal.show();
  };

  const handleModalCloseAndNavigate = () => {
    const modalElement = document.getElementById("forgotPWModal");
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide(); // 모달 닫기

    // 모달 애니메이션 시간 후 로그인 페이지로 이동
    setTimeout(() => navigate("/login"), 300);
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {/* 네비게이션 바 */}
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/"><b>SOS</b></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="#">AllGames</Link>
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

            {/* 🔔 알림 아이콘 */}
            <button type="button" className="btn btn-light me-2 position-relative">
              <i className="fa-solid fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                !
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>

            {/* 🟦 로그인 버튼 */}
            <Link to="/login" className="btn btn-light ms-2"><b>Login</b></Link>
          </div>
        </div>
      </nav>

      {/* 비밀번호 재설정 입력 */}
      <div className="forgotPW">
        <h1 className="title-forgotPW">Forgot Password?</h1>

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

        <div className="inputEmail">
          <h5>Email</h5>
          <div className="input-group">
            <input
              type="email"
              className="form-control"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          Submit
        </button>

        {/* 모달 */}
        <div className="modal fade" id="forgotPWModal" tabIndex="-1" aria-labelledby="forgotPWModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="forgotPWModalLabel">비밀번호 재설정 결과</h1>
              </div>
              <div className="modal-body">
                {resultMessage}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleModalCloseAndNavigate}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPW;
