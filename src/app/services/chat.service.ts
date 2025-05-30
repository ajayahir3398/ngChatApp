import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChatUser {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  status: 'online' | 'offline';
}

export interface Message {
  id: number;
  content: string;
  sender: 'me' | 'other';
  timestamp: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private users: ChatUser[] = [
    {
      id: 1,
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      time: '10:30 AM',
      unread: 2,
      avatar: 'J',
      status: 'online'
    },
    {
      id: 2,
      name: 'Jane Smith',
      lastMessage: 'See you tomorrow!',
      time: 'Yesterday',
      unread: 0,
      avatar: 'J',
      status: 'offline'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      lastMessage: 'The project is ready for review',
      time: 'Yesterday',
      unread: 1,
      avatar: 'M',
      status: 'online'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      lastMessage: 'Did you see the latest update?',
      time: '2 hours ago',
      unread: 3,
      avatar: 'S',
      status: 'online'
    },
    {
      id: 5,
      name: 'David Brown',
      lastMessage: 'Let\'s schedule a meeting',
      time: '5 hours ago',
      unread: 0,
      avatar: 'D',
      status: 'offline'
    },
    {
      id: 6,
      name: 'Emily Chen',
      lastMessage: 'The design looks great!',
      time: '1 day ago',
      unread: 1,
      avatar: 'E',
      status: 'online'
    },
    {
      id: 7,
      name: 'Alex Rodriguez',
      lastMessage: 'Can you review my code?',
      time: '30 mins ago',
      unread: 2,
      avatar: 'A',
      status: 'online'
    },
    {
      id: 8,
      name: 'Lisa Thompson',
      lastMessage: 'The meeting is at 3 PM',
      time: '1 hour ago',
      unread: 0,
      avatar: 'L',
      status: 'offline'
    },
    {
      id: 9,
      name: 'Ryan Park',
      lastMessage: 'New features are deployed',
      time: '3 hours ago',
      unread: 1,
      avatar: 'R',
      status: 'online'
    }
  ];

  private messages: Message[] = [
    {
      id: 1,
      content: 'Hey, how are you?',
      sender: 'other',
      timestamp: '10:30 AM',
      userId: 1
    },
    {
      id: 2,
      content: 'I\'m good, thanks! How about you?',
      sender: 'me',
      timestamp: '10:31 AM',
      userId: 1
    },
    {
      id: 3,
      content: 'Doing great! Just working on some projects.',
      sender: 'other',
      timestamp: '10:32 AM',
      userId: 1
    },
    {
      id: 4,
      content: 'Can we meet tomorrow?',
      sender: 'other',
      timestamp: 'Yesterday',
      userId: 2
    },
    {
      id: 5,
      content: 'Sure, what time works for you?',
      sender: 'me',
      timestamp: 'Yesterday',
      userId: 2
    },
    {
      id: 6,
      content: 'How about 2 PM?',
      sender: 'other',
      timestamp: 'Yesterday',
      userId: 2
    },
    {
      id: 7,
      content: 'The project is ready for review',
      sender: 'other',
      timestamp: 'Yesterday',
      userId: 3
    },
    {
      id: 8,
      content: 'Great! I\'ll take a look at it.',
      sender: 'me',
      timestamp: 'Yesterday',
      userId: 3
    },
    {
      id: 9,
      content: 'Did you see the latest update?',
      sender: 'other',
      timestamp: '2 hours ago',
      userId: 4
    },
    {
      id: 10,
      content: 'Yes, it looks promising!',
      sender: 'me',
      timestamp: '1 hour ago',
      userId: 4
    },
    {
      id: 11,
      content: 'Let\'s schedule a meeting',
      sender: 'other',
      timestamp: '5 hours ago',
      userId: 5
    },
    {
      id: 12,
      content: 'I\'m available tomorrow afternoon',
      sender: 'me',
      timestamp: '4 hours ago',
      userId: 5
    },
    {
      id: 13,
      content: 'The design looks great!',
      sender: 'other',
      timestamp: '1 day ago',
      userId: 6
    },
    {
      id: 14,
      content: 'Thanks! I worked hard on it',
      sender: 'me',
      timestamp: '1 day ago',
      userId: 6
    },
    {
      id: 15,
      content: 'Can you review my code?',
      sender: 'other',
      timestamp: '30 mins ago',
      userId: 7
    },
    {
      id: 16,
      content: 'Sure, send me the link',
      sender: 'me',
      timestamp: '25 mins ago',
      userId: 7
    },
    {
      id: 17,
      content: 'The meeting is at 3 PM',
      sender: 'other',
      timestamp: '1 hour ago',
      userId: 8
    },
    {
      id: 18,
      content: 'Got it, I\'ll be there',
      sender: 'me',
      timestamp: '55 mins ago',
      userId: 8
    },
    {
      id: 19,
      content: 'New features are deployed',
      sender: 'other',
      timestamp: '3 hours ago',
      userId: 9
    },
    {
      id: 20,
      content: 'Perfect! I\'ll test them out',
      sender: 'me',
      timestamp: '2 hours ago',
      userId: 9
    }
  ];

  private selectedUserSubject = new BehaviorSubject<ChatUser | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  constructor() {
    // Select first user by default
    this.selectUser(this.users[0]);
  }

  getUsers(): ChatUser[] {
    return this.users;
  }

  getMessagesForUser(userId: number): Message[] {
    return this.messages.filter(message => message.userId === userId);
  }

  selectUser(user: ChatUser | null) {
    this.selectedUserSubject.next(user);
    // Clear unread messages when selecting a user
    if (user) {
      const userIndex = this.users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        this.users[userIndex].unread = 0;
      }
    }
  }

  sendMessage(content: string, userId: number) {
    const newMessage: Message = {
      id: this.messages.length + 1,
      content,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId
    };
    this.messages.push(newMessage);

    // Update last message in users list
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].lastMessage = content;
      this.users[userIndex].time = 'Just now';
    }
  }
} 