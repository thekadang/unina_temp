import { useState } from 'react';
import { MapPin, Calendar, Star, CheckCircle2, MapPinned, XCircle, Edit3, Trash2, Copy, Image as ImageIcon, X, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ImageWithControls } from './ImageWithControls';
import { EditModal } from './PageEditor';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { StylePicker } from './StylePicker';
import { getStyleObject } from '../types/text-style';
import { TourData } from '../types/tour-data';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';

interface HotelData {
  country: string;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: string;
  name: string;
  type: string;
  stars: number;
  roomType: string;
  facilities: string[];
  breakfast: boolean;
  cityTax: string;
  description: string;
  nearbyAttractions: string[];
  images: string[];
  imageObjectFit?: ('cover' | 'contain' | 'fill' | 'none')[];
  imageObjectPosition?: string[];
}

interface Props {
  hotel: HotelData;
  isEditMode: boolean;
  onUpdate: (hotel: HotelData) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  data?: TourData;
  onStyleChange?: (data: Partial<TourData>) => void;
  pageId?: string;
  isBlurMode?: boolean;
  blurRegions?: BlurRegion[];
  onToggleBlurMode?: () => void;
  onAddBlurRegion?: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion?: (regionId: string) => void;
}

export function EditableAccommodationPage({ 
  hotel, 
  isEditMode, 
  onUpdate, 
  onDuplicate, 
  onDelete,
  canDelete,
  data,
  onStyleChange,
  pageId = '',
  isBlurMode = false,
  blurRegions = [],
  onToggleBlurMode,
  onAddBlurRegion,
  onRemoveBlurRegion
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(hotel);
  const [isHovered, setIsHovered] = useState(false);
  
  // 문구 편집 상태
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  
  // 이미지 편집 상태
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentObjectFit, setCurrentObjectFit] = useState<'cover' | 'contain' | 'fill' | 'none'>('cover');
  const [currentObjectPosition, setCurrentObjectPosition] = useState('center');
  
  // 이미지 뷰어 상태
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);

  const startEdit = (field: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField && onStyleChange) {
      onStyleChange({ [editingField]: tempValue });
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

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(hotel);
    setIsEditing(false);
  };

  const updateFacility = (index: number, value: string) => {
    const newFacilities = [...editData.facilities];
    newFacilities[index] = value;
    setEditData({ ...editData, facilities: newFacilities });
  };

  const addFacility = () => {
    setEditData({ ...editData, facilities: [...editData.facilities, '새 시설'] });
  };

  const removeFacility = (index: number) => {
    setEditData({ ...editData, facilities: editData.facilities.filter((_, i) => i !== index) });
  };

  const updateAttraction = (index: number, value: string) => {
    const newAttractions = [...editData.nearbyAttractions];
    newAttractions[index] = value;
    setEditData({ ...editData, nearbyAttractions: newAttractions });
  };

  const addAttraction = () => {
    setEditData({ ...editData, nearbyAttractions: [...editData.nearbyAttractions, '새 관광지'] });
  };

  const removeAttraction = (index: number) => {
    setEditData({ ...editData, nearbyAttractions: editData.nearbyAttractions.filter((_, i) => i !== index) });
  };

  const handleImageClick = (index: number) => {
    if (isEditMode) {
      setEditingImageIndex(index);
      setPreviewUrl(editData.images[index]);
      setImageUrl('');
      setCurrentObjectFit(editData.imageObjectFit?.[index] || 'cover');
      setCurrentObjectPosition(editData.imageObjectPosition?.[index] || 'center');
    } else {
      setViewingImageIndex(index);
    }
  };

  const handleUrlPreview = () => {
    if (imageUrl.trim()) {
      setPreviewUrl(imageUrl);
    }
  };

  const handleImageSave = () => {
    if (editingImageIndex !== null && (imageUrl || previewUrl)) {
      const newImages = [...editData.images];
      newImages[editingImageIndex] = imageUrl || previewUrl;
      
      // Initialize arrays if they don't exist
      const newObjectFit = editData.imageObjectFit || Array(editData.images.length).fill('cover');
      const newObjectPosition = editData.imageObjectPosition || Array(editData.images.length).fill('center');
      
      // Update the specific index
      newObjectFit[editingImageIndex] = currentObjectFit;
      newObjectPosition[editingImageIndex] = currentObjectPosition;
      
      const updatedData = { 
        ...editData, 
        images: newImages,
        imageObjectFit: newObjectFit,
        imageObjectPosition: newObjectPosition
      };
      setEditData(updatedData);
      onUpdate(updatedData);
      setEditingImageIndex(null);
      setImageUrl('');
      setPreviewUrl('');
    }
  };

  const handleImageCancel = () => {
    setEditingImageIndex(null);
    setImageUrl('');
    setPreviewUrl('');
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:py-10 print:px-12 relative blur-container"
      data-has-blur={blurRegions.length > 0 ? "true" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Controls */}
      {isEditMode && isHovered && (
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
            onClick={() => setIsEditing(true)}
            className="hover:bg-cyan-50"
          >
            <Edit3 className="w-4 h-4 text-cyan-600" />
          </Button>
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

      <div className="max-w-5xl mx-auto space-y-4 print:space-y-3">
        {/* Header */}
        <div className="text-center">
          <div data-blur-key="accommodationTitle" className="w-full">
            <div className="flex items-center justify-center gap-2 mb-[3px]">
              {isEditMode ? (
                editingField === 'accommodationTitle' ? (
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
                      style={getStyleObject(data?.accommodationTitleStyle)}
                      onClick={() => startEdit('accommodationTitle', data?.accommodationTitle || '숙소 안내')}
                    >
                      {data?.accommodationTitle || '숙소 안내'}
                    </h1>
                    <StylePicker
                      currentStyle={data?.accommodationTitleStyle}
                      onStyleChange={(style) => onStyleChange?.({ accommodationTitleStyle: style })}
                      fieldKey="accommodationTitle"
                      backgroundColorClass="bg-white"
                    />
                  </>
                )
              ) : (
                <h1
                  className="text-3xl font-semibold text-cyan-600"
                  style={getStyleObject(data?.accommodationTitleStyle)}
                >
                  {data?.accommodationTitle || '숙소 안내'}
                </h1>
              )}
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          </div>
          <div data-blur-key="accommodationLocation" className="flex items-center justify-center gap-2 pt-1">
            <MapPin className="w-4 h-4 print:w-3.5 print:h-3.5 text-cyan-600" />
            <div className="flex items-center gap-2">
              <span
                className={`text-gray-700 text-sm print:text-xs ${
                  isEditMode ? 'cursor-pointer hover:text-cyan-600 hover:underline transition-colors' : ''
                }`}
                style={getStyleObject(data?.accommodationLocationStyle)}
                onClick={() => isEditMode && setIsEditing(true)}
              >
                {hotel.country} · {hotel.city}
              </span>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationLocationStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationLocationStyle: style })}
                  fieldKey="accommodationLocation"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div data-blur-key={`accommodationImagesCard-${hotel.name}`} className="space-y-2 print:space-y-1.5">
        <div className="grid grid-cols-3 gap-2.5 print:gap-2 h-[280px] print:h-[240px]">
          <div 
            className={`col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg relative group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(0)}
          >
            <ImageWithControls
              src={hotel.images[0]}
              alt={`${hotel.name} - Main`}
              className="w-full h-full object-cover"
              objectFit={hotel.imageObjectFit?.[0] || 'cover'}
              objectPosition={hotel.imageObjectPosition?.[0] || 'center'}
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center print:hidden">
                <ImageIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div 
            className={`col-span-1 row-span-1 rounded-xl overflow-hidden shadow-md relative group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(1)}
          >
            <ImageWithControls
              src={hotel.images[1]}
              alt={`${hotel.name} - 2`}
              className="w-full h-full object-cover"
              objectFit={hotel.imageObjectFit?.[1] || 'cover'}
              objectPosition={hotel.imageObjectPosition?.[1] || 'center'}
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center print:hidden">
                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div 
            className={`col-span-1 row-span-1 rounded-xl overflow-hidden shadow-md relative group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(2)}
          >
            <ImageWithControls
              src={hotel.images[2]}
              alt={`${hotel.name} - 3`}
              className="w-full h-full object-cover"
              objectFit={hotel.imageObjectFit?.[2] || 'cover'}
              objectPosition={hotel.imageObjectPosition?.[2] || 'center'}
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center print:hidden">
                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 print:gap-2 h-[140px] print:h-[120px]">
          <div 
            className={`rounded-xl overflow-hidden shadow-md relative group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(3)}
          >
            <ImageWithControls
              src={hotel.images[3]}
              alt={`${hotel.name} - 4`}
              className="w-full h-full object-cover"
              objectFit={hotel.imageObjectFit?.[3] || 'cover'}
              objectPosition={hotel.imageObjectPosition?.[3] || 'center'}
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center print:hidden">
                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div 
            className={`rounded-xl overflow-hidden shadow-md relative group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(4)}
          >
            <ImageWithControls
              src={hotel.images[4]}
              alt={`${hotel.name} - 5`}
              className="w-full h-full object-cover"
              objectFit={hotel.imageObjectFit?.[4] || 'cover'}
              objectPosition={hotel.imageObjectPosition?.[4] || 'center'}
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center print:hidden">
                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Hotel Info */}
        <div data-blur-key="accommodationHotelCard" className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 print:p-4 shadow-lg border border-cyan-100 space-y-3 md:space-y-4 print:space-y-3 print:break-inside-avoid">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5 print:mb-1">
              <h2
                data-blur-key="accommodationHotelName"
                className="text-gray-900 text-base md:text-lg print:text-base"
                style={getStyleObject(data?.accommodationHotelNameStyle)}
              >
                {hotel.name}
              </h2>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationHotelNameStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationHotelNameStyle: style })}
                  fieldKey="accommodationHotelName"
                  backgroundColorClass="bg-white"
                />
              )}
              <span
                data-blur-key="accommodationHotelType"
                className="px-2.5 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs print:text-[10px]"
                style={getStyleObject(data?.accommodationHotelTypeStyle)}
              >
                {hotel.type}
              </span>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationHotelTypeStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationHotelTypeStyle: style })}
                  fieldKey="accommodationHotelType"
                  backgroundColorClass="bg-cyan-100"
                />
              )}
            </div>
            <div className="flex items-center gap-1 mb-2 print:mb-1.5">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 print:w-3.5 print:h-3.5 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <div className="flex items-start gap-2">
              <p
                data-blur-key="accommodationDescription"
                className="text-gray-600 text-sm print:text-xs leading-relaxed"
                style={getStyleObject(data?.accommodationDescriptionStyle)}
              >
                {hotel.description}
              </p>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationDescriptionStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationDescriptionStyle: style })}
                  fieldKey="accommodationDescription"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
          </div>

          {/* Check-in/Check-out/Nights - 2 cols on mobile, 3 cols on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-2 md:gap-3 print:gap-2">
            <div className="bg-cyan-50 rounded-lg md:rounded-xl p-2.5 md:p-3 print:p-2.5">
              <div className="flex items-center gap-1.5 text-cyan-600 mb-1">
                <Calendar className="w-3.5 h-3.5 print:w-3 print:h-3" />
                <span
                  data-blur-key="accommodationCheckInLabel"
                  className="text-xs print:text-[10px]"
                  style={getStyleObject(data?.accommodationCheckInLabelStyle)}
                >
                  체크인
                </span>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationCheckInLabelStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationCheckInLabelStyle: style })}
                    fieldKey="accommodationCheckInLabel"
                    backgroundColorClass="bg-cyan-50"
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                <p
                  data-blur-key="accommodationCheckInTime"
                  className="text-gray-800 text-xs print:text-[10px]"
                  style={getStyleObject(data?.accommodationCheckInTimeStyle)}
                >
                  {hotel.checkIn}
                </p>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationCheckInTimeStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationCheckInTimeStyle: style })}
                    fieldKey="accommodationCheckInTime"
                    backgroundColorClass="bg-cyan-50"
                  />
                )}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg md:rounded-xl p-2.5 md:p-3 print:p-2.5">
              <div className="flex items-center gap-1.5 text-yellow-600 mb-1">
                <Calendar className="w-3.5 h-3.5 print:w-3 print:h-3" />
                <span
                  data-blur-key="accommodationCheckOutLabel"
                  className="text-xs print:text-[10px]"
                  style={getStyleObject(data?.accommodationCheckOutLabelStyle)}
                >
                  체크아웃
                </span>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationCheckOutLabelStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationCheckOutLabelStyle: style })}
                    fieldKey="accommodationCheckOutLabel"
                    backgroundColorClass="bg-yellow-50"
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                <p
                  data-blur-key="accommodationCheckOutTime"
                  className="text-gray-800 text-xs print:text-[10px]"
                  style={getStyleObject(data?.accommodationCheckOutTimeStyle)}
                >
                  {hotel.checkOut}
                </p>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationCheckOutTimeStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationCheckOutTimeStyle: style })}
                    fieldKey="accommodationCheckOutTime"
                    backgroundColorClass="bg-yellow-50"
                  />
                )}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 print:col-span-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg md:rounded-xl p-2.5 md:p-3 print:p-2.5 flex items-center justify-center gap-1">
              <span
                data-blur-key="accommodationNights"
                className="text-sm print:text-xs"
                style={getStyleObject(data?.accommodationNightsStyle)}
              >
                {hotel.nights}
              </span>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationNightsStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationNightsStyle: style })}
                  fieldKey="accommodationNights"
                  backgroundColorClass="bg-cyan-500"
                />
              )}
            </div>
          </div>

          {/* Room Type & Breakfast - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 md:gap-3 print:gap-2.5 pt-2.5 print:pt-2 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-1 mb-1.5 print:mb-1">
                <p
                  data-blur-key="accommodationRoomTypeLabel"
                  className="text-gray-500 text-xs print:text-[10px]"
                  style={getStyleObject(data?.accommodationRoomTypeLabelStyle)}
                >
                  룸 형태
                </p>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationRoomTypeLabelStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationRoomTypeLabelStyle: style })}
                    fieldKey="accommodationRoomTypeLabel"
                    backgroundColorClass="bg-white"
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                <p
                  data-blur-key="accommodationRoomType"
                  className="text-gray-800 text-sm print:text-xs"
                  style={getStyleObject(data?.accommodationRoomTypeStyle)}
                >
                  {hotel.roomType}
                </p>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationRoomTypeStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationRoomTypeStyle: style })}
                    fieldKey="accommodationRoomType"
                    backgroundColorClass="bg-white"
                  />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1.5 print:mb-1">
                <p
                  data-blur-key="accommodationBreakfastLabel"
                  className="text-gray-500 text-xs print:text-[10px]"
                  style={getStyleObject(data?.accommodationBreakfastLabelStyle)}
                >
                  조식 포함 여부
                </p>
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationBreakfastLabelStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationBreakfastLabelStyle: style })}
                    fieldKey="accommodationBreakfastLabel"
                    backgroundColorClass="bg-white"
                  />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {hotel.breakfast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-green-500" />
                    <span
                      data-blur-key="accommodationBreakfastStatus"
                      className="text-green-600 text-sm print:text-xs"
                      style={getStyleObject(data?.accommodationBreakfastStatusStyle)}
                    >
                      포함
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 print:w-3.5 print:h-3.5 text-red-500" />
                    <span
                      data-blur-key="accommodationBreakfastStatus"
                      className="text-red-600 text-sm print:text-xs"
                      style={getStyleObject(data?.accommodationBreakfastStatusStyle)}
                    >
                      불포함
                    </span>
                  </>
                )}
                {isEditMode && (
                  <StylePicker
                    currentStyle={data?.accommodationBreakfastStatusStyle}
                    onStyleChange={(style) => onStyleChange({ accommodationBreakfastStatusStyle: style })}
                    fieldKey="accommodationBreakfastStatus"
                    backgroundColorClass="bg-white"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="pt-2.5 print:pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1 mb-2 print:mb-1.5">
              <p
                data-blur-key="accommodationFacilitiesLabel"
                className="text-gray-500 text-xs print:text-[10px]"
                style={getStyleObject(data?.accommodationFacilitiesLabelStyle)}
              >
                주요 부대시설
              </p>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationFacilitiesLabelStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationFacilitiesLabelStyle: style })}
                  fieldKey="accommodationFacilitiesLabel"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 print:gap-1">
              {hotel.facilities.map((facility, i) => (
                <span
                  key={i}
                  data-blur-key={`accommodation-facility-${i}`}
                  className="px-2.5 md:px-3 py-1.5 print:px-2.5 print:py-1 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 rounded-full text-xs print:text-[10px] border border-cyan-100"
                  style={getStyleObject(data?.accommodationFacilityItemStyle)}
                >
                  {facility}
                </span>
              ))}
              {isEditMode && hotel.facilities.length > 0 && (
                <StylePicker
                  currentStyle={data?.accommodationFacilityItemStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationFacilityItemStyle: style })}
                  fieldKey="accommodationFacilityItem"
                  backgroundColorClass="bg-cyan-50"
                />
              )}
            </div>
          </div>

          {/* Nearby Attractions - 2 cols on mobile, 3 cols on desktop */}
          <div className="pt-2.5 print:pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5 mb-2 print:mb-1.5">
              <MapPinned className="w-4 h-4 print:w-3.5 print:h-3.5 text-cyan-600" />
              <p
                data-blur-key="accommodationAttractionsLabel"
                className="text-gray-500 text-xs print:text-[10px]"
                style={getStyleObject(data?.accommodationAttractionsLabelStyle)}
              >
                주변 관광지
              </p>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationAttractionsLabelStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationAttractionsLabelStyle: style })}
                  fieldKey="accommodationAttractionsLabel"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 print:gap-1.5">
              {hotel.nearbyAttractions.map((attraction, i) => (
                <div
                  key={i}
                  data-blur-key={`accommodation-attraction-${i}`}
                  className="px-2.5 md:px-3 py-2 print:px-2 print:py-1.5 bg-gradient-to-br from-yellow-50 to-orange-50 text-gray-700 rounded-lg text-xs print:text-[10px] border border-yellow-100 text-center"
                  style={getStyleObject(data?.accommodationAttractionItemStyle)}
                >
                  {attraction}
                </div>
              ))}
              {isEditMode && hotel.nearbyAttractions.length > 0 && (
                <StylePicker
                  currentStyle={data?.accommodationAttractionItemStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationAttractionItemStyle: style })}
                  fieldKey="accommodationAttractionItem"
                  backgroundColorClass="bg-yellow-50"
                />
              )}
            </div>
          </div>

          <div className="pt-2.5 print:pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1 mb-1">
              <p
                data-blur-key="accommodationCityTaxLabel"
                className="text-gray-500 text-xs print:text-[10px]"
                style={getStyleObject(data?.accommodationCityTaxLabelStyle)}
              >
                예상 도시세
              </p>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationCityTaxLabelStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationCityTaxLabelStyle: style })}
                  fieldKey="accommodationCityTaxLabel"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <p
                data-blur-key="accommodationCityTax"
                className="text-gray-800 text-sm print:text-xs"
                style={getStyleObject(data?.accommodationCityTaxStyle)}
              >
                {hotel.cityTax}
              </p>
              {isEditMode && (
                <StylePicker
                  currentStyle={data?.accommodationCityTaxStyle}
                  onStyleChange={(style) => onStyleChange({ accommodationCityTaxStyle: style })}
                  fieldKey="accommodationCityTax"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">숙소 정보 수정</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">국가</label>
                  <Input
                    value={editData.country}
                    onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">도시</label>
                  <Input
                    value={editData.city}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">호텔명</label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">설명</label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">체크인</label>
                  <Input
                    value={editData.checkIn}
                    onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">체크아웃</label>
                  <Input
                    value={editData.checkOut}
                    onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">숙박 기간</label>
                  <Input
                    value={editData.nights}
                    onChange={(e) => setEditData({ ...editData, nights: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">룸 형태</label>
                  <Input
                    value={editData.roomType}
                    onChange={(e) => setEditData({ ...editData, roomType: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">도시세</label>
                  <Input
                    value={editData.cityTax}
                    onChange={(e) => setEditData({ ...editData, cityTax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">별점</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.stars}
                  onChange={(e) => setEditData({ ...editData, stars: parseInt(e.target.value) || 5 })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editData.breakfast}
                    onChange={(e) => setEditData({ ...editData, breakfast: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  조식 포함
                </label>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">부대시설</label>
                <div className="space-y-2">
                  {editData.facilities.map((facility, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={facility}
                        onChange={(e) => updateFacility(i, e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => removeFacility(i)}>
                        삭제
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addFacility}>
                    + 시설 추가
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">주변 관광지</label>
                <div className="space-y-2">
                  {editData.nearbyAttractions.map((attraction, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={attraction}
                        onChange={(e) => updateAttraction(i, e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => removeAttraction(i)}>
                        삭제
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addAttraction}>
                    + 관광지 추가
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      {editingImageIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">이미지 {editingImageIndex + 1} 수정</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">이미지 URL</label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlPreview()}
                  />
                  <Button onClick={handleUrlPreview} variant="outline">
                    미리보기
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  unsplash.com에서 원하는 이미지를 찾아 URL을 붙여넣으세요
                </p>
              </div>

              {/* Object Fit 선택 */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">이미지 삽입 방식</label>
                <select
                  value={currentObjectFit}
                  onChange={(e) => setCurrentObjectFit(e.target.value as 'cover' | 'contain' | 'fill' | 'none')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="cover">Cover (영역 채우기)</option>
                  <option value="contain">Contain (비율 유지)</option>
                  <option value="fill">Fill (늘려서 채우기)</option>
                  <option value="none">None (원본 크기)</option>
                </select>
              </div>

              {/* Preview with Controls */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">미리보기 (드래그하여 위치 조정 가능)</label>
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 aspect-video bg-gray-100">
                  <ImageWithControls
                    src={previewUrl || editData.images[editingImageIndex]}
                    alt="Preview"
                    className="w-full h-full"
                    isEditMode={true}
                    objectFit={currentObjectFit}
                    objectPosition={currentObjectPosition}
                    onObjectFitChange={setCurrentObjectFit}
                    onObjectPositionChange={setCurrentObjectPosition}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  위 버튼으로 이미지 삽입 방식을 선택하고, 드래그 모드를 활성화하여 이미지 위치를 조정하세요
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={handleImageCancel}>
                취소
              </Button>
              <Button 
                onClick={handleImageSave} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={!imageUrl.trim()}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center print:hidden"
          onClick={() => setViewingImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setViewingImageIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous Button */}
          {viewingImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingImageIndex(viewingImageIndex - 1);
              }}
              className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next Button */}
          {viewingImageIndex < hotel.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingImageIndex(viewingImageIndex + 1);
              }}
              className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Image */}
          <div 
            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={hotel.images[viewingImageIndex]}
              alt={`${hotel.name} - 이미지 ${viewingImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {viewingImageIndex + 1} / {hotel.images.length}
          </div>
        </div>
      )}
    </div>
  );
}