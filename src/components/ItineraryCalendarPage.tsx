import { Plane, Train, Car, Bus, Edit2, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { getWeeksBetween, formatDateKorean } from '../utils/date-parser';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StylePicker } from './StylePicker';
import { getStyleObject } from '../types/text-style';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';

interface Props {
  data: TourData;
  isEditMode?: boolean;
  onUpdate?: (data: Partial<TourData>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  pageId?: string;
  isBlurMode?: boolean;
  blurRegions?: BlurRegion[];
  onToggleBlurMode?: () => void;
  onAddBlurRegion?: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion?: (regionId: string) => void;
}

interface DayData {
  date: Date;
  dateNum: number;
  dayNum: number;
  isWithinTrip: boolean;
  tripData?: {
    country: string;
    city: string;
    transport: 'plane' | 'train' | 'car' | 'bus' | null;
  };
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: '파란색' },
  { value: 'bg-red-500', label: '빨간색' },
  { value: 'bg-green-500', label: '초록색' },
  { value: 'bg-yellow-500', label: '노란색' },
  { value: 'bg-purple-500', label: '보라색' },
  { value: 'bg-pink-500', label: '분홍색' },
  { value: 'bg-orange-500', label: '주황색' },
  { value: 'bg-cyan-500', label: '시안색' },
  { value: 'bg-indigo-500', label: '남색' },
  { value: 'bg-gray-500', label: '회색' },
];

