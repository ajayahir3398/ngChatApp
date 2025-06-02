import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatUser, Message } from '../../services/chat.service';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailsComponent],
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {
  @Output() backClick = new EventEmitter<void>();
  @Input() selectedUser: ChatUser | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  showUserDetails = false;
  currentUserId: string = '';

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
    
    this.chatService.getMessages().subscribe(messages => {
      this.messages = messages;
    });
  }

  ngOnInit() {
    this.chatService.selectedUser$.subscribe(user => {
      this.selectedUser = user;
      if (user) {
        this.chatService.getMessagesForUser(user.id).subscribe(messages => {
          this.messages = messages;
        });
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      this.chatService.sendMessage(this.newMessage, this.selectedUser.id);
      this.chatService.getMessagesForUser(this.selectedUser.id).subscribe(messages => {
        this.messages = messages;
      });
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