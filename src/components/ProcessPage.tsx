import { CheckCircle2, Clock, Copy, Trash2 } from 'lucide-react';
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

export function ProcessPage({ 
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
  const [tempStyle, setTempStyle] = useState(getStyleObject(data.processTitleStyle));
  const [isHovered, setIsHovered] = useState(false);

  const startEdit = (field: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingField || !onUpdate) return;

    // Parse field like "processLabel-0", "processLabel-1", etc.
    const processLabelMatch = editingField.match(/processLabel-(\d+)/);
    if (processLabelMatch) {
      const index = parseInt(processLabelMatch[1]);
      const newLabels = [...data.processLabels];
      newLabels[index] = tempValue;
      onUpdate({ processLabels: newLabels });
    } else {
      // Handle simple fields
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

  const processes = [
    { icon: Clock, label: data.processLabels[0] },
    { icon: CheckCircle2, label: data.processLabels[1] },
    { icon: CheckCircle2, label: data.processLabels[2] },
    { icon: CheckCircle2, label: data.processLabels[3] },
    { icon: CheckCircle2, label: data.processLabels[4] },
    { icon: CheckCircle2, label: data.processLabels[5] },
    { icon: CheckCircle2, label: data.processLabels[6] },
  ];

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
        {/* Header */}
        <div className="text-center">
          <div data-blur-key="processPageTitle" className="w-full">
            <div className="flex items-center justify-center gap-2 mb-[3px]">
              {isEditMode ? (
                <>
                  <h1
                    className="text-3xl font-semibold text-cyan-600"
                    style={getStyleObject(data.processPageTitleStyle)}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdate?.({ processPageTitle: e.currentTarget.textContent || '' })}
                  >
                    {data.processPageTitle}
                  </h1>
                  <StylePicker
                    currentStyle={data.processPageTitleStyle}
                    onStyleChange={(style) => onUpdate?.({ processPageTitleStyle: style })}
                    fieldKey="processPageTitle"
                    backgroundColorClass="bg-white"
                  />
                </>
              ) : (
                <h1
                  className="text-3xl font-semibold text-cyan-600"
                  style={getStyleObject(data.processPageTitleStyle)}
                >
                  {data.processPageTitle}
                </h1>
              )}
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          </div>
        </div>

        {/* Process Steps */}
        <div data-blur-key="processStepsCard" className="bg-white rounded-2xl p-6 print:p-5 shadow-lg border border-cyan-100 print:break-inside-avoid">
          {isEditMode ? (
            editingField === 'processTitle' ? (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                autoFocus
                className="text-cyan-600 mb-6 print:mb-5 text-base print:text-sm text-center w-full bg-cyan-50 px-2 py-1 rounded border border-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <div className="flex items-center justify-center gap-2 mb-6 print:mb-5">
                <h3 
                  className="text-cyan-600 text-base print:text-sm text-center cursor-pointer hover:bg-cyan-50 px-2 py-1 rounded transition-colors"
                  style={getStyleObject(data.processTitleStyle)}
                  onClick={() => startEdit('processTitle', data.processTitle)}
                >
                  {data.processTitle}
                </h3>
                <StylePicker
                  currentStyle={data.processTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ processTitleStyle: style })}
                  fieldKey="processTitle"
                  backgroundColorClass="bg-white"
                />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center gap-2 mb-6 print:mb-5">
              <h3
                data-blur-key="processTitle"
                className="text-cyan-600 text-base print:text-sm text-center font-bold text-[20px]"
                style={getStyleObject(data.processTitleStyle)}
              >
                {data.processTitle}
              </h3>
              {isEditMode && (
                <StylePicker
                  currentStyle={data.processTitleStyle}
                  onStyleChange={(style) => onUpdate?.({ processTitleStyle: style })}
                  fieldKey="processTitle"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
          )}
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-5 print:left-4 top-5 bottom-8 w-0.5 bg-gradient-to-b from-cyan-200 via-cyan-300 to-cyan-200" />
            
            <div className="space-y-4 print:space-y-3">
              {processes.map((process, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start gap-4 print:gap-3">
                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-10 h-10 print:w-8 print:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center shadow-lg border-4 border-white">
                        <process.icon className="w-5 h-5 print:w-4 print:h-4" />
                      </div>
                    </div>
                    
                    {/* Content card */}
                    <div className="flex-1 bg-gradient-to-r from-cyan-50 to-transparent rounded-lg p-3 print:p-2 border-l-2 border-cyan-300 mt-0.5">
                      <div className="flex items-center gap-2">
                        {isEditMode ? (
                          editingField === `processLabel-${index}` ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveEdit}
                              autoFocus
                              className="text-gray-800 text-sm print:text-xs flex-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-300 focus:outline-none focus:border-yellow-500"
                            />
                          ) : (
                            <p 
                              className="text-gray-800 text-sm print:text-xs cursor-pointer hover:bg-yellow-50 px-2 py-1 rounded transition-colors"
                              style={getStyleObject(data.processLabelStyle)}
                              onClick={() => startEdit(`processLabel-${index}`, process.label)}
                            >
                              {process.label}
                            </p>
                          )
                        ) : (
                          <p
                            data-blur-key={`processLabel-${index}`}
                            className="text-gray-800 text-sm print:text-xs"
                            style={getStyleObject(data.processLabelStyle)}
                          >
                            {process.label}
                          </p>
                        )}
                        {index === 0 && isEditMode && editingField !== `processLabel-${index}` && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <StylePicker
                              currentStyle={data.processLabelStyle}
                              onStyleChange={(style) => onUpdate?.({ processLabelStyle: style })}
                              fieldKey="processLabel"
                              backgroundColorClass="bg-white"
                            />
                          </div>
                        )}
                      </div>
                      {index === 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          {isEditMode ? (
                            editingField === 'processSubtext1' ? (
                              <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={saveEdit}
                                autoFocus
                                className="text-gray-500 text-[11px] print:text-[9px] flex-1 bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                              />
                            ) : (
                              <p 
                                className="text-gray-500 text-[11px] print:text-[9px] cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                                style={getStyleObject(data.processSubtextStyle)}
                                onClick={() => startEdit('processSubtext1', data.processSubtext1)}
                              >
                                {data.processSubtext1}
                              </p>
                            )
                          ) : (
                            <p
                              data-blur-key="processSubtext1"
                              className="text-gray-500 text-[11px] print:text-[9px]"
                              style={getStyleObject(data.processSubtextStyle)}
                            >
                              {data.processSubtext1}
                            </p>
                          )}
                          {isEditMode && editingField !== 'processSubtext1' && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <StylePicker
                                currentStyle={data.processSubtextStyle}
                                onStyleChange={(style) => onUpdate?.({ processSubtextStyle: style })}
                                fieldKey="processSubtext"
                                backgroundColorClass="bg-white"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {index === 3 && (
                        isEditMode ? (
                          editingField === 'processSubtext2' ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveEdit}
                              autoFocus
                              className="text-gray-500 text-[11px] print:text-[9px] mt-1 w-full bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                            />
                          ) : (
                            <p 
                              className="text-gray-500 text-[11px] print:text-[9px] mt-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                              style={getStyleObject(data.processSubtextStyle)}
                              onClick={() => startEdit('processSubtext2', data.processSubtext2)}
                            >
                              {data.processSubtext2}
                            </p>
                          )
                        ) : (
                          <p
                            data-blur-key="processSubtext2"
                            className="text-gray-500 text-[11px] print:text-[9px] mt-1"
                            style={getStyleObject(data.processSubtextStyle)}
                          >
                            {data.processSubtext2}
                          </p>
                        )
                      )}
                      {index === 6 && (
                        isEditMode ? (
                          editingField === 'processSubtext3' ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveEdit}
                              autoFocus
                              className="text-gray-500 text-[11px] print:text-[9px] mt-1 w-full bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                            />
                          ) : (
                            <p 
                              className="text-gray-500 text-[11px] print:text-[9px] mt-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                              style={getStyleObject(data.processSubtextStyle)}
                              onClick={() => startEdit('processSubtext3', data.processSubtext3)}
                            >
                              {data.processSubtext3}
                            </p>
                          )
                        ) : (
                          <p
                            data-blur-key="processSubtext3"
                            className="text-gray-500 text-[11px] print:text-[9px] mt-1"
                            style={getStyleObject(data.processSubtextStyle)}
                          >
                            {data.processSubtext3}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-5 print:mt-4 pt-5 print:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              {isEditMode ? (
                editingField === 'processNote' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-gray-600 text-xs print:text-[10px] text-center flex-1 bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                  />
                ) : (
                  <p 
                    className="text-gray-600 text-xs print:text-[10px] text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    style={getStyleObject(data.processNoteStyle)}
                    onClick={() => startEdit('processNote', data.processNote)}
                  >
                    {data.processNote}
                  </p>
                )
              ) : (
                <p
                  data-blur-key="processNote"
                  className="text-gray-600 text-xs print:text-[10px] text-center"
                  style={getStyleObject(data.processNoteStyle)}
                >
                  {data.processNote}
                </p>
              )}
              {isEditMode && editingField !== 'processNote' && (
                <StylePicker
                  currentStyle={data.processNoteStyle}
                  onStyleChange={(style) => onUpdate?.({ processNoteStyle: style })}
                  fieldKey="processNote"
                  backgroundColorClass="bg-white"
                />
              )}
            </div>
          </div>
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