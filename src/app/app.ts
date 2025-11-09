import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { Warning } from './shared/components/warning/warning';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageModule, Warning],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'recipes-app';
}
