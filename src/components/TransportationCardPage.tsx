import { useState } from 'react';
import { TourData } from '../types/tour-data';
import { TextStyle, getStyleClasses, getStyleObject } from '../types/text-style';
import { 
  CreditCard,
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
import { Button } from './ui/button';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';

interface TransportationCardPageProps {
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

const colorOptions: ColorOption[] = [
  { value: 'cyan', label: '청록', class: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200' },
  { value: 'green', label: '초록', class: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' },
  { value: 'purple', label: '보라', class: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' },
  { value: 'yellow', label: '노랑', class: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' },
  { value: 'blue', label: '파랑', class: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' },
  { value: 'red', label: '빨강', class: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' },
] as const;

const getColorClass = (color: string) => {
  const option = colorOptions.find(opt => opt.value === color);
  return option ? option.class : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200';
};

export function TransportationCardPage({
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
}: TransportationCardPageProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const cards = data.transportationCards || [];
  const restrictions = data.transportationCardRestrictions || [];

  const startEdit = (field: string, value: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(value || '');
  };

  const saveEdit = () => {
    if (!editingField || !onUpdate) return;

    if (editingField === 'cardPageTitle') {
      onUpdate({ transportationCardPageTitle: tempValue });
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

  const addCard = () => {
    const newCard = {
      id: Date.now().toString(),
      title: '새 교통카드',
      titleStyle: { fontSize: 20, fontWeight: 600, color: '#0e7490' } as TextStyle,
      color: 'cyan' as const,
      contentSections: [
        {
          id: '1',
          title: '발급 비용',
          titleStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
          content: '€5',
          contentStyle: { fontSize: 14, fontWeight: 400, color: '#374151' } as TextStyle,
        }
      ],
      advantages: [
        {
          id: '1',
          content: '새 장점',
          contentStyle: { fontSize: 14, fontWeight: 600, color: '#166534' } as TextStyle,
        }
      ],
      advantagesTitleStyle: { fontSize: 16, fontWeight: 600, color: '#166534' } as TextStyle,
      disadvantages: [
        {
          id: '1',
          content: '새 단점',
          contentStyle: { fontSize: 14, fontWeight: 600, color: '#991b1b' } as TextStyle,
        }
      ],
      disadvantagesTitleStyle: { fontSize: 16, fontWeight: 600, color: '#991b1b' } as TextStyle,
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
      transportationCards: [...cards, newCard]
    });
  };

  const updateCard = (cardId: string, updates: any) => {
    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    onUpdate({ transportationCards: newCards });
  };

  const deleteCard = (cardId: string) => {
    const newCards = cards.filter(card => card.id !== cardId);
    onUpdate({ transportationCards: newCards });
  };

  const addCardItem = (cardId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          items: [...card.items, {
            id: Date.now().toString(),
            label: '새 항목',
            labelStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
            content: '내용',
            contentStyle: { fontSize: 14, fontWeight: 400, color: '#4b5563' } as TextStyle,
          }]
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const updateCardItem = (cardId: string, itemId: string, updates: any) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          items: card.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const deleteCardItem = (cardId: string, itemId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          items: card.items.filter(item => item.id !== itemId)
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const addContentSection = (cardId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          contentSections: [...(card.contentSections || []), {
            id: Date.now().toString(),
            title: '새 항목',
            titleStyle: { fontSize: 14, fontWeight: 600, color: '#0e7490' } as TextStyle,
            content: '내용',
            contentStyle: { fontSize: 14, fontWeight: 400, color: '#374151' } as TextStyle,
          }]
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const deleteContentSection = (cardId: string, sectionId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          contentSections: (card.contentSections || []).filter(section => section.id !== sectionId)
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const addAdvantage = (cardId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          advantages: [...(card.advantages || []), {
            id: Date.now().toString(),
            content: '새 장점',
            contentStyle: { fontSize: 14, fontWeight: 600, color: '#166534' } as TextStyle,
          }]
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const updateAdvantage = (cardId: string, advantageId: string, updates: any) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          advantages: (card.advantages || []).map(adv =>
            adv.id === advantageId ? { ...adv, ...updates } : adv
          )
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const deleteAdvantage = (cardId: string, advantageId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          advantages: (card.advantages || []).filter(adv => adv.id !== advantageId)
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const addDisadvantage = (cardId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          disadvantages: [...(card.disadvantages || []), {
            id: Date.now().toString(),
            content: '새 단점',
            contentStyle: { fontSize: 14, fontWeight: 600, color: '#991b1b' } as TextStyle,
          }]
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const updateDisadvantage = (cardId: string, disadvantageId: string, updates: any) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          disadvantages: (card.disadvantages || []).map(dis =>
            dis.id === disadvantageId ? { ...dis, ...updates } : dis
          )
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const deleteDisadvantage = (cardId: string, disadvantageId: string) => {
    const newCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          disadvantages: (card.disadvantages || []).filter(dis => dis.id !== disadvantageId)
        };
      }
      return card;
    });
    onUpdate({ transportationCards: newCards });
  };

  const addRestriction = () => {
    const newRestriction = {
      id: Date.now().toString(),
      content: '새 제한사항'
    };
    onUpdate({
      transportationCardRestrictions: [...restrictions, newRestriction]
    });
  };

  const updateRestriction = (restrictionId: string, updates: any) => {
    const newRestrictions = restrictions.map(restriction =>
      restriction.id === restrictionId ? { ...restriction, ...updates } : restriction
    );
    onUpdate({ transportationCardRestrictions: newRestrictions });
  };

  const deleteRestriction = (restrictionId: string) => {
    const newRestrictions = restrictions.filter(restriction => restriction.id !== restrictionId);
    onUpdate({ transportationCardRestrictions: newRestrictions });
  };

  const ColorPicker = ({ 
    currentColor, 
    onColorChange, 
    cardId 
  }: { 
    currentColor: string; 
    onColorChange: (color: string) => void;
    cardId: string;
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
      className="relative min-h-screen bg-white p-4 md:p-6 lg:p-8 print:p-8 blur-container"
      data-has-blur={blurRegions.length > 0 ? "true" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Page Actions - Only visible in edit mode */}
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

      {/* Header */}
      <div className="text-center mb-4 md:mb-6 break-inside-avoid">
        <div className="flex items-center justify-center gap-2 mb-[3px]">
          {isEditMode ? (
            editingField === 'cardPageTitle' ? (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                autoFocus
                className="text-2xl md:text-3xl font-semibold text-cyan-600 bg-blue-50 px-3 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <>
                <h1 
                  className="text-2xl md:text-3xl font-semibold text-cyan-600 cursor-pointer hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                  style={getStyleObject(data.transportationCardTitleStyle)}
                  onClick={() => startEdit('cardPageTitle', data.transportationCardPageTitle || '교통카드 안내')}
                >
                  {data.transportationCardPageTitle || '교통카드 안내'}
                </h1>
                <StylePicker
                  currentStyle={data.transportationCardTitleStyle}
                  onStyleChange={(style) => onUpdate({ transportationCardTitleStyle: style })}
                  fieldKey="transportationCardTitle"
                  backgroundColorClass="bg-white"
                />
              </>
            )
          ) : (
            <h1 
              className="text-2xl md:text-3xl font-semibold text-cyan-600"
              style={getStyleObject(data.transportationCardTitleStyle)}
            >
              {data.transportationCardPageTitle || '교통카드 안내'}
            </h1>
          )}
        </div>
        <div className="w-20 md:w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-2" />
      </div>

      {/* Transportation Cards */}
      <div className="space-y-3 md:space-y-4 mb-4">
        {cards.map((card) => {
          const colorClass = getColorClass(card.color);
          
          return (
            <div
              key={card.id}
              className={`relative border-2 rounded-xl p-3 md:p-4 shadow-sm print:break-inside-avoid ${colorClass}`}
            >
              {/* Top Section: Info + Image - Stack on mobile, side by side on desktop */}
              <div className="flex flex-col lg:flex-row print:flex-row gap-3 md:gap-4 mb-3">
                {/* Left Side: Card Info */}
                <div className="flex-1">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    {/* Card Icon */}
                    <div className="p-2 md:p-3 bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateCard(card.id, { title: e.target.value })}
                            style={getStyleObject(card.titleStyle)}
                            className={`flex-1 min-w-[200px] px-3 py-2 bg-white border border-gray-200 rounded-lg ${getStyleClasses(card.titleStyle)}`}
                          />
                        ) : (
                          <h3 style={getStyleObject(card.titleStyle)} className={getStyleClasses(card.titleStyle)}>{card.title}</h3>
                        )}
                        {isEditMode && (
                          <>
                            <div onClick={(e) => e.stopPropagation()}>
                              <StylePicker
                                currentStyle={card.titleStyle}
                                onStyleChange={(style) => updateCard(card.id, { titleStyle: style })}
                                fieldKey={`${card.id}-title`}
                                backgroundColorClass={colorClass}
                              />
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setShowColorPicker(showColorPicker === card.id ? null : card.id)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                색상
                              </button>
                              
                              {/* Color Picker Dropdown */}
                              {showColorPicker === card.id && (
                                <ColorPicker
                                  currentColor={card.color}
                                  onColorChange={(color) => updateCard(card.id, { color })}
                                  cardId={card.id}
                                />
                              )}
                            </div>
                            <button
                              onClick={() => deleteCard(card.id)}
                              className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-3">
                    {(card.contentSections || []).map((section) => (
                      <div key={section.id} className="flex items-start gap-1">
                        <div className="flex-1">
                          {isEditMode ? (
                            <>
                              <div className="flex items-center gap-1 mb-1">
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => updateCard(card.id, { contentSections: (card.contentSections || []).map(s => s.id === section.id ? { ...s, title: e.target.value } : s) })}
                                  style={getStyleObject(section.titleStyle)}
                                  className={`inline-block px-2 py-1 bg-white rounded border border-gray-200 ${getStyleClasses(section.titleStyle)}`}
                                  placeholder="라벨 입력"
                                />
                                <div onClick={(e) => e.stopPropagation()}>
                                  <StylePicker
                                    currentStyle={section.titleStyle}
                                    onStyleChange={(style) => updateCard(card.id, { contentSections: (card.contentSections || []).map(s => s.id === section.id ? { ...s, titleStyle: style } : s) })}
                                    fieldKey={`${card.id}-${section.id}-title`}
                                    backgroundColorClass={colorClass}
                                  />
                                </div>
                                <button
                                  onClick={() => deleteContentSection(card.id, section.id)}
                                  className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-start gap-1">
                                <textarea
                                  value={section.content}
                                  onChange={(e) => updateCard(card.id, { contentSections: (card.contentSections || []).map(s => s.id === section.id ? { ...s, content: e.target.value } : s) })}
                                  style={getStyleObject(section.contentStyle)}
                                  className={`flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg resize-none ${getStyleClasses(section.contentStyle)}`}
                                  rows={3}
                                  placeholder="내용 입력 (엔터로 구분)"
                                />
                                <div onClick={(e) => e.stopPropagation()}>
                                  <StylePicker
                                    currentStyle={section.contentStyle}
                                    onStyleChange={(style) => updateCard(card.id, { contentSections: (card.contentSections || []).map(s => s.id === section.id ? { ...s, contentStyle: style } : s) })}
                                    fieldKey={`${card.id}-${section.id}-content`}
                                    backgroundColorClass={colorClass}
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={getStyleObject(section.titleStyle)} className={`mb-1 ${getStyleClasses(section.titleStyle)}`}>{section.title}</div>
                              <p style={getStyleObject(section.contentStyle)} className={`mt-1 whitespace-pre-line ${getStyleClasses(section.contentStyle)}`}>{section.content}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Content Section Button */}
                    {isEditMode && (
                      <button
                        onClick={() => addContentSection(card.id)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        항목 추가
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Image Box - Only show if image exists or in edit mode */}
                {(card.images && card.images.length > 0) || isEditMode ? (
                  <div className="w-full lg:w-80 print:w-80 flex-shrink-0 order-last lg:self-center print:self-center">
                    {card.images && card.images.length > 0 ? (
                      <div 
                        className={`relative group h-48 md:h-56 print:h-56 rounded-lg overflow-hidden border-2 border-white shadow-sm ${!isEditMode ? 'cursor-pointer print:cursor-default' : ''}`}
                        onClick={() => !isEditMode && card.images && setViewingImage(card.images[0])}
                      >
                        <ImageWithControls
                          src={card.images[0]}
                          alt={`${card.title} 이미지`}
                          className="w-full h-full"
                          isEditMode={isEditMode}
                          objectFit={card.imageObjectFit || 'cover'}
                          objectPosition={card.imageObjectPosition || 'center'}
                          onObjectFitChange={(fit) => updateCard(card.id, { imageObjectFit: fit })}
                          onObjectPositionChange={(position) => updateCard(card.id, { imageObjectPosition: position })}
                        />
                        {isEditMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newImages = card.images?.slice(1) || [];
                              updateCard(card.id, { images: newImages.length > 0 ? newImages : undefined });
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
                            updateCard(card.id, { images: [imageUrl] });
                          }
                        }}
                        className="w-full h-48 md:h-56 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">이미지 추가</span>
                      </button>
                    )}
                    
                    {/* Change Image Button (Edit Mode) */}
                    {isEditMode && card.images && card.images.length > 0 && (
                      <button
                        onClick={() => {
                          const imageUrl = prompt('새 이미지 URL을 입력하세요:', card.images![0]);
                          if (imageUrl) {
                            updateCard(card.id, { images: [imageUrl] });
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

              {/* Card Items (Full Width Below) */}
              <div className="space-y-4">
                {/* Advantages Section */}
                {((card.advantages && card.advantages.length > 0) || isEditMode) && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {isEditMode ? (
                        <>
                          <input
                            type="text"
                            value={card.advantagesTitle || '장점'}
                            onChange={(e) => updateCard(card.id, { advantagesTitle: e.target.value })}
                            style={getStyleObject(card.advantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#166534' } as TextStyle)}
                            className={`px-2 py-1 bg-white border border-green-200 rounded ${getStyleClasses(card.advantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#166534' } as TextStyle)}`}
                            placeholder="장점"
                          />
                          <div onClick={(e) => e.stopPropagation()}>
                            <StylePicker
                              currentStyle={card.advantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#166534' } as TextStyle}
                              onStyleChange={(style) => updateCard(card.id, { advantagesTitleStyle: style })}
                              fieldKey={`${card.id}-advantagesTitle`}
                              backgroundColorClass="bg-gradient-to-br from-green-50 to-emerald-50"
                            />
                          </div>
                        </>
                      ) : (
                        <h4 
                          style={getStyleObject(card.advantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#166534' } as TextStyle)}
                          className={`text-green-800 ${getStyleClasses(card.advantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#166534' } as TextStyle)}`}
                        >
                          {card.advantagesTitle || '장점'}
                        </h4>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {(card.advantages || []).map((advantage) => (
                        <li key={advantage.id} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <div className="flex-1">
                            {isEditMode ? (
                              <div className="flex items-start gap-1">
                                <textarea
                                  value={advantage.content}
                                  onChange={(e) => updateAdvantage(card.id, advantage.id, { content: e.target.value })}
                                  style={getStyleObject(advantage.contentStyle)}
                                  className={`flex-1 px-2 py-1 bg-white border border-green-200 rounded resize-none ${getStyleClasses(advantage.contentStyle)}`}
                                  rows={2}
                                  placeholder="장점 입력"
                                />
                                <div onClick={(e) => e.stopPropagation()}>
                                  <StylePicker
                                    currentStyle={advantage.contentStyle}
                                    onStyleChange={(style) => updateAdvantage(card.id, advantage.id, { contentStyle: style })}
                                    fieldKey={`${card.id}-advantage-${advantage.id}`}
                                    backgroundColorClass="bg-gradient-to-br from-green-50 to-emerald-50"
                                  />
                                </div>
                                <button
                                  onClick={() => deleteAdvantage(card.id, advantage.id)}
                                  className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <p style={getStyleObject(advantage.contentStyle)} className={`text-green-800 whitespace-pre-line ${getStyleClasses(advantage.contentStyle)}`}>
                                {advantage.content}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {isEditMode && (
                      <button
                        onClick={() => addAdvantage(card.id)}
                        className="w-full mt-3 py-2 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-500 hover:bg-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        장점 추가
                      </button>
                    )}
                  </div>
                )}

                {/* Disadvantages Section */}
                {((card.disadvantages && card.disadvantages.length > 0) || isEditMode) && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {isEditMode ? (
                        <>
                          <input
                            type="text"
                            value={card.disadvantagesTitle || '단점'}
                            onChange={(e) => updateCard(card.id, { disadvantagesTitle: e.target.value })}
                            style={getStyleObject(card.disadvantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#991b1b' } as TextStyle)}
                            className={`px-2 py-1 bg-white border border-red-200 rounded ${getStyleClasses(card.disadvantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#991b1b' } as TextStyle)}`}
                            placeholder="단점"
                          />
                          <div onClick={(e) => e.stopPropagation()}>
                            <StylePicker
                              currentStyle={card.disadvantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#991b1b' } as TextStyle}
                              onStyleChange={(style) => updateCard(card.id, { disadvantagesTitleStyle: style })}
                              fieldKey={`${card.id}-disadvantagesTitle`}
                              backgroundColorClass="bg-gradient-to-br from-red-50 to-orange-50"
                            />
                          </div>
                        </>
                      ) : (
                        <h4 
                          style={getStyleObject(card.disadvantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#991b1b' } as TextStyle)}
                          className={`text-red-800 ${getStyleClasses(card.disadvantagesTitleStyle || { fontSize: 16, fontWeight: 600, color: '#991b1b' } as TextStyle)}`}
                        >
                          {card.disadvantagesTitle || '단점'}
                        </h4>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {(card.disadvantages || []).map((disadvantage) => (
                        <li key={disadvantage.id} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <div className="flex-1">
                            {isEditMode ? (
                              <div className="flex items-start gap-1">
                                <textarea
                                  value={disadvantage.content}
                                  onChange={(e) => updateDisadvantage(card.id, disadvantage.id, { content: e.target.value })}
                                  style={getStyleObject(disadvantage.contentStyle)}
                                  className={`flex-1 px-2 py-1 bg-white border border-red-200 rounded resize-none ${getStyleClasses(disadvantage.contentStyle)}`}
                                  rows={2}
                                  placeholder="단점 입력"
                                />
                                <div onClick={(e) => e.stopPropagation()}>
                                  <StylePicker
                                    currentStyle={disadvantage.contentStyle}
                                    onStyleChange={(style) => updateDisadvantage(card.id, disadvantage.id, { contentStyle: style })}
                                    fieldKey={`${card.id}-disadvantage-${disadvantage.id}`}
                                    backgroundColorClass="bg-gradient-to-br from-red-50 to-orange-50"
                                  />
                                </div>
                                <button
                                  onClick={() => deleteDisadvantage(card.id, disadvantage.id)}
                                  className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <p style={getStyleObject(disadvantage.contentStyle)} className={`text-red-800 whitespace-pre-line ${getStyleClasses(disadvantage.contentStyle)}`}>
                                {disadvantage.content}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {isEditMode && (
                      <button
                        onClick={() => addDisadvantage(card.id)}
                        className="w-full mt-3 py-2 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:border-red-500 hover:bg-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        단점 추가
                      </button>
                    )}
                  </div>
                )}

                {/* Legacy Items Section - Keep for backward compatibility */}
                {card.items && card.items.length > 0 && (
                  <div className="space-y-2">
                    {card.items.map((item) => (
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
                                    onChange={(e) => updateCardItem(card.id, item.id, { label: e.target.value })}
                                    style={getStyleObject(item.labelStyle)}
                                    className={`flex-1 px-2 py-1 border border-gray-200 rounded ${getStyleClasses(item.labelStyle)}`}
                                    placeholder="항목 제목"
                                  />
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <StylePicker
                                      currentStyle={item.labelStyle}
                                      onStyleChange={(style) => updateCardItem(card.id, item.id, { labelStyle: style })}
                                      fieldKey={`${card.id}-${item.id}-label`}
                                      backgroundColorClass={colorClass}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-start gap-1">
                                  <textarea
                                    value={item.content}
                                    onChange={(e) => updateCardItem(card.id, item.id, { content: e.target.value })}
                                    style={getStyleObject(item.contentStyle)}
                                    className={`flex-1 px-2 py-1 border border-gray-200 rounded resize-none ${getStyleClasses(item.contentStyle)}`}
                                    rows={2}
                                    placeholder="항목 내용"
                                  />
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <StylePicker
                                      currentStyle={item.contentStyle}
                                      onStyleChange={(style) => updateCardItem(card.id, item.id, { contentStyle: style })}
                                      fieldKey={`${card.id}-${item.id}-content`}
                                      backgroundColorClass={colorClass}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={getStyleObject(item.labelStyle)} className={`mb-1 ${getStyleClasses(item.labelStyle)}`}>{item.label}</div>
                                <p style={getStyleObject(item.contentStyle)} className={getStyleClasses(item.contentStyle)}>{item.content}</p>
                              </>
                            )}
                          </div>
                          {isEditMode && (
                            <button
                              onClick={() => deleteCardItem(card.id, item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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
                        onClick={() => addCardItem(card.id)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        항목 추가
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Add Card Button */}
        {isEditMode && (
          <button
            onClick={addCard}
            className="w-full py-4 border-2 border-dashed border-cyan-300 rounded-xl text-cyan-500 hover:border-cyan-500 hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            교통카드 추가
          </button>
        )}
      </div>

      {/* Restrictions Section */}
      {restrictions && restrictions.length > 0 && (
        <div className="break-inside-avoid">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              {isEditMode ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={data.transportationCardRestrictionsTitle || '주의사항'}
                    onChange={(e) => onUpdate({ transportationCardRestrictionsTitle: e.target.value })}
                    style={getStyleObject(data.transportationCardRestrictionsTitleStyle)}
                    className={`flex-1 px-2 py-1 bg-white border border-yellow-200 rounded ${getStyleClasses(data.transportationCardRestrictionsTitleStyle)}`}
                    placeholder="제목 입력"
                  />
                  <div onClick={(e) => e.stopPropagation()}>
                    <StylePicker
                      currentStyle={data.transportationCardRestrictionsTitleStyle}
                      onStyleChange={(style) => onUpdate({ transportationCardRestrictionsTitleStyle: style })}
                      fieldKey="transportationCardRestrictionsTitle"
                      backgroundColorClass="bg-gradient-to-br from-yellow-50 to-orange-50"
                    />
                  </div>
                  <button
                    onClick={() => onUpdate({ transportationCardRestrictions: [] })}
                    className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                    title="주의사항 섹션 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h2 
                  style={getStyleObject(data.transportationCardRestrictionsTitleStyle)} 
                  className={`text-lg text-yellow-700 ${getStyleClasses(data.transportationCardRestrictionsTitleStyle)}`}
                >
                  {data.transportationCardRestrictionsTitle || '주의사항'}
                </h2>
              )}
            </div>
            
            <ul className="space-y-2">
              {restrictions.map((restriction) => (
                <li key={restriction.id} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <div className="flex-1">
                    {isEditMode ? (
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={restriction.content}
                          onChange={(e) => updateRestriction(restriction.id, { content: e.target.value })}
                          style={getStyleObject(restriction.contentStyle)}
                          className={`flex-1 px-2 py-1 bg-white border border-yellow-200 rounded ${getStyleClasses(restriction.contentStyle)}`}
                        />
                        <div onClick={(e) => e.stopPropagation()}>
                          <StylePicker
                            currentStyle={restriction.contentStyle}
                            onStyleChange={(style) => updateRestriction(restriction.id, { contentStyle: style })}
                            fieldKey={`restriction-${restriction.id}`}
                            backgroundColorClass="bg-gradient-to-br from-yellow-50 to-orange-50"
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
                      <span style={getStyleObject(restriction.contentStyle)} className={`text-yellow-700 ${getStyleClasses(restriction.contentStyle)}`}>{restriction.content}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Add Restriction Button */}
            {isEditMode && (
              <button
                onClick={addRestriction}
                className="w-full mt-4 py-2 border-2 border-dashed border-yellow-300 rounded-lg text-yellow-600 hover:border-yellow-500 hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                주의사항 추가
              </button>
            )}
          </div>
        </div>
      )}

      {isEditMode && (!restrictions || restrictions.length === 0) && (
        <button
          onClick={addRestriction}
          className="w-full py-4 border-2 border-dashed border-yellow-300 rounded-xl text-yellow-500 hover:border-yellow-500 hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          주의사항 섹션 추가
        </button>
      )}

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
              alt="교통카드 이미지"
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