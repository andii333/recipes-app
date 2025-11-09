import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthResponse } from '../models/interfaces/auth-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(username: string, password: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>('https://dummyjson.com/auth/login', {
      username,
      password,
    });
  }

  getSession() {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : null;
  }
  setSession(session: IAuthResponse) {
    return localStorage.setItem('session', JSON.stringify(session));
  }
}
