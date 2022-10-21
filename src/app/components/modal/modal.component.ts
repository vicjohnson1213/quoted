import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'q-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Output() close = new EventEmitter();

  dismiss() {
    this.close.emit();
  }
}
