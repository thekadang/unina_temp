import { useState, useEffect, useCallback } from 'react';
import { BlurRegion } from '../types/blur-region';

interface Props {
  pageId: string;
  blurRegions: BlurRegion[];
  isBlurMode: boolean;
  onAddBlurRegion: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion: (regionId: string) => void;
}

export function BlurOverlay({
  pageId,
  blurRegions,
  isBlurMode,
  onAddBlurRegion,
  onRemoveBlurRegion
}: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // 블러된 fieldKey 목록
  const blurredKeys = blurRegions.map(r => r.fieldKey);

  // 요소 클릭 핸들러
  const handleElementClick = useCallback((e: MouseEvent) => {
    if (!isBlurMode) return;

    const target = e.target as HTMLElement;
    const blurKey = target.closest('[data-blur-key]')?.getAttribute('data-blur-key');

    if (!blurKey) return;

    e.preventDefault();
    e.stopPropagation();

    // 이미 블러된 요소인지 확인
    const existingRegion = blurRegions.find(r => r.fieldKey === blurKey);

    if (existingRegion) {
      // 블러 해제
      onRemoveBlurRegion(existingRegion.id);
    } else {
      // 블러 추가
      onAddBlurRegion({ fieldKey: blurKey });
    }
  }, [isBlurMode, blurRegions, onAddBlurRegion, onRemoveBlurRegion]);

  // 요소 호버 핸들러
  const handleElementHover = useCallback((e: MouseEvent) => {
    if (!isBlurMode) {
      setHoveredKey(null);
      return;
    }

    const target = e.target as HTMLElement;
    const blurKey = target.closest('[data-blur-key]')?.getAttribute('data-blur-key');
    setHoveredKey(blurKey || null);
  }, [isBlurMode]);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (isBlurMode) {
      document.addEventListener('click', handleElementClick, true);
      document.addEventListener('mouseover', handleElementHover);
    }

    return () => {
      document.removeEventListener('click', handleElementClick, true);
      document.removeEventListener('mouseover', handleElementHover);
    };
  }, [isBlurMode, handleElementClick, handleElementHover]);

  // 블러 스타일 (인라인 - Tailwind purge 우회)
  const blurStyle = {
    filter: 'blur(8px)',
    userSelect: 'none' as const,
    pointerEvents: 'none' as const
  };

  // 블러 스타일 적용
  useEffect(() => {
    // 모든 data-blur-key 요소에서 블러 스타일 제거
    document.querySelectorAll('[data-blur-key]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.filter = '';
      htmlEl.style.userSelect = '';
      htmlEl.style.pointerEvents = '';
    });

    // 블러된 요소에 인라인 스타일 추가
    blurredKeys.forEach(key => {
      const el = document.querySelector(`[data-blur-key="${key}"]`) as HTMLElement;
      if (el) {
        el.style.filter = blurStyle.filter;
        el.style.userSelect = blurStyle.userSelect;
        el.style.pointerEvents = blurStyle.pointerEvents;
      }
    });
  }, [blurredKeys]);

  // 호버 하이라이트 스타일
  const hoverStyle = {
    outline: '2px dashed #8b5cf6',
    outlineOffset: '2px',
    cursor: 'pointer',
    backgroundColor: 'rgba(139, 92, 246, 0.1)'
  };

  // 호버 하이라이트 적용 (인라인 스타일 사용 - Tailwind purge 우회)
  useEffect(() => {
    // 이전 하이라이트 제거
    document.querySelectorAll('[data-blur-key]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '';
      htmlEl.style.outlineOffset = '';
      htmlEl.style.cursor = '';
      htmlEl.style.backgroundColor = '';
    });

    // 현재 호버된 요소에 하이라이트
    if (hoveredKey && isBlurMode) {
      const el = document.querySelector(`[data-blur-key="${hoveredKey}"]`) as HTMLElement;
      if (el) {
        el.style.outline = hoverStyle.outline;
        el.style.outlineOffset = hoverStyle.outlineOffset;
        el.style.cursor = hoverStyle.cursor;
        el.style.backgroundColor = hoverStyle.backgroundColor;
      }
    }
  }, [hoveredKey, isBlurMode]);

  // 블러 모드 종료 시 호버 상태 초기화
  useEffect(() => {
    if (!isBlurMode) {
      setHoveredKey(null);
      document.querySelectorAll('[data-blur-key]').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.outline = '';
        htmlEl.style.outlineOffset = '';
        htmlEl.style.cursor = '';
        htmlEl.style.backgroundColor = '';
      });
    }
  }, [isBlurMode]);

  return (
    <>
      {/* 블러 모드 안내 */}
      {isBlurMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 print:hidden">
          클릭하여 블러 영역을 선택하세요 (다시 클릭하면 해제)
        </div>
      )}

      {/* 블러 모드 오버레이 (클릭 이벤트 전파용) */}
      {isBlurMode && (
        <div
          className="absolute inset-0 z-40 print:hidden"
          style={{
            pointerEvents: 'none',
            cursor: 'pointer'
          }}
        />
      )}
    </>
  );
}
