# 작업 이력

> 📜 모든 AI 작업 이력 및 롤백 포인트 기록

---

## History #1 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 피그마메이크를 통해 만든 프로젝트야. claude.md를 참고해서 니가 지켜야 할 지침을 확인하고, 프로젝트 전체코드를 파악해서 어떤 기능들을 갖추고 있는지 md파일로 만들어서 설명해봐.

### 수행한 작업
- [x] CLAUDE.md 지침 확인
- [x] 프로젝트 전체 구조 분석
- [x] 핵심 파일 코드 리뷰 (App.tsx, tour-data.ts, 주요 컴포넌트들)
- [x] docs/ 디렉토리 생성
- [x] docs/structure.md 문서 작성 (프로젝트 전체 분석)
- [x] docs/history.md 문서 작성 (본 파일)

### 변경된 파일
- 📄 `docs/structure.md` - 새로 생성 (프로젝트 구조 및 기능 분석)
- 📄 `docs/history.md` - 새로 생성 (작업 이력)

### 참조한 문서
- `CLAUDE.md` - AI 개발 지침
- `package.json` - 프로젝트 의존성
- `README.md` - 프로젝트 설명
- `src/App.tsx` - 메인 앱 로직
- `src/types/tour-data.ts` - 핵심 데이터 타입
- `src/components/*.tsx` - 각 페이지 컴포넌트

### 분석 결과 요약
이 프로젝트는 **여행 제안서 디자인 웹 앱**입니다:
- React 18 + TypeScript + Vite + Tailwind CSS 기반
- 15종의 페이지 타입 지원 (표지, 항공편, 일정, 숙소, 견적, 결제 등)
- 편집 모드: 텍스트 스타일/이미지 위치 조정 가능
- 블러 영역 기능으로 민감한 정보 가리기
- JSON 파일로 데이터 내보내기/불러오기
- PDF 출력 지원
- 비밀번호 보호 기능

---

## History #2 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 버셀과 수파베이스를 통해 배포를 하려고 생각중이야. 더 좋은 조합이 있으면 추천해. 그리고 현재의 디자인과 기능들을 모두 유지하면서 코드를 최적화 하면 좋을 것 같아.

### 수행한 작업
- [x] 배포 스택 분석 (Vercel vs Cloudflare vs Netlify)
- [x] Supabase 필요성 분석 → 현재는 불필요 (localStorage 기반)
- [x] 최적화 계획 문서화 (optimization-plan.md)
- [x] Phase 1: 커스텀 훅 추출 완료
- [x] Phase 2: 유틸리티 분리 완료
- [x] Phase 3: 성능 최적화 완료 (React.memo, lazy loading)
- [x] Vercel 배포 설정 완료

### 변경된 파일
- 📄 `docs/optimization-plan.md` - 새로 생성 (최적화 계획)
- 📄 `src/hooks/index.ts` - 새로 생성 (훅 인덱스)
- 📄 `src/hooks/useTourData.ts` - 새로 생성 (투어 데이터 훅)
- 📄 `src/hooks/useBlurData.ts` - 새로 생성 (블러 영역 훅)
- 📄 `src/hooks/usePageConfigs.ts` - 새로 생성 (페이지 설정 훅)
- 📄 `src/hooks/useAuth.ts` - 새로 생성 (인증 훅)
- 📄 `src/utils/index.ts` - 새로 생성 (유틸 인덱스)
- 📄 `src/utils/storage.ts` - 새로 생성 (localStorage 래퍼)
- 📄 `src/utils/export.ts` - 새로 생성 (파일 내보내기)
- 📝 `src/components/figma/ImageWithFallback.tsx` - 업데이트 (React.memo, lazy loading)
- 📄 `vercel.json` - 새로 생성 (Vercel 배포 설정)
- 📝 `docs/structure.md` - 업데이트 (새 디렉토리 반영)

### 배포 스택 결론
| 추천 | 스택 | 이유 |
|------|------|------|
| **1위** | Vercel 단독 | 현재 앱에 최적, 추가 설정 불필요 |
| 2위 | Cloudflare Pages | 한국에서 더 빠름 (서울 엣지) |
| 향후 | Supabase 추가 | 멀티유저/협업 기능 필요시에만 |

---

## History #3
**날짜**: 2025-12-08
**사용자 질문**: 13. 견적 페이지의 "견적서" 문구와 14. 결제 안내 페이지의 "결제 안내" 문구의 글자 스타일을 35px 중간굵기 #0891b2 색상을 기본값으로 변경하고 싶어.

