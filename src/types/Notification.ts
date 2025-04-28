export interface Notification {
    id: string;
    recipient: string; // Assuming ID is string on frontend
    sender?: string;
    type: string;
    message: string;
    status: 'new' | 'seen';
    createdAt: string; // or Date, depending on how your backend sends it
  }