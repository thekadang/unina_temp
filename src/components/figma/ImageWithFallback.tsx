import React, { useState, memo, useCallback, useEffect } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

/**
 * 이미지 컴포넌트 (Lazy Loading + 에러 폴백)
 * - React.memo로 불필요한 리렌더링 방지
 * - loading="lazy"로 뷰포트 외 이미지 지연 로드
 * - decoding="async"로 비동기 디코딩
 */
export const ImageWithFallback = memo(function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false)
  const [isPrintMode, setIsPrintMode] = useState(false)

  // Print 모드 감지
  useEffect(() => {
    const checkPrintMode = () => {
      setIsPrintMode(document.body.classList.contains('print-mode'))
    }

    checkPrintMode()

    // MutationObserver로 body class 변경 감지
    const observer = new MutationObserver(checkPrintMode)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  const handleError = useCallback(() => {
    setDidError(true)
  }, [])

  const { src, alt, style, className, loading, decoding, ...rest } = props

  // Print 모드에서는 lazy loading 비활성화
  const effectiveLoading = isPrintMode ? 'eager' : (loading ?? 'lazy')

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={effectiveLoading}
      decoding={decoding ?? 'async'}
      {...rest}
      onError={handleError}
    />
  )
})
