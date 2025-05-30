import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatListComponent } from '../../components/chat-list/chat-list.component';
import { ChatViewComponent } from '../../components/chat-view/chat-view.component';
import { ChatService } from '../../services/chat.service';
import { ChatUser } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ChatListComponent, 
    ChatViewComponent,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    OverlayPanelModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showChatView = false;
  searchQuery = '';
  showSuggestions = false;
  searchSuggestions: ChatUser[] = [];
  currentUser$;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    
    // Subscribe to user selection to show chat view on mobile
    this.chatService.selectedUser$.subscribe(user => {
      if (user) {
        this.showChatView = true;
        this.showSuggestions = false;
        this.searchQuery = '';
      }
    });
  }

  onBackClick() {
    this.showChatView = false;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      const users = this.chatService.getUsers();
      this.searchSuggestions = users.filter(user => 
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
      this.searchSuggestions = [];
    }
  }

  onSuggestionClick(user: ChatUser) {
    this.chatService.selectUser(user);
    this.showSuggestions = false;
  }

  onSearchBlur() {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 