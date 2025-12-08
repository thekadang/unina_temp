import { useState, useEffect, useCallback } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';

// PageConfig 타입 정의
export interface PageConfig {
  id: string;
  type: 'cover' | 'intro' | 'flight' | 'flight-departure' | 'flight-transit' | 'flight-arrival' | 'itinerary' | 'accommodation' | 'quotation' | 'process' | 'payment' | 'detailed-schedule' | 'tourist-spot' | 'transportation-ticket' | 'transportation-card';
  title: string;
  data?: any;
}

// 기본 페이지 설정
const defaultPageConfigs: PageConfig[] = [
  { id: '1', type: 'cover', title: '표지' },
  { id: '2', type: 'intro', title: '여행 소개' },
  { id: '10', type: 'process', title: '프로세스' },
  { id: '3', type: 'flight-departure', title: '항공편 (출발)' },
  { id: '4', type: 'flight-transit', title: '항공편 (중간이동)' },
  { id: '5', type: 'flight-arrival', title: '항공편 (도착)' },
  { id: '6', type: 'itinerary', title: '여행 일정' },
  { id: '7', type: 'accommodation', title: '숙소 안내 (니스)', data: { index: 0 } },
  { id: '6-1', type: 'detailed-schedule', title: '세부 일정 (DAY 1)', data: { dayNumber: 1 } },
  { id: '6-4', type: 'tourist-spot', title: '관광지 리스트 (DAY 1)', data: { dayNumber: 1 } },
  { id: '12', type: 'transportation-ticket', title: '교통편 안내' },
  { id: '13', type: 'transportation-card', title: '교통카드 안내' },
  { id: '9', type: 'quotation', title: '견적' },
  { id: '11', type: 'payment', title: '결제 안내' },
];

/**
 * 페이지 설정 상태 관리 훅
 * - localStorage 자동 저장/불러오기
 * - 페이지 추가/삭제/복제/재정렬
 */
export function usePageConfigs() {
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>(() => {
    return storage.get(STORAGE_KEYS.PAGE_CONFIGS, defaultPageConfigs);
  });

  const [currentPage, setCurrentPage] = useState(0);

  // pageConfigs 변경 시 localStorage에 자동 저장
  useEffect(() => {
    storage.set(STORAGE_KEYS.PAGE_CONFIGS, pageConfigs);
  }, [pageConfigs]);

  // 현재 페이지가 범위를 벗어나면 조정
  useEffect(() => {
    if (currentPage >= pageConfigs.length) {
      setCurrentPage(Math.max(0, pageConfigs.length - 1));
    }
  }, [pageConfigs.length, currentPage]);

  // 새 ID 생성
  const generateId = useCallback(() => Date.now().toString(), []);

  // 페이지 추가
  const addPage = useCallback((page: Omit<PageConfig, 'id'>, afterIndex?: number) => {
    const newPage: PageConfig = { ...page, id: generateId() };
    setPageConfigs(prev => {
      const newConfigs = [...prev];
      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : prev.length;
      newConfigs.splice(insertIndex, 0, newPage);
      return newConfigs;
    });
    return newPage.id;
  }, [generateId]);

  // 페이지 삭제
  const removePage = useCallback((index: number) => {
    if (pageConfigs.length <= 1) return false;
    setPageConfigs(prev => prev.filter((_, i) => i !== index));
    return true;
  }, [pageConfigs.length]);

  // 페이지 업데이트
  const updatePage = useCallback((index: number, updates: Partial<PageConfig>) => {
    setPageConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[index] = { ...newConfigs[index], ...updates };
      return newConfigs;
    });
  }, []);

  // 페이지 복제
  const duplicatePage = useCallback((index: number): PageConfig | null => {
    if (index < 0 || index >= pageConfigs.length) return null;

    const pageToDuplicate = pageConfigs[index];
    const newPage: PageConfig = {
      ...JSON.parse(JSON.stringify(pageToDuplicate)),
      id: generateId(),
      title: pageToDuplicate.title + ' (복사)'
    };

    setPageConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs.splice(index + 1, 0, newPage);
      return newConfigs;
    });

    return newPage;
  }, [pageConfigs, generateId]);

  // 페이지 순서 변경 (드래그 앤 드롭)
  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setPageConfigs(prev => {
      const newConfigs = [...prev];
      const [removed] = newConfigs.splice(fromIndex, 1);
      newConfigs.splice(toIndex, 0, removed);
      return newConfigs;
    });
  }, []);

  // 페이지 이동
  const goToPage = useCallback((index: number) => {
    if (index >= 0 && index < pageConfigs.length) {
      setCurrentPage(index);
    }
  }, [pageConfigs.length]);

  // 다음/이전 페이지
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, pageConfigs.length - 1));
  }, [pageConfigs.length]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  // 현재 페이지 설정 가져오기
  const getCurrentPageConfig = useCallback(() => {
    return pageConfigs[currentPage];
  }, [pageConfigs, currentPage]);

  // 초기화
  const resetPageConfigs = useCallback(() => {
    setPageConfigs(defaultPageConfigs);
    setCurrentPage(0);
  }, []);

  return {
    pageConfigs,
    setPageConfigs,
    currentPage,
    setCurrentPage,
    addPage,
    removePage,
    updatePage,
    duplicatePage,
    reorderPages,
    goToPage,
    nextPage,
    prevPage,
    getCurrentPageConfig,
    resetPageConfigs,
    totalPages: pageConfigs.length
  };
}

export { defaultPageConfigs };
