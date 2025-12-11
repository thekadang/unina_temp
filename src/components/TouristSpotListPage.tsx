import { MapPin, Plus, Trash2, Copy, Eye, EyeOff, Info, Activity, Clock, X, Calendar, Image as ImageIcon } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StylePicker } from './StylePicker';
import { getStyleObject } from '../types/text-style';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { ko } from 'date-fns/locale';

interface Props {
  data: TourData;
  dayNumber: number;
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

export function TouristSpotListPage({ data, dayNumber, isEditMode, onUpdate, onDuplicate, onDelete, canDelete = true, pageId, isBlurMode, blurRegions, onToggleBlurMode, onAddBlurRegion, onRemoveBlurRegion }: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('default');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Find the schedule for the current day
  const daySchedule = data.touristSpots?.find(s => s.day === dayNumber) || {
    day: dayNumber,
    title: `DAY ${dayNumber}`,
    colorTheme: 'pink' as const,
    scheduleItems: []
  };

  // 색상 테마 정의
  const colorThemes = {
    pink: {
      border: 'border-pink-200',
      borderHover: 'hover:border-pink-300',
      icon: 'text-pink-600',
      title: 'text-pink-600',
      gradient: 'from-pink-400 to-pink-500',
      badge: 'bg-pink-500',
      line: 'bg-pink-200',
      cardBorder: 'border-pink-100'
    },
    blue: {
      border: 'border-blue-200',
      borderHover: 'hover:border-blue-300',
      icon: 'text-blue-600',
      title: 'text-blue-600',
      gradient: 'from-blue-400 to-blue-500',
      badge: 'bg-blue-500',
      line: 'bg-blue-200',
      cardBorder: 'border-blue-100'
    },
    green: {
      border: 'border-green-200',
      borderHover: 'hover:border-green-300',
      icon: 'text-green-600',
      title: 'text-green-600',
      gradient: 'from-green-400 to-green-500',
      badge: 'bg-green-500',
      line: 'bg-green-200',
      cardBorder: 'border-green-100'
    },
    purple: {
      border: 'border-purple-200',
      borderHover: 'hover:border-purple-300',
      icon: 'text-purple-600',
      title: 'text-purple-600',
      gradient: 'from-purple-400 to-purple-500',
      badge: 'bg-purple-500',
      line: 'bg-purple-200',
      cardBorder: 'border-purple-100'
    },
    orange: {
      border: 'border-orange-200',
      borderHover: 'hover:border-orange-300',
      icon: 'text-orange-600',
      title: 'text-orange-600',
      gradient: 'from-orange-400 to-orange-500',
      badge: 'bg-orange-500',
      line: 'bg-orange-200',
      cardBorder: 'border-orange-100'
    },
    teal: {
      border: 'border-teal-200',
      borderHover: 'hover:border-teal-300',
      icon: 'text-teal-600',
      title: 'text-teal-600',
      gradient: 'from-teal-400 to-teal-500',
      badge: 'bg-teal-500',
      line: 'bg-teal-200',
      cardBorder: 'border-teal-100'
    }
  };

  const currentTheme = colorThemes[daySchedule.colorTheme || 'pink'];

  // Get date to display (custom or auto-calculated)
  let currentDate: Date;
  let dateStr: string;
  
  if (daySchedule.customDate) {
    // Use custom date if set
    const customParts = daySchedule.customDate.split('-');
    currentDate = new Date(parseInt(customParts[0]), parseInt(customParts[1]) - 1, parseInt(customParts[2]));
    dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`;
  } else {
    // Auto-calculate from start date (로컬 시간대로 파싱)
    const startParts = data.startDate.split('-');
    const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
    currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayNumber - 1);
    dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`;
  }
  
  // Handler for custom date change
  const handleCustomDateChange = (date: Date | undefined) => {
    if (date && onUpdate) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const customDate = `${year}-${month}-${day}`;
      
      const newSpots = (data.touristSpots || []).map(s =>
        s.day === dayNumber ? { ...s, customDate } : s
      );
      
      onUpdate({ touristSpots: newSpots });
      setIsDatePickerOpen(false);
    }
  };
  
