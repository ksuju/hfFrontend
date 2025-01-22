import React, { useState, useEffect,useCallback  } from 'react';
import '../css/KakaoMap.css';
import searchIcon from '../images/icon_search.png';

import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; 


declare global {
  interface Window {
    kakao: any;
  }
}

const KakaoMap = () => {

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {

  /* TypeScript에서 동작함
  useEffect(() => {
    let container = document.getElementById(`map`); // 지도를 담을 영역의 DOM 레퍼런스
    let options = {
      center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도 중심 좌표
      level: 3, // 지도의 레벨(확대, 축소 정도)
    };

    let map = new window.kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴
  }, []);

  return <div id="map" style={{ width: "100vw", height: "100vh" }} />;
  */


  const container = document.getElementById('map');
  const options = {
    center: new window.kakao.maps.LatLng(37.566826, 126.978656),
    level: 3,
    draggable: true // 드래그 가능하도록 설정
  };
  const kakaoMap = new window.kakao.maps.Map(container, options);
  setMap(kakaoMap);

  // 지도 드래그 이벤트 리스너 추가
  window.kakao.maps.event.addListener(kakaoMap, 'dragend', () => {
    const latlng = kakaoMap.getCenter();
    console.log('지도 중심 좌표:', latlng.getLat(), latlng.getLng());
  });

  }, []);

  return (
    <div style={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column' }}>
      <div id="map" style={{ 
        width: '100%', 
        height: '100%',
        border: '1px solid black',
        boxSizing: 'border-box'
      }}></div>
    </div>
  )
};