### 수행한 작업
- [x] QuotationPage.tsx, PaymentPage.tsx 컴포넌트 분석
- [x] tour-data.ts 구조 분석
- [x] **근본 원인 발견**: `defaultTourData` 객체에 `quotationPageTitleStyle`이 누락됨
  - TypeScript 타입 정의(169줄)에는 있었지만, 실제 기본값 객체(514줄+)에는 없었음
  - `getStyleObject()` 함수가 undefined일 때 폴백값(16px, normal, #111827) 반환
- [x] `defaultTourData`에 견적 페이지 스타일 속성 추가 (680-691줄)
- [x] localStorage 초기화 후 테스트
- [x] 견적 페이지(13번) 스타일 적용 확인 ✅
- [x] 결제 안내 페이지(14번) 스타일 적용 확인 ✅

### 변경된 파일
- 📝 `src/types/tour-data.ts` - 업데이트
  - **Lines 680-691 추가** (`defaultTourData` 객체 내):
    ```typescript
    quotationPageTitleStyle: { size: '35px', weight: 'semibold', color: '#0891b2' },
    quotationSummaryLabelStyle: { size: '20px', weight: 'normal', color: '#111827' },
    quotationSummaryValueStyle: { size: '18px', weight: 'normal', color: '#111827' },
    // ... 기타 견적 페이지 스타일들
    ```
  - `paymentPageTitleStyle`은 이미 1233줄에 올바르게 정의되어 있었음

### 참조한 문서
- `src/components/QuotationPage.tsx` - 견적 페이지 컴포넌트
- `src/components/PaymentPage.tsx` - 결제 안내 페이지 컴포넌트
- `src/types/tour-data.ts` - 데이터 및 스타일 기본값 정의
- `src/types/text-style.ts` - `getStyleObject()` 폴백 로직 확인

### 문제 해결 요약
| 문제 | 원인 | 해결 |
|------|------|------|
| 견적서 스타일 미적용 | `defaultTourData`에 속성 누락 | 스타일 속성 추가 |
| 폴백값 적용됨 | `getStyleObject(!style)` → 기본값 | 올바른 값 정의 |

### 적용된 스타일
| 페이지 | 속성 | 값 |
|--------|------|-----|
| 13. 견적서 | size | 35px |
| 13. 견적서 | weight | semibold (600) |
| 13. 견적서 | color | #0891b2 |
| 14. 결제 안내 | size | 35px |
| 14. 결제 안내 | weight | semibold (600) |
| 14. 결제 안내 | color | #0891b2 |

---

## History #4 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 방금 작업한 내용들을 참고해서 전체코드를 다시한번 최적화 해보자. 문구와 디자인, 기능이 유지되어야 하는것을 잊지말고 검토해봐.

### 수행한 작업
- [x] tour-data.ts 전체 구조 심층 분석
- [x] TypeScript 타입 정의 vs defaultTourData 불일치 발견 및 수정
- [x] 누락된 스타일 속성 추가:
  - `quotationTitleStyle` (defaultTourData에 추가)
  - `quotationNotesStyle` (defaultTourData에 추가)
  - `quotationPageTitle` (defaultTourData에 추가)
- [x] 중복 속성 제거:
  - TourData 인터페이스에서 `quotationPageTitle` 중복 정의 제거
- [x] **TypeScript 타입 정의 정규화** (literal types → proper optional types):
  - Introduction page styles (12개 속성)
  - Flight pages styles (21개 속성)
  - Itinerary Calendar page styles (13개 속성)
  - Detailed Schedule page styles (13개 속성)
  - Transportation pages styles (2개 속성)
  - Accommodation page styles (1개 속성)
  - Quotation page styles (13개 속성)
- [x] 빌드 검증 완료 ✅

### 변경된 파일
- 📝 `src/types/tour-data.ts` - 대규모 업데이트
  - **TourData 인터페이스 정규화**: 모든 스타일 속성을 올바른 TypeScript 형식으로 변환
  - **기존 (잘못된 형식)**:
    ```typescript
    introductionTitleStyle: { size: '35px', weight: 'semibold', color: '#0891b2' },
    ```
  - **수정 (올바른 형식)**:
    ```typescript
    introductionTitleStyle?: { size: string; weight: 'normal' | 'semibold' | 'bold'; color: string; };
    ```
  - **defaultTourData에 누락된 속성 추가**:
    - `quotationTitleStyle`: `{ size: '48px', weight: 'semibold', color: '#0891b2' }`
    - `quotationNotesStyle`: `{ size: '14px', weight: 'normal', color: '#6b7280' }`
    - `quotationPageTitle`: `'견적서'`

### 문제 해결 요약
| 문제 유형 | 발견된 개수 | 해결 방법 |
|-----------|-------------|-----------|
| Literal 타입 오용 | 75+ 속성 | optional 타입으로 정규화 |
| 중복 속성 정의 | 1개 | 중복 제거 |
| defaultTourData 누락 | 3개 | 속성 추가 |

### 기술적 개선사항
1. **타입 안전성 향상**: 모든 스타일 속성이 올바른 TypeScript 형식 사용
2. **유지보수성 개선**: 일관된 타입 정의 패턴으로 코드 가독성 향상
3. **런타임 안정성**: undefined 스타일 속성에 대한 폴백 처리 보장
4. **빌드 성공**: 2536개 모듈 변환, 오류 없음

### 참조한 문서
- `src/types/tour-data.ts` - TourData 인터페이스 및 defaultTourData
- `src/types/text-style.ts` - getStyleObject() 함수
- `docs/history.md` - 이전 작업 이력

---

## History #5
**날짜**: 2025-12-08
**사용자 질문**: 텍스트 스타일 조절창이 열리지 않는 부분이 몇 군데 있어. 그리고 조절창의 글자크기 px 부분이 조금 짤린다. 창 크기가 조금 좁아서 그런것 같아. 검토해.

### 수행한 작업
- [x] StylePicker 컴포넌트 분석 (팝업 너비, z-index, 이벤트 전파)
- [x] 14개 컴포넌트에서 StylePicker 사용 위치 파악
- [x] 팝업 너비 수정: w-64 (256px) → w-72 (288px)
- [x] 브라우저에서 다중 페이지 테스트 (표지, 소개, 프로세스, 견적, 결제, 항공편)
- [x] **근본 원인 발견**: tour-data.ts에 Tailwind 클래스명이 스타일 값으로 저장됨
  - 콘솔 경고: "The specified value 'text-gray-500' does not conform to the required format"
- [x] tour-data.ts의 잘못된 9개 스타일 값 수정
- [x] 수정 후 브라우저 검증 완료 ✅

### 변경된 파일
- 📝 `src/components/StylePicker.tsx` - 팝업 너비 수정 (w-64 → w-72)
- 📝 `src/types/tour-data.ts` - 잘못된 스타일 값 수정 (9개 속성)

### 수정된 스타일 값 상세
| 위치 | 속성 | 이전 (오류) | 이후 (정상) |
|------|------|-------------|-------------|
| 표지 | coverDateStyle.color | `text-gray-500` | `#6b7280` |
| 표지 | plannerNameStyle | `text-sm`, `text-gray-500` | `14px`, `#6b7280` |
| 표지 | coverCopyrightStyle | `text-xs`, `text-gray-500` | `12px`, `#6b7280` |
| 출국편 | flightDepartureDescriptionStyle.color | `text-gray-500` | `#6b7280` |
| 출국편 | flightDepartureTitleStyle.color | `text-gray-500` | `#0891b2` |
| 경유편 | flightTransitDescriptionStyle.color | `text-gray-500` | `#6b7280` |
| 경유편 | flightTransitTitleStyle.color | `text-gray-500` | `#0891b2` |
| 귀국편 | flightArrivalDescriptionStyle.color | `text-gray-500` | `#6b7280` |
| 귀국편 | flightArrivalTitleStyle.color | `text-gray-500` | `#0891b2` |

### 문제 해결 요약
| 문제 | 원인 | 해결 |
|------|------|------|
| px 부분 짤림 | 팝업 너비 좁음 (256px) | 288px로 확장 |
| 색상 선택기 오류 | Tailwind 클래스명 저장 | hex 색상값으로 수정 |
| 크기 선택기 오류 | `text-sm` 등 저장 | `14px` 등으로 수정 |

### 참조한 문서
- `src/components/StylePicker.tsx` - 스타일 조절 팝업 컴포넌트
- `src/types/tour-data.ts` - 기본 스타일 데이터 정의
- `src/types/text-style.ts` - TextStyle 타입 및 getStyleObject()

---

## History #6
**날짜**: 2025-12-08
**사용자 질문**: 1페이지의 ㅇㅇㅇ님의 윤이나는 ㅇㅇ여행, 1차 플래닝, 날짜 부분이 글짜스타일 버튼을 눌러도 창이 나오지 않아. → 창 위치가 화면 밖에 벗어나서 안보이는거 같아. 위치를 조절하자.

### 수행한 작업
- [x] 브라우저 테스트로 문제 확인 (팝업이 열리지만 화면 밖에 위치)
- [x] **근본 원인 발견**: 부모 컨테이너의 `backdrop-blur-sm` CSS 속성이 새로운 containing block을 생성하여 `position: fixed`가 viewport 대신 해당 컨테이너 기준으로 동작
- [x] **해결책**: React Portal 적용하여 팝업을 document.body에 직접 렌더링
- [x] 위치 계산 로직 개선 (공간 부족 시 화면 중앙 배치)
- [x] z-index 상향 조정 (z-50 → z-[9999])
- [x] 브라우저 테스트로 수정 확인 ✅

### 변경된 파일
- 📝 `src/components/StylePicker.tsx` - Portal 적용 및 위치 로직 개선

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 팝업이 화면 밖에 위치 | `backdrop-blur-sm`이 containing block 생성 | React Portal로 body에 직접 렌더링 |
| `position: fixed` 오동작 | CSS backdrop-filter 속성 | Portal로 DOM 계층 우회 |
| z-index 충돌 가능성 | 다른 요소들과 겹침 | z-[9999]로 최상위 보장 |

### 주요 코드 변경
```typescript
// Before: 팝업이 컴포넌트 내부에 렌더링
{isOpen && (
  <>
    <div className="fixed inset-0 z-40..." />
    <div className="fixed ... z-50..." />
  </>
)}

// After: Portal로 document.body에 렌더링
{isOpen && createPortal(
  <>
    <div className="fixed inset-0 z-[9998]..." />
    <div className="fixed ... z-[9999]..." />
  </>,
  document.body
)}
```

### 참조한 문서
- `src/components/StylePicker.tsx` - 스타일 조절 팝업 컴포넌트
- `src/components/CoverPage.tsx` - backdrop-blur-sm 사용 확인
- MDN: CSS backdrop-filter와 containing block 관계

---

## History #7 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 페이지를 복제를 하면 기존페이지와 복제된 페이지는 개별로 동작해야해. 지금은 페이지를 복제해서 원본페이지의 내용을 수정하면 복제된 페이지에도 그대로 반영되고 있어. 그러면 안돼.

### 수행한 작업
- [x] 문제 분석: 페이지 복제 후 원본과 복제본이 같은 `tourData`를 참조
- [x] **근본 원인 발견**: 5개 페이지가 `data={tourData}`를 직접 사용하여 전역 상태 공유
- [x] 해결책: 각 페이지에 `config.data?.pageData || tourData` 패턴 적용
- [x] `flight` 페이지 독립 데이터 패턴 적용
- [x] `accommodation` 페이지 독립 데이터 패턴 적용 (hotel 데이터 포함)
- [x] `process` 페이지 독립 데이터 패턴 적용
- [x] `payment` 페이지 독립 데이터 패턴 적용
- [x] `detailed-schedule` 페이지 독립 데이터 패턴 적용
- [x] 빌드 성공 확인 ✅

### 변경된 파일
- 📝 `src/App.tsx` - 5개 페이지 케이스에 페이지별 독립 데이터 패턴 적용

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 원본-복제본 데이터 공유 | 전역 `tourData` 직접 참조 | 페이지별 `pageData` 사용 |
| 수정이 양쪽에 반영 | `setTourData()` 호출 | `setPageConfigs()` 호출로 개별 저장 |

### 수정된 페이지 목록
| 페이지 타입 | 이전 방식 | 이후 방식 |
|-------------|-----------|-----------|
| `flight` | `data={tourData}` | `data={flightPageData}` (페이지별 저장) |
| `accommodation` | `data={tourData}`, `hotel={tourData.accommodations[index]}` | 개별 pageData 사용 |
| `process` | `data={tourData}` | `data={processPageData}` (페이지별 저장) |
| `payment` | `data={tourData}` | `data={paymentPageData}` (페이지별 저장) |
| `detailed-schedule` | `data={tourData}` | `data={detailedSchedulePageData}` (페이지별 저장) |

### 주요 코드 패턴
```typescript
// Before: 전역 데이터 직접 사용
case 'process':
  return (
    <ProcessPage
      data={tourData}
      onUpdate={(updated) => setTourData({ ...tourData, ...updated })}
    />
  );

// After: 페이지별 독립 데이터 사용
case 'process':
  const processPageData = config.data?.pageData || tourData;
  return (
    <ProcessPage
      data={processPageData}
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
    />
  );
```

### 참조한 문서
- `src/App.tsx` - 메인 앱 페이지 렌더링 로직
- `src/hooks/usePageConfigs.ts` - 페이지 설정 훅

---

## History #8
**날짜**: 2025-12-08
**사용자 질문**: 5페이지 항공편 페이지를 복사했어. 원본에 경유버튼을 눌러 추가할땐 복제페이지에 아무 변화가 없어. 근데 이후에 복제페이지에서 경유버튼을 눌러 추가를 하니까 원본의 편집내용의 영향을 받고있어. 완전 독립적이지 않다는 말이야. 해결해.

### 수행한 작업
- [x] **근본 원인 발견**: 페이지 컴포넌트 내부의 `useState` 초기화 문제
  - `const [editData, setEditData] = useState(flight);`가 컴포넌트 마운트 시점에만 초기화됨
  - 페이지 전환 시 컴포넌트가 재마운트되지 않으면 이전 페이지의 상태가 남아있음
- [x] 해결책: 모든 페이지 컴포넌트에 `key={config.id}` prop 추가
  - React의 key 변경 시 컴포넌트가 완전히 재마운트됨
  - 새로운 페이지 ID → 새로운 컴포넌트 인스턴스 → 올바른 데이터로 초기화
- [x] 모든 페이지 타입에 key prop 적용 (총 14개)
- [x] 빌드 성공 확인 ✅

### 변경된 파일
- 📝 `src/App.tsx` - 모든 페이지 컴포넌트에 `key={config.id}` 추가

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 복제 후 수정 시 원본 데이터 참조 | `useState` 초기값이 이전 페이지 데이터 유지 | `key={config.id}`로 강제 재마운트 |
| 페이지 전환 시 상태 오염 | 컴포넌트 재사용으로 상태 유지 | key 변경으로 새 인스턴스 생성 |

### 수정된 페이지 목록
- cover, intro, flight, flight-departure, flight-transit, flight-arrival
- itinerary, accommodation, quotation, process, payment
- detailed-schedule, tourist-spot, transportation-ticket, transportation-card

### 주요 코드 패턴
```typescript
// Before: key 없음 - 페이지 전환 시 컴포넌트 재사용
<FlightDeparturePage
  data={flightDepPageData}
  ...
/>

// After: key 추가 - 페이지 ID 변경 시 컴포넌트 재마운트
<FlightDeparturePage
  key={config.id}
  data={flightDepPageData}
  ...
/>
```

### 참조한 문서
- `src/App.tsx` - 페이지 렌더링 로직
- `src/components/FlightDeparturePage.tsx` - useState 문제 발견

---

## History #9 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 블러 기능에 문제가 있어. 1. 화면상에 블러를 지정한 영역과 pdf출력 시의 블러영역의 위치가 다르게 나와. 2. 화면에서의 블러는 잘 작동해. 근데 pdf로 출력하면 뿌옇게 흐려지는 효과만 있고 가려야 할 내용(글자/이미지)이 그대로 보여.

### 수행한 작업
- [x] BlurOverlay 컴포넌트 분석 (`src/components/BlurOverlay.tsx`)
- [x] **근본 원인 발견 - 이슈 1 (위치 불일치)**:
  - 화면: `min-h-screen` = 뷰포트 높이에 따라 변동 (예: 900px)
  - 인쇄: `print:h-[297mm]` = 고정 A4 높이 (약 1122px)
  - 동일한 % 위치가 다른 절대 픽셀 위치로 변환됨
- [x] **근본 원인 발견 - 이슈 2 (PDF 블러 효과 약함)**:
  - `backdrop-filter: blur(12px)`는 Chrome PDF 렌더링에서 작동하지 않음
  - PDF에서는 투명 배경만 남아 내용이 그대로 보임
- [x] **해결책 1 - PDF 블러 불투명 처리**:
  - 인쇄 시 완전 불투명 흰색 배경 + 사선 패턴 적용
  - `backdrop-filter` 제거, 순수 CSS 배경색으로 내용 가림
- [x] **해결책 2 - 블러 위치 동기화**:
  - 모든 페이지 컨테이너에 `blur-container` 클래스 추가
  - `data-has-blur` 속성으로 블러 있는 페이지만 A4 비율 적용
  - 인쇄 시 고정 297mm 높이로 일관된 위치 보장
- [x] 15개 페이지 컴포넌트 업데이트 완료
- [x] 빌드 성공 확인 ✅

### 변경된 파일
- 📝 `src/styles/globals.css` - 블러 위치 동기화 CSS 추가, PDF 인쇄 스타일 개선
- 📝 `src/index.css` - PDF 인쇄용 블러 스타일 추가
- 📝 `src/components/CoverPage.tsx` - blur-container 클래스 및 data-has-blur 속성 추가
- 📝 `src/components/DetailedSchedulePage.tsx` - blur-container 적용
- 📝 `src/components/IntroductionPage.tsx` - blur-container 적용
- 📝 `src/components/EditableAccommodationPage.tsx` - blur-container 적용
- 📝 `src/components/FlightDeparturePage.tsx` - blur-container 적용
- 📝 `src/components/FlightArrivalPage.tsx` - blur-container 적용
- 📝 `src/components/FlightTransitPage.tsx` - blur-container 적용
- 📝 `src/components/FlightInfoPage.tsx` - blur-container 적용
- 📝 `src/components/ItineraryCalendarPage.tsx` - blur-container 적용
- 📝 `src/components/PaymentPage.tsx` - blur-container 적용
- 📝 `src/components/ProcessPage.tsx` - blur-container 적용
- 📝 `src/components/QuotationPage.tsx` - blur-container 적용
- 📝 `src/components/TouristSpotListPage.tsx` - blur-container 적용
- 📝 `src/components/TransportationCardPage.tsx` - blur-container 적용
- 📝 `src/components/TransportationTicketPage.tsx` - blur-container 적용
- 📝 `src/components/PageWrapper.tsx` - blur-container 적용

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| PDF 블러 효과 약함 | `backdrop-filter`가 PDF에서 미지원 | 완전 불투명 배경 + 사선 패턴으로 대체 |
| 화면/PDF 위치 불일치 | 컨테이너 높이 차이 (min-h-screen vs 297mm) | 블러 있는 페이지에 일관된 비율 적용 |

### 주요 CSS 변경
```css
/* PDF 인쇄 시 블러 영역 완전 가림 */
@media print {
  .blur-region-print,
  [data-blur-region="true"] {
    background-color: #ffffff !important;
    background: linear-gradient(135deg, #f0f0f0 25%, #ffffff 25%, ...) !important;
    backdrop-filter: none !important;
  }

  .blur-container {
    height: 297mm;
    min-height: 297mm !important;
  }
}
```

### 참조한 문서
- `src/components/BlurOverlay.tsx` - 블러 영역 컴포넌트
- `src/styles/globals.css` - 전역 스타일 및 인쇄 스타일
- MDN: CSS backdrop-filter 및 인쇄 미디어 쿼리

---

## History #10
**날짜**: 2025-12-08
**사용자 질문**: 위치가 안맞는다... 위치로 계산하지 말고 내가 가리려는 부분을 파악해서 가려줄 순 없나??

### 수행한 작업
- [x] 블러 위치 불일치 문제 심층 분석
- [x] **핵심 원인 발견**:
  - 화면: `min-h-screen` = 가변 높이 (예: 900px)
  - PDF: `print:h-[297mm]` = 고정 A4 높이 (약 1123px)
  - 블러 위치가 컨테이너 기준 %로 저장됨
  - 같은 % 값이 다른 픽셀 위치를 가리킴
- [x] **해결책: 화면에서도 블러가 있는 페이지에 A4 높이 강제 적용**
  - `.blur-container[data-has-blur="true"]`에 `height: 297mm !important` 적용
  - 화면과 PDF의 컨테이너 크기가 동일해짐
  - 동일한 % 위치 = 동일한 픽셀 위치
- [x] globals.css 블러 동기화 시스템 업데이트
- [x] 빌드 성공 확인 ✅

### 변경된 파일
- 📝 `src/styles/globals.css` - 블러 위치 동기화 CSS 개선
  - 블러가 있는 페이지에 화면에서도 A4 높이(297mm) 강제 적용
  - `overflow: auto`로 콘텐츠가 넘칠 경우 스크롤 가능
  - 상단 정렬(`justify-content: flex-start`)로 콘텐츠 시작 위치 일치
- 📝 `src/components/CoverPage.tsx` - 구조 정리 (일관성 유지)

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 화면/PDF 블러 위치 불일치 | 컨테이너 높이 차이 (가변 vs 고정) | 블러 있는 페이지만 화면에서도 A4 높이 고정 |

### 주요 CSS 변경
```css
/* 블러가 있는 페이지: 화면에서도 A4 높이 강제 적용 */
.blur-container[data-has-blur="true"] {
  min-height: 297mm !important;
  height: 297mm !important;
  overflow: auto;
  justify-content: flex-start !important;
}
```

### 참조한 문서
- `src/styles/globals.css` - 블러 위치 동기화 CSS
- `src/components/BlurOverlay.tsx` - 블러 영역 컴포넌트

---

## History #11 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 아직 해결돼지 않았다... (블러 위치 문제 지속)

### 수행한 작업
- [x] Playwright 브라우저 테스트로 실제 동작 확인
- [x] **근본 원인 재발견**:
  - `data-has-blur="true"`는 블러 영역이 **추가된 후**에만 적용됨
  - 블러 모드 활성화 시점에는 컨테이너가 여전히 화면 크기(953px)
  - 사용자가 블러 드래그할 때 이미 잘못된 % 위치가 계산됨
- [x] **해결책: 블러 모드 진입 즉시 A4 높이 적용**
  - `data-blur-mode="true"` 속성 추가
  - 블러 모드 활성화 시 인라인 스타일로 `height: 297mm` 적용
  - Tailwind `h-[297mm]` 클래스가 JIT 컴파일 안됨 → 인라인 스타일 사용
- [x] CoverPage, PageWrapper 컴포넌트에 조건부 스타일 적용
- [x] Playwright 테스트로 컨테이너 높이 1122.52px(A4) 확인 ✅
- [x] 빌드 성공 ✅

### 변경된 파일
- 📝 `src/styles/globals.css` - `data-blur-mode` 선택자 추가 (CSS 폴백용)
- 📝 `src/components/CoverPage.tsx` - 블러 모드 시 인라인 스타일로 A4 높이 적용
- 📝 `src/components/PageWrapper.tsx` - 블러 모드 시 인라인 스타일로 A4 높이 적용

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 블러 위치 여전히 불일치 | 블러 모드 활성화 시 컨테이너가 화면 크기 유지 | 블러 모드 진입 즉시 A4 높이(297mm) 적용 |
| Tailwind `h-[297mm]` 미작동 | Tailwind 4.0 JIT에서 mm 단위 미컴파일 | 인라인 스타일 사용 |

### 검증 결과 (Playwright)
```javascript
// 블러 모드 활성화 후 측정
{
  "dataBlurMode": "true",
  "inlineStyle": "height: 297mm; min-height: 297mm;",
  "offsetHeight": 1123,              // A4 높이!
  "computedHeight": "1122.52px",     // 정확히 297mm
  "heightMatch": true                // ✅
}
```

### 참조한 문서
- `src/components/CoverPage.tsx`
- `src/components/PageWrapper.tsx`
- `src/styles/globals.css`

---

## History #12 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 여전해.. 블러 범위를 마우스 드레그가 아니라 요소 범위로 하면 어때? p, span, h, div 등의 요소 범위로 블러 처리를 하면 좀 더 수월하려나?

### 수행한 작업
- [x] **좌표 기반 → 요소 기반 블러로 완전 전환**
  - 기존: 마우스 드래그 → % 좌표 저장 → 화면/PDF 크기 차이로 위치 불일치
  - 신규: DOM 요소 클릭 → `data-blur-key` 속성으로 요소 식별 → 크기 무관하게 정확한 블러
- [x] BlurRegion 타입 수정: `x, y, width, height` 제거 → `fieldKey` 추가
- [x] BlurOverlay 컴포넌트 재작성: 드래그 → 클릭 기반 선택
- [x] CSS 스타일 추가: `.blur-active`, `.blur-hover` 클래스
- [x] 모든 페이지 컴포넌트에 `data-blur-key` 속성 추가:
  - CoverPage (6개 필드)
  - IntroductionPage, DetailedSchedulePage, FlightInfoPage
  - FlightDeparturePage, FlightArrivalPage, FlightTransitPage (각 13개 패턴)
  - EditableAccommodationPage (20개 필드)
  - ItineraryCalendarPage, PaymentPage, ProcessPage
  - QuotationPage, TouristSpotListPage, TransportationCardPage, TransportationTicketPage
- [x] 빌드 성공 ✅

### 변경된 파일
- 📝 `src/types/blur-region.ts` - 좌표 기반에서 fieldKey 기반으로 타입 변경
- 📝 `src/components/BlurOverlay.tsx` - 클릭 기반 선택으로 완전 재작성
- 📝 `src/styles/globals.css` - 요소 기반 블러 CSS 스타일 추가
- 📝 `src/components/CoverPage.tsx` - data-blur-key 추가
- 📝 `src/components/IntroductionPage.tsx` - data-blur-key 추가
- 📝 `src/components/DetailedSchedulePage.tsx` - data-blur-key 추가
- 📝 `src/components/FlightInfoPage.tsx` - data-blur-key 추가
- 📝 `src/components/FlightDeparturePage.tsx` - data-blur-key 추가
- 📝 `src/components/FlightArrivalPage.tsx` - data-blur-key 추가
- 📝 `src/components/FlightTransitPage.tsx` - data-blur-key 추가
- 📝 `src/components/EditableAccommodationPage.tsx` - data-blur-key 추가
- 📝 `src/components/ItineraryCalendarPage.tsx` - data-blur-key 추가
- 📝 `src/components/PaymentPage.tsx` - data-blur-key 추가
- 📝 `src/components/ProcessPage.tsx` - data-blur-key 추가
- 📝 `src/components/QuotationPage.tsx` - data-blur-key 추가
- 📝 `src/components/TouristSpotListPage.tsx` - data-blur-key 추가

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 블러 위치 화면/PDF 불일치 | 좌표 기반 % 저장 방식의 근본적 한계 | 요소 식별자(fieldKey) 기반으로 전환 |
| 드래그 영역 정확도 | 사용자가 정확히 그리기 어려움 | 클릭 한 번으로 요소 전체 선택 |

### 새 블러 시스템 사용법
1. 블러 모드 활성화 (눈 아이콘 클릭)
2. 블러 처리할 텍스트 요소 클릭 (보라색 테두리 하이라이트)
3. 다시 클릭하면 블러 해제
4. PDF 출력 시 선택한 요소 자동 블러 처리

### 참조한 문서
- `src/types/blur-region.ts`
- `src/components/BlurOverlay.tsx`
- `src/styles/globals.css`
- 모든 페이지 컴포넌트 (15개 파일)

---

## History #13
**날짜**: 2025-12-08
**사용자 질문**: 블러 모드에서 선택할 수 있는 요소들이 보이지 않아. 마우스를 움직이면 요소들이 표시되고 선택하면 블러처리가 될 줄 알았는데..

### 수행한 작업
- [x] 브라우저에서 블러 모드 호버 하이라이트 문제 디버깅
- [x] **근본 원인 발견**: Tailwind CSS 4의 purge 기능이 동적으로 추가되는 클래스 제거
  - `.blur-hover`, `.blur-active` 클래스가 스타일시트에 0개 규칙으로 존재
  - CSS에 정의되어 있지만 빌드 시 사용되지 않는 것으로 판단되어 제거됨
- [x] **해결책: CSS 클래스 대신 인라인 스타일 사용**
  - 호버 하이라이트: JavaScript로 직접 `outline`, `backgroundColor` 등 적용
  - 블러 효과: JavaScript로 직접 `filter: blur(8px)`, `userSelect`, `pointerEvents` 적용
- [x] Playwright 브라우저 테스트로 수정 확인 ✅
  - 호버 시 보라색 점선 테두리 표시 확인
  - 클릭 시 블러 효과(흐림) 적용 확인

### 변경된 파일
- 📝 `src/components/BlurOverlay.tsx` - CSS 클래스 기반에서 인라인 스타일 기반으로 변경
  - 호버 하이라이트 스타일 추가 (outline, outlineOffset, cursor, backgroundColor)
  - 블러 스타일 추가 (filter, userSelect, pointerEvents)
  - useEffect로 DOM 요소에 직접 스타일 적용

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 호버 하이라이트 미표시 | `.blur-hover` CSS 규칙이 빌드에서 purge됨 | 인라인 스타일로 직접 적용 |
| 블러 효과 미적용 | `.blur-active` CSS 규칙이 빌드에서 purge됨 | 인라인 스타일로 직접 적용 |

### 주요 코드 변경
```typescript
// 호버 하이라이트 스타일 (인라인 - Tailwind purge 우회)
const hoverStyle = {
  outline: '2px dashed #8b5cf6',
  outlineOffset: '2px',
  cursor: 'pointer',
  backgroundColor: 'rgba(139, 92, 246, 0.1)'
};

// 블러 스타일 (인라인 - Tailwind purge 우회)
const blurStyle = {
  filter: 'blur(8px)',
  userSelect: 'none' as const,
  pointerEvents: 'none' as const
};
```

### 참조한 문서
- `src/components/BlurOverlay.tsx` - 블러 오버레이 컴포넌트
- `src/styles/globals.css` - 전역 CSS 스타일
- `src/types/blur-region.ts` - 블러 영역 타입

---

## History #14 ⭐
**날짜**: 2025-12-08
**사용자 질문**: 두 가지 문제가 있다. 1. 블러 취소 기능이 없어졌어. 2. pdf출력에서 블러 처리가 안돼.

### 수행한 작업
- [x] **문제 1: 블러 취소 기능 복구**
  - 원인: `pointerEvents: 'none'`이 블러된 요소에 항상 적용되어 클릭 불가
  - 해결: `isBlurMode ? 'auto' : 'none'` 조건부 적용
- [x] **문제 2: PDF 출력 블러 처리**
  - 원인: 인라인 스타일이 `@media print`의 `!important`보다 우선
  - 해결: `beforeprint`/`afterprint` 이벤트로 인쇄 시 스타일 직접 변경
- [x] Playwright 브라우저 테스트로 두 기능 모두 검증 ✅

### 변경된 파일
- 📝 `src/components/BlurOverlay.tsx` - 블러 취소 및 PDF 출력 처리 수정
  - `pointerEvents`를 `isBlurMode` 조건부로 변경
  - `data-blur-active` 속성 추가
  - `beforeprint`/`afterprint` 이벤트 리스너 추가
- 📝 `src/styles/globals.css` - `[data-blur-active="true"]` 선택자 추가

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| 블러 취소 불가 | `pointerEvents: 'none'`으로 클릭 차단 | 블러 모드일 때만 `'auto'` 적용 |
| PDF 블러 미적용 | 인라인 스타일 > CSS `!important` | JavaScript 이벤트로 인쇄 시 스타일 변경 |

### 주요 코드 변경
```typescript
// 블러 모드일 때는 클릭 가능하게 유지 (해제용)
el.style.pointerEvents = isBlurMode ? 'auto' : 'none';

// PDF 출력 시 블러 스타일 변경
const handleBeforePrint = () => {
  el.style.filter = 'none';
  el.style.color = 'transparent';
  el.style.backgroundColor = '#e5e5e5';
};

const handleAfterPrint = () => {
  el.style.filter = blurStyle.filter; // blur(8px) 복원
  el.style.color = '';
  el.style.backgroundColor = '';
};
```

### 검증 결과 (Playwright)
| 테스트 | 결과 |
|--------|------|
| 블러 적용 → 재클릭 해제 | ✅ 작동 확인 |
| `beforeprint` 시 스타일 | `color: transparent`, `backgroundColor: #e5e5e5`, `filter: none` ✅ |
| `afterprint` 시 스타일 | `filter: blur(8px)`, 원래 색상 복원 ✅ |

### 참조한 문서
- `src/components/BlurOverlay.tsx` - 블러 오버레이 컴포넌트
- `src/styles/globals.css` - 전역 CSS 스타일

---

## History #15 ⭐
**날짜**: 2025-12-08
**사용자 질문**:
1. 모든 요소(body, div, p, span 등)에 블러 적용 가능하게 해줘
2. 블러 모드 안내 문구가 가리는 부분 해결해줘
3. 2페이지부터 PDF에 블러 처리가 반영이 안돼
4. 블러모드에서 가장 바깥 테두리에 점선 영역이 생기는데 사라지지 않아

### 수행한 작업
- [x] **동적 요소 경로 생성 시스템 구현**
  - `getElementPath()` 함수: `auto:div[0]>p[1]>span[0]` 형식으로 요소 위치 저장
  - `findElementByPath()` 함수: 경로로 요소 찾기
  - `data-blur-key` 없는 요소도 블러 선택 가능
- [x] **안내 문구 위치 변경 및 클릭 통과 처리**
  - 위치: `top-20` → `bottom-4` (화면 하단으로 이동)
  - `pointer-events-none` 추가: 안내 문구 아래 요소도 클릭 가능
  - `data-blur-ui="true"` 속성으로 UI 요소 클릭 제외
- [x] **SVG className 에러 수정**
  - 원인: SVG 요소는 `SVGAnimatedString` 타입의 className을 가짐
  - 해결: `element.className?.split(' ')[0]` → `element.classList?.[0]`
- [x] **PDF 블러 2페이지 이후 미적용 문제 수정**
  - 원인: `containerRef.current`가 첫 번째 `.blur-container`만 참조
  - 해결: `document.querySelectorAll('.blur-container')`로 모든 페이지에서 블러 요소 찾기
- [x] **점선 테두리 잔상 문제 수정**
  - `isBlurContainer()` 함수 추가: container 자체 hover/click 제외
  - `handleMouseLeave()` 함수 추가: container 외부로 마우스 이동 시 hover 상태 정리
  - `mouseout` 이벤트 리스너 추가

### 변경된 파일
- 📝 `src/components/BlurOverlay.tsx` - 대규모 업데이트
  - `getElementPath()`, `findElementByPath()` 함수 추가
  - `isBlurOverlayUI()`, `isEditUI()`, `isBlurContainer()` 헬퍼 함수 추가
  - 안내 문구 위치 bottom-4로 이동, pointer-events-none 적용
  - `handleMouseLeave()` 함수 추가
  - PDF 인쇄 시 모든 container 대상으로 스타일 적용
- 📝 `src/components/TransportationCardPage.tsx` - `data-blur-key` 추가
- 📝 `src/components/TouristSpotListPage.tsx` - `data-blur-key` 추가
- 📝 `src/components/ItineraryCalendarPage.tsx` - `data-blur-key` 추가

### 기술적 해결 내용
| 문제 | 원인 | 해결 |
|------|------|------|
| `data-blur-key` 없는 요소 블러 불가 | 정적 키만 지원 | 동적 경로 생성 (`auto:div[0]>p[1]`) |
| 안내 문구가 요소 가림 | `top-20` 위치 + 클릭 이벤트 차단 | `bottom-4` + `pointer-events-none` |
| SVG className 에러 | `SVGAnimatedString.split()` 불가 | `classList[0]` 사용 |
| PDF 2페이지+ 블러 안됨 | 첫 번째 container만 참조 | 모든 container 순회 |
| 점선 테두리 잔상 | container 자체에 hover 발생 | container 제외 + mouseout 정리 |

### 요소 설명 표시 기능
블러 모드에서 호버 시 요소 정보 표시:
- `data-blur-key` 있는 요소: 키 값 표시 (예: `coverTitle`)
- 동적 요소: 태그명.클래스: "텍스트..." 형식 (예: `p.text-gray-500: "여행 일정..."`)

### 참조한 문서
- `src/components/BlurOverlay.tsx` - 블러 오버레이 컴포넌트
- `src/types/blur-region.ts` - 블러 영역 타입

---

## 롤백 안내

롤백이 필요한 경우:
1. "History #N으로 롤백해줘" 형식으로 요청
2. 해당 시점의 변경 파일 목록 확인
3. 역순으로 파일 복원 진행

---

*이 파일은 AI 작업 시 자동으로 업데이트됩니다.*