  // Handler to reset to auto-calculated date
  const resetToAutoDate = () => {
    if (onUpdate) {
      const newSpots = (data.touristSpots || []).map(s =>
        s.day === dayNumber ? { ...s, customDate: undefined } : s
      );
      
      onUpdate({ touristSpots: newSpots });
    }
  };

  const startEdit = (field: string, value: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(value || '');
  };

  const saveEdit = () => {
    if (!editingField || !onUpdate) return;

    const [type, ...rest] = editingField.split('-');
    
    if (type === 'pickTitle') {
      onUpdate({ touristSpotPickTitle: tempValue });
    } else if (type === 'dayTitle') {
      const newSchedules = (data.touristSpots || []).map(s =>
        s.day === dayNumber ? { ...s, title: tempValue } : s
      );
      onUpdate({ touristSpots: newSchedules });
    } else if (type === 'item') {
      // rest = ['1', '1', 'title'] for 'item-1-1-title'
      // itemId should be '1-1', field should be 'title'
      const field = rest[rest.length - 1];
      const itemId = rest.slice(0, -1).join('-');
      const newSchedules = (data.touristSpots || []).map(s => {
        if (s.day === dayNumber) {
          return {
            ...s,
            scheduleItems: s.scheduleItems.map(item =>
              item.id === itemId ? { ...item, [field]: tempValue } : item
            )
          };
        }
        return s;
      });
      onUpdate({ touristSpots: newSchedules });
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
      e.preventDefault();
      cancelEdit();
    }
  };

  const addScheduleItem = () => {
    if (!onUpdate) return;
    
    const newItem = {
      id: `${dayNumber}-${daySchedule.scheduleItems.length + 1}`,
      time: '09:00',
      title: '새 관광지',
      location: '위치 입력',
      activity: '활동 입력',
      notes: '메모 입력'
    };

    const existingSchedules = data.touristSpots || [];
    const newSchedules = existingSchedules.some(s => s.day === dayNumber)
      ? existingSchedules.map(s =>
          s.day === dayNumber
            ? { ...s, scheduleItems: [...s.scheduleItems, newItem] }
            : s
        )
      : [...existingSchedules, { day: dayNumber, title: daySchedule.title, colorTheme: daySchedule.colorTheme, scheduleItems: [newItem] }];

    onUpdate({ touristSpots: newSchedules.sort((a, b) => a.day - b.day) });
  };

  const deleteScheduleItem = (itemId: string) => {
    if (!onUpdate) return;
    
    const newSchedules = (data.touristSpots || []).map(s =>
      s.day === dayNumber
        ? { ...s, scheduleItems: s.scheduleItems.filter(item => item.id !== itemId) }
        : s
    );
    
    onUpdate({ touristSpots: newSchedules });
  };

  const updateImageUrl = (itemId: string, url: string) => {
    if (!onUpdate) return;
    
    const newSchedules = (data.touristSpots || []).map(s => {
      if (s.day === dayNumber) {
        return {
          ...s,
          scheduleItems: s.scheduleItems.map(item =>
            item.id === itemId ? { ...item, imageUrl: url } : item
          )
        };
      }
      return s;
    });
    
    onUpdate({ touristSpots: newSchedules });
  };

