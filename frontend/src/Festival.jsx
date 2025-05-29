import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Festival = () => {
    const [discount, setDiscount] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentGameId, setCurrentGameId] = useState(null);

    const [isLoggedIn, setIsLoggedIn] = useState(true);


    const games = [
        {
            id: 1,
            name: "GameName1",
            img: "https://cdn.akamai.steamstatic.com/steam/apps/2112231/header.jpg",
            link: "GameMain.html",
        },
        {
            id: 2,
            name: "GameNane",
            img: "https://cdn.akamai.steamstatic.com/steam/apps/2112231/header.jpg",
            link: "GameMain.html",
        },
    ];

    const [wishlistState, setWishlistState] = useState(
        games.reduce((acc, game) => {
            acc[game.id] = false; // 기본값: 찜(★) 되어있음
            return acc;
        }, {})
    );


    const toggleWishlist = (id) => {
        if (wishlistState[id]) {
            // ★ 찜 되어있으면 바로 해제
            setWishlistState(prev => ({
                ...prev,
                [id]: false
            }));
        } else {
            // 빈 별이면 모달 띄우기 (찜 추가는 모달 확인 시)
            setCurrentGameId(id);
            setShowModal(true);
        }
    };

    const submitDiscount = () => {
        const num = parseInt(discount);
        if (num >= 1 && num <= 100) {
            alert(`✅ 입력하신 할인율 ${num}%에 도달하면 알림을 보내드리겠습니다.`);
            setWishlistState(prev => ({
                ...prev,
                [currentGameId]: true // 찜 추가
            }));
            setShowModal(false);
            setDiscount('');
            setCurrentGameId(null);
        } else {
            alert("⚠️ 1부터 100 사이의 숫자를 입력해주세요.");
        }
    }

    const closeModal = () => {
        setShowModal(false);
        setDiscount('');
        setCurrentGameId(null);
    };

    // 검색어에 따른 필터링
    const filteredGames = games.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            <div className="festival-title-box">
                <h1 className="festival-title">소규모 축제 1</h1>
            </div>

            <div className="search-box">
                <input
                    id="searchInput"
                    type="text"
                    placeholder="게임 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="game-list" id="gameList">
                {filteredGames.map((game) => (
                    <div className="game-item" key={game.id}>
                        <a href={game.link} className="game-info-omit">
                            <img
                                src={game.img}
                                alt="Game Image"
                            />
                            <div className="game-name-omit">
                                {game.name}
                            </div>
                        </a>
                        <div className="wishlist-btn" onClick={() => toggleWishlist(game.id)}>
                            <i className={wishlistState[game.id] ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="wishlist-modal-content">
                        <div style={{ marginBottom: '1rem' }}>
                            🎯 원하시는 할인율을 입력해주세요.<br />
                            해당 할인율에 도달하면 이메일로 알림을 전송합니다.
                        </div>
                        <input
                            type="number"
                            value={discount}
                            onChange={e => setDiscount(e.target.value)}
                            min="1"
                            max="100"
                            placeholder="예: 30"
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <button className="wishlist-submit" onClick={submitDiscount}>확인</button>
                            <button className="cancle" onClick={closeModal}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Festival;
