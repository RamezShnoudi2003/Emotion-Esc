import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-movie-box',
  standalone: true,
  imports: [],
  templateUrl: './movie-box.component.html',
  styleUrl: './movie-box.component.css'
})
export class MovieBoxComponent {
  @Input() title: string = ""
  @Input() publishDate: string = ""
  @Input() imageSrc: string = ""


  @Output() ButtonEmitter:
    EventEmitter<any> = new EventEmitter<any>();


  movieSelected(event: Event) {
    this.ButtonEmitter.emit(event);
  }

  trailerSelected(event: Event) {
    this.ButtonEmitter.emit(event);
  }



}
