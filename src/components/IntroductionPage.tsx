import { Users, Heart, Calendar, Star, CheckCircle2, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { getStyleObject } from '../types/text-style';
import { StylePicker } from './StylePicker';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { ko } from 'date-fns/locale';
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

export function IntroductionPage({ 
  data, 
  isEditMode, 
  onUpdate, 
  onDuplicate, 
  onDelete, 
  canDelete,
  pageId = '',
  isBlurMode = false,
  blurRegions = [],
  onToggleBlurMode,
  onAddBlurRegion,
  onRemoveBlurRegion
}: Props) {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      // 로컬 시간대 기준으로 날짜 문자열 생성
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const isoString = `${year}-${month}-${day}`;
      
      onUpdate?.({ startDate: isoString });
      setIsStartDateOpen(false);
      
      // Auto-calculate total days if both dates are set
      if (data.endDate) {
        const endParts = data.endDate.split('-');
        const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
        const diffTime = Math.abs(end.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        onUpdate?.({ startDate: isoString, totalDays: diffDays });
      }
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      // 로컬 시간대 기준으로 날짜 문자열 생성
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const isoString = `${year}-${month}-${day}`;
      
      onUpdate?.({ endDate: isoString });
      setIsEndDateOpen(false);
      
      // Auto-calculate total days if both dates are set
      if (data.startDate) {
        const startParts = data.startDate.split('-');
        const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
        const diffTime = Math.abs(date.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        onUpdate?.({ endDate: isoString, totalDays: diffDays });
      }
    }
  };

  const formatDateKorean = (dateString: string) => {
    // YYYY-MM-DD 형식의 문자열을 로컬 시간대로 파싱
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
  };

  const getPeriodDisplay = () => {
    if (!data.startDate || !data.endDate) {
      return '날짜를 선택해주세요';
    }
    const nightsDaysText = data.nights > 0 && data.days > 0 ? ` (${data.nights}박 ${data.days}일)` : '';
    return `${formatDateKorean(data.startDate)} - ${formatDateKorean(data.endDate)}${nightsDaysText}`;
  };

  const travelInfo = [
    { 
      icon: Users, 
      label: data.travelPartyLabel, 
      value: data.travelParty, 
      field: 'travelParty' as const, 
      labelField: 'travelPartyLabel' as const,
      labelStyle: data.travelPartyLabelStyle,
      valueStyle: data.travelPartyStyle
    },
    { 
      icon: Heart, 
      label: data.travelThemeLabel, 
      value: data.travelTheme, 
      field: 'travelTheme' as const, 
      labelField: 'travelThemeLabel' as const,
      labelStyle: data.travelThemeLabelStyle,
      valueStyle: data.travelThemeStyle
    },
  ];

  const highlights = data.highlights
    .split('\n')
    .filter(line => line.trim() !== '');

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
          <button
            onClick={onDuplicate}
            className="p-2 hover:bg-blue-50 rounded transition-colors"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
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

      <div className="max-w-3xl mx-auto space-y-10 print:space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-[3px]">
            <div data-blur-key="introductionTitle">
              {isEditMode ? (
                <h1
                  className="text-3xl font-semibold text-cyan-600"
                  style={getStyleObject(data.introductionTitleStyle)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate?.({ introductionTitle: e.currentTarget.textContent || '' })}
                >
                  {data.introductionTitle}
                </h1>
              ) : (
                <h1
                  className="text-3xl font-semibold text-cyan-600"
                  style={getStyleObject(data.introductionTitleStyle)}
                >
                  {data.introductionTitle}
                </h1>
              )}
            </div>
            {isEditMode && (
              <StylePicker
                currentStyle={data.introductionTitleStyle}
                onStyleChange={(style) => onUpdate?.({ introductionTitleStyle: style })}
                fieldKey="introductionTitle"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          <div className="flex items-center justify-center gap-2">
            <div data-blur-key="introductionSubtitle">
              {isEditMode ? (
                <p
                  className="text-gray-600"
                  style={getStyleObject(data.introductionSubtitleStyle)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate?.({ introductionSubtitle: e.currentTarget.textContent || '' })}
                >
                  {data.introductionSubtitle}
                </p>
              ) : (
                <p
                  className="text-gray-600"
                  style={getStyleObject(data.introductionSubtitleStyle)}
                >
                  {data.introductionSubtitle}
                </p>
              )}
            </div>
            {isEditMode && (
              <StylePicker
                currentStyle={data.introductionSubtitleStyle}
                onStyleChange={(style) => onUpdate?.({ introductionSubtitleStyle: style })}
                fieldKey="introductionSubtitle"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
        </div>

        {/* Travel Info Cards */}
        <div className="space-y-4">
          {travelInfo.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md border border-cyan-100 hover:shadow-lg transition-shadow print:break-inside-avoid"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  {/* Editable Label */}
                  <div className="flex items-center gap-2 mb-1">
                    <div data-blur-key={item.labelField}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => onUpdate?.({ [item.labelField]: e.target.value })}
                          style={getStyleObject(item.labelStyle)}
                          className="text-gray-500 text-base w-full bg-blue-50 px-2 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p style={getStyleObject(item.labelStyle)} className="text-gray-500 text-base font-bold text-[20px]">
                          {item.label}
                        </p>
                      )}
                    </div>
                    {isEditMode && (
                      <StylePicker
                        currentStyle={item.labelStyle}
                        onStyleChange={(style) => onUpdate?.({ [`${item.labelField}Style`]: style })}
                        fieldKey={item.labelField}
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                  
                  {/* Editable Value */}
                  <div className="flex items-center gap-2">
                    <div data-blur-key={item.field}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => onUpdate?.({ [item.field]: e.target.value })}
                          style={getStyleObject(item.valueStyle)}
                          className="w-full text-gray-800 text-lg bg-white border-2 border-cyan-300 rounded-lg px-3 py-1 focus:outline-none focus:border-cyan-500"
                        />
                      ) : (
                        <p style={getStyleObject(item.valueStyle)} className="text-gray-800 text-lg text-[16px]">
                          {item.value}
                        </p>
                      )}
                    </div>
                    {isEditMode && (
                      <StylePicker
                        currentStyle={item.valueStyle}
                        onStyleChange={(style) => onUpdate?.({ [`${item.field}Style`]: style })}
                        fieldKey={item.field}
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Travel Period Card with Date Pickers */}
          <div data-blur-key="travelPeriodCard" className="bg-white rounded-2xl p-6 shadow-md border border-cyan-100 hover:shadow-lg transition-shadow print:break-inside-avoid">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                {/* Editable Label */}
                <div className="flex items-center gap-2 mb-1">
                  <div data-blur-key="travelPeriodLabel">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={data.travelPeriodLabel}
                        onChange={(e) => onUpdate?.({ travelPeriodLabel: e.target.value })}
                        style={getStyleObject(data.travelPeriodLabelStyle)}
                        className="text-gray-500 text-base w-full bg-blue-50 px-2 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p style={getStyleObject(data.travelPeriodLabelStyle)} className="text-gray-500 text-base font-bold text-[20px]">
                        {data.travelPeriodLabel}
                      </p>
                    )}
                  </div>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.travelPeriodLabelStyle}
                      onStyleChange={(style) => onUpdate?.({ travelPeriodLabelStyle: style })}
                      fieldKey="travelPeriodLabel"
                      backgroundColorClass="bg-white"
                    />
                  )}
                </div>
                {isEditMode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="text-left border-cyan-300 hover:border-cyan-500">
                            출발일: {data.startDate ? formatDateKorean(data.startDate) : '선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={data.startDate ? (() => {
                              const parts = data.startDate.split('-');
                              return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                            })() : undefined}
                            onSelect={handleStartDateChange}
                            locale={ko}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <span className="text-gray-400">~</span>
                      
                      <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="text-left border-cyan-300 hover:border-cyan-500">
                            도착일: {data.endDate ? formatDateKorean(data.endDate) : '선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={data.endDate ? (() => {
                              const parts = data.endDate.split('-');
                              return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                            })() : undefined}
                            onSelect={handleEndDateChange}
                            locale={ko}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <span className="text-gray-400">|</span>
                      
                      <Select
                        value={data.nights.toString()}
                        onValueChange={(value) => onUpdate?.({ nights: parseInt(value) })}
                      >
                        <SelectTrigger className="w-[100px] border-cyan-300 hover:border-cyan-500">
                          <SelectValue placeholder="박" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Array.from({ length: 100 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}박
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={data.days.toString()}
                        onValueChange={(value) => onUpdate?.({ days: parseInt(value) })}
                      >
                        <SelectTrigger className="w-[100px] border-cyan-300 hover:border-cyan-500">
                          <SelectValue placeholder="일" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Array.from({ length: 100 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}일
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div data-blur-key="periodDisplay">
                        <p
                          className="text-gray-600 text-lg"
                          style={getStyleObject(data.periodDisplayStyle)}
                        >
                          {getPeriodDisplay()}
                        </p>
                      </div>
                      <StylePicker
                        currentStyle={data.periodDisplayStyle || { size: '16px', weight: 'normal', color: '#6B7280' }}
                        onStyleChange={(style) => onUpdate({ periodDisplayStyle: style })}
                        fieldKey="periodDisplay"
                        backgroundColorClass="bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div data-blur-key="periodDisplay">
                    <p
                      className="text-gray-800 text-lg text-[16px]"
                      style={getStyleObject(data.periodDisplayStyle)}
                    >
                      {getPeriodDisplay()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Important Request */}
        <div data-blur-key="importantRequestCard" className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-md border border-yellow-200 print:break-inside-avoid">
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              {/* Editable Label */}
              <div className="flex items-center gap-2 mb-2">
                <div data-blur-key="importantRequestsLabel">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={data.importantRequestsLabel}
                      onChange={(e) => onUpdate?.({ importantRequestsLabel: e.target.value })}
                      style={getStyleObject(data.importantRequestsLabelStyle)}
                      className="text-gray-700 w-full bg-yellow-100 px-2 py-1 rounded border border-yellow-300 focus:outline-none focus:border-yellow-500"
                    />
                  ) : (
                    <p style={getStyleObject(data.importantRequestsLabelStyle)} className="text-gray-700 font-bold text-[20px]">
                      {data.importantRequestsLabel}
                    </p>
                  )}
                </div>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data.importantRequestsLabelStyle}
                    onStyleChange={(style) => onUpdate?.({ importantRequestsLabelStyle: style })}
                    fieldKey="importantRequestsLabel"
                    backgroundColorClass="bg-yellow-50"
                  />
                )}
              </div>
              <div className="flex items-start gap-2">
                <div data-blur-key="specialRequests">
                  {isEditMode ? (
                    <textarea
                      value={data.specialRequests}
                      onChange={(e) => onUpdate?.({ specialRequests: e.target.value })}
                      style={getStyleObject(data.specialRequestsStyle)}
                      className="w-full text-gray-800 bg-white border-2 border-yellow-300 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 min-h-[80px] resize-y"
                    />
                  ) : (
                    <p style={getStyleObject(data.specialRequestsStyle)} className="text-gray-800 text-[15px]">
                      {data.specialRequests}
                    </p>
                  )}
                </div>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data.specialRequestsStyle}
                    onStyleChange={(style) => onUpdate?.({ specialRequestsStyle: style })}
                    fieldKey="specialRequests"
                    backgroundColorClass="bg-yellow-50"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Highlights */}
        <div data-blur-key="tripHighlightsCard" className="bg-white rounded-2xl p-8 shadow-lg border border-cyan-100 print:break-inside-avoid">
          {/* Editable Title with Heart Icon */}
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-cyan-600" />
            <div data-blur-key="highlightsTitle">
              {isEditMode ? (
                <input
                  type="text"
                  value={data.highlightsTitle}
                  onChange={(e) => onUpdate?.({ highlightsTitle: e.target.value })}
                  style={getStyleObject(data.highlightsTitleStyle)}
                  className="flex-1 bg-cyan-50 px-2 py-1 rounded border border-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <h3 style={getStyleObject(data.highlightsTitleStyle)} className="text-cyan-600 font-bold text-[20px]">
                  {data.highlightsTitle}
                </h3>
              )}
            </div>
            {isEditMode && (
              <StylePicker
                currentStyle={data.highlightsTitleStyle}
                onStyleChange={(style) => onUpdate?.({ highlightsTitleStyle: style })}
                fieldKey="highlightsTitle"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
          {isEditMode ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">각 줄마다 하나의 포인트가 됩니다 (엔터로 구분)</p>
                <StylePicker
                  currentStyle={data.highlightsStyle}
                  onStyleChange={(style) => onUpdate?.({ highlightsStyle: style })}
                  fieldKey="highlights"
                  backgroundColorClass="bg-white"
                />
              </div>
              <textarea
                value={data.highlights}
                onChange={(e) => onUpdate?.({ highlights: e.target.value })}
                style={getStyleObject(data.highlightsStyle)}
                className="w-full text-gray-700 bg-white border-2 border-cyan-300 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 min-h-[150px] resize-y"
                placeholder="각 줄마다 하나의 포인트를 입력하세요"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div data-blur-key="highlights">
                    <p style={getStyleObject(data.highlightsStyle)} className="text-gray-700 text-[15px]">
                      {highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}