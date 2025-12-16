import { Phone, Mail, User, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
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

export function ContactPage({
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

  return (
    <div
      className="relative min-h-screen p-4 md:p-6 lg:p-8 py-12 md:py-16 print:min-h-[297mm] print:py-10 print:px-12 blur-container flex items-center justify-center"
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

      <div className="max-w-3xl mx-auto w-full space-y-8 print:space-y-6">
        {/* Header */}
        <div className="text-center">
          <div data-blur-key="contactPageTitle" className="w-full">
            <div className="flex items-center justify-center gap-2 mb-[3px]">
              {isEditMode ? (
                editingField === 'contactPageTitle' ? (
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
                    style={getStyleObject(data.contactPageTitleStyle)}
                  />
                ) : (
                  <>
                    <h1
                      style={getStyleObject(data.contactPageTitleStyle)}
                      className="cursor-pointer hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                      onClick={() => startEdit('contactPageTitle', data.contactPageTitle || '문의 하기')}
                    >
                      {data.contactPageTitle || '문의 하기'}
                    </h1>
                    <StylePicker
                      currentStyle={data.contactPageTitleStyle}
                      onStyleChange={(style) => onUpdate?.({ contactPageTitleStyle: style })}
                      fieldKey="contactPageTitle"
                      backgroundColorClass="bg-white"
                    />
                  </>
                )
              ) : (
                <h1 style={getStyleObject(data.contactPageTitleStyle)}>
                  {data.contactPageTitle || '문의 하기'}
                </h1>
              )}
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-8" />
          </div>
        </div>

        {/* Contact Card */}
        <div data-blur-key="contactCard" className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-8 md:p-12 print:p-8 shadow-xl text-white text-center print:break-inside-avoid">
          {isEditMode && editingField === 'contactTitle' ? (
            <div className="mb-6 print:mb-4">
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
                className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-xl md:text-2xl print:text-lg text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[150px]"
              />
              <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-6 print:mb-4">
              <h3
                className={`text-xl md:text-2xl print:text-lg font-bold ${
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

          <div className="space-y-4 print:space-y-3">
            {/* 담당자 */}
            <div data-blur-key="contactPerson" className="flex items-center justify-center gap-3">
              <User className="w-5 h-5 print:w-4 print:h-4 text-white/80" />
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
                    className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-base print:text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[200px]"
                    placeholder="담당자"
                  />
                  <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p
                    className={`text-base print:text-sm ${
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
            </div>

            {/* 이메일 */}
            <div data-blur-key="contactEmail" className="flex items-center justify-center gap-3">
              <Mail className="w-5 h-5 print:w-4 print:h-4 text-white/80" />
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
                    className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-base print:text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[250px]"
                    placeholder="이메일"
                  />
                  <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
                </div>
              ) : (
                <p
                  className={`text-base print:text-sm ${
                    isEditMode ? 'cursor-pointer hover:bg-white/10 inline-block px-3 py-1 rounded transition-colors' : ''
                  }`}
                  style={getStyleObject(data.contactInfoStyle)}
                  onClick={() => startEdit('contactEmail', data.contactEmail)}
                >
                  이메일: {data.contactEmail}
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div data-blur-key="contactPhone" className="flex items-center justify-center gap-3">
              <Phone className="w-5 h-5 print:w-4 print:h-4 text-white/80" />
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
                    className="bg-white/20 border-2 border-white/30 rounded-lg px-3 py-1 text-center text-base print:text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/50 w-auto min-w-[200px]"
                    placeholder="전화번호"
                  />
                  <p className="text-white/70 text-[10px] mt-1">Enter로 저장, Esc로 취소</p>
                </div>
              ) : (
                <p
                  className={`text-base print:text-sm ${
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

        {/* Additional Message */}
        <div data-blur-key="contactMessage" className="text-center text-gray-500 text-sm print:text-xs">
          <p>언제든지 편하게 연락주세요. 친절하게 상담해 드리겠습니다.</p>
        </div>
      </div>
    </div>
  );
}
