## 브이에이트코프 과제

- [API 명세서](https://foggy-unicorn-28d.notion.site/API-9c3a6024fcb14927ab8e21ec64ab2e5a?pvs=4)

## 🛠 기능구현 특이사항

### 게시글 (Board) 관련

1. **검색**  
   a. v1/api/board/search?query=검색어&criteria=검색기준  
   b. 쿼리 스트링으로 검색어 및 검색기준 전달  
   c. 검색기준 3종류 : all, title, author (default all)

2. **QnA 리스트 및 공지 리스트 조회**  
   a. /v1/api/board/qna?sortBy=정렬기준  
   b. 정렬기준 5종류 : createdAt, totalView, weeklyView, monthlyView, annualView  
   c. 공지와 QnA 리스트 한꺼번에 응답

3. **QnA, 공지, 1:1문의 생성 관련**  
   a. multipart/form-data 로 요청  
   b. 게시글 본문은 key 값 'body'로 JSON 데이터 전달  
   c. 이미지는 key 값 'file'로 전달

4. **S3 버킷 이미지 생성, 수정, 삭제 구현 확인**

### 댓글 (Comment) 관련

1. **대댓글 관련**  
   a. 대댓글을 댓글(Comment)의 1:N 테이블로 만들지 않음  
   b. commentTag라는 UUID활용  
   c. 같은 commentTag별로 그룹화 및 id 오름차순 정렬  
   d. c의 응답 중 첫번째 데이터는 댓글, 이후 데이터는 대댓글

2. **게시글 삭제시 관련 댓글 Soft Delete**

### 조회수 (View) 관련

1. **CronJob 을 통해 기간별 일괄 통계처리 및 업데이트**  
   a. 매일 0시 주간 조회수 통계처리 및 Board 테이블 업데이트  
   b. 매일 1시 월간 조회수 통계처리 및 Board 테이블 업데이트  
   c. 매주 일요일 2시 연간 조회수 통계처리 및 Board 테이블 업데이트
