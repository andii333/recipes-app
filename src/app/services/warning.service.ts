// Angular
import { Injectable, signal } from '@angular/core';

// Third-party libraries
import { Observable, throwError } from 'rxjs';

// Project alias imports
import { IError } from '@models/interfaces/error.interface';

@Injectable({ providedIn: 'root' })
export class WarningService {
  // Signals
  warningSuccessText = signal('');
  warningErrorText = signal('');

  // Private timers
  private warningSuccessTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private warningErrorTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Default messages
  private readonly DEFAULT_SUCCESS = 'Operation completed successfully!';
  private readonly DEFAULT_ERROR = 'An error occurred.';

  private showWarning(
    type: 'success' | 'error',
    text: string,
    timeout = 5000
  ): void {
    const isSuccess = type === 'success';

    const currentSignal = isSuccess
      ? this.warningSuccessText
      : this.warningErrorText;
    const oppositeSignal = isSuccess
      ? this.warningErrorText
      : this.warningSuccessText;
    const currentTimeoutId = isSuccess
      ? this.warningSuccessTimeoutId
      : this.warningErrorTimeoutId;
    const oppositeTimeoutId = isSuccess
      ? this.warningErrorTimeoutId
      : this.warningSuccessTimeoutId;

    const message =
      text || (isSuccess ? this.DEFAULT_SUCCESS : this.DEFAULT_ERROR);

    oppositeSignal.set('');
    if (oppositeTimeoutId) {
      clearTimeout(oppositeTimeoutId);
      if (isSuccess) {
        this.warningErrorTimeoutId = null;
      } else {
        this.warningSuccessTimeoutId = null;
      }
    }

    currentSignal.set(message);
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      currentSignal.set('');
      if (isSuccess) {
        this.warningSuccessTimeoutId = null;
      } else {
        this.warningErrorTimeoutId = null;
      }
    }, timeout);

    if (isSuccess) {
      this.warningSuccessTimeoutId = timeoutId;
    } else {
      this.warningErrorTimeoutId = timeoutId;
    }
  }

  showSuccessWarning(text?: string, timeout?: number): void {
    this.showWarning('success', text || this.DEFAULT_SUCCESS, timeout);
  }

  showErrorWarning(text?: string, timeout?: number): void {
    this.showWarning('error', text || this.DEFAULT_ERROR, timeout);
  }

  handleError(error: IError): Observable<never> {
    const message = error?.error?.message;
    this.showErrorWarning(message);
    return throwError(() => new Error(message || this.DEFAULT_ERROR));
  }
}
