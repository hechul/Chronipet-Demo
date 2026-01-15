# Chronipet 프로젝트 계획서

## 📌 프로젝트 개요

### 서비스 개념
**Chronipet (크로니펫)**: 반려동물 식품 리뷰 커뮤니티 플랫폼
- 반려견 주인들이 펫푸드 리뷰/스토리를 작성하고 공유
- 제품별 평점 데이터 누적으로 업계 제품 투명성 확보
- 향후 다른 수직(Vertical) 커뮤니티로 확장 가능한 아키텍처

### 핵심 기능
1. 회원가입/로그인 (Supabase Auth)
2. 반려견 프로필 등록/관리
3. 펫푸드 리뷰 작성 (텍스트 + 이미지)
4. 댓글/대댓글 기능
5. 좋아요 기능
6. 제품별 평점 자동 계산

### 기술 스택
- **Frontend**: Nuxt.js 3 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **Package Manager**: npm

---

## 🗂️ 데이터베이스 스키마

### 테이블 구조 (9개)

#### 1. **users** - 사용자
- Supabase Auth와 연동 (UUID)
- Soft Delete 적용
- Unique 제약: 조건부 인덱스로 탈퇴/재가입 지원

#### 2. **dogs** - 반려견
- user_id 참조
- 견종, 체중, 생일 정보

#### 3. **products** - 펫푸드 제품
- JSONB로 유연한 제품 스펙 저장
- GIN 인덱스로 고속 검색
- 자동 평점 계산

#### 4. **reviews** - 리뷰/스토리
- user_id, dog_id 참조
- view_count, like_count 자동 동기화
- Soft Delete 적용

#### 5. **reviews_products** - 리뷰-제품 연결
- 1개 리뷰에 여러 제품 포함 가능
- 제품별 별도 평점 관리
- 중복 방지: UNIQUE 복합 인덱스

#### 6. **reviewimages** - 리뷰 이미지
- display_order로 순서 관리
- is_representative로 대표사진 선택
- 대표사진 교체 함수 제공

#### 7. **comments** - 댓글
- review_id, user_id 참조
- Soft Delete 적용

#### 8. **replies** - 대댓글
- comment_id, user_id 참조
- Soft Delete 적용

#### 9. **users_reviews_likes** - 좋아요
- 중복 방지: UNIQUE 복합 인덱스
- like_count 자동 동기화

### 트리거 및 함수
- `update_timestamp()`: updated_at 자동 업데이트
- `record_deleted_at()`: Soft Delete 시 deleted_at 자동 기록
- `handle_new_user()`: Auth 가입 시 users 테이블 자동 생성
- `update_product_rating()`: 제품 평점 자동 계산
- `sync_review_like_count()`: 좋아요 수 자동 동기화
- `change_representative_image()`: 대표사진 교체 (Transaction 보장)

### RLS (Row Level Security) 정책
- 공개 조회 (is_deleted = false 필터)
- 사용자 인증 필요 (CRUD 작업)
- 작성자만 수정/삭제 가능

---

## 🎯 단계별 개발 계획

### Phase 1: 프로젝트 초기 구성
**목표**: 개발 환경 완성
- [ ] **Step 1**: Nuxt.js + TypeScript 프로젝트 생성
- [ ] **Step 2**: Supabase 프로젝트 생성 및 클라이언트 라이브러리 설치
- [ ] **Step 3**: 데이터베이스 스키마 SQL 실행
- [ ] **Step 4**: 환경 변수 설정 (.env.local)
- [ ] **Step 5**: Git 저장소 초기화

### Phase 2: 백엔드 기본 로직
**목표**: Supabase 통합 및 CRUD API 준비
- [ ] Supabase Auth 통합 (회원가입/로그인/로그아웃)
- [ ] users 테이블 자동 생성 트리거 검증
- [ ] 기본 CRUD 유틸 함수 작성
  - 사용자 프로필 (조회/수정/삭제)
  - 반려견 (조회/등록/수정/삭제)
  - 제품 (조회/검색/필터링)
  - 리뷰 (조회/생성/수정/삭제)

### Phase 3: 이미지 & 리뷰 작성
**목표**: 리뷰 생성 플로우 완성
- [ ] Supabase Storage 통합
- [ ] 이미지 업로드 로직
- [ ] 리뷰 작성 플로우
  - 리뷰 생성 → 이미지 업로드 → 대표사진 선택
