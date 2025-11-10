import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
import { Separator } from '@/shared/components/ui/separator';
import { Loader2, Save } from 'lucide-react';
import { User } from '../types/user.types';
import { updateUser, uploadProfilePhoto } from '../services/userService';
import { toast } from 'react-toastify';

interface PersonalInfoTabProps {
  user: User;
  onUpdate: (user: User) => void;
}

const PersonalInfoTab = ({ user, onUpdate }: PersonalInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    username: user.username || '',
    phone: user.phone || '',
    address: user.address || '',
    citizenshipId: user.citizenshipId || '',
  });

  const handlePhotoChange = async (file: File | null) => {
    if (!file) {
      setPhotoFile(null);
      return;
    }

    try {
      const updatedUser = await uploadProfilePhoto(user.id, file);
      onUpdate(updatedUser);
      setPhotoFile(null);
      toast.success('Profilna slika je uspješno ažurirana');
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error('Greška pri upload-u slike');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await updateUser(user.id, formData);
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Profil je uspješno ažuriran');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Greška pri ažuriranju profila');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      address: user.address || '',
      citizenshipId: user.citizenshipId || '',
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profilna slika</CardTitle>
          <CardDescription>
            Kliknite da promijenite profilnu fotografiju
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            value={photoFile}
            onChange={handlePhotoChange}
            label=""
            maxSizeMB={5}
            existingPhotoUrl={user.profilePhotoUrl}
          />
          <div className="mt-4">
            <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {user.role === 'admin' ? 'Administrator' : 'Zaposlenik'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lični podaci</CardTitle>
              <CardDescription>
                Vaše osnovne informacije i kontakt podaci
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Uredi
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ime i prezime</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Unesite ime i prezime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Korisničko ime</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Korisničko ime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email adresa</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+387 XX XXX XXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="citizenshipId">JMBG</Label>
              <Input
                id="citizenshipId"
                name="citizenshipId"
                value={formData.citizenshipId}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="1234567890123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Unesite adresu"
              rows={3}
            />
          </div>

          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Otkaži
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Čuvanje...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sačuvaj
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
