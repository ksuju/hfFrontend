import React, { useState, useEffect, useRef } from 'react';

const slides = [
  { id: 1, content: 'Slide 1 Content' ,image: 'https://via.placeholder.com/600x300?text=Slide+1'},
  { id: 2, content: 'Slide 2 Content' ,image: 'https://via.placeholder.com/600x300?text=Slide+1'},
  { id: 3, content: 'Slide 3 Content' ,image: 'https://via.placeholder.com/600x300?text=Slide+1'},
];

const Main = () => {

  const [currentIndex, setCurrentIndex] = useState(0);
  /*
    슬라이더 자동 이간 시간. useRef는 참조(reference)를 의미하며,
    직접적인 DOM요소 접근, 리렌더링 되도 값 보존. 외부 라이브러리 연동등에 사용된다고 한다.
    setTimeout은 일정시간 후 callback을 실행해줄 수 있는 js function이다.
    즉 slideInterval은 값이 없거나,  일정시간 후 callback을 호출하는 값을 참조하고 있다.
  */
  const slideInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const startAutoSlide = () => {
    slideInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000); /* setInterval, setTimeOut은 첫 인자로, 콜백함수, 둘째 인자로 number를 받는데
                 number 때마다 callback을 실행한다. 즉 여기서는 3초마다 CurrentIndex를 set하고 있다.
                 3초마다 이전상태값(prevIndex) +1을 한다음 슬라이드 전체 길이에 비교하여 나머지(%) 를
               계산하여, 첫 슬라이드로 돌아갈지, 아니면 다음 슬라이드로 넘어갈지 정해진다.
               */  
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
        clearInterval(slideInterval.current);
    }
  };


  const handleDrag = (direction: 'left' | 'right') => {
    //슬라이드 하면 일단 멈춘 후, 어느 슬라이드를 표시할 지 정해준 다음, 다시 autoSlide를 실행시킨다.
    stopAutoSlide();
    if (direction === 'left') {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide(); // 컴포넌트 언마운트 시 인터벌 정리
  }, []);


  return (
    <div className="slider" onMouseEnter={stopAutoSlide} onMouseLeave={startAutoSlide}>
      <div
        className="slides"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`, // 슬라이드를 한 번에 하나씩 이동
          transition: 'transform 0.5s ease-in-out',         // 부드럽게 슬라이드 이동
        }}
      >
         <div className="slide" key={slides[currentIndex].id}>
             {slides[currentIndex].content}
         </div>
      </div>

      <button className="prev" onClick={() => handleDrag('left')}>◀</button>
      <button className="next" onClick={() => handleDrag('right')}>▶</button>
    </div>
  );
};

export default Main;