- [ ] change_representative_image() 함수 테스트

### Phase 4: 댓글 & 좋아요
**목표**: 상호작용 기능 완성
- [ ] 댓글 CRUD (comments, replies)
- [ ] 좋아요 토글
- [ ] 자동 트리거 검증
  - 좋아요 수 자동 동기화
  - 상품 평점 자동 계산

### Phase 5: 프론트엔드 UI/UX
**목표**: 사용자 인터페이스 구현
- [ ] 레이아웃 & 네비게이션
- [ ] 인증 페이지 (회원가입/로그인)
- [ ] 홈 페이지 (리뷰 목록, 검색)
- [ ] 리뷰 상세 페이지
- [ ] 리뷰 작성 페이지 (마법사 형식)
- [ ] 사용자 프로필 페이지
- [ ] 반려견 관리 페이지

### Phase 6: 최적화 & 배포
**목표**: 프로덕션 준비
- [ ] 페이지네이션 구현
- [ ] 쿼리 최적화
- [ ] 이미지 최적화
- [ ] Vercel 배포 설정
- [ ] 환경 분리 (dev/prod)

---

## ⚠️ 주의사항 & 설계 결정

### 1. Unique 제약 문제 (해결됨)
**문제**: 탈퇴 후 재가입 시 unique 제약으로 인한 충돌
**해결책**: 조건부 UNIQUE 인덱스 사용
```sql
CREATE UNIQUE INDEX idx_users_email_active ON users(email) WHERE is_deleted = false;
CREATE UNIQUE INDEX idx_users_username_active ON users(username) WHERE is_deleted = false;
```
- 삭제된 사용자는 인덱스 대상 제외
- 살아있는 사용자만 중복 검사

### 2. representative_image 최적화
**현상**: reviews 테이블에 representative_image_id 필요 없음
**개선**: reviewimages.is_representative로 충분
- is_representative = TRUE인 사진이 대표사진
- change_representative_image() 함수로 안전하게 교체

### 3. 트리거 성능 (초기 서비스 적합)
**현황**: Soft Delete, 자동 timestamp, 평점 계산을 트리거로 구현
**장점**: 
- 데이터 일관성 보장
- 백엔드 로직 단순화
- 버그 감소

**한계**: 초당 좋아요 1000+ 수준의 대규모 트래픽
- 현재 설계: 각 좋아요마다 UPDATE 실행
- 대규모 서비스: Redis 캐싱 + 배치 업데이트로 전환 필요

### 4. Product 관리 전략
**초기**: 관리자가 수동으로 추가
**향후**: 
- 웹 스크래핑 자동화
- 외부 API 연동
- 사용자 제출 → 관리자 검수

### 5. Supabase 유료 전환 검토
필요한 기능:
- 이미지 저장 용량 증설
- 개발/프로덕션 배포 분리
- 팀 협업 기능

---

## 📊 개발 진행 상황 추적

### 예상 일정
- **Week 1** (지금): Phase 1 완료
- **Week 2**: Phase 2 완료
- **Week 3**: Phase 3-4 완료
- **Week 4**: Phase 5 진행
- **Week 5**: Phase 6 완료 및 배포

### 우선순위
1. **높음**: Phase 1-2 (기초 구성)
2. **높음**: Phase 3-4 (핵심 기능)
3. **중간**: Phase 5 (UI/UX)
4. **낮음**: Phase 6 (성능 최적화)

---

## 🚀 현재 진행 상황

### Phase 1: 프로젝트 초기 구성 ✅ **완료**
- [x] Step 1: Nuxt.js + TypeScript 프로젝트 생성 ✅
- [x] Step 2: Supabase 클라이언트 라이브러리 설치 ✅
- [x] Step 3: Supabase 프로젝트 생성 및 환경 변수 설정 ✅
- [x] Step 4: 데이터베이스 스키마 SQL 실행 ✅
- [x] Step 5: Git 저장소 초기화 & GitHub 연결 ✅

### Phase 2: 백엔드 기본 로직 - 진행 중
- [ ] **Step 1: Supabase 클라이언트 초기화** ← 다음 단계

---

## 📝 참고 문서
- `dataB.md`: 상세 DB 스키마 및 설명
- `.env.example`: 환경 변수 템플릿 (Step 4에서 작성)
