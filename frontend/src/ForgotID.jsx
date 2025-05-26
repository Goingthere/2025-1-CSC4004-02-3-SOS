import React, { useState } from "react";

const ForgotID = () => {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/users/find-id/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        setResultMessage(`회원님의 아이디는 ${data.id} 입니다.`);
      } else {
        setResultMessage(data.error || "알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      setResultMessage("서버와의 연결에 실패했습니다.");
    }

    setShowModal(true);
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {/* Navbar */}
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

            <button
              type="button"
              className="btn btn-light me-2 position-relative"
            >
              <i className="fa-solid fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                !
              </span>
            </button>

            <a href="/login" className="btn btn-light ms-2">
              <b>Login</b>
            </a>
          </div>
        </div>
      </nav>

      {/* Forgot ID Form */}
      <div className="forgotID p-4">
        <h1 className="title-forgotID">Forgot ID?</h1>

        <div className="inputEmail mb-3">
          <h5>Email</h5>
          <div className="input-group">
            <input
              type="text"
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
          data-bs-toggle="modal"
          data-bs-target="#forgotIDModal"
          onClick={handleSubmit}
        >
          Submit
        </button>

        {/* Modal */}
        <div
          className="modal fade"
          id="forgotIDModal"
          tabIndex="-1"
          aria-labelledby="forgotIDModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="forgotIDModalLabel">
                  조회 결과
                </h1>
              </div>
              <div className="modal-body">{resultMessage}</div>
              <div className="modal-footer">
                <a href="/login" className="btn btn-primary">
                  OK
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotID;
