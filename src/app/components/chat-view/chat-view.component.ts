import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatUser, Message } from '../../services/chat.service';
import { UserDetailsComponent } from '../user-details/user-details.component';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailsComponent],
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {
  @Output() backClick = new EventEmitter<void>();
  messages: Message[] = [];
  selectedUser: ChatUser | null = null;
  newMessage: string = '';
  showUserDetails: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.selectedUser$.subscribe(user => {
      this.selectedUser = user;
      if (user) {
        this.messages = this.chatService.getMessagesForUser(user.id);
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      this.chatService.sendMessage(this.newMessage, this.selectedUser.id);
      this.messages = this.chatService.getMessagesForUser(this.selectedUser.id);
      this.newMessage = '';
    }
  }

  onBackClick() {
    if (this.showUserDetails) {
      this.showUserDetails = false;
    } else {
      this.chatService.selectUser(null);
      this.backClick.emit();
    }
  }

  onUserDetailsClick() {
    this.showUserDetails = true;
  }

  onUserDetailsBack() {
    this.showUserDetails = false;
  }
} 