export function ItineraryCalendarPage({ data, isEditMode, onUpdate, onDuplicate, onDelete, canDelete, pageId, isBlurMode, blurRegions, onToggleBlurMode, onAddBlurRegion, onRemoveBlurRegion }: Props) {
  const [editingDay, setEditingDay] = useState<DayData | null>(null);
  const [editCountry, setEditCountry] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editTransport, setEditTransport] = useState<'plane' | 'train' | 'car' | 'bus' | 'none'>('none');
  const [editCountryColor, setEditCountryColor] = useState('bg-blue-500');
  const [isHovered, setIsHovered] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const startEdit = (field: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField && onUpdate) {
      onUpdate({ [editingField]: tempValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const itinerary = data.itinerary || [];
  
  const getTransportIcon = (transport: string | null) => {
    switch (transport) {
      case 'plane':
        return <Plane className="w-3.5 h-3.5 print:w-3 print:h-3" />;
      case 'train':
        return <Train className="w-3.5 h-3.5 print:w-3 print:h-3" />;
      case 'car':
        return <Car className="w-3.5 h-3.5 print:w-3 print:h-3" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 print:w-3 print:h-3" />;
      default:
        return null;
    }
  };

  const getCountryBadgeColor = (country: string) => {
    return data.countryColors?.[country] || 'bg-gray-500';
  };

  // Check if dates are available
  if (!data.startDate || !data.endDate) {
    return (
      <div className="min-h-screen p-8 py-16 print:h-[297mm] print:py-10 print:px-12">
        <div className="max-w-5xl mx-auto space-y-6 print:space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-cyan-600 mb-[3px]">여행 일정</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
            <p className="text-gray-600 text-sm print:text-xs">여행소개 페이지에서 출발일과 도착일을 선택해주세요</p>
          </div>
        </div>
      </div>
    );
  }

  // 로컬 시간대로 날짜 파싱
  const startParts = data.startDate.split('-');
  const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  
  const endParts = data.endDate.split('-');
  const endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
  
  const totalDays = data.totalDays;
  
  // Get weeks from departure week to arrival week
  const weeks = getWeeksBetween(startDate, endDate);
  
  // Format date range for display
  const nightsDaysText = data.nights > 0 && data.days > 0 ? ` (${data.nights}박 ${data.days}일)` : '';
  const dateRangeText = `${formatDateKorean(startDate)} ~ ${formatDateKorean(endDate)}${nightsDaysText}`;

  // Calculate day number for a given date
  const getDayNum = (date: Date): number => {
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleDayClick = (day: DayData) => {
    if (!isEditMode || !onUpdate) return;
    
    setEditingDay(day);
    setEditCountry(day.tripData?.country || '');
    setEditCity(day.tripData?.city || '');
    setEditTransport(day.tripData?.transport || 'none');
    
    // Set color based on existing country or default
    if (day.tripData?.country && data.countryColors?.[day.tripData.country]) {
      setEditCountryColor(data.countryColors[day.tripData.country]);
    } else {
      setEditCountryColor('bg-blue-500');
    }
  };

  const handleDayClickWrapper = (e: React.MouseEvent, day: DayData) => {
    // StylePicker나 다른 버튼 클릭 시 날짜 편집 다이얼로그가 열리지 않도록
    // e.target이 button이거나 button 내부 요소인 경우 무시
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    handleDayClick(day);
  };

  const handleSave = () => {
    if (!editingDay || !onUpdate) return;

    const newItinerary = [...itinerary];
    const dateNum = editingDay.dateNum;
    const existingIndex = newItinerary.findIndex(
      item => item.date === dateNum
    );

    if (editCountry && editCity) {
      const newItem = {
        date: dateNum,
        country: editCountry,
        city: editCity,
        transport: editTransport === 'none' ? null : editTransport,
        dayNum: editingDay.dayNum,
      };

      if (existingIndex >= 0) {
        newItinerary[existingIndex] = newItem;
      } else {
        newItinerary.push(newItem);
      }

      // Update country color
      const newCountryColors = { ...data.countryColors };
      if (editCountry) {
        newCountryColors[editCountry] = editCountryColor;
      }

      onUpdate({
        itinerary: newItinerary,
        countryColors: newCountryColors,
      });
    }

    setEditingDay(null);
  };

  const handleDelete = () => {
    if (!editingDay || !onUpdate) return;

    const newItinerary = itinerary.filter(
      item => item.date !== editingDay.dateNum
    );

    onUpdate({ itinerary: newItinerary });
    setEditingDay(null);
  };

  // Get unique countries for legend - only from items that are actually displayed in current month/year
  const uniqueCountries = Array.from(new Set(
    itinerary
      .filter(item => {
        // Check if this item's date falls within the trip period
        const itemDate = new Date(startDate);
        itemDate.setDate(item.date);
        return itemDate.getMonth() === startDate.getMonth() && 
               itemDate.getFullYear() === startDate.getFullYear() &&
               itemDate >= startDate && itemDate <= endDate;
      })
      .map(item => item.country)
  ));

  return (
    <div 
      className="min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:py-10 print:px-12 relative blur-container"
      data-has-blur={blurRegions.length > 0 ? "true" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Controls */}
      {isEditMode && isHovered && onDuplicate && onDelete && (
        <div className="absolute top-4 right-4 print:hidden z-50 flex gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
          {onToggleBlurMode && (
            <button
              onClick={onToggleBlurMode}
              className={`p-2 rounded transition-colors ${
                isBlurMode
                  ? 'bg-purple-100 hover:bg-purple-200'
                  : 'hover:bg-purple-50'
              }`}
              title={isBlurMode ? '블러 모드 비활성화' : '블러 모드 활성화'}
            >
              {isBlurMode ? (
                <EyeOff className="w-4 h-4 text-purple-600" />
              ) : (
                <Eye className="w-4 h-4 text-purple-600" />
              )}
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="hover:bg-blue-50 touch-manipulation"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="hover:bg-red-50 touch-manipulation"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 print:space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-[3px]">
            <div data-blur-key="itineraryCalendarTitle">
              {isEditMode ? (
                editingField === 'itineraryCalendarTitle' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-2xl md:text-3xl font-semibold text-cyan-600 text-center bg-blue-50 px-4 py-2 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h1
                    className="text-2xl md:text-3xl font-semibold text-cyan-600 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded transition-colors"
                    style={getStyleObject(data.itineraryCalendarTitleStyle)}
                    onClick={() => startEdit('itineraryCalendarTitle', data.itineraryCalendarTitle)}
                  >
                    {data.itineraryCalendarTitle}
                  </h1>
                )
              ) : (
                <h1
                  className="text-2xl md:text-3xl font-semibold text-cyan-600"
                  style={getStyleObject(data.itineraryCalendarTitleStyle)}
                >
                  {data.itineraryCalendarTitle}
                </h1>
              )}
            </div>
            {isEditMode && editingField !== 'itineraryCalendarTitle' && (
              <StylePicker
                currentStyle={data.itineraryCalendarTitleStyle}
                onStyleChange={(style) => onUpdate?.({ itineraryCalendarTitleStyle: style })}
                fieldKey="itineraryCalendarTitle"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
          <div className="w-20 md:w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-3 md:mb-4" />
          <div className="flex items-center justify-center gap-2">
            <div data-blur-key="itineraryCalendarDateRange">
              {isEditMode ? (
                editingField === 'itineraryCalendarDateRange' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-gray-600 text-sm print:text-xs bg-blue-50 px-4 py-2 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p
                    className="text-gray-600 text-sm print:text-xs cursor-pointer hover:bg-blue-50 px-4 py-2 rounded transition-colors"
                    style={getStyleObject(data.itineraryCalendarDateRangeStyle)}
                    onClick={() => startEdit('itineraryCalendarDateRange', data.itineraryCalendarDateRange)}
                  >
                    {dateRangeText}
                  </p>
                )
              ) : (
                <p
                  className="text-gray-600 text-sm print:text-xs"
                  style={getStyleObject(data.itineraryCalendarDateRangeStyle)}
                >
                  {dateRangeText}
                </p>
              )}
            </div>
            {isEditMode && editingField !== 'itineraryCalendarDateRange' && (
              <StylePicker
                currentStyle={data.itineraryCalendarDateRangeStyle}
                onStyleChange={(style) => onUpdate?.({ itineraryCalendarDateRangeStyle: style })}
                fieldKey="itineraryCalendarDateRange"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
          {isEditMode && (
            <div className="flex items-center justify-center gap-2">
              <p 
                className="text-cyan-600 text-xs"
                style={getStyleObject(data.itineraryCalendarHelpTextStyle)}
              >
                날짜를 클릭하여 일정을 추가/수정하세요
              </p>
              <StylePicker
                currentStyle={data.itineraryCalendarHelpTextStyle}
                onStyleChange={(style) => onUpdate?.({ itineraryCalendarHelpTextStyle: style })}
                fieldKey="itineraryCalendarHelpText"
                backgroundColorClass="bg-white"
              />
            </div>
          )}
        </div>

        {/* Legend - Mobile only (shown above the list) */}
        <div className="grid grid-cols-1 gap-3 md:hidden print:hidden">
          {/* Transport Legend */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100 print:break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <div data-blur-key="itineraryTransportTitle">
                {isEditMode ? (
                  editingField === 'itineraryTransportTitle' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="text-gray-700 text-sm bg-yellow-100 px-2 py-1 rounded border border-yellow-300 focus:outline-none focus:border-yellow-500 w-full"
                    />
                  ) : (
                    <p
                      className="text-gray-700 text-sm cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded transition-colors"
                      style={getStyleObject(data.itineraryTransportTitleStyle)}
                      onClick={() => startEdit('itineraryTransportTitle', data.itineraryTransportTitle)}
                    >
                      {data.itineraryTransportTitle}
                    </p>
                  )
                ) : (
                  <p
                    className="text-gray-700 text-sm"
                    style={getStyleObject(data.itineraryTransportTitleStyle)}
                  >
                    {data.itineraryTransportTitle}
                  </p>
                )}
              </div>
              {isEditMode && editingField !== 'itineraryTransportTitle' && (
                <StylePicker
                  currentStyle={data.itineraryTransportTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ itineraryTransportTitleStyle: style })}
                  fieldKey="itineraryTransportTitle"
                  backgroundColorClass="bg-yellow-50"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Plane className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1">
                  <span 
                    className="text-xs text-gray-700"
                    style={getStyleObject(data.itineraryTransportLabelStyle)}
                  >
                    비행기
                  </span>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.itineraryTransportLabelStyle}
                      onStyleChange={(style) => onUpdate?.({ itineraryTransportLabelStyle: style })}
                      fieldKey="itineraryTransportLabel"
                      backgroundColorClass="bg-yellow-50"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Train className="w-3.5 h-3.5" />
                </div>
                <span 
                  className="text-xs text-gray-700"
                  style={getStyleObject(data.itineraryTransportLabelStyle)}
                >
                  기차
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <span 
                  className="text-xs text-gray-700"
                  style={getStyleObject(data.itineraryTransportLabelStyle)}
                >
                  렌터카
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bus className="w-3.5 h-3.5" />
                </div>
                <span 
                  className="text-xs text-gray-700"
                  style={getStyleObject(data.itineraryTransportLabelStyle)}
                >
                  버스
                </span>
              </div>
            </div>
          </div>

          {/* Country Legend */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
            <div className="flex items-center gap-2 mb-2">
              <div data-blur-key="itineraryCountryTitle">
                {isEditMode ? (
                  editingField === 'itineraryCountryTitle' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="text-gray-700 text-sm bg-cyan-100 px-2 py-1 rounded border border-cyan-300 focus:outline-none focus:border-cyan-500 w-full"
                    />
                  ) : (
                    <p
                      className="text-gray-700 text-sm cursor-pointer hover:bg-cyan-100 px-2 py-1 rounded transition-colors"
                      style={getStyleObject(data.itineraryCountryTitleStyle)}
                      onClick={() => startEdit('itineraryCountryTitle', data.itineraryCountryTitle)}
                    >
                      {data.itineraryCountryTitle}
                    </p>
                  )
                ) : (
                  <p
                    className="text-gray-700 text-sm"
                    style={getStyleObject(data.itineraryCountryTitleStyle)}
                  >
                    {data.itineraryCountryTitle}
                  </p>
                )}
              </div>
              {isEditMode && editingField !== 'itineraryCountryTitle' && (
                <StylePicker
                  currentStyle={data.itineraryCountryTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ itineraryCountryTitleStyle: style })}
                  fieldKey="itineraryCountryTitle"
                  backgroundColorClass="bg-cyan-50"
                />
              )}
            </div>
            <div className="space-y-2">
              {uniqueCountries.length > 0 ? (
                uniqueCountries.map((country, idx) => (
                  <div key={country} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getCountryBadgeColor(country)}`} />
                    <div className="flex items-center gap-1">
                      <div data-blur-key={`itineraryCountryLabel-${country}`}>
                        <span
                          className="text-xs text-gray-700"
                          style={getStyleObject(data.itineraryCountryLabelStyle)}
                        >
                          {country}
                        </span>
                      </div>
                      {idx === 0 && isEditMode && (
                        <StylePicker
                          currentStyle={data.itineraryCountryLabelStyle}
                          onStyleChange={(style) => onUpdate?.({ itineraryCountryLabelStyle: style })}
                          fieldKey="itineraryCountryLabel"
                          backgroundColorClass="bg-cyan-50"
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <p 
                    className="text-xs text-gray-400"
                    style={getStyleObject(data.itineraryCountryEmptyStyle)}
                  >
                    일정을 추가해주세요
                  </p>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.itineraryCountryEmptyStyle}
                      onStyleChange={(style) => onUpdate?.({ itineraryCountryEmptyStyle: style })}
                      fieldKey="itineraryCountryEmpty"
                      backgroundColorClass="bg-cyan-50"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile List View - Only visible on mobile */}
        <div className="md:hidden print:hidden space-y-2">
          {(() => {
            const tripDays: DayData[] = [];
            
            weeks.forEach((week) => {
              for (let i = 0; i < 7; i++) {
                const currentDate = new Date(week.start);
                currentDate.setDate(week.start.getDate() + i);
                
                const dateNum = currentDate.getDate();
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();
                
                const isWithinTrip = currentDate >= startDate && currentDate <= endDate;
                
                if (isWithinTrip) {
                  const tripDay = itinerary.find(day => {
                    return day.date === dateNum && 
                           month === startDate.getMonth() &&
                           year === startDate.getFullYear();
                  });
                  
                  const dayNum = getDayNum(currentDate);
                  
                  tripDays.push({
                    date: currentDate,
                    dateNum,
                    dayNum,
                    isWithinTrip,
                    tripData: tripDay ? {
                      country: tripDay.country,
                      city: tripDay.city,
                      transport: tripDay.transport,
                    } : undefined,
                  });
                }
              }
            });

            return tripDays.map((day, index) => {
              const hasData = !!day.tripData;
              
              return (
                <div
                  key={index}
                  onClick={() => isEditMode ? handleDayClick(day) : null}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    hasData
                      ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md'
                      : 'border-cyan-200 bg-cyan-25'
                  } ${isEditMode ? 'cursor-pointer hover:border-cyan-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-cyan-500 font-medium">
                        D{day.dayNum}
                      </span>
                      <p className="text-lg font-semibold text-cyan-700">
                        {day.date.getMonth() + 1}월 {day.dateNum}일
                      </p>
                    </div>
                    {day.tripData?.transport && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center shadow-md">
                        {getTransportIcon(day.tripData.transport)}
                      </div>
                    )}
                  </div>
                  
                  {hasData && day.tripData ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCountryBadgeColor(day.tripData.country)}`} />
                        <span className="text-sm font-medium text-gray-700">
                          {day.tripData.country}
                        </span>
                      </div>
                      <p className="text-base text-gray-800 pl-5">
                        {day.tripData.city}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 pl-5">
                      {isEditMode ? '탭하여 일정 추가' : '일정 없음'}
                    </p>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Desktop Calendar View - Hidden on mobile */}
        <div data-blur-key="itineraryCalendarGrid" className="hidden md:block print:block bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 print:p-4 shadow-xl border border-cyan-100 print:break-inside-avoid">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2 print:gap-1.5">
            {/* Weekday Headers */}
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div
                key={day}
                className={`text-center py-2 print:py-1.5 text-xs print:text-[10px] ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {isEditMode ? (
                  <div className="flex items-center justify-center gap-1">
                    <span style={getStyleObject(data.itineraryCalendarWeekdayStyle)}>
                      {day}
                    </span>
                    {i === 0 && (
                      <StylePicker
                        currentStyle={data.itineraryCalendarWeekdayStyle}
                        onStyleChange={(style) => onUpdate?.({ itineraryCalendarWeekdayStyle: style })}
                        fieldKey="itineraryCalendarWeekday"
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                ) : (
                  <span style={getStyleObject(data.itineraryCalendarWeekdayStyle)}>
                    {day}
                  </span>
                )}
              </div>
            ))}

            {/* Calendar Days */}
            {(() => {
              const allDays: DayData[] = [];
              
              // Generate all days from all weeks
              weeks.forEach((week) => {
                for (let i = 0; i < 7; i++) {
                  const currentDate = new Date(week.start);
                  currentDate.setDate(week.start.getDate() + i);
                  
                  const dateNum = currentDate.getDate();
                  const month = currentDate.getMonth();
                  const year = currentDate.getFullYear();
                  
                  // Check if this date is within the trip period
                  const isWithinTrip = currentDate >= startDate && currentDate <= endDate;
                  
                  // Find trip data for this date
                  const tripDay = itinerary.find(day => {
                    return day.date === dateNum && 
                           month === startDate.getMonth() &&
                           year === startDate.getFullYear();
                  });
                  
                  // Calculate day number if within trip
                  const dayNum = isWithinTrip ? getDayNum(currentDate) : 0;
                  
                  allDays.push({
                    date: currentDate,
                    dateNum,
                    dayNum,
                    isWithinTrip,
                    tripData: tripDay ? {
                      country: tripDay.country,
                      city: tripDay.city,
                      transport: tripDay.transport,
                    } : undefined,
                  });
                }
              });

              let firstDateRendered = false;
              let firstDayLabelRendered = false;
              let firstCountryRendered = false;
              let firstCityRendered = false;

              return allDays.map((day, index) => {
                const isWeekend = index % 7 === 0 || index % 7 === 6;
                const isCurrentMonth = day.date.getMonth() === startDate.getMonth();
                const hasData = !!day.tripData;
                
                const showDateStylePicker = isEditMode && day.isWithinTrip && !firstDateRendered;
                if (showDateStylePicker) firstDateRendered = true;
                
                const showDayLabelStylePicker = isEditMode && day.isWithinTrip && !firstDayLabelRendered;
                if (showDayLabelStylePicker) firstDayLabelRendered = true;
                
                const showCountryStylePicker = isEditMode && hasData && !firstCountryRendered;
                if (showCountryStylePicker) firstCountryRendered = true;
                
                const showCityStylePicker = isEditMode && hasData && !firstCityRendered;
                if (showCityStylePicker) firstCityRendered = true;
                
                return (
                  <div
                    key={index}
                    onClick={(e) => handleDayClickWrapper(e, day)}
                    className={`aspect-square rounded-xl border-2 transition-all ${
                      hasData
                        ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md hover:shadow-lg'
                        : day.isWithinTrip
                        ? 'border-cyan-200 bg-cyan-25'
                        : 'border-gray-100 bg-gray-50'
                    } ${isEditMode && day.isWithinTrip ? 'cursor-pointer hover:border-cyan-500' : ''}`}
                  >
                    <div className="h-full flex flex-col p-2 print:p-1.5">
                      {/* Date Number */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-0.5">
                          <span
                            className={`text-sm print:text-xs ${
                              day.isWithinTrip
                                ? 'text-cyan-700'
                                : !isCurrentMonth
                                ? 'text-gray-300'
                                : isWeekend
                                ? index % 7 === 0
                                  ? 'text-red-400'
                                  : 'text-blue-400'
                                : 'text-gray-600'
                            }`}
                            style={getStyleObject(data.itineraryCalendarDateNumberStyle)}
                          >
                            {day.dateNum}
                          </span>
                          {showDateStylePicker && (
                            <StylePicker
                              currentStyle={data.itineraryCalendarDateNumberStyle}
                              onStyleChange={(style) => onUpdate?.({ itineraryCalendarDateNumberStyle: style })}
                              fieldKey="itineraryCalendarDateNumber"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </div>
                        {day.isWithinTrip && (
                          <div className="flex items-center gap-0.5">
                            <span 
                              className="text-[9px] print:text-[8px] bg-cyan-500 text-white px-1.5 py-0.5 rounded-full"
                              style={getStyleObject(data.itineraryCalendarDayLabelStyle)}
                            >
                              D{day.dayNum}
                            </span>
                            {showDayLabelStylePicker && (
                              <StylePicker
                                currentStyle={data.itineraryCalendarDayLabelStyle}
                                onStyleChange={(style) => onUpdate?.({ itineraryCalendarDayLabelStyle: style })}
                                fieldKey="itineraryCalendarDayLabel"
                                backgroundColorClass="bg-white"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Trip Info */}
                      {hasData && day.tripData && (
                        <div className="flex-1 flex flex-col">
                          {/* Country Badge */}
                          <div className="flex items-center gap-1 mb-1">
                            <div className={`w-2 h-2 print:w-1.5 print:h-1.5 rounded-full ${getCountryBadgeColor(day.tripData.country)}`} />
                            <div className="flex items-center gap-0.5">
                              <span 
                                className="text-[9px] print:text-[7px] text-gray-600 truncate"
                                style={getStyleObject(data.itineraryCalendarCountryNameStyle)}
                              >
                                {day.tripData.country}
                              </span>
                              {showCountryStylePicker && (
                                <StylePicker
                                  currentStyle={data.itineraryCalendarCountryNameStyle}
                                  onStyleChange={(style) => onUpdate?.({ itineraryCalendarCountryNameStyle: style })}
                                  fieldKey="itineraryCalendarCountryName"
                                  backgroundColorClass="bg-white"
                                />
                              )}
                            </div>
                          </div>

                          {/* City */}
                          <div className="flex items-center gap-0.5 mb-1">
                            <p 
                              className="text-[10px] print:text-[8px] text-gray-800 line-clamp-2 leading-tight"
                              style={getStyleObject(data.itineraryCalendarCityNameStyle)}
                            >
                              {day.tripData.city}
                            </p>
                            {showCityStylePicker && (
                              <StylePicker
                                currentStyle={data.itineraryCalendarCityNameStyle}
                                onStyleChange={(style) => onUpdate?.({ itineraryCalendarCityNameStyle: style })}
                                fieldKey="itineraryCalendarCityName"
                                backgroundColorClass="bg-white"
                              />
                            )}
                          </div>

                          {/* Transport Icon - always reserve space */}
                          <div className="flex-1 flex items-end justify-end">
                            {day.tripData.transport && (
                              <div className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center shadow-sm">
                                {getTransportIcon(day.tripData.transport)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Legend - Stack on mobile, side by side on desktop */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 print:gap-3 print:grid">
          {/* Transport Legend */}
          <div data-blur-key="itineraryTransportLegend" className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl md:rounded-2xl p-4 md:p-5 print:p-4 border border-yellow-100 print:break-inside-avoid">
            <div className="flex items-center gap-2 mb-2 md:mb-3 print:mb-2">
              {isEditMode ? (
                editingField === 'itineraryTransportTitle' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-gray-700 text-sm bg-yellow-100 px-2 py-1 rounded border border-yellow-300 focus:outline-none focus:border-yellow-500 w-full"
                  />
                ) : (
                  <>
                    <p 
                      className="text-gray-700 text-sm cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded transition-colors"
                      style={getStyleObject(data.itineraryTransportTitleStyle)}
                      onClick={() => startEdit('itineraryTransportTitle', data.itineraryTransportTitle)}
                    >
                      {data.itineraryTransportTitle}
                    </p>
                    <StylePicker
                      currentStyle={data.itineraryTransportTitleStyle}
                      onStyleChange={(style) => onUpdate?.({ itineraryTransportTitleStyle: style })}
                      fieldKey="itineraryTransportTitle"
                      backgroundColorClass="bg-yellow-50"
                    />
                  </>
                )
              ) : (
                <p 
                  className="text-gray-700 text-sm print:text-xs"
                  style={getStyleObject(data.itineraryTransportTitleStyle)}
                >
                  {data.itineraryTransportTitle}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 print:gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 print:w-6 print:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Plane className="w-3.5 h-3.5 print:w-3 print:h-3" />
                </div>
                <div className="flex items-center gap-1">
                  <span 
                    className="text-xs print:text-[10px] text-gray-700"
                    style={getStyleObject(data.itineraryTransportLabelStyle)}
                  >
                    비행기
                  </span>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.itineraryTransportLabelStyle}
                      onStyleChange={(style) => onUpdate?.({ itineraryTransportLabelStyle: style })}
                      fieldKey="itineraryTransportLabel"
                      backgroundColorClass="bg-yellow-50"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 print:w-6 print:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Train className="w-3.5 h-3.5 print:w-3 print:h-3" />
                </div>
                <span 
                  className="text-xs print:text-[10px] text-gray-700"
                  style={getStyleObject(data.itineraryTransportLabelStyle)}
                >
                  기차
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 print:w-6 print:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Car className="w-3.5 h-3.5 print:w-3 print:h-3" />
                </div>
                <span 
                  className="text-xs print:text-[10px] text-gray-700"
                  style={getStyleObject(data.itineraryTransportLabelStyle)}
                >
                  렌터카
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 print:w-6 print:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bus className="w-3.5 h-3.5 print:w-3 print:h-3" />
                </div>
                <span 
                  className="text-xs print:text-[10px] text-gray-700"
                  style={getStyleObject(data.itineraryTransportLabelStyle)}
                >
                  버스
                </span>
              </div>
            </div>
          </div>

          {/* Country Legend */}
          <div data-blur-key="itineraryCountryLegend" className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-5 print:p-4 border border-cyan-100 print:break-inside-avoid">
            <div className="flex items-center gap-2 mb-2 md:mb-3 print:mb-2">
              {isEditMode ? (
                editingField === 'itineraryCountryTitle' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-gray-700 text-sm bg-cyan-100 px-2 py-1 rounded border border-cyan-300 focus:outline-none focus:border-cyan-500 w-full"
                  />
                ) : (
                  <>
                    <p 
                      className="text-gray-700 text-sm cursor-pointer hover:bg-cyan-100 px-2 py-1 rounded transition-colors"
                      style={getStyleObject(data.itineraryCountryTitleStyle)}
                      onClick={() => startEdit('itineraryCountryTitle', data.itineraryCountryTitle)}
                    >
                      {data.itineraryCountryTitle}
                    </p>
                    <StylePicker
                      currentStyle={data.itineraryCountryTitleStyle}
                      onStyleChange={(style) => onUpdate?.({ itineraryCountryTitleStyle: style })}
                      fieldKey="itineraryCountryTitle"
                      backgroundColorClass="bg-cyan-50"
                    />
                  </>
                )
              ) : (
                <p 
                  className="text-gray-700 text-sm print:text-xs"
                  style={getStyleObject(data.itineraryCountryTitleStyle)}
                >
                  {data.itineraryCountryTitle}
                </p>
              )}
            </div>
            <div className="space-y-2 print:space-y-1.5">
              {uniqueCountries.length > 0 ? (
                uniqueCountries.map((country, idx) => (
                  <div key={country} className="flex items-center gap-2">
                    <div className={`w-3 h-3 print:w-2.5 print:h-2.5 rounded-full flex-shrink-0 ${getCountryBadgeColor(country)}`} />
                    <div className="flex items-center gap-1">
                      <span 
                        className="text-xs print:text-[10px] text-gray-700"
                        style={getStyleObject(data.itineraryCountryLabelStyle)}
                      >
                        {country}
                      </span>
                      {idx === 0 && isEditMode && (
                        <StylePicker
                          currentStyle={data.itineraryCountryLabelStyle}
                          onStyleChange={(style) => onUpdate?.({ itineraryCountryLabelStyle: style })}
                          fieldKey="itineraryCountryLabel"
                          backgroundColorClass="bg-cyan-50"
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <p 
                    className="text-xs text-gray-400"
                    style={getStyleObject(data.itineraryCountryEmptyStyle)}
                  >
                    일정을 추가해주세요
                  </p>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.itineraryCountryEmptyStyle}
                      onStyleChange={(style) => onUpdate?.({ itineraryCountryEmptyStyle: style })}
                      fieldKey="itineraryCountryEmpty"
                      backgroundColorClass="bg-cyan-50"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDay} onOpenChange={(open) => !open && setEditingDay(null)}>
        <DialogContent className="print:hidden">
          <DialogHeader>
            <DialogTitle>
              일정 {editingDay?.tripData ? '수정' : '추가'} - D{editingDay?.dayNum} ({editingDay?.dateNum}일)
            </DialogTitle>
            <DialogDescription>
              여행 일정을 추가하거나 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="country">국가</Label>
              <Input
                id="country"
                value={editCountry}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setEditCountry(newCountry);
                  // Auto-select existing country color if available
                  if (newCountry && data.countryColors?.[newCountry]) {
                    setEditCountryColor(data.countryColors[newCountry]);
                  }
                }}
                placeholder="예: 프랑스"
              />
            </div>

            <div>
              <Label htmlFor="city">도시</Label>
              <Input
                id="city"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="예: 파리"
              />
            </div>

            <div>
              <Label htmlFor="color">국가 색상</Label>
              <Select value={editCountryColor} onValueChange={setEditCountryColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transport">이동수단</Label>
              <Select value={editTransport} onValueChange={(value: any) => setEditTransport(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  <SelectItem value="plane">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      비행기
                    </div>
                  </SelectItem>
                  <SelectItem value="train">
                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4" />
                      기차
                    </div>
                  </SelectItem>
                  <SelectItem value="car">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      렌터카
                    </div>
                  </SelectItem>
                  <SelectItem value="bus">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4" />
                      버스
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            {editingDay?.tripData && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditingDay(null)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blur Overlay */}
      {onAddBlurRegion && onRemoveBlurRegion && (
        <BlurOverlay
          pageId={pageId}
          blurRegions={blurRegions}
          isBlurMode={isBlurMode}
          isEditMode={isEditMode}
          onAddBlurRegion={onAddBlurRegion}
          onRemoveBlurRegion={onRemoveBlurRegion}
        />
      )}
    </div>
  );
}