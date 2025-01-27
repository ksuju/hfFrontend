import { useState } from 'react';

interface MeetingDto {
  id: string;
  title: string;
  festivalName: string;
  date: string;
  memberCount: number;
  maxMembers: number;
}

const Meeting = () => {
  const [visibleCount] = useState(15);

  // 45개의 더미 데이터 생성
  const dummyMeetings: MeetingDto[] = Array.from({ length: 45 }, (_, i) => ({
    id: `meeting-${i + 1}`,
    title: `같이 벚꽃 구경하실 분! ${i + 1}`,
    festivalName: '2024 여의도 벚꽃축제',
    date: '2024-04-05',
    memberCount: Math.floor(Math.random() * 8) + 2, // 2~9명
    maxMembers: 10
  }));

  return (
    <div className="max-w-[430px] mx-auto">
      <div className="pt-16 pb-20">
        {/* 검색창 */}
        <div className="px-4 mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="모임을 검색해보세요"
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

        <div className="px-4 mt-4 space-y-3">
          {dummyMeetings.slice(0, visibleCount).map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-base">
                    {meeting.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {meeting.festivalName}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {meeting.memberCount}/{meeting.maxMembers}명
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {meeting.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Meeting;