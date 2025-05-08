import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [TranslateModule, NgIf],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() type: string = '';
  @Input() color: string = '';
  @Input() text: string = '';
  @Input() disabled: boolean = false;
  @Input() isBusy: boolean = false;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  onClick(event: Event) {
    this.buttonClick.emit();
  }
}
