import { useState, useEffect, useCallback } from 'react';
import { TourData, defaultTourData } from '../types/tour-data';
import { storage, STORAGE_KEYS } from '../utils/storage';

/**
 * 투어 데이터 상태 관리 훅
 * - localStorage 자동 저장/불러오기
 * - 부분 업데이트 지원
 */
export function useTourData() {
  const [tourData, setTourData] = useState<TourData>(() => {
    // 저장된 데이터와 기본값 병합: 누락된 필드는 기본값 사용
    const savedData = storage.get(STORAGE_KEYS.TOUR_DATA, null);
    return savedData ? { ...defaultTourData, ...savedData } : defaultTourData;
  });

  // tourData 변경 시 localStorage에 자동 저장
  useEffect(() => {
    storage.set(STORAGE_KEYS.TOUR_DATA, tourData);
  }, [tourData]);

  // 부분 업데이트 함수
  const updateTourData = useCallback((updates: Partial<TourData>) => {
    setTourData(prev => ({ ...prev, ...updates }));
  }, []);

  // 숙소 추가
  const addAccommodation = useCallback((accommodation: TourData['accommodations'][0]) => {
    setTourData(prev => ({
      ...prev,
      accommodations: [...prev.accommodations, accommodation]
    }));
    return tourData.accommodations.length; // 새 인덱스 반환
  }, [tourData.accommodations.length]);

  // 숙소 삭제
  const removeAccommodation = useCallback((index: number) => {
    setTourData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter((_, i) => i !== index)
    }));
  }, []);

  // 세부 일정 추가
  const addDetailedSchedule = useCallback((schedule: TourData['detailedSchedules'][0]) => {
    setTourData(prev => ({
      ...prev,
      detailedSchedules: [...prev.detailedSchedules, schedule]
    }));
  }, []);

  // 세부 일정 삭제
  const removeDetailedSchedule = useCallback((dayNumber: number) => {
    setTourData(prev => ({
      ...prev,
      detailedSchedules: prev.detailedSchedules.filter(s => s.day !== dayNumber)
    }));
  }, []);

  // 관광지 추가
  const addTouristSpot = useCallback((spot: NonNullable<TourData['touristSpots']>[0]) => {
    setTourData(prev => ({
      ...prev,
      touristSpots: [...(prev.touristSpots || []), spot]
    }));
  }, []);

  // 관광지 삭제
  const removeTouristSpot = useCallback((dayNumber: number) => {
    setTourData(prev => ({
      ...prev,
      touristSpots: (prev.touristSpots || []).filter(s => s.day !== dayNumber)
    }));
  }, []);

  // 초기화
  const resetTourData = useCallback(() => {
    setTourData(defaultTourData);
  }, []);

  return {
    tourData,
    setTourData,
    updateTourData,
    addAccommodation,
    removeAccommodation,
    addDetailedSchedule,
    removeDetailedSchedule,
    addTouristSpot,
    removeTouristSpot,
    resetTourData
  };
}
