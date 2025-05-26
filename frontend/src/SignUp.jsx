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
            const res = await fetch("/api/signup/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_name: userId,
                    password: password,
                    nickname: nickname,
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
