# 코드 최적화 및 배포 계획

> 📋 디자인과 기능을 100% 유지하면서 코드 구조를 개선하는 계획

---

## 🚀 배포 스택 추천

### 사용자 제안: Vercel + Supabase

| 구성 | 장점 | 단점 |
|------|------|------|
| **Vercel** | Vite 완벽 지원, 무료, 자동 CI/CD | 한국 리전 없음 (도쿄) |
| **Supabase** | PostgreSQL, 인증 내장, 실시간 | 현재 필요 없음 (오버엔지니어링) |

### 추천 스택 비교

| 순위 | 스택 | 적합도 | 비용 | 복잡도 | 추천 이유 |
|------|------|--------|------|--------|-----------|
| **1위** | Vercel 단독 | ⭐⭐⭐⭐⭐ | 무료 | 매우 낮음 | 현재 코드 그대로 배포 가능 |
| 2위 | Cloudflare Pages | ⭐⭐⭐⭐ | 무료 | 낮음 | 한국에서 더 빠름 (서울 엣지) |
| 3위 | Vercel + Supabase | ⭐⭐⭐ | 무료 | 중간 | 멀티유저 필요시 |

### 최종 추천

```
📌 즉시 배포: Vercel 단독
   - 현재 localStorage 기반 유지
   - 추가 설정 없이 바로 배포
   - 환경변수로 비밀번호 관리

📌 향후 확장: Supabase 추가
   - 멀티유저/협업 기능 필요시
   - 데이터 영구 저장 필요시
   - 인증 시스템 강화시
```

---

## 🔧 코드 최적화 계획

### 현재 문제점 분석

| 파일 | 문제 | 심각도 |
|------|------|--------|
| `App.tsx` | 1250줄, renderPage() 700줄+ | 🔴 높음 |
| `tour-data.ts` | 1200줄+, 중복 타입 정의 | 🟡 중간 |
| 전체 | useMemo/useCallback 미사용 | 🟡 중간 |
| 전체 | 이미지 lazy loading 없음 | 🟢 낮음 |

### 최적화 원칙 (필수 준수)

```
❌ 절대 변경 금지:
   - CSS 클래스명
   - 텍스트/문구/라벨
   - 컴포넌트 렌더링 결과
   - 기존 기능 동작

✅ 변경 가능:
   - 파일 구조/분리
   - 코드 중복 제거
   - 성능 최적화
   - 타입 정리
```

---

## 📁 Phase 1: 커스텀 훅 추출 (위험도: 낮음)

### 생성할 파일 구조

```
src/
├── hooks/
│   ├── useTourData.ts        # 투어 데이터 상태 관리
│   ├── usePageConfigs.ts     # 페이지 설정 관리
│   ├── useBlurData.ts        # 블러 영역 관리
│   ├── useAuth.ts            # 인증 상태 관리
│   └── useFileOperations.ts  # 파일 저장/불러오기
│
├── utils/
│   ├── storage.ts            # localStorage 래퍼
│   ├── export.ts             # JSON 내보내기
│   └── page-helpers.ts       # 페이지 관련 유틸
```

### useTourData.ts 예시

```typescript
// src/hooks/useTourData.ts
import { useState, useEffect } from 'react';
import { TourData, defaultTourData } from '../types/tour-data';

export function useTourData() {
  const [tourData, setTourData] = useState<TourData>(() => {
    try {
      const saved = localStorage.getItem('tourData');
      return saved ? JSON.parse(saved) : defaultTourData;
    } catch {
      return defaultTourData;
    }
  });

  // 자동 저장
  useEffect(() => {
    localStorage.setItem('tourData', JSON.stringify(tourData));
  }, [tourData]);

  const updateTourData = (updates: Partial<TourData>) => {
    setTourData(prev => ({ ...prev, ...updates }));
  };

  return { tourData, setTourData, updateTourData };
}
```

---

## 📁 Phase 2: 유틸리티 분리 (위험도: 낮음)

### storage.ts

```typescript
// src/utils/storage.ts
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  }
};
```

### export.ts

```typescript
// src/utils/export.ts
export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function uploadJson<T>(): Promise<T> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject('No file selected');

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          resolve(JSON.parse(event.target?.result as string));
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
```

---

## 📁 Phase 3: 성능 최적화 (위험도: 낮음)

### React.memo 적용

```typescript
// 각 페이지 컴포넌트에 적용
export const CoverPage = React.memo(function CoverPage(props: Props) {
  // 기존 코드 유지
});
```

### useMemo/useCallback 적용

