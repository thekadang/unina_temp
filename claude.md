# AI 코드 개발 지침 (Smart Hub)

> 🧠 **이 파일은 지능형 허브입니다. 사용자 명령을 분석하고 자동으로 적절한 문서를 참조합니다.**

---

## 📌 핵심 원칙 (항상 준수)

1. **One Source of Truth** - 중복 금지, 모든 정보는 단일 출처
2. **Single Responsibility** - 함수/클래스는 하나의 책임만
3. **No Hard-coding** - 설정은 별도 파일로 관리
4. **Error Handling** - 모든 에러는 명확한 메시지와 함께 처리
5. **기존 패턴 유지** - 프로젝트의 코딩 스타일 분석 후 동일하게 작성
6. **한글화** - 모든 산출물(md 파일, 코드 주석 등)은 한글화를 기본 원칙으로 합니다. (단, 코드의 함수명, 변수명 등은 영어로 작성합니다.)

---

## 🧠 상황별 자동 판단 로직

### 🔍 사용자 의도 파악 → 문서 자동 선택

#### 📋 작업 계속/시작 요청
**트리거**: "다음 작업", "이어서", "계속", "뭐 해야해", "어디까지 했어"
```
1. docs/task.md 자동 확인
2. 현재 Phase와 다음 체크되지 않은 항목 파악
3. 필요한 추가 문서 확인:
   - 파일 위치 필요 → docs/structure.md
   - 코딩 스타일 필요 → docs/conventions.md
4. 작업 진행
5. 완료 후 docs/task.md 자동 업데이트
```

#### 🐛 에러/버그 보고
**트리거**: "에러", "오류", "안돼", "실패", "버그", 에러 스택트레이스, 에러 캡처 이미지
```
1. docs/troubleshooting.md 자동 검색
   - 유사한 에러 있는지 확인
2. 없으면 docs/decisions.md 확인
   - 사용 중인 기술 스택 관련 정보
3. 해결 진행
4. 해결 후 docs/troubleshooting.md에 자동 추가
   - 에러 메시지
   - 해결 방법
   - 예방 팁
```

#### 🆕 새 기능/코드 추가
**트리거**: "추가해줘", "만들어줘", "구현해줘", "기능 개발"
```
1. docs/task.md 확인 - 계획된 작업인지 확인
2. docs/structure.md 확인 - 어디에 만들 것인지 파악
3. docs/conventions.md 참조 - 명명 규칙 및 스타일
4. docs/decisions.md 검토 - 사용할 기술/패턴 확인
5. 개발 진행
6. 완료 후 자동 업데이트:
   - docs/structure.md (새 파일 추가 시)
   - docs/task.md (체크박스)
   - docs/api.md (API 변경 시)
```

#### 🔧 코드 수정/리팩토링
**트리거**: "수정해줘", "고쳐줘", "리팩토링", "개선해줘"
```
1. docs/structure.md 확인 - 파일 위치
2. docs/conventions.md 참조 - 개선 기준
3. 기존 코드 패턴 분석 - 일관성 유지
4. 수정 진행
5. docs/task.md 업데이트 (해당 작업 있다면)
```

#### 🔍 코드/파일 찾기
**트리거**: "어디 있어", "찾아줘", "위치가 어디야"
```
1. docs/structure.md 자동 확인
2. 해당 기능/파일의 위치 알려주기
3. 필요시 파일 내용 확인
```

#### 🤔 기술 선택/변경 논의
**트리거**: "왜 ~를 써", "~로 바꾸면", "~가 더 낫지 않아"
```
1. docs/decisions.md 자동 확인
   - 현재 기술 선택 이유 파악
2. 변경 검토 시 ADR 형식으로 작성
3. docs/architecture.md 확인 - 영향 범위 파악
4. 결정 후 docs/decisions.md 업데이트
```

#### 📖 프로젝트 이해/온보딩
**트리거**: "프로젝트 구조", "어떻게 돌아가", "설명해줘"
```
1. docs/structure.md - 전체 구조
2. docs/architecture.md - 설계 개념
3. docs/decisions.md - 기술 선택 배경
4. docs/task.md - 현재 진행 상황
```

#### ⚙️ 환경 설정 문제
**트리거**: "설치", "설정", "실행이 안돼", "환경"
```
1. docs/troubleshooting.md 확인
   - 개발 환경 설정 섹션
2. 필요시 docs/setup.md 생성/참조
3. 해결 후 docs/troubleshooting.md 업데이트
```

