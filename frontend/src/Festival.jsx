import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const Festival = ({ gamesData = [] }) => {
    const [discount, setDiscount] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentGameId, setCurrentGameId] = useState(null);
    const [wishlistState, setWishlistState] = useState({});
    const [desiredDiscounts, setDesiredDiscounts] = useState({});

    // 전달받은 gamesData가 비어있으면 빈 배열 처리
    const games = gamesData;

    // 위시리스트 조회 API 호출 - 필요시 useEffect에 넣으세요
    // (원본에 있던 코드는 여기에 넣거나, 상위 컴포넌트에서 관리하는 게 좋음)

    const toggleWishlist = (id) => {
        // 기존 toggleWishlist 로직 유지
        if (wishlistState[id]) {
            const token = localStorage.getItem("access_token");
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }
            const wishPercent = desiredDiscounts[id] || 50;

            axios.delete(`/api/wishlist/${id}/${wishPercent}/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                setWishlistState(prev => ({ ...prev, [id]: false }));
                setDesiredDiscounts(prev => {
                    const newMap = { ...prev };
                    delete newMap[id];
                    return newMap;
                });
            })
            .catch(() => alert("찜 해제에 실패했습니다."));
        } else {
            setCurrentGameId(id);
            setShowModal(true);
        }
    };

    const submitDiscount = () => {
        const num = parseInt(discount);
        if (num >= 1 && num <= 100) {
            const token = localStorage.getItem("access_token");
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }
            axios.post('/api/wishlist/', {
                app_id: currentGameId,
                desired_discount: num,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
            .then(() => {
                alert(`✅ 입력하신 할인율 ${num}%에 도달하면 알림을 보내드리겠습니다.`);
                setWishlistState(prev => ({ ...prev, [currentGameId]: true }));
                setDesiredDiscounts(prev => ({ ...prev, [currentGameId]: num }));
                closeModal();
            })
            .catch(err => {
                const msg = err.response?.data?.error || "찜 등록에 실패했습니다.";
                alert(`❌ ${msg}`);
            });
        } else {
            alert("⚠️ 1부터 100 사이의 숫자를 입력해주세요.");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setDiscount('');
        setCurrentGameId(null);
    };

    // 검색 필터링
    const filteredGames = games.filter(game =>
        game.app_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="festival-title-box">
                <h1 className="festival-title">소규모 축제 1</h1>
            </div>

            <div className="search-box" style={{ marginBottom: '3rem' }}>
                <input
                    id="searchInput"
                    type="text"
                    placeholder="게임 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="game-list" id="gameList">
                {filteredGames.length === 0 && (
                    <div>할인 게임 예측 정보를 불러오지 못했습니다.</div>
                )}

                {filteredGames.map((game) => (
                    <div className="game-item" key={game.app_id}>
                        <a href={`/home`} className="game-info-omit">
                            <img
                                src={game.app_image}
                                alt={game.app_name}
                            />
                            <div className="game-name-omit">
                                {game.app_name}
                            </div>
                        </a>
                        <div className="wishlist-btn" onClick={() => toggleWishlist(game.app_id)}>
                            <i className={wishlistState[game.app_id] ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
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
