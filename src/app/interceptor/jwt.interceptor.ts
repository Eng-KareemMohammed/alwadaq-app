import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Used for queued API calls while refreshing tokens
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  isRefreshingToken = false;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController
  ) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.addToken(req, next).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          switch (err.status) {
            case 401: // need to refresh Token
              if (req.url.indexOf('login') > 0) return throwError(err);
              return this.handle401Error(req, next);

            case 406: // refresh Token Failed
              return this.handle406Error();

            default:
              // any other Error
              return throwError(err);
          }
        } else {
          return throwError(err);
        }
      })
    );
  }

  addToken(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let request = req.clone({
      setHeaders: {
        Authorization: 'bearer ' + this.authService.getAccessToken(),
      },
    });
    return next.handle(request);
  }

  handle406Error() {
    this.authService.removeCredentials();
    this.navCtrl.navigateForward('/login');
    return EMPTY;
  }

  handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.authService.getRefreshToken().pipe(
      switchMap((token) => {
        return this.addToken(req, next);
      })
    );
  }
}
