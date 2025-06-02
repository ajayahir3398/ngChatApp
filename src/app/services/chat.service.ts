import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  receiverId: string;
  sender: ChatUser;
  receiver: ChatUser;
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

interface MessageRequest {
  content: string;
  receiverId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private selectedUserSubject = new BehaviorSubject<ChatUser | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();
  private apiUrl = 'http://localhost:5000/api';
  private users: ChatUser[] = [];
  private usersSubject = new BehaviorSubject<ChatUser[]>([]);
  users$ = this.usersSubject.asObservable();

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
      .withUrl(`http://localhost:5000/chatHub?access_token=${token}`)
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

      // Update last message for the sender/receiver in users list
      const otherUserId = message.senderId === this.authService.getCurrentUserId() 
        ? message.receiverId 
        : message.senderId;

      this.users = this.users.map(user => {
        if (user.id === otherUserId) {
          return {
            ...user,
            lastMessage: message.content,
            time: new Date(message.timestamp).toLocaleTimeString()
          };
        }
        return user;
      });
      this.usersSubject.next(this.users);
    });

    this.hubConnection.on('UserJoined', (user: ChatUser) => {
      const users = this.usersSubject.value;
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index].status = 'online';
        this.usersSubject.next([...users]);
      }
    });

    this.hubConnection.on('UserLeft', (user: ChatUser) => {
      const users = this.usersSubject.value;
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index].status = 'offline';
        this.usersSubject.next([...users]);
      }
    });
  }

  private getHttpOptions() {
    const token = this.authService.getAuthToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  public getUsers(): Observable<ChatUser[]> {
    this.fetchUsers();
    return this.users$;
  }

  private fetchUsers(): void {
    this.http.get<ChatUser[]>(`${this.apiUrl}/user`, this.getHttpOptions())
      .subscribe({
        next: (users) => {
          this.users = users;
          this.usersSubject.next(users);
        },
        error: (error) => console.error('Error fetching users:', error)
      });
  }

  public selectUser(user: ChatUser | null): void {
    this.selectedUserSubject.next(user);
  }

  public sendMessage(content: string, receiverId: string): void {
    if (!content.trim() || !receiverId) return;

    const messageRequest: MessageRequest = {
      content: content.trim(),
      receiverId: receiverId
    };
    
    this.http.post<Message>(`${this.apiUrl}/message`, messageRequest, this.getHttpOptions())
      .subscribe({
        next: (savedMessage) => {
          this.hubConnection.invoke('SendMessage', savedMessage);
          const currentMessages = this.messagesSubject.value;
          this.messagesSubject.next([...currentMessages, savedMessage]);
        },
        error: (error) => {
          console.error('Error storing message:', error);
        }
      });
  }

  public getMessages(): Observable<Message[]> {
    return this.messagesSubject.asObservable();
  }

  public getMessageHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/message`, this.getHttpOptions());
  }

  public getMessagesForUser(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/message/user/${userId}`, this.getHttpOptions());
  }
} 