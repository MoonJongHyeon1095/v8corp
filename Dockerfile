# docker build -t zin354/v8corp .
# docker push -t zin354/v8corp .
# 첫 번째 단계: 의존성 설치 및 빌드
# Node.js 버전 20을 사용하는 공식 Alpine 이미지
FROM node:20-alpine as builder

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일(package.json 및 package-lock.json) 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 프로젝트 빌드
RUN npm run build

# 두 번째 단계: 실행 이미지 준비
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 의존성 및 빌드 결과물 복사
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# 애플리케이션 실행을 위한 환경변수 설정
ENV NODE_ENV production
ENV PORT 3000

# 애플리케이션 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["node", "dist/main"]
