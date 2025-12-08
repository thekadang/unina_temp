import { useState, useEffect, useCallback, useRef } from 'react';
import { BlurRegion } from '../types/blur-region';

interface Props {
  pageId: string;
  blurRegions: BlurRegion[];
  isBlurMode: boolean;
  isEditMode?: boolean;
  onAddBlurRegion: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion: (regionId: string) => void;
}

// 요소의 고유 경로 생성 (blur-container 기준)
function getElementPath(element: HTMLElement, container: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== container && current !== document.body) {
    const parent = current.parentElement;
    if (!parent) break;

    // 부모의 자식들 중 현재 요소의 인덱스 찾기
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(current);
    const tagName = current.tagName.toLowerCase();

    path.unshift(`${tagName}[${index}]`);
    current = parent;
  }

  return `auto:${path.join('>')}`;
}

// 경로로 요소 찾기
function findElementByPath(pathKey: string, container: HTMLElement): HTMLElement | null {
  // data-blur-key로 먼저 찾기
  if (!pathKey.startsWith('auto:')) {
    return container.querySelector(`[data-blur-key="${pathKey}"]`);
  }

  // 동적 경로 파싱
  const pathStr = pathKey.replace('auto:', '');
  if (!pathStr) return null;

  const parts = pathStr.split('>');
  let current: HTMLElement = container;

  for (const part of parts) {
    const match = part.match(/(\w+)\[(\d+)\]/);
    if (!match) return null;

    const [, tag, indexStr] = match;
    const index = parseInt(indexStr);
    const child = current.children[index];

    if (!child || child.tagName.toLowerCase() !== tag) return null;
    current = child as HTMLElement;
  }

  return current;
}

// 요소가 블러 오버레이 UI인지 확인
function isBlurOverlayUI(element: HTMLElement): boolean {
  // 블러 오버레이 안내 문구나 UI 요소인지 확인
  return element.closest('[data-blur-ui]') !== null;
}

// 요소가 편집 관련 UI인지 확인
function isEditUI(element: HTMLElement): boolean {
  // StylePicker, 버튼, 입력 필드 등 편집 UI 제외
  const editSelectors = [
    'button',
    'input',
    'textarea',
    'select',
    '[role="button"]',
    '[data-radix-collection-item]',
    '.style-picker',
    '[data-blur-ui]'
  ];

  return editSelectors.some(selector => element.closest(selector) !== null);
}

// 요소가 blur-container 자체인지 확인 (자식이 아닌 컨테이너 자체)
function isBlurContainer(element: HTMLElement): boolean {
  return element.classList.contains('blur-container');
}

