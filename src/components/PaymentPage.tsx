import { CreditCard, AlertTriangle, CalendarClock, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { useState } from 'react';
import { StylePicker } from './StylePicker';
import { getStyleObject } from '../types/text-style';
import { Button } from './ui/button';
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

export function PaymentPage({ 
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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const startEdit = (field: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const saveEdit = () => {
    if (!editingField || !onUpdate) return;
    onUpdate({ [editingField]: tempValue });
    setEditingField(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // For textarea fields, save on Ctrl+Enter or Cmd+Enter
    if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || e.key === 'Escape') {
      e.preventDefault();
      if (e.key === 'Escape') {
        cancelEdit();
      } else {
        saveEdit();
      }
    }
  };

  const savePaymentMethodEdit = () => {
    if (!editingField || !onUpdate) return;
    
    // Parse field like "paymentMethod-0-title" or "paymentMethod-1-details"
    const match = editingField.match(/paymentMethod-(\d+)-(title|details)/);
    if (match) {
      const index = parseInt(match[1]);
      const field = match[2];
      
      const newMethods = [...data.paymentMethods];
      newMethods[index] = { ...newMethods[index], [field]: tempValue };
      onUpdate({ paymentMethods: newMethods });
    }
    
    setEditingField(null);
    setTempValue('');
  };

  const addPaymentMethod = () => {
    if (!onUpdate) return;
    const newMethods = [...data.paymentMethods, { title: '새 결제 방법', details: '세부 내용을 입력하세요' }];
    onUpdate({ paymentMethods: newMethods });
  };

  const deletePaymentMethod = (index: number) => {
    if (!onUpdate) return;
    const newMethods = data.paymentMethods.filter((_, i) => i !== index);
    onUpdate({ paymentMethods: newMethods });
  };

  const startPaymentMethodEdit = (index: number, field: 'title' | 'details', currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(`paymentMethod-${index}-${field}`);
    setTempValue(currentValue || '');
  };

  const paymentInfo = [
    {
      icon: CalendarClock,
      title: data.paymentDeadlineTitle || '계약확정 및 결제일',
      content: data.paymentDeadline,
      color: 'cyan',
      editable: true,
      field: 'paymentDeadline',
      titleEditable: true,
      titleField: 'paymentDeadlineTitle',
    },
    {
      icon: CreditCard,
      title: data.paymentCardReceiptTitle || '현금영수증 & 카드결제',
      content: data.paymentCardReceipt,
      color: 'yellow',
      editable: true,
      field: 'paymentCardReceipt',
      titleEditable: true,
      titleField: 'paymentCardReceiptTitle',
    },
    {
      icon: AlertTriangle,
      title: data.paymentCancellationTitle || '여행 취소 시 환불',
      content: data.paymentCancellation,
      color: 'red',
      editable: true,
      field: 'paymentCancellation',
      titleEditable: true,
      titleField: 'paymentCancellationTitle',
    },
  ] as const;

  return (
    <div 
      className="relative min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:min-h-[297mm] print:py-10 print:px-12 blur-container"
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
      
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-[3px]">
            {isEditMode ? (
              editingField === 'paymentPageTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEdit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-2xl md:text-3xl font-semibold text-cyan-600 bg-blue-50 px-3 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                  style={getStyleObject(data.paymentPageTitleStyle)}
                />
              ) : (
                <>
                  <h1 
                    style={getStyleObject(data.paymentPageTitleStyle)}
                    className="cursor-pointer hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                    onClick={() => startEdit('paymentPageTitle', data.paymentPageTitle || '결제 안내')}
                  >
                    {data.paymentPageTitle || '결제 안내'}
                  </h1>
                  <StylePicker
                    currentStyle={data.paymentPageTitleStyle}
                    onStyleChange={(style) => onUpdate({ paymentPageTitleStyle: style })}
                    fieldKey="paymentPageTitle"
                    backgroundColorClass="bg-white"
                  />
                </>
              )
            ) : (
              <h1 
                style={getStyleObject(data.paymentPageTitleStyle)}
              >
                {data.paymentPageTitle || '결제 안내'}
              </h1>
            )}
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
        </div>

        {/* Payment Info Cards */}
        <div className="space-y-4 print:space-y-3">
          {paymentInfo.map((info, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 print:p-4 shadow-lg border-2 print:break-inside-avoid ${
                info.color === 'cyan'
                  ? 'border-cyan-200'
                  : info.color === 'yellow'
                  ? 'border-yellow-200'
                  : 'border-red-200'
              }`}
            >
              <div className="flex items-start gap-4 print:gap-3">
                <div
                  className={`p-3 print:p-2 rounded-xl text-white shadow-md flex-shrink-0 ${
                    info.color === 'cyan'
                      ? 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                      : info.color === 'yellow'
                      ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  <info.icon className="w-5 h-5 print:w-4 print:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 print:mb-1.5">
                    {isEditMode && info.titleEditable && editingField === info.titleField ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        onBlur={saveEdit}
                        autoFocus
                        className={`font-bold text-[20px] print:text-xs bg-transparent border-2 rounded px-2 py-1 ${
                          info.color === 'cyan'
                            ? 'text-cyan-700 border-cyan-300'
                            : info.color === 'yellow'
                            ? 'text-yellow-700 border-yellow-300'
                            : 'text-red-700 border-red-300'
                        } focus:outline-none`}
                        style={getStyleObject(data.paymentInfoTitleStyle)}
                      />
                    ) : (
                      <h3
                        className={`font-bold text-[20px] print:text-xs ${
                          info.color === 'cyan'
                            ? 'text-cyan-700'
                            : info.color === 'yellow'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        } ${isEditMode && info.titleEditable ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors' : ''}`}
                        style={getStyleObject(data.paymentInfoTitleStyle)}
                        onClick={() => info.titleEditable && info.titleField && startEdit(info.titleField, info.title)}
                      >
                        {info.title}
                      </h3>
                    )}
                    {index === 0 && isEditMode && editingField !== info.titleField && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <StylePicker
                          currentStyle={data.paymentInfoTitleStyle}
                          onStyleChange={(style) => onUpdate?.({ paymentInfoTitleStyle: style })}
                          fieldKey="paymentInfoTitle"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    )}
                  </div>
                  {info.editable && isEditMode && editingField === info.field ? (
                    <div>
                      <textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className={`w-full bg-transparent border-2 rounded-lg p-2 ${
                          info.color === 'cyan'
                            ? 'border-cyan-200'
                            : info.color === 'yellow'
                            ? 'border-yellow-200'
                            : 'border-red-200'
                        } focus:outline-none text-gray-700 text-sm print:text-xs resize-none`}
                        rows={4}
                        placeholder="각 항목을 엔터로 구분해주세요"
                      />
                      <p className="text-gray-400 text-[10px] mt-1">Ctrl+Enter로 저장, Esc로 취소</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p 
                        className={`flex-1 text-gray-700 text-sm print:text-xs whitespace-pre-line leading-relaxed ${
                          info.editable && isEditMode ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' : ''
                        }`}
                        style={getStyleObject(data.paymentInfoContentStyle)}
                        onClick={() => info.editable && info.field && startEdit(info.field, info.content)}
                      >
                        {info.content}
                      </p>
                      {index === 0 && isEditMode && editingField !== info.field && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <StylePicker
                            currentStyle={data.paymentInfoContentStyle}
                            onStyleChange={(style) => onUpdate?.({ paymentInfoContentStyle: style })}
                            fieldKey="paymentInfoContent"
                            backgroundColorClass="bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-gradient-to-br from-cyan-50 to-yellow-50 rounded-2xl p-6 print:p-5 border border-cyan-100 print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4 print:mb-3">
            <CreditCard className="w-4 h-4 print:w-3.5 print:h-3.5 text-cyan-700" />
            {isEditMode && editingField === 'paymentMethodsTitle' ? (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                onBlur={saveEdit}
                autoFocus
                className="text-cyan-700 text-base print:text-sm font-bold text-[20px] bg-transparent border-2 border-cyan-300 rounded px-2 py-1 focus:outline-none"
                style={getStyleObject(data.paymentMethodsTitleStyle)}
              />
            ) : (
              <h3 
                className={`text-cyan-700 text-base print:text-sm font-bold text-[20px] ${
                  isEditMode ? 'cursor-pointer hover:bg-cyan-100 px-2 py-1 rounded transition-colors' : ''
                }`}
                style={getStyleObject(data.paymentMethodsTitleStyle)}
                onClick={() => startEdit('paymentMethodsTitle', data.paymentMethodsTitle || '결제 방법')}
              >
                {data.paymentMethodsTitle || '결제 방법'}
              </h3>
            )}
            {isEditMode && editingField !== 'paymentMethodsTitle' && (
              <div onClick={(e) => e.stopPropagation()}>
                <StylePicker
                  currentStyle={data.paymentMethodsTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ paymentMethodsTitleStyle: style })}
                  fieldKey="paymentMethodsTitle"
                  backgroundColorClass="bg-gradient-to-br from-cyan-50 to-yellow-50"
                />
              </div>
            )}
          </div>
          <div className="space-y-3 print:space-y-2">
            {data.paymentMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-xl p-4 print:p-3 shadow-sm relative">
                {/* Title */}
                {isEditMode && editingField === `paymentMethod-${index}-title` ? (
                  <div>
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          savePaymentMethodEdit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      onBlur={savePaymentMethodEdit}
                      autoFocus
                      className="w-full bg-transparent border-b-2 border-cyan-300 focus:outline-none text-xs print:text-[10px] text-gray-500 mb-1.5 print:mb-1"
                    />
                    <p className="text-gray-400 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1.5 print:mb-1">
                    <p 
                      className={`text-xs print:text-[10px] text-gray-500 ${
                        isEditMode ? 'cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors' : ''
                      }`}
                      style={getStyleObject(data.paymentMethodItemTitleStyle)}
                      onClick={() => startPaymentMethodEdit(index, 'title', method.title)}
                    >
                      {method.title}
                    </p>
                    {index === 0 && isEditMode && editingField !== `paymentMethod-${index}-title` && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <StylePicker
                          currentStyle={data.paymentMethodItemTitleStyle}
                          onStyleChange={(style) => onUpdate?.({ paymentMethodItemTitleStyle: style })}
                          fieldKey="paymentMethodItemTitle"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Details */}
                {isEditMode && editingField === `paymentMethod-${index}-details` ? (
                  <div>
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || e.key === 'Escape') {
                          e.preventDefault();
                          if (e.key === 'Escape') {
                            cancelEdit();
                          } else {
                            savePaymentMethodEdit();
                          }
                        }
                      }}
                      onBlur={savePaymentMethodEdit}
                      autoFocus
                      className="w-full bg-transparent border-2 border-cyan-200 rounded-lg p-2 focus:outline-none text-gray-800 text-sm print:text-xs resize-none"
                      rows={3}
                      placeholder="각 항목을 엔터로 구분해주세요"
                    />
                    <p className="text-gray-400 text-[10px] mt-1">Ctrl+Enter로 저장, Esc로 취소</p>
                  </div>
                ) : (
                  <div 
                    className={`space-y-1.5 print:space-y-1 ${
                      isEditMode ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' : ''
                    }`}
                    onClick={() => startPaymentMethodEdit(index, 'details', method.details)}
                  >
                    {method.details.split('\n').filter(item => item.trim()).map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan-500 mt-0.5 text-sm print:text-xs">•</span>
                        <div className="flex items-center gap-2 flex-1">
                          <p 
                            className="text-gray-800 text-sm print:text-xs"
                            style={getStyleObject(data.paymentMethodItemDetailStyle)}
                          >
                            {line}
                          </p>
                          {i === 0 && index === 0 && isEditMode && editingField !== `paymentMethod-${index}-details` && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <StylePicker
                                currentStyle={data.paymentMethodItemDetailStyle}
                                onStyleChange={(style) => onUpdate?.({ paymentMethodItemDetailStyle: style })}
                                fieldKey="paymentMethodItemDetail"
                                backgroundColorClass="bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Delete button */}
                {isEditMode && (
                  <div className="mt-3 print:mt-2 pt-3 print:pt-2 border-t border-gray-200">
                    <button
                      className="text-red-500 hover:text-red-700 text-xs print:text-[10px] flex items-center gap-1 transition-colors"
                      onClick={() => deletePaymentMethod(index)}
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
                className="w-full bg-white rounded-xl p-4 print:p-3 shadow-sm text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 text-sm print:text-xs flex items-center justify-center gap-2 transition-colors"
                onClick={addPaymentMethod}
              >
                <Plus className="w-4 h-4 print:w-3.5 print:h-3.5" />
                결제 방법 추가
              </button>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-white rounded-2xl p-6 print:p-5 shadow-lg border border-gray-200 print:break-inside-avoid">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 print:w-4 print:h-4 text-orange-500 flex-shrink-0 mt-1" />
            <div className="space-y-2 print:space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                {isEditMode && editingField === 'paymentNoticesTitle' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEdit();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-gray-900 text-sm print:text-xs font-bold text-[20px] bg-transparent border-2 border-gray-300 rounded px-2 py-1 focus:outline-none"
                    style={getStyleObject(data.paymentNoticesTitleStyle)}
                  />
                ) : (
                  <h4 
                    className={`text-gray-900 text-sm print:text-xs font-bold text-[20px] ${
                      isEditMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors' : ''
                    }`}
                    style={getStyleObject(data.paymentNoticesTitleStyle)}
                    onClick={() => startEdit('paymentNoticesTitle', data.paymentNoticesTitle || '유의사항')}
                  >
                    {data.paymentNoticesTitle || '유의사항'}
                  </h4>
                )}
                {isEditMode && editingField !== 'paymentNoticesTitle' && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <StylePicker
                      currentStyle={data.paymentNoticesTitleStyle}
                      onStyleChange={(style) => onUpdate?.({ paymentNoticesTitleStyle: style })}
                      fieldKey="paymentNoticesTitle"
                      backgroundColorClass="bg-white"
                    />
                  </div>
                )}
              </div>
              {isEditMode && editingField === 'paymentNotices' ? (
                <div>
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="w-full bg-transparent border-2 border-gray-300 rounded-lg p-2 focus:outline-none text-gray-700 text-xs print:text-[10px] resize-none"
                    rows={5}
                    placeholder="각 항목을 엔터로 구분해주세요"
                  />
                  <p className="text-gray-400 text-[10px] mt-1">Ctrl+Enter로 저장, Esc로 취소</p>
                </div>
              ) : (
                <ul 
                  className={`space-y-1.5 print:space-y-1 text-gray-700 text-xs print:text-[10px] leading-relaxed ${
                    isEditMode ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' : ''
                  }`}
                  onClick={() => startEdit('paymentNotices', data.paymentNotices)}
                >
                  {data.paymentNotices.split('\n').filter(item => item.trim()).map((notice, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <div className="flex items-center gap-2 flex-1">
                        <span 
                          style={getStyleObject(data.paymentNoticesItemStyle)}
                        >
                          {notice}
                        </span>
                        {i === 0 && isEditMode && editingField !== 'paymentNotices' && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <StylePicker
                              currentStyle={data.paymentNoticesItemStyle}
                              onStyleChange={(style) => onUpdate?.({ paymentNoticesItemStyle: style })}
                              fieldKey="paymentNoticesItem"
                              backgroundColorClass="bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 print:p-5 shadow-xl text-white text-center print:break-inside-avoid">
          {isEditMode && editingField === 'contactTitle' ? (
            <div className="mb-3 print:mb-2">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                onBlur={saveEdit}
                autoFocus
                className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-base print:text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[120px]"
              />
              <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-3 print:mb-2">
              <h3 
                className={`text-base print:text-sm font-bold text-[20px] ${
                  isEditMode ? 'cursor-pointer hover:bg-white/10 px-3 py-1 rounded transition-colors' : ''
                }`}
                style={getStyleObject(data.contactTitleStyle)}
                onClick={() => startEdit('contactTitle', data.contactTitle)}
              >
                {data.contactTitle}
              </h3>
              {isEditMode && (
                <div onClick={(e) => e.stopPropagation()}>
                  <StylePicker
                    currentStyle={data.contactTitleStyle}
                    onStyleChange={(style) => onUpdate?.({ contactTitleStyle: style })}
                    fieldKey="contactTitle"
                    backgroundColorClass="bg-gradient-to-br from-cyan-500 to-cyan-600"
                  />
                </div>
              )}
            </div>
          )}
          <div className="space-y-1.5 print:space-y-1 text-sm print:text-xs">
            {isEditMode && editingField === 'contactPerson' ? (
              <div>
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEdit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  onBlur={saveEdit}
                  autoFocus
                  className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-sm print:text-xs text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[200px]"
                  placeholder="담당자: "
                />
                <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <p 
                  className={`${
                    isEditMode ? 'cursor-pointer hover:bg-white/10 px-3 py-1 rounded transition-colors' : ''
                  }`}
                  style={getStyleObject(data.contactInfoStyle)}
                  onClick={() => startEdit('contactPerson', data.contactPerson)}
                >
                  담당자: {data.contactPerson}
                </p>
                {isEditMode && editingField !== 'contactPerson' && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <StylePicker
                      currentStyle={data.contactInfoStyle}
                      onStyleChange={(style) => onUpdate?.({ contactInfoStyle: style })}
                      fieldKey="contactInfo"
                      backgroundColorClass="bg-gradient-to-br from-cyan-500 to-cyan-600"
                    />
                  </div>
                )}
              </div>
            )}
            
            {isEditMode && editingField === 'contactEmail' ? (
              <div>
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEdit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  onBlur={saveEdit}
                  autoFocus
                  className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-sm print:text-xs text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[250px]"
                  placeholder="이메일: "
                />
                <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
              </div>
            ) : (
              <p 
                className={`${
                  isEditMode ? 'cursor-pointer hover:bg-white/10 inline-block px-3 py-1 rounded transition-colors' : ''
                }`}
                style={getStyleObject(data.contactInfoStyle)}
                onClick={() => startEdit('contactEmail', data.contactEmail)}
              >
                이메일: {data.contactEmail}
              </p>
            )}
            
            {isEditMode && editingField === 'contactPhone' ? (
              <div>
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEdit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  onBlur={saveEdit}
                  autoFocus
                  className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-sm print:text-xs text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[200px]"
                  placeholder="전화: "
                />
                <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
              </div>
            ) : (
              <p 
                className={`${
                  isEditMode ? 'cursor-pointer hover:bg-white/10 inline-block px-3 py-1 rounded transition-colors' : ''
                }`}
                style={getStyleObject(data.contactInfoStyle)}
                onClick={() => startEdit('contactPhone', data.contactPhone)}
              >
                전화: {data.contactPhone}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}