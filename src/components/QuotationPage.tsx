import { DollarSign, FileText, AlertCircle, CheckCircle2, XCircle, Copy, Trash2, Package, Calendar, Globe, Users, Plane, Hotel, Eye, EyeOff } from 'lucide-react';
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

export function QuotationPage({ 
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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  
  const startEdit = (field: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField) {
      if (editingField === 'quotationPageTitle') {
        onUpdate({ quotationPageTitle: tempValue });
      } else if (editingField.startsWith('label')) {
        const labelNum = editingField.replace('label', '');
        onUpdate({ 
          quotationLabels: { 
            ...data.quotationLabels, 
            [`label${labelNum}`]: tempValue 
          } 
        });
      } else {
        onUpdate({ [editingField]: tempValue });
      }
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
  
  const summary = [
    { 
      icon: Package, 
      label: data.productNameLabel,
      value: data.productName, 
      editable: true,
      field: 'productName',
      labelEditable: true,
      labelField: 'productNameLabel'
    },
    { 
      icon: Calendar, 
      label: data.periodLabel,
      value: (() => {
        const start = data.startDate.replace(/-/g, '.');
        const end = data.endDate.replace(/-/g, '.');
        const nightsDaysText = data.nights > 0 && data.days > 0 ? ` (${data.nights}박 ${data.days}일)` : '';
        return `${start} - ${end}${nightsDaysText}`;
      })(),
      editable: false,
      labelEditable: true,
      labelField: 'periodLabel'
    },
    { 
      icon: Globe, 
      label: data.countriesLabel,
      value: data.countries, 
      editable: true, 
      field: 'countries',
      labelEditable: true,
      labelField: 'countriesLabel'
    },
    { 
      icon: Users, 
      label: data.participantsLabel,
      value: data.travelParty, 
      editable: false,
      labelEditable: true,
      labelField: 'participantsLabel'
    },
    { 
      icon: Plane, 
      label: data.transportationLabel,
      value: data.transportation, 
      editable: true, 
      field: 'transportation',
      labelEditable: true,
      labelField: 'transportationLabel'
    },
    { 
      icon: Hotel, 
      label: data.accommodationLabel,
      value: data.accommodationSummary, 
      editable: true, 
      field: 'accommodationSummary',
      labelEditable: true,
      labelField: 'accommodationLabel'
    },
  ];

  const included = data.includedItems.split('\n').filter(item => item.trim());

  const excluded = data.excludedItems.split('\n').filter(item => item.trim());

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
      
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        {/* Header */}
        <div className="text-center">
          <div data-blur-key="quotationPageTitle" className="w-full">
            <div className="flex items-center justify-center gap-2 mb-[3px]">
              {isEditMode ? (
                editingField === 'quotationPageTitle' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-2xl md:text-3xl font-semibold text-cyan-600 bg-blue-50 px-3 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                    style={getStyleObject(data.quotationPageTitleStyle)}
                  />
                ) : (
                  <>
                    <h1
                      style={getStyleObject(data.quotationPageTitleStyle)}
                      className="cursor-pointer hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                      onClick={() => startEdit('quotationPageTitle', data.quotationPageTitle || '견적서')}
                    >
                      {data.quotationPageTitle || '견적서'}
                    </h1>
                    <StylePicker
                      currentStyle={data.quotationPageTitleStyle}
                      onStyleChange={(style) => onUpdate({ quotationPageTitleStyle: style })}
                      fieldKey="quotationPageTitle"
                      backgroundColorClass="bg-white"
                    />
                  </>
                )
              ) : (
                <h1
                  style={getStyleObject(data.quotationPageTitleStyle)}
                >
                  {data.quotationPageTitle || '견적서'}
                </h1>
              )}
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-2 print:space-y-1.5">
          {summary.map((item, index) => (
            <div
              key={index}
              data-blur-key={`quotationSummaryCard-${item.labelField}`}
              className="bg-white rounded-xl p-4 print:p-3 shadow-md border border-cyan-100 flex items-center gap-3 print:break-inside-avoid"
            >
              <div className="p-2.5 print:p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white">
                <item.icon className="w-4 h-4 print:w-3.5 print:h-3.5" />
              </div>
              <div className="flex-1">
                {/* Editable Label */}
                {item.labelEditable && isEditMode ? (
                  editingField === item.labelField ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="text-gray-500 text-base w-full bg-blue-50 px-2 py-1 rounded border border-blue-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p 
                        className="text-gray-500 text-base cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors inline-block font-bold text-[18px]"
                        style={getStyleObject(data.quotationSummaryLabelStyle)}
                        onClick={() => startEdit(item.labelField!, item.label)}
                      >
                        {item.label}
                      </p>
                      <StylePicker
                        currentStyle={data.quotationSummaryLabelStyle}
                        onStyleChange={(style) => onUpdate({ quotationSummaryLabelStyle: style })}
                        fieldKey="quotationSummaryLabel"
                        backgroundColorClass="bg-white"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <p
                      data-blur-key={item.labelField}
                      className="text-gray-500 text-base font-bold text-[18px]"
                      style={getStyleObject(data.quotationSummaryLabelStyle)}
                    >
                      {item.label}
                    </p>
                    {isEditMode && (
                      <StylePicker
                        currentStyle={data.quotationSummaryLabelStyle}
                        onStyleChange={(style) => onUpdate({ quotationSummaryLabelStyle: style })}
                        fieldKey="quotationSummaryLabel"
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                )}

                {/* Editable Value */}
                {item.editable && isEditMode ? (
                  editingField === item.field ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="text-gray-800 text-lg w-full bg-yellow-50 px-2 py-1 rounded border border-yellow-300 focus:outline-none focus:border-yellow-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p 
                        className="text-gray-800 text-lg cursor-pointer hover:bg-yellow-50 px-2 py-1 rounded transition-colors text-[15px]"
                        style={getStyleObject(data.quotationSummaryValueStyle)}
                        onClick={() => startEdit(item.field!, item.value)}
                      >
                        {item.value}
                      </p>
                      <StylePicker
                        currentStyle={data.quotationSummaryValueStyle}
                        onStyleChange={(style) => onUpdate({ quotationSummaryValueStyle: style })}
                        fieldKey="quotationSummaryValue"
                        backgroundColorClass="bg-white"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <p
                      data-blur-key={item.field}
                      className="text-gray-800 text-lg text-[15px]"
                      style={getStyleObject(data.quotationSummaryValueStyle)}
                    >
                      {item.value}
                    </p>
                    {isEditMode && (
                      <StylePicker
                        currentStyle={data.quotationSummaryValueStyle}
                        onStyleChange={(style) => onUpdate({ quotationSummaryValueStyle: style })}
                        fieldKey="quotationSummaryValue"
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Price */}
        <div data-blur-key="quotationPriceCard" className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 print:p-5 shadow-xl text-white text-center print:break-inside-avoid">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isEditMode ? (
              editingField === 'estimatedCostTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-base print:text-sm opacity-90 bg-cyan-700 text-white px-2 py-1 rounded border border-cyan-400 focus:outline-none focus:border-white text-center"
                />
              ) : (
                <p 
                  className="text-base print:text-sm opacity-90 cursor-pointer hover:bg-cyan-700 px-2 py-1 rounded transition-colors"
                  style={getStyleObject(data.quotationEstimatedTitleStyle)}
                  onClick={() => startEdit('estimatedCostTitle', data.estimatedCostTitle)}
                >
                  ₩ {data.estimatedCostTitle}
                </p>
              )
            ) : (
              <p data-blur-key="estimatedCostTitle" className="text-base print:text-sm opacity-90" style={getStyleObject(data.quotationEstimatedTitleStyle)}>₩ {data.estimatedCostTitle}</p>
            )}
            {isEditMode && editingField !== 'estimatedCostTitle' && (
              <StylePicker
                currentStyle={data.quotationEstimatedTitleStyle}
                onStyleChange={(style) => onUpdate({ quotationEstimatedTitleStyle: style })}
                fieldKey="quotationEstimatedTitle"
                backgroundColorClass="bg-cyan-500"
              />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {isEditMode ? (
              editingField === 'estimatedCostAmount' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-3xl print:text-2xl bg-cyan-700 text-white px-2 py-1 rounded border border-cyan-400 focus:outline-none focus:border-white w-full text-center"
                />
              ) : (
                <p 
                  className="text-3xl print:text-2xl cursor-pointer hover:bg-cyan-700 px-2 py-1 rounded transition-colors"
                  style={getStyleObject(data.quotationEstimatedAmountStyle)}
                  onClick={() => startEdit('estimatedCostAmount', data.estimatedCostAmount)}
                >
                  {data.estimatedCostAmount}
                </p>
              )
            ) : (
              <p data-blur-key="estimatedCostAmount" className="text-3xl print:text-2xl" style={getStyleObject(data.quotationEstimatedAmountStyle)}>{data.estimatedCostAmount}</p>
            )}
            {isEditMode && editingField !== 'estimatedCostAmount' && (
              <StylePicker
                currentStyle={data.quotationEstimatedAmountStyle}
                onStyleChange={(style) => onUpdate({ quotationEstimatedAmountStyle: style })}
                fieldKey="quotationEstimatedAmount"
                backgroundColorClass="bg-cyan-500"
              />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            {isEditMode ? (
              editingField === 'estimatedCostNote' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-xs print:text-[10px] opacity-80 bg-cyan-700 text-white px-2 py-1 rounded border border-cyan-400 focus:outline-none focus:border-white w-full"
                />
              ) : (
                <p 
                  className="text-xs print:text-[10px] opacity-80 cursor-pointer hover:bg-cyan-700 px-2 py-1 rounded transition-colors"
                  style={getStyleObject(data.quotationEstimatedNoteStyle)}
                  onClick={() => startEdit('estimatedCostNote', data.estimatedCostNote)}
                >
                  {data.estimatedCostNote}
                </p>
              )
            ) : (
              <p data-blur-key="estimatedCostNote" className="text-xs print:text-[10px] opacity-80" style={getStyleObject(data.quotationEstimatedNoteStyle)}>{data.estimatedCostNote}</p>
            )}
            {isEditMode && editingField !== 'estimatedCostNote' && (
              <StylePicker
                currentStyle={data.quotationEstimatedNoteStyle}
                onStyleChange={(style) => onUpdate({ quotationEstimatedNoteStyle: style })}
                fieldKey="quotationEstimatedNote"
                backgroundColorClass="bg-cyan-500"
              />
            )}
          </div>
        </div>

        {/* Included */}
        <div data-blur-key="quotationIncludedCard" className="bg-white rounded-2xl p-6 print:p-5 shadow-lg border border-green-100 print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4 print:mb-3">
            <CheckCircle2 className="w-5 h-5 print:w-4 print:h-4 text-green-500" />
            {isEditMode ? (
              editingField === 'includedItemsTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-green-700 text-base print:text-sm bg-green-50 px-2 py-1 rounded border border-green-300 focus:outline-none focus:border-green-500 flex-1"
                />
              ) : (
                <h3 
                  className="text-green-700 text-base print:text-sm cursor-pointer hover:bg-green-50 px-2 py-1 rounded transition-colors font-bold"
                  style={getStyleObject(data.quotationIncludedTitleStyle)}
                  onClick={() => startEdit('includedItemsTitle', data.includedItemsTitle)}
                >
                  {data.includedItemsTitle}
                </h3>
              )
            ) : (
              <h3 data-blur-key="includedItemsTitle" className="text-green-700 text-base print:text-sm font-bold text-[20px]" style={getStyleObject(data.quotationIncludedTitleStyle)}>{data.includedItemsTitle}</h3>
            )}
            {isEditMode && editingField !== 'includedItemsTitle' && (
              <StylePicker
                currentStyle={data.quotationIncludedTitleStyle}
                onStyleChange={(style) => onUpdate({ quotationIncludedTitleStyle: style })}
                fieldKey="quotationIncludedTitle"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
          {isEditMode ? (
            editingField === 'includedItems' ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={saveEdit}
                autoFocus
                rows={6}
                placeholder="각 항목을 엔터로 구분하여 입력하세요"
                className="w-full text-gray-700 text-sm print:text-xs bg-green-50 px-3 py-2 rounded border border-green-300 focus:outline-none focus:border-green-500 resize-none"
              />
            ) : (
              <div 
                className="space-y-2 print:space-y-1.5 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
                onClick={() => startEdit('includedItems', data.includedItems)}
              >
                {included.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 group">
                    <div className="w-1.5 h-1.5 print:w-1 print:h-1 rounded-full bg-green-500 flex-shrink-0 mt-1.5 print:mt-1 group-hover:scale-150 transition-transform" />
                    <div className="flex items-center gap-2 flex-1">
                      <p className="text-gray-700 text-sm print:text-xs" style={getStyleObject(data.quotationIncludedItemStyle)}>{item}</p>
                      {index === 0 && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <StylePicker
                            currentStyle={data.quotationIncludedItemStyle}
                            onStyleChange={(style) => onUpdate({ quotationIncludedItemStyle: style })}
                            fieldKey="quotationIncludedItem"
                            backgroundColorClass="bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2 print:space-y-1.5">
              {included.map((item, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className="w-1.5 h-1.5 print:w-1 print:h-1 rounded-full bg-green-500 flex-shrink-0 mt-1.5 print:mt-1 group-hover:scale-150 transition-transform" />
                  <div className="flex items-center gap-2 flex-1">
                    <p data-blur-key={`includedItem-${index}`} className="text-gray-700 text-sm print:text-xs" style={getStyleObject(data.quotationIncludedItemStyle)}>{item}</p>
                    {index === 0 && isEditMode && (
                      <StylePicker
                        currentStyle={data.quotationIncludedItemStyle}
                        onStyleChange={(style) => onUpdate({ quotationIncludedItemStyle: style })}
                        fieldKey="quotationIncludedItem"
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Excluded */}
        <div data-blur-key="quotationExcludedCard" className="bg-white rounded-2xl p-6 print:p-5 shadow-lg border border-red-100 print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4 print:mb-3">
            <XCircle className="w-5 h-5 print:w-4 print:h-4 text-red-500" />
            {isEditMode ? (
              editingField === 'excludedItemsTitle' ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  autoFocus
                  className="text-red-700 text-base print:text-sm bg-red-50 px-2 py-1 rounded border border-red-300 focus:outline-none focus:border-red-500 flex-1"
                />
              ) : (
                <h3 
                  className="text-red-700 text-base print:text-sm cursor-pointer hover:bg-red-50 px-2 py-1 rounded transition-colors font-bold"
                  style={getStyleObject(data.quotationExcludedTitleStyle)}
                  onClick={() => startEdit('excludedItemsTitle', data.excludedItemsTitle)}
                >
                  {data.excludedItemsTitle}
                </h3>
              )
            ) : (
              <h3 data-blur-key="excludedItemsTitle" className="text-red-700 text-base print:text-sm font-bold text-[20px]" style={getStyleObject(data.quotationExcludedTitleStyle)}>{data.excludedItemsTitle}</h3>
            )}
            {isEditMode && editingField !== 'excludedItemsTitle' && (
              <StylePicker
                currentStyle={data.quotationExcludedTitleStyle}
                onStyleChange={(style) => onUpdate({ quotationExcludedTitleStyle: style })}
                fieldKey="quotationExcludedTitle"
                backgroundColorClass="bg-white"
              />
            )}
          </div>
          {isEditMode ? (
            editingField === 'excludedItems' ? (
              <div className="mb-4 print:mb-3">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={saveEdit}
                  autoFocus
                  rows={6}
                  placeholder="각 항목을 엔터로 구분하여 입력하세요"
                  className="w-full text-gray-700 text-sm print:text-xs bg-red-50 px-3 py-2 rounded border border-red-300 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            ) : (
              <div 
                className="space-y-2 print:space-y-1.5 mb-4 print:mb-3 cursor-pointer hover:bg-red-50 p-2 rounded transition-colors"
                onClick={() => startEdit('excludedItems', data.excludedItems)}
              >
                {excluded.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 group">
                    <div className="w-1.5 h-1.5 print:w-1 print:h-1 rounded-full bg-red-500 flex-shrink-0 mt-1.5 print:mt-1 group-hover:scale-150 transition-transform" />
                    <div className="flex items-center gap-2 flex-1">
                      <p className="text-gray-700 text-sm print:text-xs" style={getStyleObject(data.quotationExcludedItemStyle)}>{item}</p>
                      {index === 0 && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <StylePicker
                            currentStyle={data.quotationExcludedItemStyle}
                            onStyleChange={(style) => onUpdate({ quotationExcludedItemStyle: style })}
                            fieldKey="quotationExcludedItem"
                            backgroundColorClass="bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2 print:space-y-1.5 mb-4 print:mb-3">
              {excluded.map((item, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className="w-1.5 h-1.5 print:w-1 print:h-1 rounded-full bg-red-500 flex-shrink-0 mt-1.5 print:mt-1 group-hover:scale-150 transition-transform" />
                  <div className="flex items-center gap-2 flex-1">
                    <p data-blur-key={`excludedItem-${index}`} className="text-gray-700 text-sm print:text-xs" style={getStyleObject(data.quotationExcludedItemStyle)}>{item}</p>
                    {index === 0 && isEditMode && (
                      <StylePicker
                        currentStyle={data.quotationExcludedItemStyle}
                        onStyleChange={(style) => onUpdate({ quotationExcludedItemStyle: style })}
                        fieldKey="quotationExcludedItem"
                        backgroundColorClass="bg-white"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-3 print:pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {isEditMode ? (
                editingField === 'excludedItemsNote' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="text-gray-600 text-xs print:text-[10px] bg-gray-50 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-gray-500 w-full"
                  />
                ) : (
                  <p 
                    className="text-gray-600 text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    style={getStyleObject(data.quotationExcludedNoteStyle)}
                    onClick={() => startEdit('excludedItemsNote', data.excludedItemsNote)}
                  >
                    {data.excludedItemsNote}
                  </p>
                )
              ) : (
                <p data-blur-key="excludedItemsNote" className="text-gray-600 text-xs print:text-[10px]" style={getStyleObject(data.quotationExcludedNoteStyle)}>
                  {data.excludedItemsNote}
                </p>
              )}
              {isEditMode && editingField !== 'excludedItemsNote' && (
                <StylePicker
                  currentStyle={data.quotationExcludedNoteStyle}
                  onStyleChange={(style) => onUpdate({ quotationExcludedNoteStyle: style })}
                  fieldKey="quotationExcludedNote"
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