/*
const KakaoMap = () => {
  
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<{ marker: any; infowindow: any }[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  //const [searchResults, setSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState<{ festivalName: string; placeName: string; address: string; position: { lat: number; lng: number } }[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<{ title: string; position: { lat: number; lng: number } } | null>(null);


  useEffect(() => {
    // 지도 초기화
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.978656),
      level: 3,
      draggable: true // 드래그 가능하도록 설정
    };
    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);

    // 지도 드래그 이벤트 리스너 추가
    window.kakao.maps.event.addListener(kakaoMap, 'dragend', () => {
      const latlng = kakaoMap.getCenter();
      console.log('지도 중심 좌표:', latlng.getLat(), latlng.getLng());
    });
  }, []);

  //const addMarker = useCallback((position, title) => {
  const addMarker = useCallback((position: { lat: number; lng: number }, title: string) => {
    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: map
    });

    // 인포윈도우 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${title}</div>`
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      focusOnPlace(position, title);
      infowindow.open(map, marker);
    });

    // 마우스가 마커 위로 올라왔을 때 인포윈도우 표시
    window.kakao.maps.event.addListener(marker, 'mouseover', () => {
      infowindow.open(map, marker);
    });
  
    // 마우스가 마커에서 벗어났을 때 인포윈도우 숨기기
    window.kakao.maps.event.addListener(marker, 'mouseout', () => {
      infowindow.close();
    });

    return { marker, infowindow };
  }, [map]);

  // 장소에 포커스하는 함수
  //const focusOnPlace = useCallback((position, title) => {
    const focusOnPlace = useCallback((position: { lat: number; lng: number }, title: string) => {
    if (map) {
      const latLng = new window.kakao.maps.LatLng(position.lat, position.lng);
      map.setCenter(latLng);
      map.setLevel(5);
      setSelectedPlace({ title, position });
    }
  }, [map]);

  // 검색 처리 함수
  const handleSearch = async (e : any) => {

    e.preventDefault();
    if (!searchKeyword.trim()) {
      Toastify({
        text: "검색어를 입력해주세요", 
        duration: 3000, 
        close: true, 
        gravity: "bottom", 
        position: "right", 
        backgroundColor: "#333", 
        stopOnFocus: true, 
      }).showToast();
      return;
    }  
    // 기존 마커들 제거
    markers.forEach(item => item.marker.setMap(null));
    setMarkers([]);
    setSearchResults([]);

      
        try {
        //현재는 프론트, 백 모두 로컬서버라 이리 설정되어있지만, 고정 ip 및 도메인이 정해지면 설정 변경 필요!
        //키워드 필수값으로 해야할듯.
        //장소가 겹치는 경우엔 마커는 그대로 표시하돼, 결과 List 컴포넌트에 각각뿌려주는쪽으로 방향을 잡아야할듯.
       
        const response = await fetch(`http://localhost:8050/kopis?keyword=${encodeURIComponent(searchKeyword)}`);
        const dbData = await response.json();
        const places = new window.kakao.maps.services.Places();
        const bounds = new window.kakao.maps.LatLngBounds();
        const newMarkers: { marker: any; infowindow: any }[] = [];
        // const newMarkers = [];


        const results: { festivalName: string; placeName: string; address: string; position: { lat: number; lng: number } }[] = [];
        //const results = [];

        for (const place of dbData) {
          // Kakao Maps API로 좌표 보완
          //place.festivalHallName = 공연장소
          //place.festivalArea     = 공연지역

          
          //  1. response.json인 dbData를 반복문을 돌려서 아래 작업을 실시한다. 
          //  2. 반복대상 객체인 place에 대하여, 카카오 api를 호출하여, 
          //      장소값을 키워드로 호출하여, 받아온 결과를 마커로 표시한다. 
          places.keywordSearch(place.festivalHallName, (kakaoData : any, status : any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              // 첫 번째 검색 결과의 좌표 사용
              const kakaoPlace = kakaoData[0];
              const position = {
                lat: kakaoPlace.y,
                lng: kakaoPlace.x,
              };
      
              // 마커 및 인포윈도우 생성
              const { marker, infowindow } = addMarker(position, place.festivalHallName);
              bounds.extend(new window.kakao.maps.LatLng(kakaoPlace.y, kakaoPlace.x));
              newMarkers.push({ marker, infowindow });


              results.push({
                festivalName: place.festivalHallName,
                placeName: kakaoPlace.place_name,
                address: kakaoPlace.address_name,
                position,
              });
              // 지도 업데이트
              setMarkers(newMarkers);
              map.setBounds(bounds);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
              console.warn(`"${place.place_name}"에 대한 검색 결과가 없습니다.`);
            } else if (status === window.kakao.maps.services.Status.ERROR) {
              console.error(`"${place.place_name}" 검색 중 오류가 발생했습니다.`);
            }
          });
        }

        setSearchResults(results);

      } catch (error) {
          console.error('Error:', error);
          alert('검색 중 오류가 발생했습니다.');
      }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px' }}>
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="장소를 검색하세요"
            style={{ width: '100%', padding: '10px' }}
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="검색" style={{ width: '20px', height: '20px' }} />
          </button>
        </form>
      </div>
  
      <div id="map" style={{ 
        width: '100%', 
        height: '50%',
        border: '1px solid black',
        boxSizing: 'border-box'
      }}></div>
  
      <div style={{ 
        width: '100%', 
        height: '30%', 
        overflowY: 'auto',
        border: '1px solid black',
        boxSizing: 'border-box',
        padding: '10px'
      }}>
        <h3>검색 결과</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {searchResults.map((place, index) => (  //되게 반복적으로 호출되는것을 보면, 상태관리에 문제가 있음.  
            <li                                 //효과적인 react사용을 위해선 component 관리 필요!
              key={index} 
              onClick={() => focusOnPlace({ lat: place.position.lat, lng: place.position.lng }, place.festivalName)}
              //onClick={() => focusOnPlace({ lat: place.y, lng: place.x }, place.festivalHallName)}
              style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #eee' }}
            >
              {place.placeName}
            </li>
           // {place.place_name}
          ))}
        </ul>
      </div>
    </div>
  );
};

*/
export default KakaoMap;