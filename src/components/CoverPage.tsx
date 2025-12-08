import logoImage from 'figma:asset/1100f1d34a250da4c1585b7146206ed44ae1ca51.png';
import { Sparkles, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { getStyleObject } from '../types/text-style';
import { StylePicker } from './StylePicker';
import { Button } from './ui/button';
import { useState } from 'react';
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

export function CoverPage({ 
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
  const [isHovered, setIsHovered] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState<string | null>(null);

  return (
    <div
      className={`flex flex-col items-center p-4 md:p-6 lg:p-8 py-12 md:py-16 pb-24 md:pb-28 lg:pb-32 relative overflow-hidden print:py-10 print:px-12 print:pb-12 blur-container ${
        isBlurMode || blurRegions.length > 0
          ? 'justify-start overflow-auto'
          : 'min-h-screen justify-center'
      }`}
      style={isBlurMode || blurRegions.length > 0 ? { height: '297mm', minHeight: '297mm' } : undefined}
      data-blur-mode={isBlurMode ? "true" : undefined}
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
            title="페이지 복제"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded transition-colors"
              title="페이지 삭제"
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
          onAddBlurRegion={onAddBlurRegion}
          onRemoveBlurRegion={onRemoveBlurRegion}
        />
      )}

      {/* Decorative Elements */}
      <div className="absolute top-10 md:top-20 left-5 md:left-10 w-24 md:w-32 h-24 md:h-32 bg-yellow-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-32 md:w-40 h-32 md:h-40 bg-cyan-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-1/3 right-10 md:right-20 w-20 md:w-24 h-20 md:h-24 bg-green-200 rounded-full opacity-15 blur-2xl" />

      <div className="relative z-10 text-center space-y-8 md:space-y-10 lg:space-y-12 max-w-2xl w-full px-4 print:space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-6 md:mb-8 animate-fade-in">
          <img src={logoImage} alt="Uninatour Logo" className="h-14 md:h-16 lg:h-20 object-contain" />
        </div>

        {/* Title */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-cyan-500" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <div data-blur-key="coverMainTitle">
              {isEditMode ? (
                <input
                  type="text"
                  value={data.coverMainTitle}
                  onChange={(e) => onUpdate?.({ coverMainTitle: e.target.value })}
                  style={getStyleObject(data.coverMainTitleStyle)}
                  className="text-center text-2xl md:text-3xl font-semibold text-cyan-600 tracking-wider bg-white border-2 border-cyan-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 w-full max-w-md"
                />
              ) : (
                <h1
                  style={getStyleObject(data.coverMainTitleStyle)}
                  className="text-2xl md:text-3xl font-semibold text-cyan-600 tracking-wider"
                >
                  {data.coverMainTitle}
                </h1>
              )}
            </div>
            {isEditMode && (
              <div className="relative flex-shrink-0">
                <StylePicker
                  currentStyle={data.coverMainTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ coverMainTitleStyle: style })}
                  fieldKey="coverMainTitle"
                  backgroundColorClass="bg-white"
                />
              </div>
            )}
          </div>
          <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full" />
        </div>

        {/* Customer Info */}
        <div data-blur-key="customerInfoCard" className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg border border-cyan-100">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center gap-2">
              <div data-blur-key="coverTitle">
                {isEditMode ? (
                  <input
                    type="text"
                    value={data.coverTitle}
                    onChange={(e) => onUpdate?.({ coverTitle: e.target.value })}
                    style={getStyleObject(data.coverTitleStyle)}
                    className="text-center text-cyan-700 bg-white border-2 border-cyan-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 w-full max-w-xs"
                  />
                ) : (
                  <h2
                    style={getStyleObject(data.coverTitleStyle)}
                    className="text-cyan-700"
                  >
                    {data.coverTitle}
                  </h2>
                )}
              </div>
              {isEditMode && (
                <div className="relative flex-shrink-0">
                  <StylePicker
                    currentStyle={data.coverTitleStyle}
                    onStyleChange={(style) => onUpdate?.({ coverTitleStyle: style })}
                    fieldKey="coverTitle"
                    backgroundColorClass="bg-white/80"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 md:space-y-3 text-gray-700">
              <div className="flex items-center justify-center gap-2">
                <div data-blur-key="coverPlanningLabel">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={data.coverPlanningLabel}
                      onChange={(e) => onUpdate?.({ coverPlanningLabel: e.target.value })}
                      style={getStyleObject(data.coverPlanningLabelStyle)}
                      className="text-center text-cyan-600 bg-white border-2 border-cyan-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 w-full max-w-xs"
                    />
                  ) : (
                    <p
                      style={getStyleObject(data.coverPlanningLabelStyle)}
                      className="text-cyan-600"
                    >
                      {data.coverPlanningLabel}
                    </p>
                  )}
                </div>
                {isEditMode && (
                  <div className="relative flex-shrink-0">
                    <StylePicker
                      currentStyle={data.coverPlanningLabelStyle}
                      onStyleChange={(style) => onUpdate?.({ coverPlanningLabelStyle: style })}
                      fieldKey="coverPlanningLabel"
                      backgroundColorClass="bg-white/80"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div data-blur-key="coverDate">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={data.coverDate}
                      onChange={(e) => onUpdate?.({ coverDate: e.target.value })}
                      style={getStyleObject(data.coverDateStyle)}
                      className="text-center bg-white border-2 border-cyan-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 w-full max-w-xs"
                    />
                  ) : (
                    <p style={getStyleObject(data.coverDateStyle)}>{data.coverDate}</p>
                  )}
                </div>
                {isEditMode && (
                  <div className="relative flex-shrink-0">
                    <StylePicker
                      currentStyle={data.coverDateStyle}
                      onStyleChange={(style) => onUpdate?.({ coverDateStyle: style })}
                      fieldKey="coverDate"
                      backgroundColorClass="bg-white/80"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Planner Info */}
        <div data-blur-key="plannerInfoCard" className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <div data-blur-key="plannerName">
              {isEditMode ? (
                <input
                  type="text"
                  value={data.plannerName}
                  onChange={(e) => onUpdate?.({ plannerName: e.target.value })}
                  style={getStyleObject(data.plannerNameStyle)}
                  className="text-center bg-cyan-600 text-white border-2 border-white/50 rounded-lg px-4 py-2 focus:outline-none focus:border-white placeholder-white/70 w-full max-w-xs"
                  placeholder="담당자: "
                />
              ) : (
                <p style={getStyleObject(data.plannerNameStyle)}>담당 플래너 : {data.plannerName}</p>
              )}
            </div>
            {isEditMode && (
              <div className="relative flex-shrink-0">
                <StylePicker
                  currentStyle={data.plannerNameStyle}
                  onStyleChange={(style) => onUpdate?.({ plannerNameStyle: style })}
                  fieldKey="plannerName"
                  backgroundColorClass="bg-cyan-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="flex flex-col items-center gap-2 text-gray-500 text-xs leading-relaxed max-w-xl mx-auto pt-3 md:pt-4 pb-12 md:pb-16 border-t border-gray-200 -mt-[1.28rem]">
          {isEditMode && (
            <div className="relative self-end">
              <StylePicker
                currentStyle={data.coverCopyrightStyle}
                onStyleChange={(style) => onUpdate?.({ coverCopyrightStyle: style })}
                fieldKey="coverCopyright"
                backgroundColorClass="bg-white"
              />
            </div>
          )}
          <div data-blur-key="coverCopyright">
            {isEditMode ? (
              <textarea
                value={data.coverCopyright}
                onChange={(e) => onUpdate?.({ coverCopyright: e.target.value })}
                style={getStyleObject(data.coverCopyrightStyle)}
                rows={3}
                className="w-full text-center text-gray-500 text-xs leading-relaxed bg-white border-2 border-cyan-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 resize-none"
              />
            ) : (
              <div style={getStyleObject(data.coverCopyrightStyle)}>
                {data.coverCopyright.split('\\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < data.coverCopyright.split('\\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}