import { Plane, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { useState } from 'react';
import { Button } from './ui/button';
import { StylePicker } from './StylePicker';
import { getStyleObject } from '../types/text-style';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';

interface Props {
  data: TourData;
  isEditMode: boolean;
  onUpdate: (updated: Partial<TourData>) => void;
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

export function FlightDeparturePage({ 
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
  const flight = data.flights.departure;
  const [editData, setEditData] = useState(flight);
  const [originalSegment, setOriginalSegment] = useState(flight.segments[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const startEdit = (field: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField) {
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

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...editData, [field]: value };
    setEditData(updated);
    onUpdate({
      flights: {
        ...data.flights,
        departure: updated
      }
    });
  };

  const handleSegmentUpdate = (index: number, field: string, value: any) => {
    const newSegments = [...editData.segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    handleUpdate('segments', newSegments);
  };

  const toggleDirect = (isDirect: boolean) => {
    if (isDirect) {
      if (editData.segments.length >= 2) {
        const lastSegment = editData.segments[editData.segments.length - 1];
        const restoredSegment = {
          ...originalSegment,
          arrivalTime: lastSegment.arrivalTime,
          arrivalAirport: lastSegment.arrivalAirport
        };
        const newData = {
          ...editData,
          isDirect: true,
          segments: [restoredSegment],
          transitTime: undefined
        };
        setEditData(newData);
        onUpdate({
          flights: {
            ...data.flights,
            departure: newData
          }
        });
      }
    } else {
      if (editData.segments.length === 1) {
        setOriginalSegment(editData.segments[0]);
        const updatedFirst = { ...editData.segments[0], arrivalAirport: '경유 공항', arrivalTime: '' };
        const newData = {
          ...editData,
          isDirect: false,
          segments: [
            updatedFirst,
            {
              airline: editData.segments[0].airline,
              class: editData.segments[0].class,
              departureTime: '',
              departureAirport: '경유 공항',
              arrivalTime: editData.segments[0].arrivalTime,
              arrivalAirport: editData.segments[0].arrivalAirport,
              services: editData.segments[0].services || ''
            }
          ]
        };
        setEditData(newData);
        onUpdate({
          flights: {
            ...data.flights,
            departure: newData
          }
        });
      }
    }
  };

  const addSegment = () => {
    const lastSegment = editData.segments[editData.segments.length - 1];
    const newSegment = {
      airline: lastSegment.airline,
      class: lastSegment.class,
      departureTime: '',
      departureAirport: '경유 공항',
      arrivalTime: lastSegment.arrivalTime,
      arrivalAirport: lastSegment.arrivalAirport,
      services: lastSegment.services || ''
    };
    
    // 마지막 구간의 도착지를 경유 공항으로 변경
    const updatedSegments = [...editData.segments];
    updatedSegments[updatedSegments.length - 1] = {
      ...lastSegment,
      arrivalAirport: '경유 공항',
      arrivalTime: ''
    };
    
    handleUpdate('segments', [...updatedSegments, newSegment]);
  };

  const segmentCount = flight.segments.length;
  const hasMultipleSegments = segmentCount > 2;

  return (
    <div 
      className={`min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:min-h-0 print:py-10 print:px-12 relative blur-container`}
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
            className="hover:bg-blue-50"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
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
      
      <div className={`max-w-5xl mx-auto ${hasMultipleSegments ? 'space-y-6 print:space-y-4' : 'space-y-10 print:space-y-8'}`}>
        {/* Header */}
        <div className="text-center print:break-inside-avoid">
          <div className="flex items-center justify-center gap-2 mb-[3px]">
            {isEditMode ? (
              editingField === 'flightDepartureTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-3xl font-semibold text-cyan-600 text-center bg-blue-50 px-4 py-2 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <>
                  <h1 
                    className="text-3xl font-semibold text-cyan-600 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded transition-colors"
                    style={getStyleObject(data.flightDepartureTitleStyle)}
                    onClick={() => startEdit('flightDepartureTitle', data.flightDepartureTitle)}
                  >
                    {data.flightDepartureTitle}
                  </h1>
                  <StylePicker
                    currentStyle={data.flightDepartureTitleStyle}
                    onStyleChange={(style) => onUpdate({ flightDepartureTitleStyle: style })}
                    fieldKey="flightDepartureTitle"
                    backgroundColorClass="bg-white"
                  />
                </>
              )
            ) : (
              <h1 
                className="text-3xl font-semibold text-cyan-600"
                style={getStyleObject(data.flightDepartureTitleStyle)}
              >
                {data.flightDepartureTitle}
              </h1>
            )}
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          {/* Editable Description */}
          <div className="flex items-center justify-center gap-2">
            {isEditMode ? (
              editingField === 'flightDepartureDescription' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-gray-600 pt-4 w-full max-w-2xl mx-auto bg-blue-50 px-4 py-2 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <>
                  <p 
                    className="text-gray-600 pt-4 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded transition-colors inline-block"
                    style={getStyleObject(data.flightDepartureDescriptionStyle)}
                    onClick={() => startEdit('flightDepartureDescription', data.flightDepartureDescription)}
                  >
                    {data.flightDepartureDescription}
                  </p>
                  <StylePicker
                    currentStyle={data.flightDepartureDescriptionStyle}
                    onStyleChange={(style) => onUpdate({ flightDepartureDescriptionStyle: style })}
                    fieldKey="flightDepartureDescription"
                    backgroundColorClass="bg-white"
                  />
                </>
              )
            ) : (
              <p 
                className="text-gray-600 pt-4"
                style={getStyleObject(data.flightDepartureDescriptionStyle)}
              >
                {data.flightDepartureDescription}
              </p>
            )}
          </div>
        </div>

        {/* Flight Type Toggle */}
        {isEditMode && (
          <div className="flex justify-center gap-4 print:hidden">
            <div className="flex items-center gap-4 bg-white rounded-full shadow-lg px-6 py-3 border border-cyan-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={editData.isDirect}
                  onChange={() => toggleDirect(true)}
                  className="w-4 h-4 text-cyan-600"
                />
                <span className="text-gray-700">{data.flightDepartureDirectLabel}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!editData.isDirect}
                  onChange={() => toggleDirect(false)}
                  className="w-4 h-4 text-cyan-600"
                />
                <span className="text-gray-700">{data.flightDepartureConnectingLabel}</span>
              </label>
            </div>
            
            {!editData.isDirect && (
              <button
                onClick={addSegment}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{data.flightDepartureAddSegmentLabel}</span>
              </button>
            )}
          </div>
        )}

        {/* Flight Segments */}
        <div className={`grid gap-4 ${!flight.isDirect && flight.segments.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'} ${hasMultipleSegments ? 'print:gap-3' : ''}`}>
          {flight.segments.map((segment, index) => (
            <div key={index} className={`bg-white rounded-2xl p-4 shadow-lg border border-cyan-100 print:break-inside-avoid ${flight.isDirect ? 'max-w-2xl mx-auto w-full' : ''} ${hasMultipleSegments ? 'print:p-3' : 'p-6'}`}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg text-white">
                  <Plane className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {isEditMode ? (
                    editingField === `flightDepartureSegmentTitle-${index}` ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className="text-cyan-700 font-bold text-[20px] bg-cyan-50 px-2 py-1 rounded border border-cyan-300 focus:outline-none focus:border-cyan-500 flex-1"
                      />
                    ) : (
                      <>
                        <h3 
                          className="text-cyan-700 font-bold text-[20px] cursor-pointer hover:bg-cyan-50 px-2 py-1 rounded transition-colors"
                          style={getStyleObject(data.flightDepartureSegmentTitleStyle)}
                          onClick={() => startEdit(`flightDepartureSegmentTitle-${index}`, !flight.isDirect && flight.segments.length >= 2 ? `${index + 1}구간` : data.flightDepartureSegmentTitle)}
                        >
                          {!flight.isDirect && flight.segments.length >= 2 ? `${index + 1}구간` : data.flightDepartureSegmentTitle}
                        </h3>
                        {index === 0 && (
                          <StylePicker
                            currentStyle={data.flightDepartureSegmentTitleStyle}
                            onStyleChange={(style) => onUpdate({ flightDepartureSegmentTitleStyle: style })}
                            fieldKey="flightDepartureSegmentTitle"
                            backgroundColorClass="bg-white"
                          />
                        )}
                      </>
                    )
                  ) : (
                    <h3 
                      className="text-cyan-700 font-bold text-[20px]"
                      style={getStyleObject(data.flightDepartureSegmentTitleStyle)}
                    >
                      {!flight.isDirect && flight.segments.length >= 2 ? `${index + 1}구간` : data.flightDepartureSegmentTitle}
                    </h3>
                  )}
                </div>
              </div>

              <div className={hasMultipleSegments ? 'space-y-3' : 'space-y-4'}>
                {/* Airline */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isEditMode ? (
                      editingField === `flightDepartureAirlineLabel-${index}` ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className="text-gray-500 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      ) : (
                        <>
                          <p 
                            className="text-gray-500 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                            style={getStyleObject(data.flightDepartureLabelStyle)}
                            onClick={() => startEdit(`flightDepartureAirlineLabel-${index}`, data.flightDepartureAirlineLabel)}
                          >
                            {data.flightDepartureAirlineLabel}
                          </p>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightDepartureLabelStyle}
                              onStyleChange={(style) => onUpdate({ flightDepartureLabelStyle: style })}
                              fieldKey="flightDepartureLabel"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <p 
                        className="text-gray-500 text-sm"
                        style={getStyleObject(data.flightDepartureLabelStyle)}
                      >
                        {data.flightDepartureAirlineLabel}
                      </p>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.segments[index]?.airline || ''}
                        onChange={(e) => handleSegmentUpdate(index, 'airline', e.target.value)}
                        className="flex-1 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                        placeholder="대한항공"
                      />
                      <input
                        type="text"
                        value={editData.segments[index]?.class || ''}
                        onChange={(e) => handleSegmentUpdate(index, 'class', e.target.value)}
                        className="w-28 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                        placeholder="비즈니스"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p 
                        className="text-gray-800"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                      >
                        {segment.airline} ({segment.class}석)
                      </p>
                      {isEditMode && (
                        <StylePicker
                          currentStyle={data.flightDepartureDataStyle}
                          onStyleChange={(style) => onUpdate({ flightDepartureDataStyle: style })}
                          fieldKey="flightDepartureData"
                          backgroundColorClass="bg-white"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Departure */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isEditMode ? (
                      editingField === `flightDepartureDepartureLabel-${index}` ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className="text-gray-500 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      ) : (
                        <>
                          <p 
                            className="text-gray-500 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                            style={getStyleObject(data.flightDepartureLabelStyle)}
                            onClick={() => startEdit(`flightDepartureDepartureLabel-${index}`, data.flightDepartureDepartureLabel)}
                          >
                            {data.flightDepartureDepartureLabel}
                          </p>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightDepartureLabelStyle}
                              onStyleChange={(style) => onUpdate({ flightDepartureLabelStyle: style })}
                              fieldKey="flightDepartureLabel"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <p 
                        className="text-gray-500 text-sm"
                        style={getStyleObject(data.flightDepartureLabelStyle)}
                      >
                        {data.flightDepartureDepartureLabel}
                      </p>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editData.segments[index]?.departureTime || ''}
                          onChange={(e) => handleSegmentUpdate(index, 'departureTime', e.target.value)}
                          className="flex-1 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          style={getStyleObject(data.flightDepartureDataStyle)}
                          placeholder="2026.08.05 10:00"
                        />
                        <StylePicker
                          currentStyle={data.flightDepartureDataStyle}
                          onStyleChange={(style) => onUpdate({ flightDepartureDataStyle: style })}
                          fieldKey="flightDepartureData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editData.segments[index]?.departureAirport || ''}
                          onChange={(e) => handleSegmentUpdate(index, 'departureAirport', e.target.value)}
                          className="flex-1 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          style={getStyleObject(data.flightDepartureDataStyle)}
                          placeholder={index === 0 ? '인천국제공항' : '경유 공항'}
                        />
                        <StylePicker
                          currentStyle={data.flightDepartureDataStyle}
                          onStyleChange={(style) => onUpdate({ flightDepartureDataStyle: style })}
                          fieldKey="flightDepartureData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p 
                        className="text-gray-800"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                      >
                        {segment.departureTime}
                      </p>
                      <p 
                        className="text-gray-600 text-sm"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                      >
                        {segment.departureAirport}
                      </p>
                    </>
                  )}
                </div>

                {/* Arrow - Only for direct flights */}
                {flight.isDirect && (
                  <div className="flex items-center justify-center py-2 gap-2">
                    <div className="flex-1 border-t-2 border-dashed border-cyan-300" />
                    <div className="flex items-center gap-2">
                      {isEditMode ? (
                        editingField === 'flightDepartureDirectBadge' ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            autoFocus
                            className="text-sm px-4 py-1 bg-cyan-50 rounded-full text-cyan-600 border border-cyan-300 focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <>
                            <span 
                              className="text-sm px-4 py-1 bg-cyan-50 rounded-full text-cyan-600 whitespace-nowrap cursor-pointer hover:bg-cyan-100 transition-colors"
                              style={getStyleObject(data.flightDepartureDirectBadgeStyle)}
                              onClick={() => startEdit('flightDepartureDirectBadge', data.flightDepartureDirectBadge)}
                            >
                              {data.flightDepartureDirectBadge}
                            </span>
                            <StylePicker
                              currentStyle={data.flightDepartureDirectBadgeStyle}
                              onStyleChange={(style) => onUpdate({ flightDepartureDirectBadgeStyle: style })}
                              fieldKey="flightDepartureDirectBadge"
                              backgroundColorClass="bg-cyan-50"
                            />
                          </>
                        )
                      ) : (
                        <span 
                          className="text-sm px-4 py-1 bg-cyan-50 rounded-full text-cyan-600 whitespace-nowrap"
                          style={getStyleObject(data.flightDepartureDirectBadgeStyle)}
                        >
                          {data.flightDepartureDirectBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-cyan-300" />
                  </div>
                )}

                {/* Arrival */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isEditMode ? (
                      editingField === `flightDepartureArrivalLabel-${index}` ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className="text-gray-500 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      ) : (
                        <>
                          <p 
                            className="text-gray-500 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                            style={getStyleObject(data.flightDepartureLabelStyle)}
                            onClick={() => startEdit(`flightDepartureArrivalLabel-${index}`, data.flightDepartureArrivalLabel)}
                          >
                            {data.flightDepartureArrivalLabel}
                          </p>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightDepartureLabelStyle}
                              onStyleChange={(style) => onUpdate({ flightDepartureLabelStyle: style })}
                              fieldKey="flightDepartureLabel"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <p 
                        className="text-gray-500 text-sm"
                        style={getStyleObject(data.flightDepartureLabelStyle)}
                      >
                        {data.flightDepartureArrivalLabel}
                      </p>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editData.segments[index]?.arrivalTime || ''}
                          onChange={(e) => handleSegmentUpdate(index, 'arrivalTime', e.target.value)}
                          className="flex-1 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          style={getStyleObject(data.flightDepartureDataStyle)}
                          placeholder="2026.08.05 14:00"
                        />
                        <StylePicker
                          currentStyle={data.flightDepartureDataStyle}
                          onStyleChange={(style) => onUpdate({ flightDepartureDataStyle: style })}
                          fieldKey="flightDepartureData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editData.segments[index]?.arrivalAirport || ''}
                          onChange={(e) => handleSegmentUpdate(index, 'arrivalAirport', e.target.value)}
                          className="flex-1 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          style={getStyleObject(data.flightDepartureDataStyle)}
                          placeholder={index === flight.segments.length - 1 ? '니스국제공항' : '경유 공항'}
                        />
                        <StylePicker
                          currentStyle={data.flightDepartureDataStyle}
                          onStyleChange={(style) => onUpdate({ flightDepartureDataStyle: style })}
                          fieldKey="flightDepartureData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p 
                        className="text-gray-800"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                      >
                        {segment.arrivalTime}
                      </p>
                      <p 
                        className="text-gray-600 text-sm"
                        style={getStyleObject(data.flightDepartureDataStyle)}
                      >
                        {segment.arrivalAirport}
                      </p>
                    </>
                  )}
                </div>

                {/* Services */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditMode ? (
                      editingField === `flightDepartureServicesTitle-${index}` ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className={`text-gray-700 ${hasMultipleSegments ? 'text-sm' : ''} bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500`}
                        />
                      ) : (
                        <>
                          <h3 
                            className={`text-gray-700 ${hasMultipleSegments ? 'text-sm' : ''} cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors`}
                            style={getStyleObject(data.flightDepartureServicesTitleStyle)}
                            onClick={() => startEdit(`flightDepartureServicesTitle-${index}`, data.flightDepartureServicesTitle)}
                          >
                            {data.flightDepartureServicesTitle}
                          </h3>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightDepartureServicesTitleStyle}
                              onStyleChange={(style) => onUpdate({ flightDepartureServicesTitleStyle: style })}
                              fieldKey="flightDepartureServicesTitle"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <h3 
                        className={`text-gray-700 ${hasMultipleSegments ? 'text-sm' : ''}`}
                        style={getStyleObject(data.flightDepartureServicesTitleStyle)}
                      >
                        {data.flightDepartureServicesTitle}
                      </h3>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        value={editData.segments[index]?.services || ''}
                        onChange={(e) => handleSegmentUpdate(index, 'services', e.target.value)}
                        className={`flex-1 px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${hasMultipleSegments ? 'min-h-[60px] text-sm' : 'min-h-[80px]'}`}
                        style={getStyleObject(data.flightDepartureServicesItemStyle)}
                        placeholder="수하물 23kg x 2개&#10;기내식 포함&#10;좌석 지정 가능"
                      />
                      <StylePicker
                        currentStyle={data.flightDepartureServicesItemStyle}
                        onStyleChange={(style) => onUpdate({ flightDepartureServicesItemStyle: style })}
                        fieldKey="flightDepartureServicesItem"
                        backgroundColorClass="bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(segment.services || '').split('\n').filter(s => s.trim()).map((service, idx) => (
                        <div key={idx} className={`flex items-center gap-2 ${hasMultipleSegments ? 'text-xs' : 'text-sm'}`}>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />
                          <span 
                            className="text-gray-600"
                            style={getStyleObject(data.flightDepartureServicesItemStyle)}
                          >
                            {service}
                          </span>
                          {idx === 0 && isEditMode && (
                            <StylePicker
                              currentStyle={data.flightDepartureServicesItemStyle}
                              onStyleChange={(style) => onUpdate({ flightDepartureServicesItemStyle: style })}
                              fieldKey="flightDepartureServicesItem"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transit Time (if connecting) */}
        {!flight.isDirect && flight.segments.length >= 2 && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 print:break-inside-avoid">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  editingField === 'flightDepartureTransitLabel' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="text-cyan-700 bg-cyan-100 px-2 py-1 rounded border border-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  ) : (
                    <>
                      <span 
                        className="text-cyan-700 cursor-pointer hover:bg-cyan-100 px-2 py-1 rounded transition-colors"
                        style={getStyleObject(data.flightDepartureTransitLabelStyle)}
                        onClick={() => startEdit('flightDepartureTransitLabel', data.flightDepartureTransitLabel)}
                      >
                        {data.flightDepartureTransitLabel}
                      </span>
                      <StylePicker
                        currentStyle={data.flightDepartureTransitLabelStyle}
                        onStyleChange={(style) => onUpdate({ flightDepartureTransitLabelStyle: style })}
                        fieldKey="flightDepartureTransitLabel"
                        backgroundColorClass="bg-cyan-50"
                      />
                    </>
                  )
                ) : (
                  <span 
                    className="text-cyan-700"
                    style={getStyleObject(data.flightDepartureTransitLabelStyle)}
                  >
                    {data.flightDepartureTransitLabel}
                  </span>
                )}
              </div>
              {isEditMode ? (
                <input
                  type="text"
                  value={editData.transitTime || ''}
                  onChange={(e) => handleUpdate('transitTime', e.target.value)}
                  className="px-3 py-1 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={getStyleObject(data.flightDepartureTransitValueStyle)}
                  placeholder="2시간"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span 
                    className="text-cyan-900"
                    style={getStyleObject(data.flightDepartureTransitValueStyle)}
                  >
                    {flight.transitTime || '-'}
                  </span>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.flightDepartureTransitValueStyle}
                      onStyleChange={(style) => onUpdate({ flightDepartureTransitValueStyle: style })}
                      fieldKey="flightDepartureTransitValue"
                      backgroundColorClass="bg-cyan-50"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className={`bg-yellow-50 border border-yellow-200 rounded-xl print:break-inside-avoid ${hasMultipleSegments ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-2 mb-3">
            {isEditMode ? (
              editingField === 'flightDepartureChecklistTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className={`text-yellow-800 ${hasMultipleSegments ? 'text-sm' : ''} bg-yellow-100 px-2 py-1 rounded border border-yellow-300 focus:outline-none focus:border-yellow-500 flex-1`}
                />
              ) : (
                <>
                  <h3 
                    className={`text-yellow-800 ${hasMultipleSegments ? 'text-sm' : ''} cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded transition-colors`}
                    style={getStyleObject(data.flightDepartureChecklistTitleStyle)}
                    onClick={() => startEdit('flightDepartureChecklistTitle', data.flightDepartureChecklistTitle)}
                  >
                    {data.flightDepartureChecklistTitle}
                  </h3>
                  <StylePicker
                    currentStyle={data.flightDepartureChecklistTitleStyle}
                    onStyleChange={(style) => onUpdate({ flightDepartureChecklistTitleStyle: style })}
                    fieldKey="flightDepartureChecklistTitle"
                    backgroundColorClass="bg-yellow-50"
                  />
                </>
              )
            ) : (
              <h3 
                className={`text-yellow-800 ${hasMultipleSegments ? 'text-sm' : ''}`}
                style={getStyleObject(data.flightDepartureChecklistTitleStyle)}
              >
                {data.flightDepartureChecklistTitle}
              </h3>
            )}
          </div>
          {isEditMode ? (
            <div className="flex items-start gap-2">
              <textarea
                value={editData.checklist || ''}
                onChange={(e) => handleUpdate('checklist', e.target.value)}
                className={`flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${hasMultipleSegments ? 'min-h-[80px] text-xs' : 'min-h-[100px] text-sm'}`}
                style={getStyleObject(data.flightDepartureChecklistItemStyle)}
                placeholder="한 줄에 하나씩 입력하세요&#10;출발 3시간 전까지 공항 도착을 권장합니다&#10;여권 유효기간을 확인해주세요 (입국일 기준 6개월 이상)"
              />
              <StylePicker
                currentStyle={data.flightDepartureChecklistItemStyle}
                onStyleChange={(style) => onUpdate({ flightDepartureChecklistItemStyle: style })}
                fieldKey="flightDepartureChecklistItem"
                backgroundColorClass="bg-yellow-50"
              />
            </div>
          ) : (
            <ul className={`space-y-2 ${hasMultipleSegments ? 'text-xs' : 'text-sm'}`}>
              {(flight.checklist || '').split('\n').filter(s => s.trim()).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span 
                    className="text-yellow-900"
                    style={getStyleObject(data.flightDepartureChecklistItemStyle)}
                  >
                    {item}
                  </span>
                  {idx === 0 && isEditMode && (
                    <StylePicker
                      currentStyle={data.flightDepartureChecklistItemStyle}
                      onStyleChange={(style) => onUpdate({ flightDepartureChecklistItemStyle: style })}
                      fieldKey="flightDepartureChecklistItem"
                      backgroundColorClass="bg-yellow-50"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}