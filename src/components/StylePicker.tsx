import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Type } from 'lucide-react';
import { TextStyle } from '../types/text-style';

interface StylePickerProps {
  currentStyle?: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  fieldKey: string;
  backgroundColorClass?: string;
}

export function StylePicker({
  currentStyle,
  onStyleChange,
  fieldKey,
  backgroundColorClass
}: StylePickerProps) {
  const initialStyle = currentStyle || { size: '16px', weight: 'normal', color: '#111827' };
  const [tempStyle, setTempStyle] = useState<TextStyle>(initialStyle);
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const sizeValue = parseInt(tempStyle.size) || 16;

  // 배경색 클래스 결정
  const bgColorClass = backgroundColorClass || 'bg-gray-50';

  // 팝업 위치 계산 - fixed 포지셔닝 사용
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const buttonRect = buttonRef.current!.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const POPUP_WIDTH = 288; // w-72 = 18rem = 288px
        const POPUP_HEIGHT = popupRef.current?.offsetHeight || 400;
        const SPACING = 12;

        let top: number;
        let left: number;

        // 수평 위치: 버튼 왼쪽 기준, 화면 밖으로 나가면 조정
        left = buttonRect.left;

        // 오른쪽으로 넘어가면 버튼 오른쪽 끝에 맞춤
        if (left + POPUP_WIDTH > viewportWidth - SPACING) {
          left = buttonRect.right - POPUP_WIDTH;
        }

        // 그래도 왼쪽으로 넘어가면 화면 중앙에 배치
        if (left < SPACING) {
          left = Math.max(SPACING, (viewportWidth - POPUP_WIDTH) / 2);
        }

        // 수직 위치: 버튼 아래에 표시 시도
        const spaceBelow = viewportHeight - buttonRect.bottom - SPACING;
        const spaceAbove = buttonRect.top - SPACING;

        if (spaceBelow >= POPUP_HEIGHT) {
          // 아래에 공간이 충분하면 아래에 표시
          top = buttonRect.bottom + SPACING;
        } else if (spaceAbove >= POPUP_HEIGHT) {
          // 위에 공간이 충분하면 위에 표시
          top = buttonRect.top - POPUP_HEIGHT - SPACING;
        } else {
          // 둘 다 부족하면 화면 중앙에 배치
          top = Math.max(SPACING, (viewportHeight - POPUP_HEIGHT) / 2);
        }

        // 최종 경계 체크
        top = Math.max(SPACING, Math.min(top, viewportHeight - POPUP_HEIGHT - SPACING));
        left = Math.max(SPACING, Math.min(left, viewportWidth - POPUP_WIDTH - SPACING));

        setPopupPosition({ top, left });
      };

      // 초기 위치 설정
      updatePosition();

      // 팝업이 렌더링된 후 실제 높이로 다시 계산
      requestAnimationFrame(updatePosition);
    }
  }, [isOpen]);

  const handleSizeChange = (newSize: string) => {
    const newStyle = { ...tempStyle, size: newSize };
    setTempStyle(newStyle);
    onStyleChange(newStyle); // 크기는 실시간 반영
  };

  const handleWeightChange = (newWeight: 'normal' | 'semibold' | 'bold') => {
    const newStyle = { ...tempStyle, weight: newWeight };
    setTempStyle(newStyle);
    onStyleChange(newStyle); // 굵기는 실시간 반영
  };

  const handleColorChange = (newColor: string) => {
    // 색상은 로컬 상태만 변경 (부모 업데이트 안 함)
    setTempStyle({ ...tempStyle, color: newColor });
  };

  const handleApply = () => {
    // 최종 스타일을 부모에 반영
    onStyleChange(tempStyle);
    setIsOpen(false);
  };

  const handleCancel = () => {
    onStyleChange(initialStyle); // 원래 상태로 되돌림
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
            setIsOpen(!isOpen);
          }}
          className="p-1 text-gray-400 hover:text-cyan-600 transition-colors"
          title="글자 스타일"
        >
          <Type className="w-3 h-3" />
        </button>
      </div>

      {isOpen && createPortal(
        <>
          {/* Backdrop - 반투명 오버레이 */}
          <div
            className="fixed inset-0 print:hidden"
            style={{
              zIndex: 99998,
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div
            ref={popupRef}
            className="fixed p-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-72 print:hidden"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()} // 팝업 내부 클릭도 전파 방지
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">크기</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    step="1"
                    value={sizeValue}
                    onChange={(e) => handleSizeChange(`${e.target.value}px`)}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={sizeValue}
                    onChange={(e) => handleSizeChange(`${e.target.value}px`)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    min="8"
                    max="72"
                    step="1"
                  />
                  <span className="text-xs text-gray-500">px</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">굵기</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'semibold', 'bold'] as const).map((weight) => (
                    <button
                      key={weight}
                      onClick={() => handleWeightChange(weight)}
                      className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        tempStyle.weight === weight 
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-md' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-300 hover:bg-cyan-50'
                      }`}
                      style={{
                        fontWeight: weight === 'normal' ? 400 : weight === 'semibold' ? 600 : 700
                      }}
                    >
                      {weight === 'normal' ? '일반' : weight === 'semibold' ? '중간' : '굵게'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">색상</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempStyle.color}
                    onInput={(e) => handleColorChange(e.currentTarget.value)}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-14 h-10 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tempStyle.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
                {/* 색상 미리보기 */}
                <div className={`mt-3 p-3 rounded-lg border-2 border-gray-200 ${bgColorClass}`}>
                  <div className="text-xs text-gray-500 mb-2">미리보기</div>
                  <div
                    style={{
                      fontSize: tempStyle.size,
                      fontWeight: tempStyle.weight === 'normal' ? 400 : tempStyle.weight === 'semibold' ? 600 : 700,
                      color: tempStyle.color
                    }}
                  >
                    샘플 텍스트 ABC 123
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors shadow-sm"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}