import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  sender: 'me' | 'other';
}

export interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  status: 'online' | 'offline';
  avatar: string;
  time: string;
  unread: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private selectedUserSubject = new BehaviorSubject<ChatUser | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();
  private apiUrl = 'http://localhost:5039/api';
  private users: ChatUser[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {
    this.setupSignalRConnection();
    this.authService.token$.subscribe(() => {
      // Reconnect when token changes
      this.setupSignalRConnection();
    });
  }

  private setupSignalRConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }

    const token = this.authService.getAuthToken();
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5039/chatHub?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    this.startConnection();
    this.addListeners();
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  private addListeners() {
    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.hubConnection.on('UserJoined', (message: string) => {
      console.log(message);
    });

    this.hubConnection.on('UserLeft', (message: string) => {
      console.log(message);
    });
  }

  public getUsers(): ChatUser[] {
    return this.users;
  }

  public selectUser(user: ChatUser | null): void {
    this.selectedUserSubject.next(user);
  }

  public sendMessage(content: string, userId: string): void {
    const message: Message = {
      id: crypto.randomUUID(),
      senderId: userId,
      senderName: this.users.find(u => u.id === userId)?.name || '',
      content,
      timestamp: new Date(),
      sender: 'me'
    };
    
    this.hubConnection.invoke('SendMessage', message);
  }

  public getMessages(): Observable<Message[]> {
    return this.messagesSubject.asObservable();
  }

  public getMessageHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/message`);
  }

  public getMessagesForUser(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/message/user/${userId}`);
  }
} 