// Angular
import { bootstrapApplication } from '@angular/platform-browser';

// Local imports
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
