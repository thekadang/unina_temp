import { Plane, Calendar, Clock, MapPin, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { TourData } from '../types/tour-data';
import { BlurRegion } from '../types/blur-region';
import { BlurOverlay } from './BlurOverlay';
import { useState } from 'react';

interface Props {
  data: TourData;
  isEditMode?: boolean;
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

export function FlightInfoPage({ 
  data,
  isEditMode,
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

  return (
    <div 
      className="min-h-screen p-8 py-16 print:py-10 print:px-12 relative blur-container"
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

      <div className="max-w-3xl mx-auto space-y-10 print:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-cyan-600 mb-[3px]">항공편</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto rounded-full mb-4" />
          <div className="flex items-center justify-center gap-4 text-gray-600 pt-4">
            <span className="px-4 py-2 bg-cyan-50 rounded-full">IN: 서울 → 니스</span>
            <span className="px-4 py-2 bg-yellow-50 rounded-full">OUT: 바르셀로나 → 서울</span>
          </div>
        </div>

        {/* Flight 1: Inbound */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-cyan-100 print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-cyan-700">여정 1</h2>
              <p className="text-gray-600">서울 → 니스</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Flight Details */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">항공사</p>
                  <p className="text-gray-800">대한항공 (비즈니스석)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">출발 시간</p>
                  <p className="text-gray-800">2026.08.08 13:00 (인천국제공항)</p>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2 text-cyan-600">
                  <div className="w-full border-t-2 border-dashed border-cyan-300" />
                  <span className="text-sm px-4 py-1 bg-cyan-50 rounded-full whitespace-nowrap">직항</span>
                  <div className="w-full border-t-2 border-dashed border-cyan-300" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">도착 시간</p>
                  <p className="text-gray-800">2026.08.08 19:30 (니스 공항)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight 2: Outbound */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-yellow-100 print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white">
              <Plane className="w-6 h-6 transform rotate-180" />
            </div>
            <div>
              <h2 className="text-yellow-700">여정 2</h2>
              <p className="text-gray-600">바르셀로나 → 서울</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Flight Details */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">항공사</p>
                  <p className="text-gray-800">대한항공 (비즈니스석)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">출발 시간</p>
                  <p className="text-gray-800">2026.08.18 11:00 (바르셀로나 공항)</p>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2 text-yellow-600">
                  <div className="w-full border-t-2 border-dashed border-yellow-300" />
                  <span className="text-sm px-4 py-1 bg-yellow-50 rounded-full whitespace-nowrap">직항</span>
                  <div className="w-full border-t-2 border-dashed border-yellow-300" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">도착 시간</p>
                  <p className="text-gray-800">2026.08.19 06:00+1 (인천국제공항)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}