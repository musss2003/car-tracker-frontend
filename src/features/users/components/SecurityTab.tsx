import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Shield, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { User } from '../types/user.types';
import { toast } from 'react-toastify';
import { changePassword } from '../services/userService';

interface SecurityTabProps {
  user: User;
}

const SecurityTab = ({ user }: SecurityTabProps) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validatePasswords = () => {
    if (!passwords.currentPassword) {
      toast.error('Unesite trenutnu lozinku');
      return false;
    }

    if (!passwords.newPassword) {
      toast.error('Unesite novu lozinku');
      return false;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Nova lozinka mora imati najmanje 6 karaktera');
      return false;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Lozinke se ne poklapaju');
      return false;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      toast.error('Nova lozinka mora biti različita od trenutne');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    try {
      setIsSaving(true);
      
      await changePassword(
        user.id,
        passwords.currentPassword,
        passwords.newPassword
      );

      toast.success('Lozinka je uspješno promijenjena');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || 'Greška pri promjeni lozinke';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-6">
      {/* Password Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <div>
              <CardTitle>Lozinka</CardTitle>
              <CardDescription>
                Promijenite vašu lozinku za pristup sistemu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isChangingPassword ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lozinka</p>
                <p className="text-sm text-muted-foreground">
                  Zadnja promjena: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('bs-BA') : 'Nepoznato'}
                </p>
              </div>
              <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                Promijeni lozinku
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Trenutna lozinka</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={handleChange}
                    placeholder="Unesite trenutnu lozinku"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova lozinka</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={handleChange}
                    placeholder="Unesite novu lozinku"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lozinka mora imati najmanje 6 karaktera
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdite novu lozinku</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    placeholder="Potvrdite novu lozinku"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Otkaži
                </Button>
                <Button onClick={handleChangePassword} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Čuvanje...
                    </>
                  ) : (
                    'Sačuvaj lozinku'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Sigurnosne informacije</CardTitle>
              <CardDescription>
                Informacije o vašem nalogu i sigurnosti
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Zadnja prijava</p>
              <p className="text-sm text-muted-foreground">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString('bs-BA') : 'Nepoznato'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Nalog kreiran</p>
              <p className="text-sm text-muted-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bs-BA') : 'Nepoznato'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium">Uloga</p>
              <p className="text-sm text-muted-foreground">
                {user.role === 'admin' ? 'Administrator' : 'Zaposlenik'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