```typescript
// App.tsx에서
const pageConfigs = useMemo(() => [...], [dependencies]);

const handlePageChange = useCallback((index: number) => {
  setCurrentPage(index);
}, []);

const duplicatePage = useCallback((index: number) => {
  // 기존 로직
}, [pageConfigs, tourData]);
```

### 이미지 Lazy Loading

```typescript
// ImageWithFallback.tsx 개선
<img
  loading="lazy"
  decoding="async"
  // 기존 속성 유지
/>
```

---

## 📁 Phase 4: 컴포넌트 분리 (위험도: 중간)

### PageRenderer 컴포넌트 분리

```typescript
// src/components/PageRenderer.tsx
import { PageConfig } from '../types/page-config';
import { TourData } from '../types/tour-data';

interface Props {
  config: PageConfig;
  tourData: TourData;
  isEditMode: boolean;
  // 공통 props
}

export function PageRenderer({ config, tourData, isEditMode, ...commonProps }: Props) {
  switch (config.type) {
    case 'cover':
      return <CoverPage {...commonProps} data={tourData} />;
    // ... 기존 switch 로직
  }
}
```

### 공통 Props 표준화

```typescript
// src/types/page-config.ts
export interface CommonPageProps {
  isEditMode: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  pageId: string;
  isBlurMode: boolean;
  blurRegions: BlurRegion[];
  onToggleBlurMode: () => void;
  onAddBlurRegion: (region: Omit<BlurRegion, 'id' | 'pageId'>) => void;
  onRemoveBlurRegion: (regionId: string) => void;
}
```

---

## 📁 Phase 5: 타입 분리 (위험도: 중간)

### 타입 파일 구조

```
src/types/
├── index.ts              # 모든 타입 re-export
├── tour-data.ts          # 메인 TourData 타입
├── flight.ts             # 항공편 관련 타입
├── accommodation.ts      # 숙소 관련 타입
├── schedule.ts           # 일정 관련 타입
├── transportation.ts     # 교통편 관련 타입
├── quotation.ts          # 견적 관련 타입
├── payment.ts            # 결제 관련 타입
├── text-style.ts         # 스타일 타입 (기존)
├── blur-region.ts        # 블러 타입 (기존)
└── page-config.ts        # 페이지 설정 타입
```

---

## ⚡ 실행 순서

### 1단계: 안전한 추출 (즉시 실행 가능)

```
[ ] hooks/useTourData.ts 생성
[ ] hooks/usePageConfigs.ts 생성
[ ] hooks/useBlurData.ts 생성
[ ] hooks/useAuth.ts 생성
[ ] utils/storage.ts 생성
[ ] utils/export.ts 생성
[ ] App.tsx에서 훅 사용으로 교체
```

### 2단계: 성능 최적화 (테스트 후 실행)

```
[ ] React.memo 적용
[ ] useMemo/useCallback 적용
[ ] 이미지 lazy loading 추가
```

### 3단계: 컴포넌트 분리 (신중하게 실행)

```
[ ] PageRenderer 컴포넌트 생성
[ ] 공통 Props 표준화
[ ] App.tsx 간소화
```

### 4단계: 타입 정리 (마지막에 실행)

```
[ ] 타입 파일 분리
[ ] tour-data.ts 간소화
[ ] 인덱스 파일로 re-export
```

---

## 🔐 Vercel 배포 설정

### 1. vercel.json 생성

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. 환경변수 설정 (선택)

```
VITE_APP_PASSWORD=thekadang  # 비밀번호 환경변수화
```

### 3. 배포 명령

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 📊 예상 결과

| 항목 | 현재 | 최적화 후 |
|------|------|----------|
| App.tsx 줄 수 | 1250줄 | ~300줄 |
| tour-data.ts 줄 수 | 1200줄 | ~200줄 (분리) |
| 커스텀 훅 수 | 0개 | 5개 |
| 유틸리티 파일 | 1개 | 4개 |
| 초기 로딩 | 기본 | lazy loading으로 개선 |

---

## ⚠️ 주의사항

1. **각 단계마다 테스트 필수**
   - npm run dev로 기능 확인
   - 모든 페이지 렌더링 확인
   - 편집 모드 동작 확인

2. **Git 커밋 전략**
   - 각 Phase마다 별도 커밋
   - 문제 발생시 롤백 가능하도록

3. **디자인 변경 금지**
   - CSS 클래스 수정 X
   - Tailwind 클래스 수정 X
   - 컴포넌트 구조만 개선

---

*작성일: 2025-12-08*