export function BlurOverlay({
  pageId,
  blurRegions,
  isBlurMode,
  isEditMode,
  onAddBlurRegion,
  onRemoveBlurRegion
}: Props) {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // blur-container 찾기
  useEffect(() => {
    const container = document.querySelector('.blur-container') as HTMLElement;
    containerRef.current = container;
  }, [pageId]);

  // 블러된 fieldKey 목록
  const blurredKeys = blurRegions.map(r => r.fieldKey);

  // 요소의 블러 키 가져오기 (data-blur-key 또는 동적 경로)
  const getBlurKey = useCallback((element: HTMLElement): string | null => {
    if (!containerRef.current) return null;

    // 편집 UI 요소는 제외
    if (isEditUI(element)) return null;

    // data-blur-key 속성이 있으면 그것 사용
    const existingKey = element.getAttribute('data-blur-key');
    if (existingKey) return existingKey;

    // 가장 가까운 data-blur-key 요소 확인
    const closestWithKey = element.closest('[data-blur-key]');
    if (closestWithKey) {
      return closestWithKey.getAttribute('data-blur-key');
    }

    // 없으면 동적 경로 생성
    return getElementPath(element, containerRef.current);
  }, []);

  // 요소 클릭 핸들러
  const handleElementClick = useCallback((e: MouseEvent) => {
    if (!isBlurMode || !containerRef.current) return;

    const target = e.target as HTMLElement;

    // 블러 오버레이 UI 클릭은 무시
    if (isBlurOverlayUI(target)) return;

    // blur-container 외부 클릭은 무시
    if (!containerRef.current.contains(target)) return;

    // blur-container 자체 클릭은 무시 (경계선 문제 해결)
    if (isBlurContainer(target)) return;

    const blurKey = getBlurKey(target);
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
  }, [isBlurMode, blurRegions, onAddBlurRegion, onRemoveBlurRegion, getBlurKey]);

  // 요소 호버 핸들러
  const handleElementHover = useCallback((e: MouseEvent) => {
    if (!isBlurMode || !containerRef.current) {
      setHoveredElement(null);
      setHoveredKey(null);
      return;
    }

    const target = e.target as HTMLElement;

    // 블러 오버레이 UI 호버는 무시
    if (isBlurOverlayUI(target)) {
      setHoveredElement(null);
      setHoveredKey(null);
      return;
    }

    // blur-container 외부는 무시
    if (!containerRef.current.contains(target)) {
      setHoveredElement(null);
      setHoveredKey(null);
      return;
    }

    // blur-container 자체는 hover 대상에서 제외 (경계선 문제 해결)
    if (isBlurContainer(target)) {
      setHoveredElement(null);
      setHoveredKey(null);
      return;
    }

    const blurKey = getBlurKey(target);

    if (blurKey) {
      // data-blur-key가 있는 요소 또는 동적 경로로 찾은 요소
      const element = blurKey.startsWith('auto:')
        ? target
        : (containerRef.current.querySelector(`[data-blur-key="${blurKey}"]`) as HTMLElement || target);

      setHoveredElement(element);
      setHoveredKey(blurKey);
    } else {
      setHoveredElement(null);
      setHoveredKey(null);
    }
  }, [isBlurMode, getBlurKey]);

  // 마우스가 container를 벗어날 때 hover 상태 정리
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const relatedTarget = e.relatedTarget as HTMLElement | null;

    // relatedTarget이 없거나 container 외부로 나가는 경우에만 정리
    if (!relatedTarget || !containerRef.current.contains(relatedTarget)) {
      setHoveredElement(null);
      setHoveredKey(null);
    }
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (isBlurMode) {
      document.addEventListener('click', handleElementClick, true);
      document.addEventListener('mouseover', handleElementHover);
      document.addEventListener('mouseout', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('click', handleElementClick, true);
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [isBlurMode, handleElementClick, handleElementHover, handleMouseLeave]);

  // 블러 스타일 (인라인 - Tailwind purge 우회)
  const blurStyle = {
    filter: 'blur(8px)',
    userSelect: 'none' as const
  };

  // 블러 스타일 적용
  useEffect(() => {
    if (!containerRef.current) return;

    // 기존 블러 스타일 제거 (data-blur-key 요소)
    containerRef.current.querySelectorAll('[data-blur-key]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.filter = '';
      htmlEl.style.userSelect = '';
      htmlEl.style.pointerEvents = '';
      htmlEl.removeAttribute('data-blur-active');
    });

    // 동적 경로로 블러된 요소들도 스타일 제거
    containerRef.current.querySelectorAll('[data-blur-active]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.filter = '';
      htmlEl.style.userSelect = '';
      htmlEl.style.pointerEvents = '';
      htmlEl.removeAttribute('data-blur-active');
    });

    // 블러된 요소에 인라인 스타일 및 속성 추가
    blurredKeys.forEach(key => {
      const el = findElementByPath(key, containerRef.current!);
      if (el) {
        el.style.filter = blurStyle.filter;
        el.style.userSelect = blurStyle.userSelect;
        // 블러 모드일 때는 클릭 가능하게 유지 (해제용), 아닐 때는 차단
        el.style.pointerEvents = isBlurMode ? 'auto' : 'none';
        // PDF 출력용 data 속성 추가
        el.setAttribute('data-blur-active', 'true');
      }
    });
  }, [blurredKeys, isBlurMode]);

  // PDF 출력 시 블러 스타일 변경 (인라인 스타일 → 인쇄용 스타일)
  // 모든 페이지의 blur-container를 대상으로 함
  useEffect(() => {
    const handleBeforePrint = () => {
      // 모든 blur-container에서 블러된 요소 찾기
      const allContainers = document.querySelectorAll('.blur-container');

      allContainers.forEach(container => {
        blurredKeys.forEach(key => {
          const el = findElementByPath(key, container as HTMLElement);
          if (el) {
            // 인라인 blur 제거하고 완전 가림 스타일 적용
            el.style.filter = 'none';
            // 텍스트를 배경색과 동일하게 만들어 완전히 숨김
            el.style.color = '#d4d4d4';
            el.style.textShadow = 'none';
            el.style.backgroundColor = '#d4d4d4';
            el.style.borderRadius = '4px';
            el.style.position = 'relative';
            // 자식 요소들도 모두 같은 색으로
            el.querySelectorAll('*').forEach(child => {
              (child as HTMLElement).style.color = '#d4d4d4';
              (child as HTMLElement).style.backgroundColor = '#d4d4d4';
            });
          }
        });
      });
    };

    const handleAfterPrint = () => {
      // 모든 blur-container에서 블러된 요소 복원
      const allContainers = document.querySelectorAll('.blur-container');

      allContainers.forEach(container => {
        blurredKeys.forEach(key => {
          const el = findElementByPath(key, container as HTMLElement);
          if (el) {
            el.style.filter = blurStyle.filter;
            el.style.color = '';
            el.style.textShadow = '';
            el.style.backgroundColor = '';
            el.style.borderRadius = '';
            el.style.position = '';
            // 자식 요소들도 복원
            el.querySelectorAll('*').forEach(child => {
              (child as HTMLElement).style.color = '';
              (child as HTMLElement).style.backgroundColor = '';
            });
          }
        });
      });
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
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
    if (!containerRef.current) return;

    // 이전 하이라이트 제거
    containerRef.current.querySelectorAll('[data-blur-hover]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '';
      htmlEl.style.outlineOffset = '';
      htmlEl.style.cursor = '';
      // 블러된 요소가 아니면 배경색도 제거
      if (!htmlEl.hasAttribute('data-blur-active')) {
        htmlEl.style.backgroundColor = '';
      }
      htmlEl.removeAttribute('data-blur-hover');
    });

    // 현재 호버된 요소에 하이라이트
    if (hoveredElement && isBlurMode) {
      hoveredElement.style.outline = hoverStyle.outline;
      hoveredElement.style.outlineOffset = hoverStyle.outlineOffset;
      hoveredElement.style.cursor = hoverStyle.cursor;
      hoveredElement.style.backgroundColor = hoverStyle.backgroundColor;
      hoveredElement.setAttribute('data-blur-hover', 'true');
    }
  }, [hoveredElement, isBlurMode]);

  // 블러 모드 종료 시 호버 상태 초기화
  useEffect(() => {
    if (!isBlurMode) {
      setHoveredElement(null);
      setHoveredKey(null);

      if (containerRef.current) {
        containerRef.current.querySelectorAll('[data-blur-hover]').forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.outline = '';
          htmlEl.style.outlineOffset = '';
          htmlEl.style.cursor = '';
          if (!htmlEl.hasAttribute('data-blur-active')) {
            htmlEl.style.backgroundColor = '';
          }
          htmlEl.removeAttribute('data-blur-hover');
        });
      }
    }
  }, [isBlurMode]);

  // 현재 호버된 요소 정보 표시용
  const getElementDescription = (element: HTMLElement | null, key: string | null): string => {
    if (!element || !key) return '';

    // data-blur-key가 있으면 그것 표시
    if (!key.startsWith('auto:')) {
      return key;
    }

    // 동적 경로면 태그명 + 클래스 표시
    const tagName = element.tagName.toLowerCase();
    // classList 사용 (SVG 요소에서도 동작)
    const className = element.classList?.[0] || '';
    const textContent = element.textContent?.slice(0, 20)?.trim() || '';

    return `${tagName}${className ? `.${className}` : ''}${textContent ? `: "${textContent}${element.textContent && element.textContent.length >= 20 ? '...' : ''}"` : ''}`;
  };

  return (
    <>
      {/* 블러 모드 안내 - 하단으로 이동, pointer-events: none */}
      {isBlurMode && (
        <div
          data-blur-ui="true"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-[100] print:hidden pointer-events-none select-none"
        >
          <div className="text-center">
            <div className="text-sm font-medium">클릭하여 블러 영역을 선택하세요</div>
            <div className="text-xs opacity-80 mt-1">
              {hoveredKey && hoveredElement ? (
                <span className="bg-purple-700 px-2 py-0.5 rounded">
                  {getElementDescription(hoveredElement, hoveredKey)}
                </span>
              ) : (
                '요소 위에 마우스를 올려보세요'
              )}
            </div>
          </div>
        </div>
      )}

      {/* 블러된 요소 개수 표시 */}
      {isBlurMode && blurredKeys.length > 0 && (
        <div
          data-blur-ui="true"
          className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-1.5 rounded-lg shadow-lg z-[100] print:hidden pointer-events-none"
        >
          <span className="text-sm">{blurredKeys.length}개 블러됨</span>
        </div>
      )}
    </>
  );
}
