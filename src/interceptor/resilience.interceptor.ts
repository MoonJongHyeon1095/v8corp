import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  import * as circuitBreaker from 'opossum';
  
  @Injectable()
  export class CircuitBreakerInterceptor implements NestInterceptor {
    private breaker: any;
  
    constructor() {
      this.breaker = new circuitBreaker(this.handleRequest.bind(this), {
        timeout: 3000, // 요청이 3초 이상 걸리면 타임아웃
        errorThresholdPercentage: 50, // 오류 비율이 50%를 초과하면 서킷 브레이크
        resetTimeout: 5000, // 5초 후에 서킷 브레이커를 리셋
      });
    }
  
    // 외부 API 호출 로직을 처리하는 메서드
    async handleRequest(data: any) {
      // 여기에 보호하려는 외부 API 호출 로직을 구현합니다.
    }
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return new Observable((subscriber) => {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
  
        this.breaker
          .fire(request.body)
          .then((response) => {
            subscriber.next(response);
            subscriber.complete();
          })
          .catch((error) => {
            subscriber.error(error);
          });
      }).pipe(
        catchError((error) => {
          console.error('Circuit breaker intercepted an error:', error);
          throw error;
        }),
      );
    }
  }
  