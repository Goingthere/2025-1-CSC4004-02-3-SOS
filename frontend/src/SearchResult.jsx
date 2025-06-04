import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const SearchResult = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]); // API에서 받아온 게임 리스트
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(null);
  const [discount, setDiscount] = useState('');
  const [wishlist, setWishlist] = useState([]); // 게임 수만큼 동적 생성 예정

  // searchQuery 변경시 API 호출
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setGames([]);
      setWishlist([]);
      return;
    }

    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/app/search/?query=${encodeURIComponent(searchQuery)}&mode=full`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setGames(data);
        setWishlist(new Array(data.length).fill(false)); // wishlist 상태 초기화
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [searchQuery]);

  const toggleWishlist = (index) => {
    const updated = [...wishlist];
    updated[index] = !updated[index];
    setWishlist(updated);

    if (updated[index]) {
      setSelectedGameIndex(index);
      setShowModal(true);
    }
  };

  const handleDiscountSubmit = () => {
    const value = parseInt(discount);
    if (value >= 1 && value <= 100) {
      alert(`✅ 입력하신 할인율 ${value}%에 도달하면 알림을 보내드리겠습니다.`);
      setShowModal(false);
      setDiscount('');
    } else {
      alert('⚠️ 1부터 100 사이의 숫자를 입력해주세요.');
    }
  };

  return (
    <div>
      {/* 검색창 */}
      <div className="search-container">
        <div className="search-box" style={{ margin: '3rem auto' }}>
          <input
            type="text"
            placeholder="Search for the game name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 로딩 및 에러 메시지 */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* 게임 리스트 */}
      <div className="game-list" id="gameList">
        {games.map((game, index) => (
          <div className="game-item" key={game.appID}>
            <a href="GameMain.html" className="game-info-omit">
              <img src={game.app_image} alt={game.app_name} />
              <div className="game-name-omit">{game.app_name}</div>
            </a>
            <div
              className="wishlist-btn"
              onClick={() => toggleWishlist(index)}
              style={{ cursor: 'pointer', fontSize: '1.5rem', userSelect: 'none' }}
            >
              {wishlist[index] ? '★' : '☆'}
            </div>
          </div>
        ))}
      </div>

      {/* 할인율 입력 모달 */}
      {showModal && selectedGameIndex !== null && (
        <div
          className="modal"
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              🎯 원하시는 할인율을 입력해주세요.<br />
              해당 할인율에 도달하면 이메일로 알림을 전송합니다.
            </div>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min="1"
              max="100"
              placeholder="예: 30"
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <button
              onClick={handleDiscountSubmit}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
