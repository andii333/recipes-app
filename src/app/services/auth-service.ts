// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

// Third-party libraries
import { catchError, Observable } from 'rxjs';

// Project alias imports
import { IAuthResponse } from '@models/interfaces/auth-response.interface';
import { environment } from '@env/environment';
import { WarningService } from './warning.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private session = signal<IAuthResponse | null>(this.getSession());

  private readonly warningService = inject(WarningService);

  login(username: string, password: string): Observable<IAuthResponse> {
    const loginUrl = environment.API_URL + '/auth/login';
    return this.http
      .post<IAuthResponse>(loginUrl, { username, password })
      .pipe(catchError((err) => this.warningService.handleError(err)));
  }

  logout(): void {
    localStorage.removeItem('session');
    this.session.set(null);
  }

  getSession(): IAuthResponse | null {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : null;
  }

  setSession(session: IAuthResponse): void {
    localStorage.setItem('session', JSON.stringify(session));
    this.session.set(session);
  }

  isLoggedIn(): IAuthResponse | null {
    return this.session();
  }
}
