import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { User, Settings, Shield, Bell } from 'lucide-react';
import { getUser } from '../services/userService';
import { User as UserType } from '../types/user.types';
import { toast } from 'react-toastify';
import PersonalInfoTab from '../components/PersonalInfoTab';
import SecurityTab from '../components/SecurityTab';
import SettingsTab from '../components/SettingsTab';
import NotificationsTab from '../components/NotificationsTab';


const UserProfilePage = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [authUser?.id]);

  const fetchUserData = async () => {
    if (!authUser?.id) return;

    try {
      setLoading(true);
      const userData = await getUser(authUser.id);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Greška pri učitavanju profila');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Korisnik nije pronađen</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Moj Profil</h1>
        <p className="text-muted-foreground mt-2">
          Upravljajte svojim ličnim podacima, sigurnošću i postavkama
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Lični podaci</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sigurnost</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Postavke</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifikacije</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <PersonalInfoTab user={user} onUpdate={handleUserUpdate} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityTab user={user} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab user={user} onUpdate={handleUserUpdate} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab user={user} onUpdate={handleUserUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;
