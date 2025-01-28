// Meeting.tsx
import { useState } from 'react';
import SearchBar from '../components/SearchBar';

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

  const dummyMeetings: MeetingDto[] = Array.from({ length: 45 }, (_, i) => ({
    id: `meeting-${i + 1}`,
    title: `같이 벚꽃 구경하실 분! ${i + 1}`,
    festivalName: '2024 여의도 벚꽃축제',
    date: '2024-04-05',
    memberCount: Math.floor(Math.random() * 8) + 2,
    maxMembers: 10
  }));

  const handleSearch = async (/*keyword: string*/) => {
    try {
      // const response = await fetch(`/api/v1/meetings/search?keyword=${encodeURIComponent(keyword)}`);
      // const data = await response.json();
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    }
  };

  return (
      <div className="max-w-[600px] mx-auto">
        <SearchBar
            placeholder="모임을 검색해보세요"
            onSearch={handleSearch}
        />
        <div className="p-4 my-20">
          <div className="space-y-3">
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

export default Meeting