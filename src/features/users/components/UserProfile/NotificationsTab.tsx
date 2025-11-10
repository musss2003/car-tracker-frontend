import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Bell } from 'lucide-react';
import { User } from '../../types/user.types';
import { useState } from 'react';

interface NotificationsTabProps {
  user: User;
  onUpdate: (user: User) => void;
}

const NotificationsTab = ({ user, onUpdate }: NotificationsTabProps) => {
  const [emailNotifications, setEmailNotifications] = useState({
    newContract: true,
    contractExpiring: true,
    carMaintenance: true,
    userActivity: false,
    systemUpdates: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    newContract: true,
    contractExpiring: true,
    carMaintenance: false,
    userActivity: false,
  });

  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // In a real app, this would save to backend
  };

  const handlePushToggle = (key: keyof typeof pushNotifications) => {
    setPushNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // In a real app, this would save to backend
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Email obavještenja</CardTitle>
              <CardDescription>
                Kontrolišite koje email obavijesti želite primati
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-new-contract">Novi ugovori</Label>
              <p className="text-xs text-muted-foreground">
                Primajte obavještenje kada se kreira novi ugovor
              </p>
            </div>
            <Switch
              id="email-new-contract"
              checked={emailNotifications.newContract}
              onCheckedChange={() => handleEmailToggle('newContract')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-contract-expiring">Istek ugovora</Label>
              <p className="text-xs text-muted-foreground">
                Primajte podsjetnik kada ugovor istječe
              </p>
            </div>
            <Switch
              id="email-contract-expiring"
              checked={emailNotifications.contractExpiring}
              onCheckedChange={() => handleEmailToggle('contractExpiring')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-car-maintenance">Održavanje vozila</Label>
              <p className="text-xs text-muted-foreground">
                Obavještenja o održavanju i servisiranju vozila
              </p>
            </div>
            <Switch
              id="email-car-maintenance"
              checked={emailNotifications.carMaintenance}
              onCheckedChange={() => handleEmailToggle('carMaintenance')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-user-activity">Aktivnost korisnika</Label>
              <p className="text-xs text-muted-foreground">
                Primajte obavještenja o aktivnostima korisnika
              </p>
            </div>
            <Switch
              id="email-user-activity"
              checked={emailNotifications.userActivity}
              onCheckedChange={() => handleEmailToggle('userActivity')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-system-updates">Sistemske izmjene</Label>
              <p className="text-xs text-muted-foreground">
                Novosti, ažuriranja i najave sistema
              </p>
            </div>
            <Switch
              id="email-system-updates"
              checked={emailNotifications.systemUpdates}
              onCheckedChange={() => handleEmailToggle('systemUpdates')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push obavještenja</CardTitle>
          <CardDescription>
            Upravljajte push obavještenjima u pregledaču
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Omogući push obavještenja</Label>
              <p className="text-xs text-muted-foreground">
                Primajte trenutna obavještenja u pregledaču
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={pushNotifications.enabled}
              onCheckedChange={() => handlePushToggle('enabled')}
            />
          </div>

          {pushNotifications.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-new-contract">Novi ugovori</Label>
                  <p className="text-xs text-muted-foreground">
                    Trenutno obavještenje za nove ugovore
                  </p>
                </div>
                <Switch
                  id="push-new-contract"
                  checked={pushNotifications.newContract}
                  onCheckedChange={() => handlePushToggle('newContract')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-contract-expiring">Istek ugovora</Label>
                  <p className="text-xs text-muted-foreground">
                    Push obavještenje za ističuće ugovore
                  </p>
                </div>
                <Switch
                  id="push-contract-expiring"
                  checked={pushNotifications.contractExpiring}
                  onCheckedChange={() => handlePushToggle('contractExpiring')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-car-maintenance">Održavanje vozila</Label>
                  <p className="text-xs text-muted-foreground">
                    Push obavještenja za servisiranje
                  </p>
                </div>
                <Switch
                  id="push-car-maintenance"
                  checked={pushNotifications.carMaintenance}
                  onCheckedChange={() => handlePushToggle('carMaintenance')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-user-activity">Aktivnost korisnika</Label>
                  <p className="text-xs text-muted-foreground">
                    Push obavještenja o aktivnostima
                  </p>
                </div>
                <Switch
                  id="push-user-activity"
                  checked={pushNotifications.userActivity}
                  onCheckedChange={() => handlePushToggle('userActivity')}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Postavke obavještenja</CardTitle>
          <CardDescription>
            Dodatne opcije za obavještenja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-sound">Zvuk obavještenja</Label>
              <p className="text-xs text-muted-foreground">
                Reproduciraj zvuk pri novom obavještenju
              </p>
            </div>
            <Switch id="notification-sound" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="desktop-notifications">Desktop obavještenja</Label>
              <p className="text-xs text-muted-foreground">
                Prikaži obavještenja na radnoj površini
              </p>
            </div>
            <Switch id="desktop-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-preview">Pregled u obavještenju</Label>
              <p className="text-xs text-muted-foreground">
                Prikaži sadržaj u obavještenju
              </p>
            </div>
            <Switch id="notification-preview" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
