import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private userId: string;
  private email: string;

  // added Router for redirection after login and logout
  constructor(private http: HttpClient, private router: Router){}

  createUser(email: string, password: string): void{
    const authData: AuthData = { email, password };
    this.http.post('http://localhost:3000/api/user/signup', authData)
    .subscribe( response => {
      this.router.navigate(['/login']);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  login(email: string, password: string): void{
    const authData: AuthData = { email, password };
    this.http.post<{token: string, expiresIn: number, userId: string, email: string}>('http://localhost:3000/api/user/login', authData)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token){
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.email = response.email;
        this.authStatusListener.next(true);
        // saving auth data locally
        const now = new Date();
        const expirationDate = new Date (now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, this.userId, this.email);
        // navigating to home page after successful login
        this.router.navigate(['/']);
        // console.log('LoggedIn', token);
      }
    });
  }

  private setAuthTimer(duration: number): void{
    console.log('Auth Timer Duration:', duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);    // converted time to miliseconds
  }

  // automatically authenticating user
  autoAuthUser(): void{
    const authInformation = this.getAuthData();
    if (!authInformation){
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0){
      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.email = authInformation.email;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  getToken(): string{
    return this.token;
  }

  getIsAuth(): boolean{
    return this.isAuthenticated;
  }

  getAuthStatusListener(): Observable<boolean>{
    return this.authStatusListener.asObservable();
  }

  getUserId(): string{
    return this.userId;
  }

  getEmail(): string{
    return this.email;
  }

  logout(): void{
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    // clearing the token timer here
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.email = null;
    this.router.navigate(['/login']);
  }

  // storing the token/session locally
  private saveAuthData(token: string, expirationDate: Date, userId: string, email: string): void{
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
  }

  private clearAuthData(): void{
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }

  private getAuthData(): {token: string, expirationDate: Date, userId: string, email: string}{
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    if (!token || !expirationDate){
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId,
      email
    };
  }
}
