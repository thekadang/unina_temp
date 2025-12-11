import { useState } from 'react';
import { TourData } from '../types/tour-data';
import { TextStyle, getStyleClasses, getStyleObject } from '../types/text-style';
import { 
  Bus, 
  Car, 
  Train, 
  Plane, 
  Ship, 
  Bike, 
  Plus, 
  Trash2, 
  Copy, 
  Edit2,
  AlertTriangle,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ImageWithControls } from './ImageWithControls';
import { StylePicker } from './StylePicker';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';

interface TransportationTicketPageProps {
  data: TourData;
  isEditMode: boolean;
  onUpdate: (data: Partial<TourData>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  pageId?: string;
  isBlurMode?: boolean;
  blurRegions?: BlurRegion[];
  onToggleBlurMode?: () => void;
  onAddBlurRegion?: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion?: (regionId: string) => void;
}

interface ColorOption {
  value: string;
  label: string;
  class: string;
}

const iconOptions = [
  { value: 'bus', label: '버스', icon: Bus },
  { value: 'car', label: '자동차', icon: Car },
  { value: 'train', label: '기차', icon: Train },
  { value: 'plane', label: '비행기', icon: Plane },
  { value: 'ship', label: '배', icon: Ship },
  { value: 'bike', label: '자전거', icon: Bike },
  { value: 'image', label: '이미지', icon: ImageIcon },
] as const;

const colorOptions: ColorOption[] = [
  { value: 'cyan', label: '청록', class: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200' },
  { value: 'green', label: '초록', class: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' },
  { value: 'purple', label: '보라', class: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' },
  { value: 'yellow', label: '노랑', class: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' },
  { value: 'blue', label: '파랑', class: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' },
  { value: 'red', label: '빨강', class: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' },
] as const;

const getIconComponent = (iconType: string) => {
  const option = iconOptions.find(opt => opt.value === iconType);
  return option ? option.icon : Bus;
};

const getColorClass = (color: string) => {
  const option = colorOptions.find(opt => opt.value === color);
  return option ? option.class : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200';
};

export function TransportationTicketPage({
  data,
  isEditMode,
  onUpdate,
  onDuplicate,
  onDelete,
  canDelete,
  pageId,
  isBlurMode,
  blurRegions,
  onToggleBlurMode,
  onAddBlurRegion,
  onRemoveBlurRegion
}: TransportationTicketPageProps) {
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const tickets = data.transportationTickets || [];
  const restrictions = data.transportationRestrictions || [];

  const startEdit = (field: string, value: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(value || '');
  };

  const saveEdit = () => {
    if (!editingField || !onUpdate) return;

    if (editingField === 'ticketTitle') {
      onUpdate({ transportationTicketTitle: tempValue });
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

  const addTicket = () => {
    const newTicket = {
      id: Date.now().toString(),
      icon: 'bus' as const,
      title: '새 교통편',
      titleStyle: { fontSize: 18, fontWeight: 700, color: '#0e7490' } as TextStyle,
      price: '0.00€',
      priceStyle: { fontSize: 16, fontWeight: 600, color: '#0891b2' } as TextStyle,
      validFor: '유효 범위',
      validForLabel: '유효 범위:',
      validForLabelStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
      validForStyle: { fontSize: 14, fontWeight: 400, color: '#374151' } as TextStyle,
      usage: '사용 횟수',
      usageLabel: '횟수:',
      usageLabelStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
      usageStyle: { fontSize: 14, fontWeight: 400, color: '#374151' } as TextStyle,
      color: 'cyan' as const,
      items: [
        {
          id: '1',
          label: '항목',
          labelStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
          content: '내용',
          contentStyle: { fontSize: 14, fontWeight: 400, color: '#4b5563' } as TextStyle,
        }
      ]
    };
    
    onUpdate({
      transportationTickets: [...tickets, newTicket]
    });
  };

  const updateTicket = (ticketId: string, updates: any) => {
    const newTickets = tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    );
    onUpdate({ transportationTickets: newTickets });
  };

  const deleteTicket = (ticketId: string) => {
    const newTickets = tickets.filter(ticket => ticket.id !== ticketId);
    onUpdate({ transportationTickets: newTickets });
  };

  const addTicketItem = (ticketId: string) => {
    const newTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          items: [...ticket.items, {
            id: Date.now().toString(),
            label: '새 항목',
            labelStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
            content: '내용',
            contentStyle: { fontSize: 14, fontWeight: 400, color: '#4b5563' } as TextStyle,
          }]
        };
      }
      return ticket;
    });
    onUpdate({ transportationTickets: newTickets });
  };

  const updateTicketItem = (ticketId: string, itemId: string, updates: any) => {
    const newTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          items: ticket.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return ticket;
    });
    onUpdate({ transportationTickets: newTickets });
  };

  const deleteTicketItem = (ticketId: string, itemId: string) => {
    const newTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          items: ticket.items.filter(item => item.id !== itemId)
        };
      }
      return ticket;
    });
    onUpdate({ transportationTickets: newTickets });
  };

  const addRestriction = () => {
    const newRestriction = {
      id: Date.now().toString(),
      content: '새 제한사항'
    };
    onUpdate({
      transportationRestrictions: [...restrictions, newRestriction]
    });
  };

  const updateRestriction = (restrictionId: string, updates: any) => {
    const newRestrictions = restrictions.map(restriction =>
      restriction.id === restrictionId ? { ...restriction, ...updates } : restriction
    );
    onUpdate({ transportationRestrictions: newRestrictions });
  };

  const deleteRestriction = (restrictionId: string) => {
    const newRestrictions = restrictions.filter(restriction => restriction.id !== restrictionId);
    onUpdate({ transportationRestrictions: newRestrictions });
  };

  const ColorPicker = ({ 
    currentColor, 
    onColorChange, 
    ticketId 
  }: { 
    currentColor: string; 
    onColorChange: (color: string) => void;
    ticketId: string;
  }) => {
    const [tempColor, setTempColor] = useState<string>(currentColor);
    
    const handleColorChange = (color: string) => {
      setTempColor(color);
      onColorChange(color);
    };
    
    const handleApply = () => {
      setShowColorPicker(null);
    };
    
    const handleCancel = () => {
      onColorChange(currentColor);
      setShowColorPicker(null);
    };
    
    return (
      <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-56">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">배경 색상</label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleColorChange(option.value)}
                  className={`w-14 h-14 rounded-lg border-2 ${option.class} hover:scale-110 transition-transform ${
                    tempColor === option.value ? 'ring-2 ring-cyan-500 ring-offset-2' : ''
                  }`}
                  title={option.label}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative min-h-screen bg-white p-8 print:p-8 blur-container"
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

      {/* Header */}
      <div className="text-center mb-4 break-inside-avoid">
        <div data-blur-key="transportationTicketTitle" className="w-full">
          <div className="flex items-center justify-center gap-2 mb-[3px]">
            {isEditMode ? (
              editingField === 'ticketTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-3xl font-semibold text-cyan-600 bg-blue-50 px-3 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <>
                  <h1
                    className="text-3xl font-semibold text-cyan-600 cursor-pointer hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                    style={getStyleObject(data.transportationTicketTitleStyle)}
                    onClick={() => startEdit('ticketTitle', data.transportationTicketTitle || '교통편 안내')}
                  >
                    {data.transportationTicketTitle || '교통편 안내'}
                  </h1>
                  <StylePicker
                    currentStyle={data.transportationTicketTitleStyle}
                    onStyleChange={(style) => onUpdate({ transportationTicketTitleStyle: style })}
                    fieldKey="transportationTicketTitle"
                    backgroundColorClass="bg-white"
                  />
                </>
              )
            ) : (
              <h1
                className="text-3xl font-semibold text-cyan-600"
                style={getStyleObject(data.transportationTicketTitleStyle)}
              >
                {data.transportationTicketTitle || '교통편 안내'}
              </h1>
            )}
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-2" />
        </div>
      </div>

      {/* Transportation Tickets */}
      <div className="space-y-4 mb-4">
        {tickets.map((ticket) => {
          const IconComponent = getIconComponent(ticket.icon);
          const colorClass = getColorClass(ticket.color);
          
          return (
            <div
              key={ticket.id}
              data-blur-key={`transportationTicket-${ticket.id}`}
              className={`relative border-2 rounded-xl p-4 shadow-sm print:break-inside-avoid ${colorClass}`}
            >
              {/* Top Section: Info + Image - Stack on mobile, side by side on desktop */}
              <div className="flex flex-col md:flex-row print:flex-row gap-4 mb-3">
                {/* Left Side: Ticket Info */}
                <div className="flex-1">
                  {/* Ticket Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon Selector */}
                    <div className="relative">
                      {isEditMode ? (
                        <button
                          onClick={() => setShowIconPicker(showIconPicker === ticket.id ? null : ticket.id)}
                          className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                        >
                          <IconComponent className="w-6 h-6 text-cyan-600" />
                        </button>
                      ) : (
                        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                          <IconComponent className="w-6 h-6 text-cyan-600" />
                        </div>
                      )}
                      
                      {/* Icon Picker Dropdown */}
                      {isEditMode && showIconPicker === ticket.id && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-50 grid grid-cols-2 gap-3 w-32">
                          {iconOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => {
                                  updateTicket(ticket.id, { icon: option.value });
                                  setShowIconPicker(null);
                                }}
                                className="p-3 hover:bg-cyan-50 rounded transition-colors border border-gray-100"
                                title={option.label}
                              >
                                <Icon className="w-6 h-6 text-cyan-600" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Title and Price */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={ticket.title}
                            onChange={(e) => updateTicket(ticket.id, { title: e.target.value })}
                            style={getStyleObject(ticket.titleStyle)}
                            className={`flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg ${getStyleClasses(ticket.titleStyle)}`}
                          />
                        ) : (
                          <h3 style={getStyleObject(ticket.titleStyle)} className={getStyleClasses(ticket.titleStyle)}>{ticket.title}</h3>
                        )}
                        {isEditMode && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <StylePicker
                              currentStyle={ticket.titleStyle}
                              onStyleChange={(style) => updateTicket(ticket.id, { titleStyle: style })}
                              fieldKey={`${ticket.id}-title`}
                              backgroundColorClass={colorClass}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={ticket.price}
                              onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                              style={getStyleObject(ticket.priceStyle)}
                              className={`inline-block w-32 px-2 py-1 border border-gray-200 rounded ${getStyleClasses(ticket.priceStyle)}`}
                              placeholder="예: 24.70€"
                            />
                          ) : (
                            <div style={getStyleObject(ticket.priceStyle)} className={getStyleClasses(ticket.priceStyle)}>가격: {ticket.price}</div>
                          )}
                          {isEditMode && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <StylePicker
                                currentStyle={ticket.priceStyle}
                                onStyleChange={(style) => updateTicket(ticket.id, { priceStyle: style })}
                                fieldKey={`${ticket.id}-price`}
                                backgroundColorClass={colorClass}
                              />
                            </div>
                          )}
                        </div>
                        
                        {isEditMode && (
                          <>
                            <div className="relative">
                              <button
                                onClick={() => setShowColorPicker(showColorPicker === ticket.id ? null : ticket.id)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                색상
                              </button>
                              
                              {/* Color Picker Dropdown */}
                              {showColorPicker === ticket.id && (
                                <ColorPicker
                                  currentColor={ticket.color}
                                  onColorChange={(color) => updateTicket(ticket.id, { color })}
                                  ticketId={ticket.id}
                                />
                              )}
                            </div>
                            <button
                              onClick={() => deleteTicket(ticket.id)}
                              className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-1">
                      <div className="flex-1">
                        {isEditMode ? (
                          <>
                            <div className="flex items-center gap-1 mb-1">
                              <input
                                type="text"
                                value={ticket.validForLabel || '유효 범위:'}
                                onChange={(e) => updateTicket(ticket.id, { validForLabel: e.target.value })}
                                style={getStyleObject(ticket.validForLabelStyle)}
                                className={`inline-block px-2 py-1 bg-white rounded border border-gray-200 ${getStyleClasses(ticket.validForLabelStyle)}`}
                                placeholder="라벨 입력"
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <StylePicker
                                  currentStyle={ticket.validForLabelStyle}
                                  onStyleChange={(style) => updateTicket(ticket.id, { validForLabelStyle: style })}
                                  fieldKey={`${ticket.id}-validForLabel`}
                                  backgroundColorClass={colorClass}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={ticket.validFor}
                                onChange={(e) => updateTicket(ticket.id, { validFor: e.target.value })}
                                style={getStyleObject(ticket.validForStyle)}
                                className={`flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg ${getStyleClasses(ticket.validForStyle)}`}
                                placeholder="예: 존1, 존2, 존3"
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <StylePicker
                                  currentStyle={ticket.validForStyle}
                                  onStyleChange={(style) => updateTicket(ticket.id, { validForStyle: style })}
                                  fieldKey={`${ticket.id}-validFor`}
                                  backgroundColorClass={colorClass}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={getStyleObject(ticket.validForLabelStyle)} className={`mb-1 ${getStyleClasses(ticket.validForLabelStyle)}`}>{ticket.validForLabel || '유효 범위:'}</div>
                            <p style={getStyleObject(ticket.validForStyle)} className={`mt-1 ${getStyleClasses(ticket.validForStyle)}`}>{ticket.validFor}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-1">
                      <div className="flex-1">
                        {isEditMode ? (
                          <>
                            <div className="flex items-center gap-1 mb-1">
                              <input
                                type="text"
                                value={ticket.usageLabel || '횟수:'}
                                onChange={(e) => updateTicket(ticket.id, { usageLabel: e.target.value })}
                                style={getStyleObject(ticket.usageLabelStyle)}
                                className={`inline-block px-2 py-1 bg-white rounded border border-gray-200 ${getStyleClasses(ticket.usageLabelStyle)}`}
                                placeholder="라벨 입력"
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <StylePicker
                                  currentStyle={ticket.usageLabelStyle}
                                  onStyleChange={(style) => updateTicket(ticket.id, { usageLabelStyle: style })}
                                  fieldKey={`${ticket.id}-usageLabel`}
                                  backgroundColorClass={colorClass}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={ticket.usage}
                                onChange={(e) => updateTicket(ticket.id, { usage: e.target.value })}
                                style={getStyleObject(ticket.usageStyle)}
                                className={`flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg ${getStyleClasses(ticket.usageStyle)}`}
                                placeholder="예: 10회"
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <StylePicker
                                  currentStyle={ticket.usageStyle}
                                  onStyleChange={(style) => updateTicket(ticket.id, { usageStyle: style })}
                                  fieldKey={`${ticket.id}-usage`}
                                  backgroundColorClass={colorClass}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={getStyleObject(ticket.usageLabelStyle)} className={`mb-1 ${getStyleClasses(ticket.usageLabelStyle)}`}>{ticket.usageLabel || '횟수:'}</div>
                            <p style={getStyleObject(ticket.usageStyle)} className={`mt-1 ${getStyleClasses(ticket.usageStyle)}`}>{ticket.usage}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Image Box - Only show if image exists or in edit mode */}
                {(ticket.images && ticket.images.length > 0) || isEditMode ? (
                  <div className="w-full md:w-80 print:w-80 md:flex-shrink-0 order-last">
                    {ticket.images && ticket.images.length > 0 ? (
                      <div 
                        className={`relative group h-48 md:h-56 print:h-56 rounded-lg overflow-hidden border-2 border-white shadow-sm ${!isEditMode ? 'cursor-pointer print:cursor-default' : ''}`}
                        onClick={() => !isEditMode && ticket.images && setViewingImage(ticket.images[0])}
                      >
                        <ImageWithControls
                          src={ticket.images[0]}
                          alt={`${ticket.title} 이미지`}
                          className="w-full h-full"
                          isEditMode={isEditMode}
                          objectFit={ticket.imageObjectFit || 'cover'}
                          objectPosition={ticket.imageObjectPosition || 'center'}
                          onObjectFitChange={(fit) => updateTicket(ticket.id, { imageObjectFit: fit })}
                          onObjectPositionChange={(position) => updateTicket(ticket.id, { imageObjectPosition: position })}
                        />
                        {isEditMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newImages = ticket.images?.slice(1) || [];
                              updateTicket(ticket.id, { images: newImages.length > 0 ? newImages : undefined });
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const imageUrl = prompt('이미지 URL을 입력하세요:');
                          if (imageUrl) {
                            updateTicket(ticket.id, { images: [imageUrl] });
                          }
                        }}
                        className="w-full h-48 md:h-56 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">이미지 추가</span>
                      </button>
                    )}
                    
                    {/* Change Image Button (Edit Mode) */}
                    {isEditMode && ticket.images && ticket.images.length > 0 && (
                      <button
                        onClick={() => {
                          const imageUrl = prompt('새 이미지 URL을 입력하세요:', ticket.images![0]);
                          if (imageUrl) {
                            updateTicket(ticket.id, { images: [imageUrl] });
                          }
                        }}
                        className="w-full mt-2 py-1 text-sm border border-cyan-300 rounded-lg text-cyan-500 hover:bg-cyan-50 transition-colors"
                      >
                        이미지 변경
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Ticket Items (Full Width Below) */}
              <div className="space-y-2">
                {ticket.items.map((item) => (
                  <div key={item.id} className="p-3 border-l-4 border-gray-400/40">
                    <div className="flex items-start gap-2">
                      {isEditMode && (
                        <Edit2 className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        {isEditMode ? (
                          <>
                            <div className="flex items-center gap-1 mb-1">
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateTicketItem(ticket.id, item.id, { label: e.target.value })}
                                style={getStyleObject(item.labelStyle)}
                                className={`flex-1 px-2 py-1 border border-gray-200 rounded ${getStyleClasses(item.labelStyle)}`}
                                placeholder="항목 제목"
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <StylePicker
                                  currentStyle={item.labelStyle}
                                  onStyleChange={(style) => updateTicketItem(ticket.id, item.id, { labelStyle: style })}
                                  fieldKey={`${ticket.id}-${item.id}-label`}
                                  backgroundColorClass={colorClass}
                                />
                              </div>
                            </div>
                            <div className="flex items-start gap-1">
                              <textarea
                                value={item.content}
                                onChange={(e) => updateTicketItem(ticket.id, item.id, { content: e.target.value })}
                                style={getStyleObject(item.contentStyle)}
                                className={`flex-1 px-2 py-1 border border-gray-200 rounded resize-none ${getStyleClasses(item.contentStyle)}`}
                                rows={2}
                                placeholder="항목 내용"
                              />
                              <div onClick={(e) => e.stopPropagation()}>
                                <StylePicker
                                  currentStyle={item.contentStyle}
                                  onStyleChange={(style) => updateTicketItem(ticket.id, item.id, { contentStyle: style })}
                                  fieldKey={`${ticket.id}-${item.id}-content`}
                                  backgroundColorClass={colorClass}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={getStyleObject(item.labelStyle)} className={`mb-1 ${getStyleClasses(item.labelStyle)}`}>{item.label}</div>
                            <div style={getStyleObject(item.contentStyle)} className={`text-sm ${getStyleClasses(item.contentStyle)}`}>{item.content}</div>
                          </>
                        )}
                      </div>
                      {isEditMode && (
                        <button
                          onClick={() => deleteTicketItem(ticket.id, item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Item Button */}
                {isEditMode && (
                  <button
                    onClick={() => addTicketItem(ticket.id)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    항목 추가
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Add Ticket Button */}
        {isEditMode && (
          <button
            onClick={addTicket}
            className="w-full py-4 border-2 border-dashed border-cyan-300 rounded-xl text-cyan-500 hover:border-cyan-500 hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            교통편 추가
          </button>
        )}
      </div>

      {/* Restrictions Section */}
      <div className="break-inside-avoid">
        <div data-blur-key="transportationTicketRestrictions" className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {isEditMode ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={data.transportationRestrictionsTitle || '주요 제한 사항:'}
                  onChange={(e) => onUpdate({ transportationRestrictionsTitle: e.target.value })}
                  style={getStyleObject(data.transportationRestrictionsTitleStyle)}
                  className={`flex-1 px-2 py-1 bg-white border border-red-200 rounded ${getStyleClasses(data.transportationRestrictionsTitleStyle)}`}
                  placeholder="제목 입력"
                />
                <div onClick={(e) => e.stopPropagation()}>
                  <StylePicker
                    currentStyle={data.transportationRestrictionsTitleStyle}
                    onStyleChange={(style) => onUpdate({ transportationRestrictionsTitleStyle: style })}
                    fieldKey="transportationRestrictionsTitle"
                    backgroundColorClass="bg-gradient-to-br from-red-50 to-orange-50"
                  />
                </div>
              </div>
            ) : (
              <h2 
                style={getStyleObject(data.transportationRestrictionsTitleStyle)} 
                className={`text-lg text-red-700 ${getStyleClasses(data.transportationRestrictionsTitleStyle)}`}
              >
                {data.transportationRestrictionsTitle || '주요 제한 사항:'}
              </h2>
            )}
          </div>
          
          <ul className="space-y-2">
            {restrictions.map((restriction) => (
              <li key={restriction.id} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={restriction.content}
                        onChange={(e) => updateRestriction(restriction.id, { content: e.target.value })}
                        style={getStyleObject(restriction.contentStyle)}
                        className={`flex-1 px-2 py-1 bg-white border border-red-200 rounded ${getStyleClasses(restriction.contentStyle)}`}
                      />
                      <div onClick={(e) => e.stopPropagation()}>
                        <StylePicker
                          currentStyle={restriction.contentStyle}
                          onStyleChange={(style) => updateRestriction(restriction.id, { contentStyle: style })}
                          fieldKey={`restriction-${restriction.id}`}
                          backgroundColorClass="bg-gradient-to-br from-red-50 to-orange-50"
                        />
                      </div>
                      <button
                        onClick={() => deleteRestriction(restriction.id)}
                        className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span style={getStyleObject(restriction.contentStyle)} className={`text-red-700 ${getStyleClasses(restriction.contentStyle)}`}>{restriction.content}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          
          {/* Add Restriction Button */}
          {isEditMode && (
            <button
              onClick={addRestriction}
              className="w-full mt-4 py-2 border-2 border-dashed border-red-300 rounded-lg text-red-500 hover:border-red-500 hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              제한사항 추가
            </button>
          )}
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
              alt="교통편 이미지"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
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
    </div>
  );
}