  return (
    <div 
      className="relative min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:py-10 print:px-12 bg-white print:bg-white blur-container"
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
          <button
            onClick={onDuplicate}
            className="p-2 hover:bg-blue-50 rounded transition-colors"
            title="페이지 복제"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="페이지 삭제"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center relative">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="absolute flex gap-2 print:hidden" style={{ top: '45px', right: '0', left: 'auto' }}>
              {/* Color Theme Selector */}
              <div className="flex gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                {(Object.keys(colorThemes) as Array<keyof typeof colorThemes>).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      const newSchedules = (data.touristSpots || []).map(s =>
                        s.day === dayNumber ? { ...s, colorTheme: theme } : s
                      );
                      onUpdate?.({ touristSpots: newSchedules });
                    }}
                    className={`w-6 h-6 rounded-md transition-all ${
                      daySchedule.colorTheme === theme || (!daySchedule.colorTheme && theme === 'pink')
                        ? 'ring-2 ring-offset-1 ring-gray-400'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      background: theme === 'pink' ? 'linear-gradient(to right, #f472b6, #ec4899)' :
                                theme === 'blue' ? 'linear-gradient(to right, #60a5fa, #3b82f6)' :
                                theme === 'green' ? 'linear-gradient(to right, #4ade80, #22c55e)' :
                                theme === 'purple' ? 'linear-gradient(to right, #c084fc, #a855f7)' :
                                theme === 'orange' ? 'linear-gradient(to right, #fb923c, #f97316)' :
                                'linear-gradient(to right, #2dd4bf, #14b8a6)'
                    }}
                    title={`${theme} 테마`}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div data-blur-key="touristSpotListTitle" className="w-full">
            <div className="flex items-center justify-center gap-2 mb-[3px]">
              {isEditMode && editingField === 'dayTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-2xl print:text-xl bg-transparent border-b-2 border-cyan-400 focus:outline-none text-center px-4"
                />
              ) : (
                <h1
                  className={`text-3xl font-semibold text-cyan-600 ${
                    isEditMode ? 'cursor-pointer hover:bg-gray-100 px-4 py-1 rounded transition-colors' : ''
                  }`}
                  style={getStyleObject(data.detailedScheduleDayTitleStyle)}
                  onClick={() => startEdit('dayTitle', daySchedule.title)}
                >
                  관광지 픽 DAY{dayNumber}
                </h1>
              )}
              {isEditMode && (
                <StylePicker
                  currentStyle={data.detailedScheduleDayTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ detailedScheduleDayTitleStyle: style })}
                  fieldKey="detailedScheduleDayTitle"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-8 print:mb-6">
            <p
              data-blur-key="detailedScheduleDate"
              className="text-sm print:text-xs text-gray-500"
              style={getStyleObject(data.detailedScheduleDateStyle)}
            >
              {dateStr} (DAY {dayNumber})
              {daySchedule.customDate && isEditMode && (
                <span className="text-xs text-cyan-600 ml-1">(수정됨)</span>
              )}
            </p>
            {isEditMode && (
              <>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 hover:bg-cyan-50"
                      title="날짜 수정"
                    >
                      <Calendar className="w-3 h-3 text-cyan-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={currentDate}
                      onSelect={handleCustomDateChange}
                      locale={ko}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {daySchedule.customDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToAutoDate}
                    className="h-6 px-2 hover:bg-yellow-50 text-xs"
                    title="자동 날짜로 되돌리기"
                  >
                    <X className="w-3 h-3 text-yellow-600" />
                  </Button>
                )}
                <StylePicker
                  currentStyle={data.detailedScheduleDateStyle}
                  onStyleChange={(style) => onUpdate?.({ detailedScheduleDateStyle: style })}
                  fieldKey="detailedScheduleDate"
                  backgroundColorClass="bg-white"
                />
              </>
            )}
          </div>
        </div>

        <div>
            <div className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-2 mb-4 print:mb-3">
                {isEditMode ? (
                  editingField === 'pickTitle' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className={`${currentTheme.title} text-xl print:text-lg bg-blue-50 px-3 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500`}
                    />
                  ) : (
                    <>
                      <h2 
                        className={`${currentTheme.title} text-xl print:text-lg cursor-pointer hover:bg-blue-50 px-3 py-1 rounded transition-colors`}
                        style={getStyleObject(data.detailedSchedulePickTitleStyle)}
                        onClick={() => startEdit('pickTitle', data.touristSpotPickTitle || "TODAY'S PICK")}
                      >
                        {data.touristSpotPickTitle || "TODAY'S PICK"}
                      </h2>
                      <StylePicker
                        currentStyle={data.detailedSchedulePickTitleStyle}
                        onStyleChange={(style) => onUpdate?.({ detailedSchedulePickTitleStyle: style })}
                        fieldKey="detailedSchedulePickTitle"
                        backgroundColorClass="bg-white"
                      />
                    </>
                  )
                ) : (
                  <h2
                    data-blur-key="touristSpotPickTitle"
                    className={`${currentTheme.title} text-xl print:text-lg`}
                    style={getStyleObject(data.detailedSchedulePickTitleStyle)}
                  >
                    {data.touristSpotPickTitle || "TODAY'S PICK"}
                  </h2>
                )}
              </div>

              {daySchedule.scheduleItems.map((item, index) => (
                <div
                  key={item.id}
                  data-blur-key={`touristSpotCard-${dayNumber}-${item.id}`}
                  className={`bg-white rounded-2xl p-5 print:p-4 shadow-lg border-2 ${currentTheme.cardBorder} ${currentTheme.borderHover} transition-all print:break-inside-avoid`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${currentTheme.gradient} text-white rounded-xl px-4 py-2 print:py-1.5 mb-4 print:mb-3`}>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm print:text-xs"
                        style={getStyleObject(data.detailedScheduleCardNumberStyle)}
                      >
                        {index + 1}.
                      </span>
                      {index === 0 && isEditMode && (
                        <StylePicker
                          currentStyle={data.detailedScheduleCardNumberStyle}
                          onStyleChange={(style) => onUpdate?.({ detailedScheduleCardNumberStyle: style })}
                          fieldKey="detailedScheduleCardNumber"
                          backgroundColorClass="bg-pink-500"
                        />
                      )}
                      {isEditMode && editingField === `item-${item.id}-title` ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className="flex-1 bg-transparent border-b border-white/50 focus:outline-none text-sm print:text-xs"
                        />
                      ) : (
                        <h3
                          data-blur-key={`touristSpot-${dayNumber}-${item.id}-title`}
                          className={`text-sm print:text-xs flex-1 ${
                            isEditMode ? 'cursor-pointer hover:bg-white/20 px-2 py-1 rounded transition-colors' : ''
                          }`}
                          style={getStyleObject(data.detailedScheduleCardTitleStyle)}
                          onClick={() => {
                            if (isEditMode) {
                              startEdit(`item-${item.id}-title`, item.title);
                            }
                          }}
                        >
                          {item.title}
                        </h3>
                      )}
                      {index === 0 && isEditMode && (
                        <StylePicker
                          currentStyle={data.detailedScheduleCardTitleStyle}
                          onStyleChange={(style) => onUpdate?.({ detailedScheduleCardTitleStyle: style })}
                          fieldKey="detailedScheduleCardTitle"
                          backgroundColorClass="bg-pink-500"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 print:gap-3">
                    {/* Details */}
                    <div className="flex-1 space-y-3 print:space-y-2">
                      {/* Location */}
                      <div className="flex items-start gap-2">
                        <MapPin className={`w-4 h-4 print:w-3.5 print:h-3.5 ${currentTheme.icon} flex-shrink-0 mt-0.5`} />
                        {isEditMode && editingField === `item-${item.id}-location` ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            autoFocus
                            className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none text-xs print:text-[10px]"
                          />
                        ) : (
                          <p
                            data-blur-key={`touristSpot-${dayNumber}-${item.id}-location`}
                            className={`text-xs print:text-[10px] text-gray-700 flex-1 ${
                              isEditMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors' : ''
                            }`}
                            style={getStyleObject(data.detailedScheduleCardLocationStyle)}
                            onClick={() => {
                              if (isEditMode) {
                                startEdit(`item-${item.id}-location`, item.location);
                              }
                            }}
                          >
                            {item.location}
                          </p>
                        )}
                        {index === 0 && isEditMode && (
                          <StylePicker
                            currentStyle={data.detailedScheduleCardLocationStyle}
                            onStyleChange={(style) => onUpdate?.({ detailedScheduleCardLocationStyle: style })}
                            fieldKey="detailedScheduleCardLocation"
                            backgroundColorClass="bg-white"
                          />
                        )}
                      </div>

                      {/* Time */}
                      <div className="flex items-start gap-2">
                        <Clock className={`w-4 h-4 print:w-3.5 print:h-3.5 ${currentTheme.icon} flex-shrink-0 mt-0.5`} />
                        {isEditMode && editingField === `item-${item.id}-time` ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            autoFocus
                            className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none text-xs print:text-[10px]"
                          />
                        ) : (
                          <p
                            data-blur-key={`touristSpot-${dayNumber}-${item.id}-time`}
                            className={`text-xs print:text-[10px] text-gray-700 flex-1 ${
                              isEditMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors' : ''
                            }`}
                            style={getStyleObject(data.detailedScheduleCardTimeTextStyle)}
                            onClick={() => {
                              if (isEditMode) {
                                startEdit(`item-${item.id}-time`, item.time);
                              }
                            }}
                          >
                            {item.time}
                          </p>
                        )}
                        {index === 0 && isEditMode && (
                          <StylePicker
                            currentStyle={data.detailedScheduleCardTimeTextStyle}
                            onStyleChange={(style) => onUpdate?.({ detailedScheduleCardTimeTextStyle: style })}
                            fieldKey="detailedScheduleCardTimeText"
                            backgroundColorClass="bg-white"
                          />
                        )}
                      </div>

                      {/* Activity */}
                      <div className="flex items-start gap-2">
                        <Activity className={`w-4 h-4 print:w-3.5 print:h-3.5 ${currentTheme.icon} flex-shrink-0 mt-0.5`} />
                        {isEditMode && editingField === `item-${item.id}-activity` ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            autoFocus
                            className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none text-xs print:text-[10px]"
                          />
                        ) : (
                          <p
                            data-blur-key={`touristSpot-${dayNumber}-${item.id}-activity`}
                            className={`text-xs print:text-[10px] text-gray-700 flex-1 ${
                              isEditMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors' : ''
                            }`}
                            style={getStyleObject(data.detailedScheduleCardActivityStyle)}
                            onClick={() => {
                              if (isEditMode) {
                                startEdit(`item-${item.id}-activity`, item.activity);
                              }
                            }}
                          >
                            {item.activity}
                          </p>
                        )}
                        {index === 0 && isEditMode && (
                          <StylePicker
                            currentStyle={data.detailedScheduleCardActivityStyle}
                            onStyleChange={(style) => onUpdate?.({ detailedScheduleCardActivityStyle: style })}
                            fieldKey="detailedScheduleCardActivity"
                            backgroundColorClass="bg-white"
                          />
                        )}
                      </div>

                      {/* Notes */}
                      <div className="flex items-start gap-2">
                        <Info className={`w-4 h-4 print:w-3.5 print:h-3.5 ${currentTheme.icon} flex-shrink-0 mt-0.5`} />
                        {isEditMode && editingField === `item-${item.id}-notes` ? (
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={saveEdit}
                            autoFocus
                            className="flex-1 bg-transparent border border-gray-300 rounded p-1 focus:outline-none text-xs print:text-[10px] resize-none"
                            rows={2}
                          />
                        ) : (
                          <p
                            data-blur-key={`touristSpot-${dayNumber}-${item.id}-notes`}
                            className={`text-xs print:text-[10px] text-gray-600 flex-1 ${
                              isEditMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors' : ''
                            }`}
                            style={getStyleObject(data.detailedScheduleCardNotesStyle)}
                            onClick={() => {
                              if (isEditMode) {
                                startEdit(`item-${item.id}-notes`, item.notes);
                              }
                            }}
                          >
                            {item.notes}
                          </p>
                        )}
                        {index === 0 && isEditMode && (
                          <StylePicker
                            currentStyle={data.detailedScheduleCardNotesStyle}
                            onStyleChange={(style) => onUpdate?.({ detailedScheduleCardNotesStyle: style })}
                            fieldKey="detailedScheduleCardNotes"
                            backgroundColorClass="bg-white"
                          />
                        )}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-24 h-24 print:w-20 print:h-20 flex-shrink-0">
                      {item.imageUrl ? (
                        <div 
                          className={`relative group w-full h-full ${!isEditMode ? 'cursor-pointer' : ''}`}
                          onClick={() => !isEditMode && setViewingImage(item.imageUrl)}
                        >
                          <ImageWithFallback
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {isEditMode && (
                            <button
                              onClick={() => updateImageUrl(item.id, '')}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        isEditMode && (
                          <div
                            className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => {
                              const url = prompt('이미지 URL을 입력하세요:');
                              if (url) updateImageUrl(item.id, url);
                            }}
                          >
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Edit/Delete buttons */}
                  {isEditMode && (
                    <div className="mt-4 print:mt-3 pt-4 print:pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => deleteScheduleItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs print:text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 print:w-3 print:h-3" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add button */}
              {isEditMode && (
                <button
                  onClick={addScheduleItem}
                  className="w-full bg-white rounded-2xl p-4 print:p-3 shadow-lg border-2 border-pink-200 hover:border-pink-400 text-pink-600 hover:text-pink-700 hover:bg-pink-50 text-sm print:text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5 print:w-4 print:h-4" />
                  관광지 추가
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center print:hidden"
          onClick={() => setViewingImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <div 
            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={viewingImage}
              alt="일정 이미지"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}