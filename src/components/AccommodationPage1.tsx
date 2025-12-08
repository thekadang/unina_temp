import { MapPin, Calendar, Star, CheckCircle2, MapPinned } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AccommodationPage1() {
  const hotel = {
    country: '프랑스',
    city: '니스',
    checkIn: '2026.08.08',
    checkOut: '2026.08.10',
    nights: '2박 3일',
    name: 'Hotel Negresco Nice',
    type: '호텔',
    stars: 5,
    roomType: '디럭스 더블룸',
    facilities: ['수영장', '사우나', '피트니스', '엘리베이터', '에어컨'],
    breakfast: true,
    cityTax: '€3 per person/night',
    description: '니스의 프롬나드 데 장글레(Promenade des Anglais)에 위치한 5성급 럭셔리 호텔로, 지중해의 아름다운 전망과 벨 에포크 시대의 우아함을 자랑합니다.',
    nearbyAttractions: ['영국인 산책로 (도보 1분)', '마세나 광장 (도보 10분)', '구시가지 (차량 5분)'],
    images: [
      'https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzYyOTg2NTMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1631048835184-3f0ceda91b75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGJlZHJvb20lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjI5NjQyNDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1759223607861-f0ef3e617739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMGJhdGhyb29tfGVufDF8fHx8MTc2Mjk0NDQ1MXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1722867710896-8b5ddb94e141?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjB2aWV3fGVufDF8fHx8MTc2MzAxNDk5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758973470049-4514352776eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGFtZW5pdGllcyUyMHBvb2x8ZW58MXx8fHwxNzYyOTIwNTUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  };

  return (
    <div className="min-h-screen p-8 py-16 print:h-[297mm] print:py-10 print:px-12">
      <div className="max-w-5xl mx-auto space-y-4 print:space-y-3">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-cyan-600 mb-[3px]">숙소 안내</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          <div className="flex items-center justify-center gap-2 pt-1">
            <MapPin className="w-4 h-4 print:w-3.5 print:h-3.5 text-cyan-600" />
            <span className="text-gray-700 text-sm print:text-xs">{hotel.country} · {hotel.city}</span>
          </div>
        </div>

        {/* Images Grid - 더 크게 */}
        <div className="grid grid-cols-3 gap-2.5 print:gap-2 h-[280px] print:h-[240px]">
          {/* Main large image - left side */}
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg">
            <ImageWithFallback
              src={hotel.images[0]}
              alt={`${hotel.name} - Main`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Small images grid - right side */}
          <div className="col-span-1 row-span-1 rounded-xl overflow-hidden shadow-md">
            <ImageWithFallback
              src={hotel.images[1]}
              alt={`${hotel.name} - 2`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="col-span-1 row-span-1 rounded-xl overflow-hidden shadow-md">
            <ImageWithFallback
              src={hotel.images[2]}
              alt={`${hotel.name} - 3`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 print:gap-2 h-[140px] print:h-[120px]">
          <div className="rounded-xl overflow-hidden shadow-md">
            <ImageWithFallback
              src={hotel.images[3]}
              alt={`${hotel.name} - 4`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden shadow-md">
            <ImageWithFallback
              src={hotel.images[4]}
              alt={`${hotel.name} - 5`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Hotel Info */}
        <div className="bg-white rounded-2xl p-5 print:p-4 shadow-lg border border-cyan-100 space-y-4 print:space-y-3">
          {/* Hotel Name & Stars */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 print:mb-1">
              <h2 className="text-gray-900 text-lg print:text-base">{hotel.name}</h2>
              <span className="px-2.5 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs print:text-[10px]">
                {hotel.type}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-2 print:mb-1.5">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 print:w-3.5 print:h-3.5 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-gray-600 text-sm print:text-xs leading-relaxed">{hotel.description}</p>
          </div>

          {/* Check-in/out */}
          <div className="grid grid-cols-3 gap-3 print:gap-2">
            <div className="bg-cyan-50 rounded-xl p-3 print:p-2.5">
              <div className="flex items-center gap-1.5 text-cyan-600 mb-1">
                <Calendar className="w-3.5 h-3.5 print:w-3 print:h-3" />
                <span className="text-xs print:text-[10px]">체크인</span>
              </div>
              <p className="text-gray-800 text-xs print:text-[10px]">{hotel.checkIn}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 print:p-2.5">
              <div className="flex items-center gap-1.5 text-yellow-600 mb-1">
                <Calendar className="w-3.5 h-3.5 print:w-3 print:h-3" />
                <span className="text-xs print:text-[10px]">체크아웃</span>
              </div>
              <p className="text-gray-800 text-xs print:text-[10px]">{hotel.checkOut}</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl p-3 print:p-2.5 flex items-center justify-center">
              <span className="text-sm print:text-xs">{hotel.nights}</span>
            </div>
          </div>

          {/* Room Type & Breakfast */}
          <div className="grid grid-cols-2 gap-3 print:gap-2.5 pt-2.5 print:pt-2 border-t border-gray-200">
            <div>
              <p className="text-gray-500 text-xs print:text-[10px] mb-1.5 print:mb-1">룸 형태</p>
              <p className="text-gray-800 text-sm print:text-xs">{hotel.roomType}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs print:text-[10px] mb-1.5 print:mb-1">조식 포함 여부</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-green-500" />
                <span className="text-green-600 text-sm print:text-xs">포함</span>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="pt-2.5 print:pt-2 border-t border-gray-200">
            <p className="text-gray-500 text-xs print:text-[10px] mb-2 print:mb-1.5">주요 부대시설</p>
            <div className="flex flex-wrap gap-1.5 print:gap-1">
              {hotel.facilities.map((facility, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 print:px-2.5 print:py-1 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 rounded-full text-xs print:text-[10px] border border-cyan-100"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>

          {/* Nearby Attractions */}
          <div className="pt-2.5 print:pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5 mb-2 print:mb-1.5">
              <MapPinned className="w-4 h-4 print:w-3.5 print:h-3.5 text-cyan-600" />
              <p className="text-gray-500 text-xs print:text-[10px]">주변 관광지</p>
            </div>
            <div className="grid grid-cols-3 gap-2 print:gap-1.5">
              {hotel.nearbyAttractions.map((attraction, i) => (
                <div
                  key={i}
                  className="px-3 py-2 print:px-2 print:py-1.5 bg-gradient-to-br from-yellow-50 to-orange-50 text-gray-700 rounded-lg text-xs print:text-[10px] border border-yellow-100 text-center"
                >
                  {attraction}
                </div>
              ))}
            </div>
          </div>

          {/* City Tax */}
          <div className="pt-2.5 print:pt-2 border-t border-gray-200">
            <p className="text-gray-500 text-xs print:text-[10px] mb-1">예상 도시세</p>
            <p className="text-gray-800 text-sm print:text-xs">{hotel.cityTax}</p>
          </div>
        </div>
      </div>
    </div>
  );
}