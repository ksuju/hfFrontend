import React, { useState, useRef, useEffect} from 'react';

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

const Slider: React.FC<SliderProps> = ({ slides, title, autoSlide = false }) => {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  
  
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);


  /*슬라이드 자동 이동 기능 */
  const startAutoSlide = () => {
    stopAutoSlide(); 
    if (autoSlide && slides.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 5500);
    }
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };


  /*화살표 클릭시 슬라이드 index 이동동 */
  const handleDrag = (direction: 'left' | 'right') => {
    stopAutoSlide();
    if (direction === 'left') {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
    if (autoSlide) {
      startAutoSlide();
    }
  };



  /*마우스 드래그를 사용한 슬라이드 이벤트 
    마우스 누를경우(MouseDown) Dragging(true)
    마우스를 움직일경우(MouseMove) 현재 X축을 기준으로 보여줄 슬라이드 표시시
  */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setStartX(e.pageX);
    setDragX(0);
    stopAutoSlide();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }
    const currentX = e.pageX;
    const dragDistance = currentX - startX;
    
    if (dragDistance > 0) {
      handleDrag('left');
    } else if (dragDistance < 0) {
      handleDrag('right');
    }
    
    setDragging(false);
    setStartX(currentX);
  };

  const handleMouseUp = () => {
    setDragging(false);
    if (autoSlide) {
      startAutoSlide();
    }
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
        className="slider-container"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <button className="arrow left" onClick={() => handleDrag('left')}>&#10094;</button>
        <div
          className="slides"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragX}px))`,
            transition: dragging ? 'none' : 'transform 0.3s ease-out',
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
        <button className="arrow right" onClick={() => handleDrag('right')}>&#10095;</button>
      </div>
    </div>
  );
};

export default Slider;
