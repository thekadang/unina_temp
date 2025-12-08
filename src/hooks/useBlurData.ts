import { useState, useEffect, useCallback } from 'react';
import { BlurData, BlurRegion } from '../types/blur-region';
import { storage, STORAGE_KEYS } from '../utils/storage';

/**
 * 블러 영역 상태 관리 훅
 * - localStorage 자동 저장/불러오기
 * - 페이지별 블러 영역 관리
 */
export function useBlurData() {
  // 블러 데이터 (pageId -> BlurRegion[])
  const [blurData, setBlurData] = useState<BlurData>(() => {
    return storage.get(STORAGE_KEYS.BLUR_DATA, {});
  });

  // 블러 모드 활성화된 페이지 목록
  const [blurModePages, setBlurModePages] = useState<Set<string>>(new Set());

  // blurData 변경 시 localStorage에 자동 저장
  useEffect(() => {
    storage.set(STORAGE_KEYS.BLUR_DATA, blurData);
  }, [blurData]);

  // 특정 페이지의 블러 모드 토글
  const toggleBlurMode = useCallback((pageId: string) => {
    setBlurModePages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  }, []);

  // 특정 페이지가 블러 모드인지 확인
  const isBlurMode = useCallback((pageId: string) => {
    return blurModePages.has(pageId);
  }, [blurModePages]);

  // 블러 영역 추가
  const addBlurRegion = useCallback((pageId: string, region: Omit<BlurRegion, 'id' | 'pageId'>) => {
    const regionId = Date.now().toString();
    const newRegion: BlurRegion = { ...region, id: regionId, pageId };

    setBlurData(prev => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), newRegion]
    }));

    return regionId;
  }, []);

  // 블러 영역 삭제
  const removeBlurRegion = useCallback((pageId: string, regionId: string) => {
    setBlurData(prev => ({
      ...prev,
      [pageId]: (prev[pageId] || []).filter(r => r.id !== regionId)
    }));
  }, []);

  // 특정 페이지의 블러 영역 가져오기
  const getBlurRegions = useCallback((pageId: string): BlurRegion[] => {
    return blurData[pageId] || [];
  }, [blurData]);

  // 특정 페이지의 모든 블러 영역 삭제
  const clearPageBlurRegions = useCallback((pageId: string) => {
    setBlurData(prev => {
      const newData = { ...prev };
      delete newData[pageId];
      return newData;
    });
  }, []);

  // 모든 블러 데이터 초기화
  const resetBlurData = useCallback(() => {
    setBlurData({});
    setBlurModePages(new Set());
  }, []);

  return {
    blurData,
    blurModePages,
    toggleBlurMode,
    isBlurMode,
    addBlurRegion,
    removeBlurRegion,
    getBlurRegions,
    clearPageBlurRegions,
    resetBlurData
  };
}
