import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  /**
   * Connect to Socket.IO server and mark user as online
   */
  connect(userId: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      
      // Mark user as online
      if (this.userId) {
        this.socket?.emit('user:online', this.userId);
        
        // Also join user's notification room (for backward compatibility)
        this.socket?.emit('join', this.userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      if (this.userId) {
        this.socket?.emit('user:online', this.userId);
      }
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Listen for user status changes (online/offline)
   */
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.on('user:status', callback);
  }

  /**
   * Stop listening for user status changes
   */
  offUserStatusChange() {
    if (this.socket) {
      this.socket.off('user:status');
    }
  }

  /**
   * Listen for notifications (existing functionality)
   */
  onNotification(callback: (notification: any) => void) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.on('receiveNotification', callback);
  }

  /**
   * Send notification (existing functionality)
   */
  sendNotification(data: {
    recipientId: string;
    type: string;
    message: string;
    senderId?: string;
  }) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('sendNotification', data);
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
