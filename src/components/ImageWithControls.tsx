import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Move, Maximize2, Minimize2, Square } from 'lucide-react';

interface ImageWithControlsProps {
  src: string;
  alt: string;
  className?: string;
  isEditMode?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
  onObjectFitChange?: (fit: 'cover' | 'contain' | 'fill' | 'none') => void;
  onObjectPositionChange?: (position: string) => void;
}

export function ImageWithControls({
  src,
  alt,
  className = '',
  isEditMode = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onObjectFitChange,
  onObjectPositionChange,
}: ImageWithControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 50, y: 50 }); // Default center position

  // Parse initial object-position
  useEffect(() => {
    if (objectPosition) {
      const parts = objectPosition.split(' ');
      if (parts.length === 2) {
        currentPosRef.current = {
          x: parseFloat(parts[0]) || 50,
          y: parseFloat(parts[1]) || 50,
        };
      }
    }
  }, [objectPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragMode || !isEditMode) return;
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    // Calculate percentage change based on container size
    const percentX = (deltaX / rect.width) * 100;
    const percentY = (deltaY / rect.height) * 100;
    
    // Update position
    const newX = Math.max(0, Math.min(100, currentPosRef.current.x - percentX));
    const newY = Math.max(0, Math.min(100, currentPosRef.current.y - percentY));
    
    currentPosRef.current = { x: newX, y: newY };
    
    if (onObjectPositionChange) {
      onObjectPositionChange(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
    }
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dragMode || !isEditMode) return;
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    
    const percentX = (deltaX / rect.width) * 100;
    const percentY = (deltaY / rect.height) * 100;
    
    const newX = Math.max(0, Math.min(100, currentPosRef.current.x - percentX));
    const newY = Math.max(0, Math.min(100, currentPosRef.current.y - percentY));
    
    currentPosRef.current = { x: newX, y: newY };
    
    if (onObjectPositionChange) {
      onObjectPositionChange(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
    }
    
    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Extract base classes and add our object-fit and object-position
  const baseClasses = className.replace(/object-\S+/g, '').trim();
  const objectFitClass = `object-${objectFit}`;
  const finalClassName = `${baseClasses} ${objectFitClass}`.trim();

  const imageStyle: React.CSSProperties = {
    objectPosition: objectPosition,
    cursor: dragMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };

  return (
    <div className="relative w-full h-full group" ref={imageRef}>
      <ImageWithFallback
        src={src}
        alt={alt}
        className={finalClassName}
        style={imageStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {isEditMode && (
        <div className="absolute top-2 left-2 print:hidden opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {/* Object Fit Controls */}
          <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-1 flex gap-1">
            <button
              onClick={() => onObjectFitChange?.('cover')}
              className={`p-1.5 rounded transition-colors ${
                objectFit === 'cover'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Cover (채우기)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onObjectFitChange?.('contain')}
              className={`p-1.5 rounded transition-colors ${
                objectFit === 'contain'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Contain (맞추기)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onObjectFitChange?.('fill')}
              className={`p-1.5 rounded transition-colors ${
                objectFit === 'fill'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Fill (늘리기)"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
          
          {/* Drag Mode Toggle */}
          {(objectFit === 'cover' || objectFit === 'fill') && (
            <button
              onClick={() => setDragMode(!dragMode)}
              className={`p-1.5 rounded transition-colors bg-white/95 backdrop-blur shadow-lg ${
                dragMode
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={dragMode ? '위치 조정 모드 (클릭하여 해제)' : '위치 조정 모드 (클릭하여 활성화)'}
            >
              <Move className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      {dragMode && isEditMode && (
        <div className="absolute inset-0 pointer-events-none print:hidden">
          <div className="absolute inset-0 border-2 border-dashed border-cyan-400 rounded" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-500/80 text-white px-3 py-1 rounded-full text-xs">
            드래그하여 위치 조정
          </div>
        </div>
      )}
    </div>
  );
}
