import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Added injectable without parameters, will be added in app.module.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any>{
    const authToken = this.authService.getToken();
    // cloning the request, instead of making changes in original
    // using the original one, creates side effects
    // console.log('Token from Interceptor', authToken);
    const authReq = req.clone({
      headers: req.headers.set('authorization', 'Bearer ' + authToken)  // it will update the header instead of replace.
    });
    return next.handle(authReq);
  }
}
