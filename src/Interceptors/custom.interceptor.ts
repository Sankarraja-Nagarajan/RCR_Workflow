import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CustomInterceptor implements HttpInterceptor {

  constructor() {}

  errorHandler(error: HttpErrorResponse): Observable<any> {
    return throwError(error);
   }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const newRequest = request.clone({
      url : environment.baseAddress + request.url
    })
    return next.handle(newRequest).pipe(catchError(this.errorHandler));
  }
}
