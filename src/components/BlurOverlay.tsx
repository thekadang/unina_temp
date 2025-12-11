import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
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
  const [containerReady, setContainerReady] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<HTMLSpanElement | null>(null);

  // 자신의 blur-container 찾기 (부모에서 가장 가까운 blur-container)
  // useLayoutEffect로 DOM 업데이트 직후 실행
  useLayoutEffect(() => {
    const findContainer = () => {
      if (markerRef.current) {
        const container = markerRef.current.closest('.blur-container') as HTMLElement;
        if (container && container !== containerRef.current) {
          containerRef.current = container;
          setContainerReady(true);
        }
      }
    };

    findContainer();

    // 약간의 지연 후 다시 확인 (DOM이 완전히 준비되지 않은 경우 대비)
    const timer = setTimeout(findContainer, 50);
    return () => clearTimeout(timer);
  }, [pageId]);

  // 블러된 fieldKey 목록 (안정적인 참조를 위해 useMemo 사용)
  const blurredKeys = useMemo(() => blurRegions.map(r => r.fieldKey), [blurRegions]);
  const blurredKeysString = useMemo(() => JSON.stringify(blurredKeys), [blurredKeys]);

  // 잘못된 동적 경로 블러 영역 자동 정리 (모드 전환 시 무효화된 것들)
  useEffect(() => {
    // 동적 경로(auto:로 시작)를 가진 블러 영역 찾기
    const invalidRegions = blurRegions.filter(r => r.fieldKey.startsWith('auto:'));

    if (invalidRegions.length > 0) {
      console.warn(`[BlurOverlay] 무효한 동적 경로 블러 영역 ${invalidRegions.length}개 발견. 자동 제거합니다.`);
      // 각 잘못된 영역 제거
      invalidRegions.forEach(region => {
        onRemoveBlurRegion(region.id);
      });
    }
  }, [blurRegions, onRemoveBlurRegion]);

  // 요소의 블러 키 가져오기 (컨테이너 우선 방식 - 가장 큰 컨테이너 선택)
  const getBlurKey = useCallback((element: HTMLElement): string | null => {
    if (!containerRef.current) return null;

    // 편집 UI 요소는 제외
    if (isEditUI(element)) return null;

    // 클릭 위치 계산
    const clickRect = element.getBoundingClientRect();
    const clickCenter = { x: clickRect.left + clickRect.width / 2, y: clickRect.top + clickRect.height / 2 };

    // 컨테이너 내 모든 data-blur-key 요소 검색
    const allBlurableElements = containerRef.current.querySelectorAll('[data-blur-key]');

    // 클릭 위치를 포함하는 모든 요소 찾기
    const containingElements: { element: Element; area: number; key: string }[] = [];

    allBlurableElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // 클릭 위치가 요소 내부에 있는지 확인
      if (clickCenter.x >= rect.left && clickCenter.x <= rect.right &&
          clickCenter.y >= rect.top && clickCenter.y <= rect.bottom) {
        const key = el.getAttribute('data-blur-key');
        if (key) {
          // Card 컨테이너(접미사 Card)는 우선순위 높임
          const isCard = key.endsWith('Card');
          const area = rect.width * rect.height;
          containingElements.push({
            element: el,
            area: isCard ? area * 1000 : area, // Card는 높은 우선순위
            key
          });
        }
      }
    });

    // 가장 큰 컨테이너 선택 (Card 접미사 우선)
    if (containingElements.length > 0) {
      containingElements.sort((a, b) => b.area - a.area);
      return containingElements[0].key;
    }

    // 직접 속성 확인 (fallback)
    const existingKey = element.getAttribute('data-blur-key');
    if (existingKey) return existingKey;

    // 가장 가까운 조상 확인 (fallback)
    const closestWithKey = element.closest('[data-blur-key]');
    if (closestWithKey) {
      return closestWithKey.getAttribute('data-blur-key');
    }

    return null;
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

  // 블러 오버레이 div들을 추적
  const overlayMapRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // 블러 오버레이 생성 함수 (isBlurMode 의존성 제거)
  const createBlurOverlay = useCallback((key: string): HTMLDivElement => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-blur-overlay', key);
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      backdrop-filter: blur(1px);
      -webkit-backdrop-filter: blur(1px);
      background: linear-gradient(135deg, hsla(128, 100%, 93%, 1.00) 0%, rgba(240, 255, 206, 0.95) 100%);
      border-radius: inherit;
      z-index: 10;
      pointer-events: none;
    `;
    return overlay;
  }, []);

  // 블러 오버레이 생성/제거 (blurredKeys, isEditMode 변경 시)
  useEffect(() => {
    let isCancelled = false;
    let retryCount = 0;
    const maxRetries = 3;

    // DOM 업데이트 완료 후 실행 (모드 전환 시 타이밍 문제 해결)
    const applyBlurOverlays = () => {
      if (isCancelled) {
        return;
      }

      // 컨테이너 다시 찾기 (모드 전환 시 DOM 구조가 변경될 수 있음)
      if (markerRef.current) {
        const container = markerRef.current.closest('.blur-container') as HTMLElement;
        if (container) {
          containerRef.current = container;
        }
      }

      if (!containerRef.current) {
        // 컨테이너를 찾지 못하면 재시도
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(applyBlurOverlays, 100);
        }
        return;
      }

      // 기존 블러 오버레이 모두 제거
      containerRef.current.querySelectorAll('[data-blur-overlay]').forEach(overlay => {
        overlay.remove();
      });
      overlayMapRef.current.clear();

      // 기존 블러 스타일 제거 (data-blur-key 요소)
      containerRef.current.querySelectorAll('[data-blur-key]').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.position = '';
        htmlEl.style.userSelect = '';
        htmlEl.style.pointerEvents = '';
        htmlEl.removeAttribute('data-blur-active');
      });

      // 동적 경로로 블러된 요소들도 스타일 제거
      containerRef.current.querySelectorAll('[data-blur-active]').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.position = '';
        htmlEl.style.userSelect = '';
        htmlEl.style.pointerEvents = '';
        htmlEl.removeAttribute('data-blur-active');
      });

      // 블러된 요소에 오버레이 추가
      let foundCount = 0;
      blurredKeys.forEach(key => {
        const el = findElementByPath(key, containerRef.current!);
        if (el) {
          foundCount++;
          // 요소에 position: relative 설정 (오버레이 위치 기준)
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.position === 'static') {
            el.style.position = 'relative';
          }
          el.style.userSelect = 'none';
          // PDF 출력용 data 속성 추가
          el.setAttribute('data-blur-active', 'true');

          // 오버레이 생성 및 추가
          const overlay = createBlurOverlay(key);
          el.appendChild(overlay);
          overlayMapRef.current.set(key, overlay);
        }
      });

      // 일부 요소를 찾지 못했으면 재시도
      if (foundCount < blurredKeys.length && retryCount < maxRetries) {
        retryCount++;
        setTimeout(applyBlurOverlays, 150);
      }
    };

    // requestAnimationFrame으로 DOM 업데이트 완료 후 실행
    const rafId = requestAnimationFrame(() => {
      // 추가 지연으로 DOM이 완전히 준비되도록 함 (모드 전환 시 더 긴 지연 필요)
      setTimeout(applyBlurOverlays, 100);
    });

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [blurredKeysString, isEditMode, containerReady, createBlurOverlay, blurredKeys]);

  // 블러 모드 변경 시 pointer-events만 업데이트 (오버레이 재생성 없음)
  useEffect(() => {
    overlayMapRef.current.forEach(overlay => {
      overlay.style.pointerEvents = isBlurMode ? 'auto' : 'none';
    });

    // 블러된 요소의 pointer-events도 업데이트
    if (containerRef.current) {
      containerRef.current.querySelectorAll('[data-blur-active]').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.pointerEvents = isBlurMode ? 'auto' : '';
      });
    }
  }, [isBlurMode]);

  // PDF 출력 시 블러 스타일 변경 (인라인 스타일로 직접 적용)
  useEffect(() => {
    const handleBeforePrint = () => {
      try {
        // 자신의 컨테이너만 처리 (다른 페이지 요소에 영향 주지 않음)
        if (!containerRef.current) return;

        const container = containerRef.current;

        // 오버레이를 분홍색 불투명 배경으로 변경
        container.querySelectorAll('[data-blur-overlay]').forEach(overlay => {
          const htmlOverlay = overlay as HTMLElement;
          htmlOverlay.style.backdropFilter = 'none';
          htmlOverlay.style.webkitBackdropFilter = 'none';
          htmlOverlay.style.background = 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #fce4ec 100%)';
          htmlOverlay.style.boxShadow = 'inset 0 0 0 1px rgba(236, 64, 122, 0.15)';
        });

        blurredKeys.forEach(key => {
          const el = findElementByPath(key, container);
          if (el) {
            try {
              // 텍스트 숨김
              el.style.color = 'transparent';
              el.style.textShadow = 'none';
              // 자식 요소들도 모두 숨김 (HTMLElement만, 오버레이 제외)
              el.querySelectorAll('*:not([data-blur-overlay])').forEach(child => {
                try {
                  if (child instanceof HTMLElement) {
                    child.style.color = 'transparent';
                    child.style.background = 'transparent';
                    child.style.borderColor = 'transparent';
                    child.style.textShadow = 'none';
                    child.style.boxShadow = 'none';
                  }
                } catch (e) {
                  // SVG 요소 등에서 스타일 설정 실패 시 무시
                }
              });
              // 이미지와 SVG 숨김
              el.querySelectorAll('img, svg').forEach(media => {
                try {
                  (media as HTMLElement).style.opacity = '0';
                } catch (e) {
                  // 스타일 설정 실패 시 무시
                }
              });
            } catch (e) {
              console.warn('블러 요소 스타일 적용 실패:', e);
            }
          }
        });
      } catch (e) {
        console.error('handleBeforePrint 에러:', e);
      }
    };

    const handleAfterPrint = () => {
      try {
        // 자신의 컨테이너만 처리 (다른 페이지 요소에 영향 주지 않음)
        if (!containerRef.current) return;

        const container = containerRef.current;

        // 오버레이를 블러 스타일로 복원
        container.querySelectorAll('[data-blur-overlay]').forEach(overlay => {
          const htmlOverlay = overlay as HTMLElement;
          htmlOverlay.style.backdropFilter = 'blur(12px)';
          htmlOverlay.style.webkitBackdropFilter = 'blur(12px)';
          htmlOverlay.style.background = 'rgba(255, 255, 255, 0.3)';
          htmlOverlay.style.boxShadow = '';
        });

        blurredKeys.forEach(key => {
          const el = findElementByPath(key, container);
          if (el) {
            try {
              // 화면용 스타일 복원
              el.style.color = '';
              el.style.textShadow = '';
              // 자식 요소들도 복원 (HTMLElement만)
              el.querySelectorAll('*:not([data-blur-overlay])').forEach(child => {
                try {
                  if (child instanceof HTMLElement) {
                    child.style.color = '';
                    child.style.background = '';
                    child.style.borderColor = '';
                    child.style.textShadow = '';
                    child.style.boxShadow = '';
                  }
                } catch (e) {
                  // 스타일 복원 실패 시 무시
                }
              });
              // 이미지와 SVG 복원
              el.querySelectorAll('img, svg').forEach(media => {
                try {
                  (media as HTMLElement).style.opacity = '';
                } catch (e) {
                  // 스타일 복원 실패 시 무시
                }
              });
            } catch (e) {
              console.warn('블러 요소 스타일 복원 실패:', e);
            }
          }
        });
      } catch (e) {
        console.error('handleAfterPrint 에러:', e);
      }
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
      {/* 부모 컨테이너 탐색용 마커 (보이지 않음) */}
      <span ref={markerRef} style={{ display: 'none' }} aria-hidden="true" />

      {/* 블러 모드 안내 - 하단으로 이동, pointer-events: none */}
      {isBlurMode && (
        <div
          data-blur-ui="true"
          className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] print:hidden pointer-events-none select-none"
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
          className="fixed bottom-28 right-4 bg-purple-600 text-white px-3 py-1.5 rounded-lg shadow-lg z-[9999] print:hidden pointer-events-none"
        >
          <span className="text-sm">{blurredKeys.length}개 블러됨</span>
        </div>
      )}
    </>
  );
}
