/**
 * localStorage 래퍼 유틸리티
 * - 타입 안전한 저장/불러오기
 * - 에러 처리 포함
 */

export const storage = {
  /**
   * localStorage에서 데이터 불러오기
   * @param key 저장 키
   * @param defaultValue 기본값 (파싱 실패 시 반환)
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  /**
   * localStorage에 데이터 저장
   * @param key 저장 키
   * @param value 저장할 값
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  /**
   * localStorage에서 데이터 삭제
   * @param key 삭제할 키
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

// 저장 키 상수
export const STORAGE_KEYS = {
  TOUR_DATA: 'tourData',
  PAGE_CONFIGS: 'pageConfigs',
  BLUR_DATA: 'blurData',
  AUTH: 'tour-authenticated'
} as const;
