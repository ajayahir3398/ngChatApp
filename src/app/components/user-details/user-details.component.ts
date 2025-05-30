import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatUser } from '../../services/chat.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  @Input() user!: ChatUser;
  @Output() backClick = new EventEmitter<void>();

  onBackClick() {
    this.backClick.emit();
  }
} 