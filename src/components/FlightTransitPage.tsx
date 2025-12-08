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

export function FlightTransitPage({ 
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
  const flight = data.flights.transit;
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
        transit: updated
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
            transit: newData
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
            transit: newData
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
      className={`min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:py-10 print:px-12 relative blur-container`}
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
              editingField === 'flightTransitTitle' ? (
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
                    style={getStyleObject(data.flightTransitTitleStyle)}
                    onClick={() => startEdit('flightTransitTitle', data.flightTransitTitle)}
                  >
                    {data.flightTransitTitle}
                  </h1>
                  <StylePicker
                    currentStyle={data.flightTransitTitleStyle}
                    onStyleChange={(style) => onUpdate({ flightTransitTitleStyle: style })}
                    fieldKey="flightTransitTitle"
                    backgroundColorClass="bg-white"
                  />
                </>
              )
            ) : (
              <h1 
                className="text-3xl font-semibold text-cyan-600"
                style={getStyleObject(data.flightTransitTitleStyle)}
              >
                {data.flightTransitTitle}
              </h1>
            )}
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          {/* Editable Description */}
          <div className="flex items-center justify-center gap-2">
            {isEditMode ? (
              editingField === 'flightTransitDescription' ? (
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
                    style={getStyleObject(data.flightTransitDescriptionStyle)}
                    onClick={() => startEdit('flightTransitDescription', data.flightTransitDescription)}
                  >
                    {data.flightTransitDescription}
                  </p>
                  <StylePicker
                    currentStyle={data.flightTransitDescriptionStyle}
                    onStyleChange={(style) => onUpdate({ flightTransitDescriptionStyle: style })}
                    fieldKey="flightTransitDescription"
                    backgroundColorClass="bg-white"
                  />
                </>
              )
            ) : (
              <p 
                className="text-gray-600 pt-4"
                style={getStyleObject(data.flightTransitDescriptionStyle)}
              >
                {data.flightTransitDescription}
              </p>
            )}
          </div>
        </div>

        {/* Flight Type Toggle */}
        {isEditMode && (
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-4 bg-white rounded-full shadow-lg px-6 py-3 border border-purple-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={editData.isDirect}
                  onChange={() => toggleDirect(true)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-700">{data.flightTransitDirectLabel}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!editData.isDirect}
                  onChange={() => toggleDirect(false)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-700">{data.flightTransitConnectingLabel}</span>
              </label>
            </div>
            
            {!editData.isDirect && (
              <button
                onClick={addSegment}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{data.flightTransitAddSegmentLabel}</span>
              </button>
            )}
          </div>
        )}

        {/* Flight Segments */}
        <div className={`grid gap-4 ${!flight.isDirect && flight.segments.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'} ${hasMultipleSegments ? 'print:gap-3' : ''}`}>
          {flight.segments.map((segment, index) => (
            <div key={index} className={`bg-white rounded-2xl p-4 shadow-lg border border-purple-100 print:break-inside-avoid ${flight.isDirect ? 'max-w-2xl mx-auto w-full' : ''} ${hasMultipleSegments ? 'print:p-3' : 'p-6'}`}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white">
                  <Plane className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {isEditMode ? (
                    editingField === `flightTransitSegmentTitle-${index}` ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className="text-purple-700 font-bold text-[20px] bg-purple-50 px-2 py-1 rounded border border-purple-300 focus:outline-none focus:border-purple-500 flex-1"
                      />
                    ) : (
                      <>
                        <h3 
                          className="text-purple-700 font-bold text-[20px] cursor-pointer hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                          style={getStyleObject(data.flightTransitSegmentTitleStyle)}
                          onClick={() => startEdit(`flightTransitSegmentTitle-${index}`, !flight.isDirect && flight.segments.length >= 2 ? `${index + 1}구간` : data.flightTransitSegmentTitle)}
                        >
                          {!flight.isDirect && flight.segments.length >= 2 ? `${index + 1}구간` : data.flightTransitSegmentTitle}
                        </h3>
                        {index === 0 && (
                          <StylePicker
                            currentStyle={data.flightTransitSegmentTitleStyle}
                            onStyleChange={(style) => onUpdate({ flightTransitSegmentTitleStyle: style })}
                            fieldKey="flightTransitSegmentTitle"
                            backgroundColorClass="bg-white"
                          />
                        )}
                      </>
                    )
                  ) : (
                    <h3 
                      className="text-purple-700 font-bold text-[20px]"
                      style={getStyleObject(data.flightTransitSegmentTitleStyle)}
                    >
                      {!flight.isDirect && flight.segments.length >= 2 ? `${index + 1}구간` : data.flightTransitSegmentTitle}
                    </h3>
                  )}
                </div>
              </div>

              <div className={hasMultipleSegments ? 'space-y-3' : 'space-y-4'}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isEditMode ? (
                      editingField === `flightTransitAirlineLabel-${index}` ? (
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
                            style={getStyleObject(data.flightTransitLabelStyle)}
                            onClick={() => startEdit(`flightTransitAirlineLabel-${index}`, data.flightTransitAirlineLabel)}
                          >
                            {data.flightTransitAirlineLabel}
                          </p>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightTransitLabelStyle}
                              onStyleChange={(style) => onUpdate({ flightTransitLabelStyle: style })}
                              fieldKey="flightTransitLabel"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <p 
                        className="text-gray-500 text-sm"
                        style={getStyleObject(data.flightTransitLabelStyle)}
                      >
                        {data.flightTransitAirlineLabel}
                      </p>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.segments[index]?.airline || ''}
                        onChange={(e) => handleSegmentUpdate(index, 'airline', e.target.value)}
                        className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={getStyleObject(data.flightTransitDataStyle)}
                        placeholder="루프트한자"
                      />
                      <input
                        type="text"
                        value={editData.segments[index]?.class || ''}
                        onChange={(e) => handleSegmentUpdate(index, 'class', e.target.value)}
                        className="w-28 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={getStyleObject(data.flightTransitDataStyle)}
                        placeholder="이코노미"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p 
                        className="text-gray-800"
                        style={getStyleObject(data.flightTransitDataStyle)}
                      >
                        {segment.airline} ({segment.class}석)
                      </p>
                      {isEditMode && (
                        <StylePicker
                          currentStyle={data.flightTransitDataStyle}
                          onStyleChange={(style) => onUpdate({ flightTransitDataStyle: style })}
                          fieldKey="flightTransitData"
                          backgroundColorClass="bg-white"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isEditMode ? (
                      editingField === `flightTransitDepartureLabel-${index}` ? (
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
                            style={getStyleObject(data.flightTransitLabelStyle)}
                            onClick={() => startEdit(`flightTransitDepartureLabel-${index}`, data.flightTransitDepartureLabel)}
                          >
                            {data.flightTransitDepartureLabel}
                          </p>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightTransitLabelStyle}
                              onStyleChange={(style) => onUpdate({ flightTransitLabelStyle: style })}
                              fieldKey="flightTransitLabel"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <p 
                        className="text-gray-500 text-sm"
                        style={getStyleObject(data.flightTransitLabelStyle)}
                      >
                        {data.flightTransitDepartureLabel}
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
                          className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={getStyleObject(data.flightTransitDataStyle)}
                          placeholder="2026.08.15 10:00"
                        />
                        <StylePicker
                          currentStyle={data.flightTransitDataStyle}
                          onStyleChange={(style) => onUpdate({ flightTransitDataStyle: style })}
                          fieldKey="flightTransitData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editData.segments[index]?.departureAirport || ''}
                          onChange={(e) => handleSegmentUpdate(index, 'departureAirport', e.target.value)}
                          className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={getStyleObject(data.flightTransitDataStyle)}
                          placeholder={index === 0 ? '출발 공항' : '경유 공항'}
                        />
                        <StylePicker
                          currentStyle={data.flightTransitDataStyle}
                          onStyleChange={(style) => onUpdate({ flightTransitDataStyle: style })}
                          fieldKey="flightTransitData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p 
                        className="text-gray-800"
                        style={getStyleObject(data.flightTransitDataStyle)}
                      >
                        {segment.departureTime}
                      </p>
                      <p 
                        className="text-gray-600 text-sm"
                        style={getStyleObject(data.flightTransitDataStyle)}
                      >
                        {segment.departureAirport}
                      </p>
                    </>
                  )}
                </div>

                {flight.isDirect && (
                  <div className="flex items-center justify-center py-2 gap-2">
                    <div className="flex-1 border-t-2 border-dashed border-purple-300" />
                    <div className="flex items-center gap-2">
                      {isEditMode ? (
                        editingField === 'flightTransitDirectBadge' ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            autoFocus
                            className="text-sm px-4 py-1 bg-purple-100 rounded-full text-purple-600 border border-purple-300 focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          <>
                            <span 
                              className="text-sm px-4 py-1 bg-purple-50 rounded-full text-purple-600 whitespace-nowrap cursor-pointer hover:bg-purple-100 transition-colors"
                              style={getStyleObject(data.flightTransitDirectBadgeStyle)}
                              onClick={() => startEdit('flightTransitDirectBadge', data.flightTransitDirectBadge)}
                            >
                              {data.flightTransitDirectBadge}
                            </span>
                            <StylePicker
                              currentStyle={data.flightTransitDirectBadgeStyle}
                              onStyleChange={(style) => onUpdate({ flightTransitDirectBadgeStyle: style })}
                              fieldKey="flightTransitDirectBadge"
                              backgroundColorClass="bg-purple-50"
                            />
                          </>
                        )
                      ) : (
                        <span 
                          className="text-sm px-4 py-1 bg-purple-50 rounded-full text-purple-600 whitespace-nowrap"
                          style={getStyleObject(data.flightTransitDirectBadgeStyle)}
                        >
                          {data.flightTransitDirectBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-purple-300" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isEditMode ? (
                      editingField === `flightTransitArrivalLabel-${index}` ? (
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
                            style={getStyleObject(data.flightTransitLabelStyle)}
                            onClick={() => startEdit(`flightTransitArrivalLabel-${index}`, data.flightTransitArrivalLabel)}
                          >
                            {data.flightTransitArrivalLabel}
                          </p>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightTransitLabelStyle}
                              onStyleChange={(style) => onUpdate({ flightTransitLabelStyle: style })}
                              fieldKey="flightTransitLabel"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <p 
                        className="text-gray-500 text-sm"
                        style={getStyleObject(data.flightTransitLabelStyle)}
                      >
                        {data.flightTransitArrivalLabel}
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
                          className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={getStyleObject(data.flightTransitDataStyle)}
                          placeholder="2026.08.15 14:00"
                        />
                        <StylePicker
                          currentStyle={data.flightTransitDataStyle}
                          onStyleChange={(style) => onUpdate({ flightTransitDataStyle: style })}
                          fieldKey="flightTransitData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editData.segments[index]?.arrivalAirport || ''}
                          onChange={(e) => handleSegmentUpdate(index, 'arrivalAirport', e.target.value)}
                          className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={getStyleObject(data.flightTransitDataStyle)}
                          placeholder={index === flight.segments.length - 1 ? '도착 공항' : '경유 공항'}
                        />
                        <StylePicker
                          currentStyle={data.flightTransitDataStyle}
                          onStyleChange={(style) => onUpdate({ flightTransitDataStyle: style })}
                          fieldKey="flightTransitData"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p 
                        className="text-gray-800"
                        style={getStyleObject(data.flightTransitDataStyle)}
                      >
                        {segment.arrivalTime}
                      </p>
                      <p 
                        className="text-gray-600 text-sm"
                        style={getStyleObject(data.flightTransitDataStyle)}
                      >
                        {segment.arrivalAirport}
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditMode ? (
                      editingField === `flightTransitServicesTitle-${index}` ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className={`text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500 ${hasMultipleSegments ? 'text-sm' : ''}`}
                        />
                      ) : (
                        <>
                          <h3 
                            className={`text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors ${hasMultipleSegments ? 'text-sm' : ''}`}
                            style={getStyleObject(data.flightTransitServicesTitleStyle)}
                            onClick={() => startEdit(`flightTransitServicesTitle-${index}`, data.flightTransitServicesTitle)}
                          >
                            {data.flightTransitServicesTitle}
                          </h3>
                          {index === 0 && (
                            <StylePicker
                              currentStyle={data.flightTransitServicesTitleStyle}
                              onStyleChange={(style) => onUpdate({ flightTransitServicesTitleStyle: style })}
                              fieldKey="flightTransitServicesTitle"
                              backgroundColorClass="bg-white"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <h3 
                        className={`text-gray-700 ${hasMultipleSegments ? 'text-sm' : ''}`}
                        style={getStyleObject(data.flightTransitServicesTitleStyle)}
                      >
                        {data.flightTransitServicesTitle}
                      </h3>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        value={editData.segments[index]?.services || ''}
                        onChange={(e) => handleSegmentUpdate(index, 'services', e.target.value)}
                        className={`flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${hasMultipleSegments ? 'min-h-[60px] text-sm' : 'min-h-[80px]'}`}
                        style={getStyleObject(data.flightTransitServicesItemStyle)}
                        placeholder="수하물 20kg x 1개&#10;기내식 포함&#10;좌석 지정 가능"
                      />
                      <StylePicker
                        currentStyle={data.flightTransitServicesItemStyle}
                        onStyleChange={(style) => onUpdate({ flightTransitServicesItemStyle: style })}
                        fieldKey="flightTransitServicesItem"
                        backgroundColorClass="bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(segment.services || '').split('\n').filter(s => s.trim()).map((service, idx) => (
                        <div key={idx} className={`flex items-center gap-2 ${hasMultipleSegments ? 'text-xs' : 'text-sm'}`}>
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                          <span 
                            className="text-gray-600"
                            style={getStyleObject(data.flightTransitServicesItemStyle)}
                          >
                            {service}
                          </span>
                          {idx === 0 && isEditMode && (
                            <StylePicker
                              currentStyle={data.flightTransitServicesItemStyle}
                              onStyleChange={(style) => onUpdate({ flightTransitServicesItemStyle: style })}
                              fieldKey="flightTransitServicesItem"
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

        {/* Transit Time */}
        {!flight.isDirect && flight.segments.length >= 2 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 print:break-inside-avoid">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  editingField === 'flightTransitTransitLabel' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="text-purple-700 bg-purple-100 px-2 py-1 rounded border border-purple-300 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <>
                      <span 
                        className="text-purple-700 cursor-pointer hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                        style={getStyleObject(data.flightTransitTransitLabelStyle)}
                        onClick={() => startEdit('flightTransitTransitLabel', data.flightTransitTransitLabel)}
                      >
                        {data.flightTransitTransitLabel}
                      </span>
                      <StylePicker
                        currentStyle={data.flightTransitTransitLabelStyle}
                        onStyleChange={(style) => onUpdate({ flightTransitTransitLabelStyle: style })}
                        fieldKey="flightTransitTransitLabel"
                        backgroundColorClass="bg-purple-50"
                      />
                    </>
                  )
                ) : (
                  <span 
                    className="text-purple-700"
                    style={getStyleObject(data.flightTransitTransitLabelStyle)}
                  >
                    {data.flightTransitTransitLabel}
                  </span>
                )}
              </div>
              {isEditMode ? (
                <input
                  type="text"
                  value={editData.transitTime || ''}
                  onChange={(e) => handleUpdate('transitTime', e.target.value)}
                  className="px-3 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={getStyleObject(data.flightTransitTransitValueStyle)}
                  placeholder="1시간 30분"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span 
                    className="text-purple-900"
                    style={getStyleObject(data.flightTransitTransitValueStyle)}
                  >
                    {flight.transitTime || '-'}
                  </span>
                  {isEditMode && (
                    <StylePicker
                      currentStyle={data.flightTransitTransitValueStyle}
                      onStyleChange={(style) => onUpdate({ flightTransitTransitValueStyle: style })}
                      fieldKey="flightTransitTransitValue"
                      backgroundColorClass="bg-purple-50"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className={`bg-purple-50 border border-purple-200 rounded-xl print:break-inside-avoid ${hasMultipleSegments ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-2 mb-3">
            {isEditMode ? (
              editingField === 'flightTransitChecklistTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className={`text-purple-800 bg-purple-100 px-2 py-1 rounded border border-purple-300 focus:outline-none focus:border-purple-500 ${hasMultipleSegments ? 'text-sm' : ''}`}
                />
              ) : (
                <>
                  <h3 
                    className={`text-purple-800 cursor-pointer hover:bg-purple-100 px-2 py-1 rounded transition-colors ${hasMultipleSegments ? 'text-sm' : ''}`}
                    style={getStyleObject(data.flightTransitChecklistTitleStyle)}
                    onClick={() => startEdit('flightTransitChecklistTitle', data.flightTransitChecklistTitle)}
                  >
                    {data.flightTransitChecklistTitle}
                  </h3>
                  <StylePicker
                    currentStyle={data.flightTransitChecklistTitleStyle}
                    onStyleChange={(style) => onUpdate({ flightTransitChecklistTitleStyle: style })}
                    fieldKey="flightTransitChecklistTitle"
                    backgroundColorClass="bg-purple-50"
                  />
                </>
              )
            ) : (
              <h3 
                className={`text-purple-800 ${hasMultipleSegments ? 'text-sm' : ''}`}
                style={getStyleObject(data.flightTransitChecklistTitleStyle)}
              >
                {data.flightTransitChecklistTitle}
              </h3>
            )}
          </div>
          {isEditMode ? (
            <div className="flex items-start gap-2">
              <textarea
                value={editData.checklist || ''}
                onChange={(e) => handleUpdate('checklist', e.target.value)}
                className={`flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${hasMultipleSegments ? 'min-h-[80px] text-xs' : 'min-h-[100px] text-sm'}`}
                style={getStyleObject(data.flightTransitChecklistItemStyle)}
                placeholder="한 줄에 하나씩 입력하세요&#10;출발 2시간 전까지 공항 도착을 권장합니다&#10;EU 내 항공편은 액체류 제한이 있습니다 (100ml 이하)"
              />
              <StylePicker
                currentStyle={data.flightTransitChecklistItemStyle}
                onStyleChange={(style) => onUpdate({ flightTransitChecklistItemStyle: style })}
                fieldKey="flightTransitChecklistItem"
                backgroundColorClass="bg-purple-50"
              />
            </div>
          ) : (
            <ul className={`space-y-2 ${hasMultipleSegments ? 'text-xs' : 'text-sm'}`}>
              {(flight.checklist || '').split('\n').filter(s => s.trim()).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span 
                    className="text-purple-900"
                    style={getStyleObject(data.flightTransitChecklistItemStyle)}
                  >
                    {item}
                  </span>
                  {idx === 0 && isEditMode && (
                    <StylePicker
                      currentStyle={data.flightTransitChecklistItemStyle}
                      onStyleChange={(style) => onUpdate({ flightTransitChecklistItemStyle: style })}
                      fieldKey="flightTransitChecklistItem"
                      backgroundColorClass="bg-purple-50"
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