#### 🧪 테스트 관련
**트리거**: "테스트", "검증", "확인"
```
1. docs/conventions.md 확인 - 테스트 규칙
2. docs/structure.md 확인 - 테스트 파일 위치
3. 테스트 작성/실행
```

#### 🔄 롤백 요청
**트리거**: "롤백", "되돌려", "이전으로", "취소", "원래대로"
```
1. docs/history.md 자동 확인
2. 롤백 대상 시점 파악:
   - "History #XX로" → 해당 번호
   - "~하기 전으로" → 키워드 검색
   - "XX시 상태로" → 시간 검색
3. 변경된 파일 목록 확인
4. 역순으로 파일 복원:
   - 생성된 파일 → 삭제
   - 수정된 파일 → 이전 버전 복원
   - 삭제된 파일 → 재생성
5. 롤백 결과를 새 History 항목으로 기록
```

#### 🕐 클리어 후 재시작
**트리거**: Claude Code 클리어 후 첫 메시지
```
1. docs/history.md 자동 확인
   - 마지막 History 항목 확인
2. docs/task.md 확인
   - 현재 진행 단계 파악
3. 컨텍스트 복원 완료 알림
4. 다음 작업 제안
5. 새 History 항목 생성 (컨텍스트 복원 기록)
```

#### 📜 작업 이력 조회
**트리거**: "히스토리", "이력", "로그", "뭐 했어", "작업 내역"
```
1. docs/history.md 자동 확인
2. 최근 5-10개 History 요약
3. 중요 마일스톤(⭐) 표시
4. 필요시 특정 History 상세 설명
```

---

## 🔄 자동 업데이트 규칙

### 작업 완료 후 항상 확인
```
✅ 새 파일 생성됨 → docs/structure.md 업데이트
✅ 작업 단계 완료 → docs/task.md 체크박스
✅ 에러 해결함 → docs/troubleshooting.md 추가
✅ 기술 선택함 → docs/decisions.md ADR 추가
✅ API 변경됨 → docs/api.md 업데이트
✅ 모든 작업마다 → docs/history.md에 새 항목 추가 ⭐
```

### 작업 시작 전 항상 확인
```
📖 명령 모호함 → docs/task.md로 의도 파악
📖 파일 위치 불명 → docs/structure.md 확인
📖 코딩 스타일 불명 → docs/conventions.md 확인
📖 클리어 후 시작 → docs/history.md로 컨텍스트 복원 ⭐
```

### History 자동 기록 규칙
```
매 작업마다 docs/history.md에 다음 정보 기록:
1. History 번호 (자동 증가)
2. 날짜 및 시간
3. 사용자 질문 (원문)
4. AI가 수행한 작업 (체크리스트)
5. 변경된 파일 목록:
   - 📄 새로 생성
   - 📝 업데이트
   - 🗑️ 삭제
   - ⏪ 복원 (롤백 시)
6. 참조한 문서
7. 중요 마일스톤은 ⭐ 표시
```

---

## 💬 작업 흐름 예시

### 사용자: "에러가 났어요" + 에러 캡처
```
[AI 자동 판단]
1. 에러 관련 → docs/troubleshooting.md 검색
2. 기술 스택 확인 필요 → docs/decisions.md 확인
3. 해결 진행
4. docs/troubleshooting.md에 "❌ 문제: [에러메시지]" 형식으로 추가
5. docs/history.md에 새 History 항목 자동 기록
```

### 사용자: "다음 작업 해줘"
```
[AI 자동 판단]
1. 작업 계속 → docs/task.md 확인
2. "Phase 3-2. 기능 B" 체크 안됨 확인
3. docs/structure.md에서 파일 위치 파악
4. docs/conventions.md 참조하여 개발
5. 완료 후 docs/task.md 체크박스 [x]
6. docs/history.md에 새 History 항목 자동 기록
```

### 사용자: "사용자 인증 기능 추가해줘"
```
[AI 자동 판단]
1. 새 기능 → docs/task.md 확인 (계획된 작업인지)
2. docs/structure.md에서 /src/services/ 확인
3. docs/conventions.md로 명명 규칙 확인
4. docs/decisions.md에서 JWT 사용 확인
5. auth_service.py 생성
6. 완료 후:
   - docs/structure.md에 auth_service.py 추가
   - docs/task.md 체크박스 업데이트
   - docs/api.md에 /auth 엔드포인트 추가
   - docs/history.md에 새 History 항목 (주요 기능 → ⭐ 마일스톤)
```

