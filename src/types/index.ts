export interface Message {
  id: number;
  content: string;
  created: Date;
  accountId: number;
  isImage: boolean;
}
export interface User {
  id: number;
  fullName: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
  username: string;
  token?: string;
  sessionSocket: string;
  avtUrl: string;
}
export interface UserReducer {
  user: User;
  socket: any;
}
export interface Conversation {
  chatTitle: string;
  conversationId: number;
  participants: { [key: string]: User };
  messages: Message[];
  filter: {
    limit: number;
    page: number;
    canLoadMore: boolean;
  };
  isRead: boolean;
  multimediaInfo: {
    [key: string]: {
      quantity: number;
      size: number;
    };
  };
}
export interface CurrentChat {
  conversationId: number;
}
export interface ChatReducer {
  currentChat: CurrentChat;
  conversations: { [key: string]: Conversation };
  order: string[];
}
export interface ReduxState {
  userReducer: UserReducer;
  chatReducer: ChatReducer;
}
