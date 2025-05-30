import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ChatUser } from '../../services/chat.service';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    BadgeModule,
    RippleModule
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  chats: ChatUser[] = [];
  selectedUser: ChatUser | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chats = this.chatService.getUsers();
    this.chatService.selectedUser$.subscribe(user => {
      this.selectedUser = user;
    });
  }

  selectChat(chat: ChatUser) {
    this.chatService.selectUser(chat);
  }
} 