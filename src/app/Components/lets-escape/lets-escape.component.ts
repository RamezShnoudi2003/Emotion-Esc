import { Component } from '@angular/core';
import { WebcamComponent } from '../webcam/webcam.component';
import { Router } from '@angular/router';
import { PersistDataService } from '../../Services/persist-data.service';

@Component({
  selector: 'app-lets-escape',
  standalone: true,
  imports: [WebcamComponent],
  templateUrl: './lets-escape.component.html',
  styleUrl: './lets-escape.component.css',
})
export class LetsEscapeComponent {
  constructor(
    private readonly router: Router,
    private readonly persistDataService: PersistDataService
  ) {}

  handleFaceOutputEmotion(event: any) {
    let lastTabUserWasOn = localStorage.getItem('tab') || '';
    console.log('lastTabUserWasOn', lastTabUserWasOn);
    console.log('lets escape emotion ', event);

    // this.persistDataService.setItem('emotion', event);

    this.persistDataService.updateEmotion(event);

    this.router.navigateByUrl(lastTabUserWasOn);
  }
}