### 사용자: "왜 FastAPI를 쓰는 거예요?"
```
[AI 자동 판단]
1. 기술 질문 → docs/decisions.md 확인
2. "ADR-001: Python 3.11 + FastAPI 선택" 찾음
3. 선택 이유와 장단점 설명
4. docs/history.md에 간단히 기록 (조회만)
```

### 사용자: "결제 기능 추가하기 전으로 롤백해줘" ⭐NEW
```
[AI 자동 판단]
1. 롤백 요청 → docs/history.md 확인
2. "결제" 키워드로 검색 → History #7 발견
3. History #7의 변경 파일 확인:
   - payment_service.py 생성
   - routes.py 수정
   - requirements.txt 수정
4. 역순으로 복원:
   - payment_service.py 삭제
   - routes.py History #6 버전으로 복원
   - requirements.txt History #6 버전으로 복원
5. docs/history.md에 롤백 기록 추가:
   - "History #8 - 롤백: 결제 기능 제거"
   - 롤백된 파일 목록 명시
```

### 사용자: "며칠 만이야, 어디까지 했더라?" ⭐NEW
```
[AI 자동 판단]
1. 클리어 후 재시작 감지 → docs/history.md 우선 확인
2. 마지막 History 항목 확인 (예: History #9)
3. docs/task.md로 현재 단계 확인
4. 컨텍스트 복원 완료 응답:
   "History #9까지 Stripe 결제 기능을 완성했습니다. 
    현재 Phase 3-4: 알림 시스템이 다음 작업입니다."
5. docs/history.md에 "클리어 후 재시작" 기록
```

---

## 🔐 Git 워크플로우 규칙 (필수!)

### ⚠️ 절대 규칙
```
🚫 git push는 사용자가 명시적으로 요청하기 전까지 절대 하지 않는다!
```

### 작업 흐름
```
코드 작업
   ↓
docs/history.md 기록
   ↓
git add .
   ↓
git commit -m "명확한 커밋 메시지"
   ↓
⛔ 여기서 멈춤! (push 금지)
   ↓
사용자: "푸시해" / "push해"
   ↓
✅ git push
```

### 커밋 메시지 규칙
- 한글 또는 영어로 작성
- 변경 내용이 한눈에 파악되도록 명확하게
- 예시:
  - `feat: 초기화 버튼 추가`
  - `fix: 필드 호환성 문제 해결`
  - `refactor: 숙소 컴포넌트 구조 개선`
  - `style: 버튼 색상 변경`

### 푸시 트리거 키워드
다음 키워드가 있을 때만 push 실행:
- "푸시해", "푸시 해", "push해", "push 해"
- "배포해", "올려", "반영해"

---

## 🎯 중요 규칙

1. **사용자는 문서명을 몰라도 됨**
   - "docs/task.md 확인해줘" 라고 명시하지 않아도
   - AI가 자동으로 상황 판단하여 적절한 문서 참조

2. **항상 관련 문서 먼저 확인**
   - 추측하지 말고 문서에서 확인
   - 없으면 작업 후 문서에 추가

3. **작업 후 자동 업데이트**
   - 사용자가 요청하지 않아도
   - 관련 문서를 자동으로 업데이트

4. **맥락 유지**
   - 새 대화 시작 시 docs/task.md로 이전 상황 파악
   - "마지막으로 뭐 했지?" 질문 없이도 연속성 유지

---

## 📚 문서 위치

```
docs/
├── task.md            # 작업 진행 상황 (가장 자주 참조)
├── history.md         # 모든 작업 이력 및 롤백 (클리어 후 필수) ⭐
├── structure.md       # 프로젝트 구조 (파일 위치)
├── conventions.md     # 코딩 규칙 (상세)
├── decisions.md       # 기술 결정 기록
├── troubleshooting.md # 문제 해결
├── architecture.md    # 시스템 설계
├── api.md            # API 명세
└── setup.md          # 환경 설정
```

---

## ⚡ AI 동작 원칙

### 판단 순서
```
1. 사용자 의도 파악 (키워드, 맥락 분석)
   ↓
2. 필요한 문서 자동 선택
   ↓
3. 문서 내용 확인
   ↓
4. 작업 수행
   ↓
5. 관련 문서 자동 업데이트
```

### 애매할 때
```
IF 사용자 의도 불명확:
  → docs/task.md 먼저 확인 (계획된 작업일 수 있음)
  → 그래도 모르겠으면 사용자에게 질문
```

---

**이 claude.md가 모든 작업의 허브입니다. 사용자는 자연스럽게 대화하기만 하면, AI가 알아서 적절한 문서를 찾아 참조하고 업데이트합니다.**
