// src/components/BannerCarousel.jsx

import React, { useEffect, useState } from 'react';
import { Carousel, Spinner } from 'react-bootstrap';
import axios from 'axios';

const BannerCarousel = ({ period, title, dateRange }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/predictions/seasonal/summary/?period=${period}`)
      .then((res) => {
        setItems(res.data.results.slice(0, 5)); // 최대 5개만 사용
        setLoading(false);
      })
      .catch((err) => {
        console.error(`${title} 배너 데이터 로딩 실패`, err);
        setLoading(false);
      });
  }, [period, title]);

  if (loading) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div className="mb-5">
      <div className="card-title">{title}</div>
      <div className="card-date">{dateRange}</div>
      <Carousel interval={3000} controls={false} indicators={false} fade>
        {items.map((item) => (
          <Carousel.Item key={item.app_id}>
            <img
              className="d-block w-100"
              src={item.app_image}
              alt={item.app_name}
              style={{ height: '250px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
