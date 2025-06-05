import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BannerCarousel from './components/BannerCarousel';

const Home = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // 🔍 자동완성 API 호출 (디바운스 적용)
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch(`/api/app/search/?query=${encodeURIComponent(query)}&mode=suggest`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        })
        .catch(err => {
          console.error('자동완성 실패:', err);
          setSuggestions([]);
        });
    }, 300);
  }, [query]);

  // ⏎ 엔터 입력 시 검색 페이지로 이동
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate(`/searchResult?query=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  // ⌨️ 자동완성 항목 클릭
  const handleSuggestionClick = (name) => {
    setQuery(name);
    setShowSuggestions(false);
    navigate(`/searchResult?query=${encodeURIComponent(name)}`);
  };

  // 🖱 배너 클릭 시 API 호출 → Festival.jsx로 데이터 전달
  const handleBannerClick = async (period) => {
    try {
      const res = await fetch(`/api/predictions/seasonal/?period=${encodeURIComponent(period)}`);
      const data = await res.json();
      navigate('/festival', { state: { predictionData: data } });
    } catch (err) {
      console.error('예측 할인 정보 불러오기 실패:', err);
      alert('할인 정보를 불러오는 데 실패했습니다.');
    }
  };

  return (
    <div className="search-container">
      {/* 🔍 검색창 */}
      <h2 className="search-title">Search for the game name</h2>
      <div className="search-box position-relative" style={{ marginBottom: '7rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
            {suggestions.map((item) => (
              <li
                key={item.appID}
                className="list-group-item list-group-item-action d-flex align-items-center"
                onClick={() => handleSuggestionClick(item.app_name)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.app_image} alt={item.app_name} width="40" height="20" className="me-2" />
                <div>
                  <div>{item.app_name}</div>
                  {item.currently_discounted ? (
                    <div style={{ fontSize: '0.9rem', color: 'green' }}>
                      {item.discount_price.toLocaleString()}원 (할인 중)
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                      {item.origin_price.toLocaleString()}원
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📋 세일 리스트 */}
      <div className="sale-title">Season Sale List</div>
      <div className="subtitle">
        아래 배너를 클릭해서 더욱 자세한 예측 할인 리스트를 확인해 보세요!
      </div>

      <div className="card-container">
        {/* 소규모 축제1 */}
        <div className="card" onClick={() => handleBannerClick('next-week')} style={{ cursor: 'pointer' }}>
          <BannerCarousel
            period="next-week"
            title="소규모 축제1"
            dateRange="2025.05.11 ~ 2025.05.18"
          />
        </div>

        {/* 소규모 축제2 */}
        <div className="card" onClick={() => handleBannerClick('next-next-week')} style={{ cursor: 'pointer' }}>
          <BannerCarousel
            period="next-next-week"
            title="소규모 축제2"
            dateRange="2025.05.12 ~ 2025.05.19"
          />
        </div>

        {/* 대규모 축제 */}
        <div className="card" onClick={() => handleBannerClick('next-season')} style={{ cursor: 'pointer' }}>
          <BannerCarousel
            period="next-season"
            title="대규모 축제"
            dateRange="2025.05.12 ~ 2025.05.19"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
