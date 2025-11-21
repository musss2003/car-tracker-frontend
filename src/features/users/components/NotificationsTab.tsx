import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Bell, Mail, Info, ArrowRight, Clock } from 'lucide-react';
import { User } from '../types/user.types';
import { getNotifications } from '@/features/notifications/services/notificationService';
import { Notification } from '@/features/notifications/types/notification.types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsTabProps {
  user: User;
  onUpdate: (user: User) => void;
}

const NotificationsTab = ({ user, onUpdate }: NotificationsTabProps) => {
  const navigate = useNavigate();
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotifications = async () => {
      try {
        const data = await getNotifications();
        // Get the 5 most recent notifications
        const recent = (data.notifications || []).slice(0, 5);
        setRecentNotifications(recent);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNotifications();
  }, []);

  const unreadCount = recentNotifications.filter((n) => n.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <div>
                <CardTitle>Nedavna obavještenja</CardTitle>
                <CardDescription>
                  {unreadCount > 0 
                    ? `Imate ${unreadCount} nepročitano obavještenje${unreadCount > 1 ? 'a' : ''}`
                    : 'Sve je pročitano'}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => navigate('/notifications')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Vidi sve
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Učitavanje...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nemate obavještenja
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                    notification.status === 'new' ? 'bg-blue-50/50 border-blue-200' : ''
                  }`}
                  onClick={() => navigate('/notifications')}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-primary" 
                         style={{ opacity: notification.status === 'new' ? 1 : 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.status === 'new' ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentNotifications.length >= 5 && (
                <Button
                  onClick={() => navigate('/notifications')}
                  variant="ghost"
                  className="w-full"
                >
                  Vidi sva obavještenja
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Notifications Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <div>
              <CardTitle>Tipovi obavještenja</CardTitle>
              <CardDescription>
                Automatska obavještenja u sistemu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ugovori</p>
                <p className="text-sm text-muted-foreground">
                  Novi i ističući ugovori
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary">Aktivno</span>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email obavještenja</p>
                <p className="text-sm text-muted-foreground">
                  Automatska email obavještenja
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary">Aktivno</span>
          </div>
        </CardContent>
      </Card>

      {/* Email Address Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>Email adresa za obavještenja</CardTitle>
          <CardDescription>
            Obavještenja se šalju na vašu registrovanu email adresu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Email adresa</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Za promjenu email adrese, idite na karticu Lični podaci.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
