// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

// Third-party libraries
import { Observable } from 'rxjs';

// Project alias imports
import { IAuthResponse } from '@models/interfaces/auth-response.interface';

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

  logout(): void {
    localStorage.removeItem('session');
  }

  getSession(): IAuthResponse | null {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : null;
  }
  setSession(session: IAuthResponse): void {
    localStorage.setItem('session', JSON.stringify(session));
  }
}
