import { Component, inject } from '@angular/core';
import { WarningService } from '../../../services/warning.service';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.html',
  styleUrl: './warning.scss',
})
export class Warning {
  warningService = inject(WarningService);
  warningSuccessText = this.warningService.warningSuccessText;
  warningErrorText = this.warningService.warningErrorText;
}
