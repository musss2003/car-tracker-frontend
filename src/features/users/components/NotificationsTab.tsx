import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Bell, Mail, Info } from 'lucide-react';
import { User } from '../types/user.types';

interface NotificationsTabProps {
  user: User;
  onUpdate: (user: User) => void;
}

const NotificationsTab = ({ user }: NotificationsTabProps) => {
  return (
    <div className="space-y-6">
      {/* System Notifications Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Sistemska obavještenja</CardTitle>
              <CardDescription>
                Informacije o vašim obavještenjima u sistemu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Aktivna obavještenja</p>
              <p className="text-sm text-muted-foreground">
                Primajte obavještenja o novim ugovorima, isteku ugovora i važnim
                događajima u sistemu.
              </p>
            </div>
          </div>

          <div className="grid gap-4 pt-2">
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
