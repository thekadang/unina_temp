/**
 * 요소 기반 블러 영역
 *
 * 화면/PDF 위치 불일치 문제를 해결하기 위해
 * 좌표 기반 대신 요소 식별자(fieldKey) 기반으로 변경
 */
export interface BlurRegion {
  id: string;
  pageId: string;
  fieldKey: string;  // data-blur-key 속성 값
}

export interface BlurData {
  [pageId: string]: BlurRegion[];
}
