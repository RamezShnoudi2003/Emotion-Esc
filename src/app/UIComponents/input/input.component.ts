import { NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [TranslateModule, NgIf, ButtonComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => InputComponent),
  //     multi: true,
  //   },
  // ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = '';
  @Input() placeholder: string = '';
  @Input() text: string = '';
  @Input() disabled: boolean = false;

  @Output() enterPressed: EventEmitter<any> = new EventEmitter<any>();

  // value: string = ""

  /**
   *
   */
  constructor(@Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(obj: any): void {
    this.text = obj || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onKeyDown(event: KeyboardEvent) {
    if (this.type === 'tel') {
      const isNumber = event.key >= '0' && event.key <= '9';
      const isBackspace = event.key === 'Backspace';

      // Allow only number characters and backspace
      if (!isNumber && !isBackspace) {
        event.preventDefault();
      }
    }

    if (event.key === 'Enter') {
      this.enterPressed.emit();
    }
  }

  onInputChange(event: any) {
    this.text = event.target.value;
    this.onChange(this.text);
  }
}
