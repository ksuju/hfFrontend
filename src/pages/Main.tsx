// Main.tsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import SearchBar from '../components/SearchBar'

const Main = () => {
  const handleSearch = async (/*keyword: string*/) => {
    try {
      // const response = await fetch(`/api/v1/search?keyword=${encodeURIComponent(keyword)}`);
      // const data = await response.json();
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    }
  };

  return (
      <div className="flex flex-col">
        <SearchBar
            placeholder="축제, 공연, 모임을 검색해보세요"
            onSearch={handleSearch}
        />
        <div className="px-4 my-24">
          {/* 메인 배너 */}
          <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop={true}
              className="w-[336px] lg:w-full aspect-[3/2] mx-auto mt-3"
          >
            {[1, 2, 3, 4, 5].map((item) => (
                <SwiperSlide key={item}>
                  <div className="w-full h-full bg-gray-200 rounded-lg">
                    배너 {item}
                  </div>
                </SwiperSlide>
            ))}
          </Swiper>

          {/* 중간 배너 섹션 */}
          {[1, 2].map((section) => (
              <div key={section} className="mt-8 lg:mt-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">섹션 {section}</h2>
                  <button className="text-sm text-primary">더보기</button>
                </div>
                <Swiper
                    slidesPerView={2.5}
                    spaceBetween={12}
                    className="w-full"
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                      <SwiperSlide key={item}>
                        <div className="w-full aspect-[4/5] bg-gray-200 rounded-lg">
                          카드 {item}
                        </div>
                      </SwiperSlide>
                  ))}
                </Swiper>
              </div>
          ))}
        </div>
      </div>
  )
}

export default Main
