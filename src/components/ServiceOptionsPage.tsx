import { CheckCircle2, Copy, Trash2 } from 'lucide-react';
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

export function ServiceOptionsPage({
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
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingField || !onUpdate) return;

    // Parse field like "service-0-title", "service-1-includes"
    const serviceMatch = editingField.match(/service-(\d+)-(\w+)/);
    if (serviceMatch) {
      const index = parseInt(serviceMatch[1]);
      const field = serviceMatch[2];

      const newServices = [...data.services];
      newServices[index] = { ...newServices[index], [field]: tempValue };
      onUpdate({ services: newServices });
    }

    // Handle simple fields
    if (!serviceMatch) {
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
    // For includes field (textarea with multiple lines), only save on Ctrl+Enter or Cmd+Enter
    if (editingField?.includes('-includes')) {
      if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || e.key === 'Escape') {
        e.preventDefault();
        if (e.key === 'Escape') {
          cancelEdit();
        } else {
          saveEdit();
        }
      }
    } else {
      // For other fields, save on Enter
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    }
  };

  return (
    <div
      className="p-4 md:p-6 lg:p-8 py-12 md:py-16 print:py-10 print:px-12 relative blur-container"
      data-has-blur={blurRegions.length > 0 ? "true" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Controls */}
      {isEditMode && isHovered && onDuplicate && onDelete && (
        <div className="absolute top-4 right-4 print:hidden z-50 flex gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
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

      <div className="max-w-5xl mx-auto space-y-10 print:space-y-6">
        {/* Header - 페이지 제목 */}
        <div className="text-center">
          <div data-blur-key="serviceOptionsPageTitle" className="w-full">
            <div className="flex items-center justify-center gap-2 mb-[3px]">
              {isEditMode ? (
                <>
                  <h1
                    className="text-[25px] font-semibold text-cyan-600"
                    style={getStyleObject(data.serviceOptionsTitleStyle)}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdate?.({ serviceOptionsTitle: e.currentTarget.textContent || '' })}
                  >
                    {data.serviceOptionsTitle}
                  </h1>
                  <StylePicker
                    currentStyle={data.serviceOptionsTitleStyle}
                    onStyleChange={(style) => onUpdate?.({ serviceOptionsTitleStyle: style })}
                    fieldKey="serviceOptionsTitle"
                    backgroundColorClass="bg-white"
                  />
                </>
              ) : (
                <h1
                  className="text-[25px] font-semibold text-cyan-600"
                  style={getStyleObject(data.serviceOptionsTitleStyle)}
                >
                  {data.serviceOptionsTitle}
                </h1>
              )}
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          </div>
        </div>

        {/* Service Options Cards */}
        <div className="space-y-4 print:space-y-3">
          {data.services.map((service, index) => (
            <div
              key={index}
              data-blur-key={`serviceOptionCard-${index}`}
              className={`bg-white rounded-2xl p-6 print:p-4 shadow-lg border-2 print:break-inside-avoid ${
                service.color === 'cyan' ? 'border-cyan-200' : 'border-yellow-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-3 print:mb-2">
                <div
                  className={`w-7 h-7 print:w-6 print:h-6 rounded-full ${
                    service.color === 'cyan'
                      ? 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                      : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  } text-white flex items-center justify-center flex-shrink-0 text-sm print:text-xs`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isEditMode && editingField === `service-${index}-title` ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className={`flex-1 bg-transparent border-b-2 ${
                          service.color === 'cyan' ? 'border-cyan-300' : 'border-yellow-300'
                        } focus:outline-none text-sm print:text-xs ${
                          service.color === 'cyan' ? 'text-cyan-700' : 'text-yellow-700'
                        } mb-1`}
                      />
                    ) : (
                      <h4
                        data-blur-key={`service-${index}-title`}
                        className={`text-sm print:text-xs ${
                          service.color === 'cyan' ? 'text-cyan-700' : 'text-yellow-700'
                        } ${isEditMode ? 'cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors' : ''}`}
                        style={getStyleObject(data.serviceTitleStyle)}
                        onClick={() => startEdit(`service-${index}-title`, service.title)}
                      >
                        {service.title}
                      </h4>
                    )}
                    {index === 0 && isEditMode && editingField !== `service-${index}-title` && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <StylePicker
                          currentStyle={data.serviceTitleStyle}
                          onStyleChange={(style) => onUpdate?.({ serviceTitleStyle: style })}
                          fieldKey="serviceTitle"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {isEditMode && editingField === `service-${index}-description` ? (
                      <textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none text-gray-600 text-xs print:text-[10px] resize-none"
                        rows={2}
                      />
                    ) : (
                      <p
                        data-blur-key={`service-${index}-description`}
                        className={`text-gray-600 text-xs print:text-[10px] ${isEditMode ? 'cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors' : ''}`}
                        style={getStyleObject(data.serviceDescriptionStyle)}
                        onClick={() => startEdit(`service-${index}-description`, service.description)}
                      >
                        {service.description}
                      </p>
                    )}
                    {index === 0 && isEditMode && editingField !== `service-${index}-description` && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <StylePicker
                          currentStyle={data.serviceDescriptionStyle}
                          onStyleChange={(style) => onUpdate?.({ serviceDescriptionStyle: style })}
                          fieldKey="serviceDescription"
                          backgroundColorClass="bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`mt-3 print:mt-2 pt-3 print:pt-2 border-t ${
                  service.color === 'cyan' ? 'border-cyan-100' : 'border-yellow-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 print:mb-1.5">
                  {isEditMode ? (
                    editingField === `serviceIncludesTitle-${index}` ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className="text-gray-500 text-xs print:text-[10px] flex-1 bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                      />
                    ) : (
                      <>
                        <p
                          className="text-gray-500 text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                          style={getStyleObject(data.serviceIncludesTitleStyle)}
                          onClick={() => startEdit(`serviceIncludesTitle-${index}`, data.serviceIncludesTitle)}
                        >
                          {data.serviceIncludesTitle}
                        </p>
                        {index === 0 && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <StylePicker
                              currentStyle={data.serviceIncludesTitleStyle}
                              onStyleChange={(style) => onUpdate?.({ serviceIncludesTitleStyle: style })}
                              fieldKey="serviceIncludesTitle"
                              backgroundColorClass="bg-white"
                            />
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    <p
                      data-blur-key="serviceIncludesTitle"
                      className="text-gray-500 text-xs print:text-[10px]"
                      style={getStyleObject(data.serviceIncludesTitleStyle)}
                    >
                      {data.serviceIncludesTitle}
                    </p>
                  )}
                </div>
                {isEditMode && editingField === `service-${index}-includes` ? (
                  <div>
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className={`w-full bg-transparent border-2 rounded-lg p-2 ${
                        service.color === 'cyan' ? 'border-cyan-200' : 'border-yellow-200'
                      } focus:outline-none text-gray-700 text-xs print:text-[10px] resize-none`}
                      rows={6}
                      placeholder="각 항목을 엔터로 구분해주세요"
                    />
                    <p className="text-gray-400 text-[10px] mt-1">Ctrl+Enter로 저장, Esc로 취소</p>
                  </div>
                ) : (
                  <div
                    className={`space-y-1.5 print:space-y-1 ${isEditMode ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' : ''}`}
                    onClick={() => startEdit(`service-${index}-includes`, service.includes)}
                  >
                    {service.includes.split('\n').filter(item => item.trim()).map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 print:w-3 print:h-3 flex-shrink-0 mt-0.5 ${
                            service.color === 'cyan' ? 'text-cyan-500' : 'text-yellow-500'
                          }`}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <p
                            data-blur-key={`service-${index}-includesItem-${i}`}
                            className="text-gray-700 text-xs print:text-[10px]"
                            style={getStyleObject(data.serviceIncludesItemStyle)}
                          >
                            {item}
                          </p>
                          {i === 0 && index === 0 && isEditMode && editingField !== `service-${index}-includes` && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <StylePicker
                                currentStyle={data.serviceIncludesItemStyle}
                                onStyleChange={(style) => onUpdate?.({ serviceIncludesItemStyle: style })}
                                fieldKey="serviceIncludesItem"
                                backgroundColorClass="bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
