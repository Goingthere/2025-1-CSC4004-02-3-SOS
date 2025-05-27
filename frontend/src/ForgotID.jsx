import React, { useState } from "react";

const ForgotID = () => {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/find_id/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.user_name) {
        setResultMessage(`회원님의 아이디는 ${data.user_name} 입니다.`);
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
