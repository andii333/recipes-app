import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('https://dummyjson.com/auth/login', {
      username,
      password,
    });
  }

  getToken() {
    return localStorage.getItem('token');
  }
  setToken(token: string) {
    return localStorage.setItem('token', token);
  }
}
