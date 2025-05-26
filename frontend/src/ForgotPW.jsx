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
      const response = await fetch("/api/find_password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userId,
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
