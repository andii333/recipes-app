// Angular
import { Injectable, signal } from '@angular/core';

// Third-party libraries
import { Observable, throwError } from 'rxjs';

// Project alias imports
import { IError } from '@models/interfaces/error.interface';

@Injectable({ providedIn: 'root' })
export class WarningService {
  warningSuccessText = signal('');
  warningErrorText = signal('');
  private warningSuccessTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private warningErrorTimeoutId: ReturnType<typeof setTimeout> | null = null;

  showSuccessWarning(text: string, timeout = 5000): void {
    this.warningErrorText.set('');
    if (this.warningErrorTimeoutId) {
      clearTimeout(this.warningErrorTimeoutId);
      this.warningErrorTimeoutId = null;
    }

    this.warningSuccessText.set(text);
    if (this.warningSuccessTimeoutId) {
      clearTimeout(this.warningSuccessTimeoutId);
    }
    this.warningSuccessTimeoutId = setTimeout(() => {
      this.warningSuccessText.set('');
      this.warningSuccessTimeoutId = null;
    }, timeout);
  }

  showErrorWarning(text: string, timeout = 5000): void {
    this.warningSuccessText.set('');
    if (this.warningSuccessTimeoutId) {
      clearTimeout(this.warningSuccessTimeoutId);
      this.warningSuccessTimeoutId = null;
    }

    this.warningErrorText.set(text);
    if (this.warningErrorTimeoutId) {
      clearTimeout(this.warningErrorTimeoutId);
    }
    this.warningErrorTimeoutId = setTimeout(() => {
      this.warningErrorText.set('');
      this.warningErrorTimeoutId = null;
    }, timeout);
  }

  handleError(error: IError): Observable<never> {
    const message = error?.error?.message;
    this.showErrorWarning(message);
    return throwError(() => new Error(error?.error?.message));
  }
}
