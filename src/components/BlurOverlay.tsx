import { useState, useRef, useEffect } from 'react';
import { BlurRegion } from '../types/blur-region';
import { X } from 'lucide-react';

interface Props {
  pageId: string;
  blurRegions: BlurRegion[];
  isBlurMode: boolean;
  isEditMode?: boolean;
  onAddBlurRegion: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion: (regionId: string) => void;
}

export function BlurOverlay({ 
  pageId, 
  blurRegions, 
  isBlurMode, 
  isEditMode = false,
  onAddBlurRegion, 
  onRemoveBlurRegion 
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; regionId: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isBlurMode || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    
    // Only create blur region if it's large enough
    if (width > 10 && height > 10) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      
      // Convert pixel values to percentages
      const xPercent = (x / containerWidth) * 100;
      const yPercent = (y / containerHeight) * 100;
      const widthPercent = (width / containerWidth) * 100;
      const heightPercent = (height / containerHeight) * 100;
      
      onAddBlurRegion({ 
        x: xPercent, 
        y: yPercent, 
        width: widthPercent, 
        height: heightPercent 
      });
    }
    
    setIsDragging(false);
  };

  const handleContextMenu = (e: React.MouseEvent, regionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, regionId });
  };

  const handleRemoveBlur = (regionId: string) => {
    onRemoveBlurRegion(regionId);
    setContextMenu(null);
  };

  // Calculate current dragging rectangle
  const getDragRect = () => {
    if (!isDragging) return null;
    
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    
    return { x, y, width, height };
  };

  const dragRect = getDragRect();

  return (
    <>
      <div
        ref={containerRef}
        className={`absolute inset-0 ${isBlurMode ? 'z-40' : 'z-30'}`}
        style={{ pointerEvents: isBlurMode ? 'auto' : 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Existing blur regions */}
        {blurRegions.map((region) => (
          <div
            key={region.id}
            className="absolute blur-region-print"
            data-blur-region="true"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onContextMenu={(e) => handleContextMenu(e, region.id)}
          >
            {isBlurMode && (
              <div className="absolute inset-0 border-2 border-red-400 border-dashed opacity-50 print:hidden" />
            )}
          </div>
        ))}

        {/* Current dragging rectangle */}
        {isDragging && dragRect && (
          <div
            className="absolute border-2 border-blue-500 border-dashed bg-blue-500/10 print:hidden"
            style={{
              left: `${dragRect.x}px`,
              top: `${dragRect.y}px`,
              width: `${dragRect.width}px`,
              height: `${dragRect.height}px`,
            }}
          />
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] print:hidden"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleRemoveBlur(contextMenu.regionId)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            블러 취소
          </button>
        </div>
      )}

      {/* Blur mode indicator */}
      {isBlurMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 print:hidden">
          드래그하여 블러 영역을 지정하세요
        </div>
      )}
    </>
  );
}