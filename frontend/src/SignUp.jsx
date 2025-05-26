import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickname, setNickname] = useState("");  // 닉네임 상태 추가
    const [email, setEmail] = useState("");

    const navigate = useNavigate();

    const handleIdCheck = async () => {
        if (!userId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }

        try {
            const res = await fetch("/api/check_username/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_name: userId }),
            });

            const data = await res.json();

            if (res.status === 200) {
                alert(data.message);
            } else {
                alert(data.detail);
            }
        } catch (error) {
            alert("아이디 중복 확인 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/users/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    user_name: name,
                    password: password,
                    password2: confirmPassword,
                    nickname: nickname,  // 닉네임도 전송
                    email: email,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("회원가입이 완료되었습니다.");
                navigate("/login");
            } else {
                alert(data.error || "회원가입에 실패했습니다.");
            }
        } catch (error) {
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-custom">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/home"><b>SOS</b></Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
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
                                    <li><Link className="dropdown-item" to="#">Notion</Link></li>
                                    <li><Link className="dropdown-item" to="#">Figma</Link></li>
                                    <li><Link className="dropdown-item" to="#">GitHub</Link></li>
                                </ul>
                            </li>
                        </ul>
                        <button type="button" className="btn btn-light me-2 position-relative">
                            <i className="fa-solid fa-bell"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">!</span>
                        </button>
                        <Link to="/login" className="btn btn-light ms-2"><b>Login</b></Link>
                    </div>
                </div>
            </nav>

            <div className="signUp">
                <h2 className="title-signUp">Enter Your Information</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="inputID">
                        <label className="form-label">ID</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Your ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                            <button className="btn btn-outline-primary" type="button" onClick={handleIdCheck}>
                                아이디 중복 확인
                            </button>
                        </div>
                    </div>

                    <div className="inputPW">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="inputPW">
                        <label className="form-label">Password Check</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Your Password Again"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* 닉네임 입력란 추가 */}
                    <div className="inputNickname mb-3">
                        <label className="form-label">Nickname</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Your Nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

                    <div className="inputEmail">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        <b>Sign Up</b>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
