// Angular
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Third-party libraries
import { MessageModule } from 'primeng/message';

// Project alias imports
import { Warning } from '@shared/components/warning/warning';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageModule, Warning],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'recipes-app';
}
