import { useState, useEffect } from 'react';
import { TourData, defaultTourData } from './types/tour-data';
import customDefaultData from './data/custom-default-data.json';
import { BlurData, BlurRegion } from './types/blur-region';
import { CoverPage } from './components/CoverPage';
import { IntroductionPage } from './components/IntroductionPage';
import { FlightInfoPage } from './components/FlightInfoPage';
import { FlightDeparturePage } from './components/FlightDeparturePage';
import { FlightTransitPage } from './components/FlightTransitPage';
import { FlightArrivalPage } from './components/FlightArrivalPage';
import { ItineraryCalendarPage } from './components/ItineraryCalendarPage';
import { QuotationPage } from './components/QuotationPage';
import { ProcessPage } from './components/ProcessPage';
import { PaymentPage } from './components/PaymentPage';
import { EditableAccommodationPage } from './components/EditableAccommodationPage';
import { DetailedSchedulePage } from './components/DetailedSchedulePage';
import { TouristSpotListPage } from './components/TouristSpotListPage';
import { TransportationTicketPage } from './components/TransportationTicketPage';
import { TransportationCardPage } from './components/TransportationCardPage';
import { PasswordProtection } from './components/PasswordProtection';
import { ChevronLeft, ChevronRight, Menu, Download, Settings, Plus, FileDown, Upload, RotateCcw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from './components/ui/button';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import { ImageIcon } from 'lucide-react';

interface PageConfig {
  id: string;
  type: 'cover' | 'intro' | 'flight' | 'flight-departure' | 'flight-transit' | 'flight-arrival' | 'itinerary' | 'accommodation' | 'quotation' | 'process' | 'payment' | 'detailed-schedule' | 'tourist-spot' | 'transportation-ticket' | 'transportation-card';
  title: string;
  data?: any;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [blurModePages, setBlurModePages] = useState<Set<string>>(new Set());
  
  // Load saved data from localStorage or use default
  const [tourData, setTourData] = useState<TourData>(() => {
    try {
      const saved = localStorage.getItem('tourData');
      return saved ? JSON.parse(saved) : defaultTourData;
    } catch (error) {
      console.error('Failed to load saved data:', error);
      return defaultTourData;
    }
  });
  
  // Load blur data from localStorage
  const [blurData, setBlurData] = useState<BlurData>(() => {
    try {
      const saved = localStorage.getItem('blurData');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load blur data:', error);
      return {};
    }
  });

  // Save blur data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('blurData', JSON.stringify(blurData));
  }, [blurData]);
  
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>(() => {
    try {
      const saved = localStorage.getItem('pageConfigs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved page configs:', error);
    }
    return [
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
  });

  // Save current state as default
  const saveAsDefault = async () => {
    try {
      // First save to localStorage as backup
      localStorage.setItem('tourData', JSON.stringify(tourData));
      localStorage.setItem('pageConfigs', JSON.stringify(pageConfigs));
      
      // Create JSON data to download
      const dataToExport = {
        tourData,
        pageConfigs,
        exportedAt: new Date().toISOString()
      };
      
      // Create a blob from the JSON data
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `tour-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ 현재 상태가 JSON 파일로 저장되었습니다!\n\n이 파일을 개발자에게 전달하면 기본값으로 설정할 수 있습니다.\n\n또는 다른 브라우저에서 "설정 불러오기" 버튼으로 이 파일을 업로드하세요.');
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('❌ 저장에 실패했습니다.');
    }
  };

  // Load settings from JSON file
  const loadSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.tourData) {
            // 기본값과 병합: 누락된 필드는 기본값 사용, 저장된 필드는 불러온 값 사용
            const mergedTourData = { ...defaultTourData, ...data.tourData };
            setTourData(mergedTourData);
            localStorage.setItem('tourData', JSON.stringify(mergedTourData));
          }

          if (data.pageConfigs) {
            setPageConfigs(data.pageConfigs);
            localStorage.setItem('pageConfigs', JSON.stringify(data.pageConfigs));
          }

          alert('✅ 설정이 성공적으로 불러와졌습니다!');
        } catch (error) {
          console.error('Failed to load settings:', error);
          alert('❌ 파일을 읽는데 실패했습니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Save current page as JSON file
  const saveCurrentPage = async () => {
    try {
      const currentPageConfig = pageConfigs[currentPage];
      let pageDataToExport: any = null;

      // 페이지 타입에 따라 적절한 데이터 추출
      if (currentPageConfig.type === 'accommodation') {
        const accIndex = currentPageConfig.data?.index ?? 0;
        pageDataToExport = tourData.accommodations[accIndex];
      } else if (currentPageConfig.type === 'detailed-schedule') {
        const dayNumber = currentPageConfig.data?.dayNumber ?? 1;
        pageDataToExport = tourData.detailedSchedules.find(s => s.day === dayNumber);
      } else if (currentPageConfig.type === 'tourist-spot') {
        const dayNumber = currentPageConfig.data?.dayNumber ?? 1;
        pageDataToExport = tourData.touristSpots?.find(s => s.day === dayNumber);
      } else {
        pageDataToExport = currentPageConfig.data?.pageData || tourData;
      }

      const dataToExport = {
        pageConfig: currentPageConfig,
        pageData: pageDataToExport,
        exportedAt: new Date().toISOString()
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `page-${currentPageConfig.type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ 현재 페이지가 저장되었습니다!');
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('❌ 페이지 저장에 실패했습니다.');
    }
  };

  // Load page from JSON file and insert at current position
  const loadPageAtCurrent = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.pageConfig || !data.pageData) {
            alert('❌ 올바른 페이지 파일이 아닙니다.');
            return;
          }

          const newId = Date.now().toString();
          let newPage: PageConfig;
          let needsDataUpdate = false;

          // 페이지 타입에 따라 처리
          if (data.pageConfig.type === 'accommodation') {
            // 숙소 데이터를 tourData에 추가
            const newAccommodations = [...tourData.accommodations, data.pageData];
            setTourData({ ...tourData, accommodations: newAccommodations });

            newPage = {
              id: newId,
              type: 'accommodation',
              title: data.pageConfig.title,
              data: { index: newAccommodations.length - 1 }
            };
          } else if (data.pageConfig.type === 'detailed-schedule') {
            // 다음 day number 찾기
            const existingDayNumbers = tourData.detailedSchedules.map(s => s.day);
            const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;

            const loadedSchedule = { ...data.pageData, day: newDayNumber };
            const newSchedules = [...tourData.detailedSchedules, loadedSchedule];
            setTourData({ ...tourData, detailedSchedules: newSchedules });

            newPage = {
              id: newId,
              type: 'detailed-schedule',
              title: `세부 일정 (DAY ${newDayNumber})`,
              data: { dayNumber: newDayNumber }
            };
          } else if (data.pageConfig.type === 'tourist-spot') {
            // 다음 day number 찾기
            const touristSpots = tourData.touristSpots || [];
            const existingDayNumbers = touristSpots.map(s => s.day);
            const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;

            const loadedSpot = { ...data.pageData, day: newDayNumber };
            const newSpots = [...touristSpots, loadedSpot];
            setTourData({ ...tourData, touristSpots: newSpots });

            newPage = {
              id: newId,
              type: data.pageConfig.type as any,
              title: `관광지 리스트 (DAY ${newDayNumber})`,
              data: { dayNumber: newDayNumber }
            };
          } else {
            // 다른 모든 페이지 타입
            newPage = {
              id: newId,
              type: data.pageConfig.type as any,
              title: data.pageConfig.title,
              data: {
                ...data.pageConfig.data,
                pageData: data.pageData
              }
            };
          }

          // 현재 위치에 페이지 삽입
          const newPages = [...pageConfigs];
          newPages.splice(currentPage, 0, newPage);
          setPageConfigs(newPages);

          alert('✅ 페이지가 성공적으로 불러와졌습니다!');
        } catch (error) {
          console.error('Failed to load page:', error);
          alert('❌ 페이지를 불러오는데 실패했습니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const renderPage = (config: PageConfig) => {
    switch (config.type) {
      case 'cover':
        const coverPageData = config.data?.pageData || tourData;
        return (
          <CoverPage
            key={config.id}
            data={coverPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...coverPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'intro':
        const introPageData = config.data?.pageData || tourData;
        return (
          <IntroductionPage
            key={config.id}
            data={introPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              // 날짜 관련 정보가 업데이트되면 전역 tourData도 함께 업데이트
              const dateRelatedFields = ['startDate', 'endDate', 'nights', 'days', 'totalDays'];
              const hasDateUpdate = Object.keys(updated).some(key => dateRelatedFields.includes(key));
              
              if (hasDateUpdate) {
                // 전역 tourData 업데이트
                setTourData({ ...tourData, ...updated });
              }
              
              // 페이지별 데이터 업데이트
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...introPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'flight':
        const flightPageData = config.data?.pageData || tourData;
        return (
          <FlightInfoPage
            key={config.id}
            data={flightPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...flightPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'flight-departure':
        const flightDepPageData = config.data?.pageData || tourData;
        return (
          <FlightDeparturePage
            key={config.id}
            data={flightDepPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...flightDepPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'flight-transit':
        const flightTransitPageData = config.data?.pageData || tourData;
        return (
          <FlightTransitPage
            key={config.id}
            data={flightTransitPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...flightTransitPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'flight-arrival':
        const flightArrPageData = config.data?.pageData || tourData;
        return (
          <FlightArrivalPage
            key={config.id}
            data={flightArrPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...flightArrPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'itinerary':
        // ItineraryCalendarPage는 항상 전역 tourData를 사용 (날짜 연동을 위해)
        const itineraryPageData = { ...tourData, ...(config.data?.pageData || {}) };
        return (
          <ItineraryCalendarPage
            key={config.id}
            data={itineraryPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              // 전역 tourData 업데이트 (일정 데이터)
              setTourData({ ...tourData, ...updated });
              
              // 페이지별 데이터도 업데이트
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...itineraryPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'accommodation':
        const accIndex = config.data?.index ?? 0;
        // 페이지별 독립 데이터 사용: pageData가 있으면 그것을 사용, 없으면 tourData에서 가져옴
        const accPageData = config.data?.pageData || tourData;
        const accHotel = config.data?.pageData?.accommodations?.[accIndex] || tourData.accommodations[accIndex];
        return (
          <EditableAccommodationPage
            key={config.id}
            hotel={accHotel}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              // 페이지별 데이터에 숙소 정보 업데이트
              const currentAccommodations = accPageData.accommodations ? [...accPageData.accommodations] : [...tourData.accommodations];
              currentAccommodations[accIndex] = updated;
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...accPageData, accommodations: currentAccommodations }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.filter(p => p.type === 'accommodation').length > 1}
            data={accPageData}
            onStyleChange={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...accPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'quotation':
        const quotationPageData = config.data?.pageData || tourData;
        return (
          <QuotationPage
            key={config.id}
            data={quotationPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...quotationPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'process':
        const processPageData = config.data?.pageData || tourData;
        return (
          <ProcessPage
            key={config.id}
            data={processPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...processPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'payment':
        const paymentPageData = config.data?.pageData || tourData;
        return (
          <PaymentPage
            key={config.id}
            data={paymentPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...paymentPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'detailed-schedule':
        const dayNum = config.data?.dayNumber ?? 1;
        const detailedSchedulePageData = config.data?.pageData || tourData;
        return (
          <DetailedSchedulePage
            key={config.id}
            data={detailedSchedulePageData}
            dayNumber={dayNum}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...detailedSchedulePageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.filter(p => p.type === 'detailed-schedule').length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'tourist-spot':
        // 페이지별 독립 데이터 사용
        const touristSpotPageData = config.data?.pageData || tourData;
        const touristDayNum = config.data?.dayNumber ?? 1;
        return (
          <TouristSpotListPage
            key={config.id}
            data={touristSpotPageData}
            dayNumber={touristDayNum}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...touristSpotPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.filter(p => p.type === 'tourist-spot').length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'transportation-ticket':
        // 페이지별 독립 데이터 사용
        const ticketPageData = config.data?.pageData || tourData;
        return (
          <TransportationTicketPage
            key={config.id}
            data={ticketPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...ticketPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      case 'transportation-card':
        // 페이지별 독립 데이터 사용
        const cardPageData = config.data?.pageData || tourData;
        return (
          <TransportationCardPage
            key={config.id}
            data={cardPageData}
            isEditMode={isEditMode}
            onUpdate={(updated) => {
              const newPages = [...pageConfigs];
              newPages[currentPage] = {
                ...newPages[currentPage],
                data: {
                  ...newPages[currentPage].data,
                  pageData: { ...cardPageData, ...updated }
                }
              };
              setPageConfigs(newPages);
            }}
            onDuplicate={() => duplicatePage(currentPage)}
            onDelete={() => deletePage(currentPage)}
            canDelete={pageConfigs.length > 1}
            pageId={config.id}
            isBlurMode={blurModePages.has(config.id)}
            blurRegions={blurData[config.id] || []}
            onToggleBlurMode={() => handleToggleBlurMode(config.id)}
            onAddBlurRegion={(region) => handleAddBlurRegion(config.id, region)}
            onRemoveBlurRegion={(regionId) => handleRemoveBlurRegion(config.id, regionId)}
          />
        );
      default:
        return null;
    }
  };

  const duplicatePage = (index: number) => {
    const pageToDuplicate = pageConfigs[index];
    const newId = Date.now().toString();
    
    let newPage: PageConfig;
    if (pageToDuplicate.type === 'accommodation') {
      const accIndex = pageToDuplicate.data?.index ?? 0;
      const hotelToDuplicate = tourData.accommodations[accIndex];
      const newAccommodations = [...tourData.accommodations];
      // 깊은 복사를 위해 JSON.parse(JSON.stringify()) 사용
      const duplicatedHotel = JSON.parse(JSON.stringify(hotelToDuplicate));
      duplicatedHotel.name = duplicatedHotel.name + ' (복사)';
      newAccommodations.push(duplicatedHotel);
      setTourData({ ...tourData, accommodations: newAccommodations });
      
      newPage = {
        id: newId,
        type: 'accommodation',
        title: pageToDuplicate.title + ' (복사)',
        data: { index: newAccommodations.length - 1 }
      };
    } else if (pageToDuplicate.type === 'detailed-schedule') {
      const currentDayNumber = pageToDuplicate.data?.dayNumber ?? 1;
      const scheduleToDuplicate = tourData.detailedSchedules.find(s => s.day === currentDayNumber);
      
      // 다음 day number 찾기
      const existingDayNumbers = tourData.detailedSchedules.map(s => s.day);
      const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;
      
      // 스케줄 데이터 깊은 복사
      const duplicatedSchedule = scheduleToDuplicate 
        ? JSON.parse(JSON.stringify(scheduleToDuplicate))
        : { day: newDayNumber, title: `DAY ${newDayNumber}`, scheduleItems: [] };
      
      duplicatedSchedule.day = newDayNumber;
      duplicatedSchedule.title = `DAY ${newDayNumber}`;
      
      const newSchedules = [...tourData.detailedSchedules, duplicatedSchedule];
      setTourData({ ...tourData, detailedSchedules: newSchedules });
      
      newPage = {
        id: newId,
        type: 'detailed-schedule',
        title: `세부 일정 (DAY ${newDayNumber})`,
        data: { dayNumber: newDayNumber }
      };
    } else if (pageToDuplicate.type === 'tourist-spot') {
      const currentDayNumber = pageToDuplicate.data?.dayNumber ?? 1;
      const touristSpots = tourData.touristSpots || [];
      const spotToDuplicate = touristSpots.find(s => s.day === currentDayNumber);
      
      // 다음 day number 찾기
      const existingDayNumbers = touristSpots.map(s => s.day);
      const newDayNumber = Math.max(...existingDayNumbers, 0) + 1;
      
      // 스케줄 데이터 깊은 복사
      const duplicatedSpot = spotToDuplicate 
        ? JSON.parse(JSON.stringify(spotToDuplicate))
        : { day: newDayNumber, title: `DAY ${newDayNumber}`, colorTheme: 'pink', scheduleItems: [] };
      
      duplicatedSpot.day = newDayNumber;
      duplicatedSpot.title = `DAY ${newDayNumber}`;
      
      const newSpots = [...touristSpots, duplicatedSpot];
      setTourData({ ...tourData, touristSpots: newSpots });
      
      newPage = {
        id: newId,
        type: 'tourist-spot',
        title: `관광지 리스트 (DAY ${newDayNumber})`,
        data: { dayNumber: newDayNumber }
      };
    } else {
      // 다른 모든 페이지 타입: pageData를 깊은 복사
      const pageDataToDuplicate = pageToDuplicate.data?.pageData || tourData;
      const duplicatedPageData = JSON.parse(JSON.stringify(pageDataToDuplicate));
      
      newPage = {
        ...pageToDuplicate,
        id: newId,
        title: pageToDuplicate.title + ' (복사)',
        data: {
          ...pageToDuplicate.data,
          pageData: duplicatedPageData
        }
      };
    }
    
    const newPages = [...pageConfigs];
    newPages.splice(index + 1, 0, newPage);
    setPageConfigs(newPages);
    setCurrentPage(index + 1);
  };

  const deletePage = (index: number) => {
    if (pageConfigs.length <= 1) return;
    
    const pageToDelete = pageConfigs[index];
    
    if (pageToDelete.type === 'accommodation') {
      const accIndex = pageToDelete.data?.index ?? 0;
      const newAccommodations = tourData.accommodations.filter((_, i) => i !== accIndex);
      setTourData({ ...tourData, accommodations: newAccommodations });
      
      // 다른 숙소 페이지들의 인덱스 업데이트
      const newPages = pageConfigs
        .filter((_, i) => i !== index)
        .map(page => {
          if (page.type === 'accommodation' && (page.data?.index ?? 0) > accIndex) {
            return { ...page, data: { index: page.data.index - 1 } };
          }
          return page;
        });
      setPageConfigs(newPages);
    } else if (pageToDelete.type === 'detailed-schedule') {
      const dayNumber = pageToDelete.data?.dayNumber ?? 1;
      const newSchedules = tourData.detailedSchedules.filter(s => s.day !== dayNumber);
      setTourData({ ...tourData, detailedSchedules: newSchedules });
      
      const newPages = pageConfigs.filter((_, i) => i !== index);
      setPageConfigs(newPages);
    } else if (pageToDelete.type === 'tourist-spot') {
      const dayNumber = pageToDelete.data?.dayNumber ?? 1;
      const touristSpots = tourData.touristSpots || [];
      const newSpots = touristSpots.filter(s => s.day !== dayNumber);
      setTourData({ ...tourData, touristSpots: newSpots });
      
      const newPages = pageConfigs.filter((_, i) => i !== index);
      setPageConfigs(newPages);
    } else {
      const newPages = pageConfigs.filter((_, i) => i !== index);
      setPageConfigs(newPages);
    }
    
    if (currentPage >= pageConfigs.length - 1) {
      setCurrentPage(Math.max(0, currentPage - 1));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex === null || dragOverIndex === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPages = [...pageConfigs];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(dragOverIndex, 0, draggedPage);

    setPageConfigs(newPages);
    
    // 현재 보고 있는 페이지 추적
    if (currentPage === draggedIndex) {
      setCurrentPage(dragOverIndex);
    } else if (draggedIndex < currentPage && dragOverIndex >= currentPage) {
      setCurrentPage(currentPage - 1);
    } else if (draggedIndex > currentPage && dragOverIndex <= currentPage) {
      setCurrentPage(currentPage + 1);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Blur management functions
  const handleToggleBlurMode = (pageId: string) => {
    setBlurModePages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  const handleAddBlurRegion = (pageId: string, region: Omit<BlurRegion, 'id' | 'pageId'>) => {
    const regionId = Date.now().toString();
    const newRegion: BlurRegion = { ...region, id: regionId, pageId };
    
    setBlurData(prev => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), newRegion]
    }));
  };

  const handleRemoveBlurRegion = (pageId: string, regionId: string) => {
    setBlurData(prev => ({
      ...prev,
      [pageId]: (prev[pageId] || []).filter(r => r.id !== regionId)
    }));
  };

  const addAccommodationPage = () => {
    const newHotel = {
      country: '새 국가',
      city: '새 도시',
      checkIn: '2026.08.01',
      checkOut: '2026.08.03',
      nights: '2박 3일',
      name: '새 호텔',
      type: '호텔',
      stars: 5,
      roomType: '디럭스 더블룸',
      facilities: ['수영장', '피트니스'],
      breakfast: true,
      cityTax: '€3 per person/night',
      description: '호텔 설명을 입력하세요.',
      nearbyAttractions: ['관광지 1', '관광지 2', '관광지 3'],
      images: [
        'https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=1080',
        'https://images.unsplash.com/photo-1631048835184-3f0ceda91b75?w=1080',
        'https://images.unsplash.com/photo-1759223607861-f0ef3e617739?w=1080',
        'https://images.unsplash.com/photo-1722867710896-8b5ddb94e141?w=1080',
        'https://images.unsplash.com/photo-1758973470049-4514352776eb?w=1080'
      ]
    };

    const newAccommodations = [...tourData.accommodations, newHotel];
    setTourData({ ...tourData, accommodations: newAccommodations });

    const newPage: PageConfig = {
      id: Date.now().toString(),
      type: 'accommodation',
      title: `숙소 안내 (${newHotel.city})`,
      data: { index: newAccommodations.length - 1 }
    };

    const newPages = [...pageConfigs, newPage];
    setPageConfigs(newPages);
    setCurrentPage(newPages.length - 1);
  };

  const nextPage = () => {
    if (currentPage < pageConfigs.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePrint = async () => {
    console.log('[PDF] 인쇄 시작...');
    setIsPrintMode(true);
    setIsEditMode(false);

    // React 상태 업데이트 및 DOM 재렌더링 대기
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('[PDF] 인쇄 모드 활성화됨');

    // 모든 이미지가 로드될 때까지 기다림
    const waitForImages = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const images = document.querySelectorAll('img');
          console.log(`[PDF] ${images.length}개 이미지 로드 대기...`);

          let loadedCount = 0;
          const totalImages = images.length;

          const imagePromises = Array.from(images).map((img, index) => {
            // lazy loading 비활성화하고 강제 로드
            if (img.loading === 'lazy') {
              img.loading = 'eager';
              // src를 다시 설정하여 강제 로드 트리거
              const currentSrc = img.src;
              img.src = '';
              img.src = currentSrc;
              console.log(`[PDF] 이미지 ${index + 1}/${totalImages} lazy→eager 전환`);
            }

            // 이미 로드 완료된 이미지
            if (img.complete && img.naturalWidth > 0) {
              loadedCount++;
              console.log(`[PDF] 이미지 ${index + 1}/${totalImages} 이미 로드됨`);
              return Promise.resolve();
            }

            // 로드 대기 (개별 타임아웃 3초)
            return new Promise<void>((imgResolve) => {
              const timeout = setTimeout(() => {
                console.log(`[PDF] 이미지 ${index + 1}/${totalImages} 타임아웃`);
                imgResolve();
              }, 3000);

              img.onload = () => {
                clearTimeout(timeout);
                loadedCount++;
                console.log(`[PDF] 이미지 ${index + 1}/${totalImages} 로드 완료`);
                imgResolve();
              };
              img.onerror = () => {
                clearTimeout(timeout);
                console.log(`[PDF] 이미지 ${index + 1}/${totalImages} 로드 실패`);
                imgResolve(); // 에러여도 계속 진행
              };
            });
          });

          Promise.all(imagePromises).then(() => {
            console.log(`[PDF] 총 ${loadedCount}/${totalImages} 이미지 로드됨`);
            resolve();
          });
        }, 100); // DOM 업데이트 대기
      });
    };

    await waitForImages();
    console.log('[PDF] 이미지 로드 완료');

    // 추가 대기 시간 (이미지 렌더링 완료) - 2초로 증가
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[PDF] window.print() 호출...');

    try {
      window.print();
      console.log('[PDF] 인쇄 대화상자 완료');
    } catch (e) {
      console.error('[PDF] window.print() 에러:', e);
    }

    setIsPrintMode(false);
    console.log('[PDF] 인쇄 모드 종료');
  };

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollBottom = scrollTop + windowHeight;
      
      // 페이지 하단에서 100px 이내면 불투명하게
      const isNearBottom = documentHeight - scrollBottom < 100;
      setIsAtBottom(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 확인

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  if (isPrintMode) {
    return (
      <div className="print-mode">
        {/* SVG Filter for blur effect in PDF */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="svg-blur-filter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
            </filter>
          </defs>
        </svg>
        
        {pageConfigs.map((config, index) => {
          // Generate page-specific class based on type
          const pageClass = `${config.type}-page`;
          
          return (
            <div 
              key={config.id} 
              className={`print-page print:break-after-page ${pageClass}`}
            >
              {renderPage(config)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-yellow-50">
      {/* SVG Filter for blur effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="svg-blur-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
          </filter>
        </defs>
      </svg>

      {/* File Menu Button - 좌측 상단 */}
      <button
        onClick={() => setShowFileMenu(!showFileMenu)}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-cyan-200 print:hidden"
      >
        <Menu className="w-5 h-5 text-cyan-600" />
      </button>

      {/* File Menu Dropdown */}
      {showFileMenu && (
        <div className="fixed top-16 left-4 z-50 bg-white rounded-lg shadow-xl border border-cyan-200 p-2 w-52 print:hidden">
          <button
            onClick={() => {
              handlePrint();
              setShowFileMenu(false);
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-cyan-50 text-gray-700 transition-colors flex items-center gap-3"
          >
            <FileDown className="w-5 h-5 text-cyan-600" />
            <span>PDF 저장</span>
          </button>
          <button
            onClick={() => {
              saveAsDefault();
              setShowFileMenu(false);
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-green-50 text-gray-700 transition-colors flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5 text-green-600" />
            <span>사이트저장</span>
          </button>
          <button
            onClick={() => {
              loadSettings();
              setShowFileMenu(false);
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors flex items-center gap-3"
          >
            <Upload className="w-5 h-5 text-blue-600" />
            <span>사이트 불러오기</span>
          </button>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={() => {
              saveCurrentPage();
              setShowFileMenu(false);
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 text-gray-700 transition-colors flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-purple-600" />
            <span>페이지저장</span>
          </button>
          <button
            onClick={() => {
              loadPageAtCurrent();
              setShowFileMenu(false);
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 text-gray-700 transition-colors flex items-center gap-3"
          >
            <Upload className="w-5 h-5 text-orange-600" />
            <span>페이지 불러오기</span>
          </button>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={() => {
              if (confirm('정말 초기화하시겠습니까?\n\n불러온 모든 데이터가 삭제되고 커스텀 기본값으로 초기화됩니다.')) {
                // 커스텀 기본값으로 초기화 (JSON 파일에서 로드)
                localStorage.setItem('tourData', JSON.stringify(customDefaultData.tourData));
                // pageConfigs도 JSON 파일에서 로드 (스타일 정보 포함)
                if (customDefaultData.pageConfigs) {
                  localStorage.setItem('pageConfigs', JSON.stringify(customDefaultData.pageConfigs));
                } else {
                  localStorage.removeItem('pageConfigs');
                }
                localStorage.removeItem('blurData');
                window.location.reload();
              }
              setShowFileMenu(false);
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 transition-colors flex items-center gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>초기화</span>
          </button>
        </div>
      )}

      {/* Edit Mode Toggle */}
      <button
        onClick={() => {
          const newEditMode = !isEditMode;
          setIsEditMode(newEditMode);
          // 편집 모드를 끌 때 모든 블러 모드도 함께 끄기
          if (!newEditMode) {
            setBlurModePages(new Set());
          }
        }}
        className={`fixed top-4 left-20 z-50 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 print:hidden ${
          isEditMode
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            : 'bg-white text-gray-700 border border-gray-300'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span>{isEditMode ? '편집 모드' : '보기 모드'}</span>
      </button>

      {/* Blur Mode Toggle - 보기 모드에서만 표시 */}
      {!isEditMode && (
        <button
          onClick={() => {
            const currentPageId = pageConfigs[currentPage].id;
            handleToggleBlurMode(currentPageId);
          }}
          className={`fixed top-4 left-64 z-50 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 print:hidden ${
            blurModePages.has(pageConfigs[currentPage].id)
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          {blurModePages.has(pageConfigs[currentPage].id) ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
          <span>{blurModePages.has(pageConfigs[currentPage].id) ? '블러 모드' : '블러 설정'}</span>
        </button>
      )}

      {/* Page Navigation Menu - 우측 상단 */}
      <button
        onClick={() => setShowNav(!showNav)}
        className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-cyan-200 print:hidden"
      >
        <Menu className="w-5 h-5 text-cyan-600" />
      </button>

      {showNav && (
        <div className="fixed top-16 right-4 z-50 bg-white rounded-lg shadow-xl border border-cyan-200 p-4 w-56 max-h-[80vh] overflow-y-auto print:hidden">
          <div className="space-y-2">
            {pageConfigs.map((page, index) => (
              <button
                key={page.id}
                draggable={isEditMode}
                onDragStart={isEditMode ? () => handleDragStart(index) : undefined}
                onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
                onDragEnd={isEditMode ? handleDragEnd : undefined}
                onDragLeave={isEditMode ? handleDragLeave : undefined}
                onClick={() => {
                  setCurrentPage(index);
                  setShowNav(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  isEditMode ? 'cursor-move' : 'cursor-pointer'
                } ${
                  currentPage === index
                    ? 'bg-cyan-500 text-white'
                    : 'hover:bg-cyan-50 text-gray-700'
                } ${
                  draggedIndex === index && isEditMode
                    ? 'opacity-50 scale-95'
                    : ''
                } ${
                  dragOverIndex === index && draggedIndex !== index && isEditMode
                    ? 'border-2 border-cyan-400 border-dashed'
                    : ''
                }`}
              >
                {index + 1}. {page.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="max-w-4xl mx-auto pb-32 px-4 md:px-6 lg:px-0">
        {renderPage(pageConfigs[currentPage])}
      </div>

      {/* Page Navigation */}
      <div className={`fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-4 rounded-full shadow-xl px-4 md:px-6 py-2 md:py-3 border border-cyan-200 print:hidden z-[100] transition-all ${
        isAtBottom ? 'bg-white' : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="p-2 md:p-2 rounded-full hover:bg-cyan-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5 md:w-5 md:h-5 text-cyan-600" />
        </button>
        
        <div className="flex items-center gap-1.5 md:gap-2">
          {pageConfigs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all touch-manipulation ${
                currentPage === index
                  ? 'w-6 md:w-8 bg-cyan-500'
                  : 'w-1.5 md:w-2 bg-gray-300 hover:bg-cyan-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pageConfigs.length - 1}
          className="p-2 md:p-2 rounded-full hover:bg-cyan-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          <ChevronRight className="w-5 h-5 md:w-5 md:h-5 text-cyan-600" />
        </button>
      </div>

      {/* Page Counter */}
      <div className={`fixed bottom-4 md:bottom-8 right-4 md:right-8 rounded-full shadow-lg px-3 md:px-4 py-1.5 md:py-2 border border-cyan-200 print:hidden z-[100] transition-all ${
        isAtBottom ? 'bg-white' : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <span className="text-sm md:text-base text-cyan-600">
          {currentPage + 1} / {pageConfigs.length}
        </span>
      </div>
    </div>
  );
}