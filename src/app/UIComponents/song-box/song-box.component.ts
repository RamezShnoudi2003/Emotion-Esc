import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-song-box',
  standalone: true,
  imports: [],
  templateUrl: './song-box.component.html',
  styleUrl: './song-box.component.css',
})
export class SongBoxComponent {
  @Input() title: string = '';
  @Input() artist: string = '';
  @Input() imageSrc: string = '';

  @Output() ButtonEmitter: EventEmitter<any> = new EventEmitter<any>();

  songSelected(event: Event) {
    this.ButtonEmitter.emit(event);
  }
}
