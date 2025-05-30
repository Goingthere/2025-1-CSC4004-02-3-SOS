import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Wishlist = () => {
  const [games, setGames] = useState([]);
  const [wishlistState, setWishlistState] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [discount, setDiscount] = useState('');

  // access_token 확인 및 위시리스트 불러오기
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setGames(data);
          const initialState = {};
          data.forEach(game => {
            initialState[game.app_id] = {
              wished: true,
              wish_percent: game.wish_percent
            };
          });
          setWishlistState(initialState);
        } else {
          alert("❌ 위시리스트를 불러오지 못했습니다.");
        }
      } catch (err) {
        alert("⚠️ 네트워크 오류가 발생했습니다.");
      }
    };

    fetchWishlist();
  }, []);

  const toggleWishlist = (appId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }

    const gameState = wishlistState[appId];

    if (gameState?.wished) {
      // 찜 해제
      fetch(`/api/wishlist/${appId}/${gameState.wish_percent}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert("🌟 위시리스트에서 제거되었습니다.");
            setWishlistState(prev => ({
              ...prev,
              [appId]: { wished: false, wish_percent: null }
            }));
          } else {
            alert(data.error || "삭제 실패");
          }
        })
        .catch(() => alert("❌ 네트워크 오류"));
    } else {
      setCurrentGameId(appId);
      setShowModal(true);
    }
  };

  const submitDiscount = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }

    const num = parseInt(discount);
    if (num >= 1 && num <= 100) {
      fetch("/api/wishlist/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          app_id: currentGameId,
          wish_percent: num
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert(`✅ 입력하신 할인율 ${num}%에 도달하면 알림을 보내드리겠습니다.`);
            setWishlistState(prev => ({
              ...prev,
              [currentGameId]: {
                wished: true,
                wish_percent: num
              }
            }));
            setShowModal(false);
            setDiscount('');
            setCurrentGameId(null);
          } else {
            alert(data.error || "추가 실패");
          }
        })
        .catch(() => alert("❌ 네트워크 오류"));
    } else {
      alert("⚠️ 1부터 100 사이의 숫자를 입력해주세요.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDiscount('');
    setCurrentGameId(null);
  };

  return (
    <div>
      <div className="wishlist-title-box">
        <h1 className="wishlist-title">WishList</h1>
      </div>

      <div className="game-list" id="gameList">
        {games.map(game => (
          <div className="game-item" key={game.app_id}>
            <a href="GameMain.html" className="game-info-omit">
              <img src={game.app_image} alt={game.app_name} />
              <div className="game-name-omit">{game.app_name}</div>
            </a>

            <div className="discount-section">
              <div className="discount-text">
                <div className="discount-label">현재 할인율</div>
                <div className="discount-rate">
                  {game.currently_discounted ? `${game.current_discount_percent}%` : "-"}
                </div>
              </div>
            </div>

            <div className="wishlist-btn" onClick={() => toggleWishlist(game.app_id)}>
              <i className={
                wishlistState[game.app_id]?.wished
                  ? "fa-solid fa-star"
                  : "fa-regular fa-star"
              }></i>
            </div>
          </div>
        ))}
      </div>

      {/* 할인율 입력 모달 */}
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

export default Wishlist;
