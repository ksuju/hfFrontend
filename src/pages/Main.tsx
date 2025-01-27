import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const Main = () => {
  return (
    <div className="max-w-[430px] mx-auto">
      <div className="pt-16 pb-20">
        {/* 검색창 */}
        <div className="px-4 mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:border-primary"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 메인 배너 */}
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop={true}
          className="w-[336px] aspect-[3/2] mx-auto mt-4"
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
          <div key={section} className="mt-8 px-4">
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