import React, { useState, useEffect, useRef } from 'react';

interface Slide {
  festivalId: string;
  festivalName: string;
  festivalUrl: string;
}

interface SliderProps {
  slides: Slide[];
  title: string;
  autoSlide?: boolean;
}

//MainSlide는 Auto이고, CategorySlide는 AutoFalse.
//Main.tsx에서 Slider 태그를 사용할때, 보낸 데이터를 정의(interface) 하여 사용.
const Slider: React.FC<SliderProps> = ({ slides, title, autoSlide = false }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const slideInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoSlide = () => {
    stopAutoSlide(); 
    if (autoSlide && slides.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 3000);
    }
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  const handleDrag = (direction: 'left' | 'right') => {
    stopAutoSlide();
    if (direction === 'left') {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
    if (autoSlide) startAutoSlide();
  };

  useEffect(() => {
    if (autoSlide && slides.length > 0) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [autoSlide, slides]);
  
  useEffect(() => {
    return () => stopAutoSlide();
  }, []);



  if (slides.length === 0) {
    return <div>Loading {title}...</div>;
  }

  return (
    <div className="slider">
      <h2>{title}</h2>
      <div
        className="slides"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div className="slide" key={slide.festivalId}>
            <h3>{slide.festivalName}</h3>
            <img 
              src={slide.festivalUrl} 
              alt={slide.festivalName}
              style={{ 
                width: '100%', 
                height: '400px', 
                objectFit: 'contain' 
              }} 
            />
          </div>
        ))}
      </div>
      <button className="prev" onClick={() => handleDrag('left')}>◀</button>
      <button className="next" onClick={() => handleDrag('right')}>▶</button>
    </div>
  );
};

export default Slider;
