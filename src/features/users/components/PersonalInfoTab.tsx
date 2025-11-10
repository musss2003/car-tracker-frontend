import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
import { Separator } from '@/shared/components/ui/separator';
import { Loader2, Save, Upload } from 'lucide-react';
import { User } from '../types/user.types';
import { updateUser } from '../services/userService';
import { uploadDocument, downloadDocument } from '@/shared/services/uploadService';
import { toast } from 'react-toastify';

interface PersonalInfoTabProps {
  user: User;
  onUpdate: (user: User) => void;
}

const PersonalInfoTab = ({ user, onUpdate }: PersonalInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    username: user.username || '',
    phone: user.phone || '',
    address: user.address || '',
    citizenshipId: user.citizenshipId || '',
  });

  // Load existing profile photo
  useEffect(() => {
    const loadExistingPhoto = async () => {
      if (!user.profilePhotoUrl) {
        setPhotoPreview('');
        return;
      }

      setIsLoadingPhoto(true);
      try {
        const photoBlob = await downloadDocument(user.profilePhotoUrl);
        const photoObjectUrl = URL.createObjectURL(photoBlob);
        setPhotoPreview(photoObjectUrl);
      } catch (error) {
        console.error('Error loading profile photo:', error);
        setPhotoPreview('');
      } finally {
        setIsLoadingPhoto(false);
      }
    };

    loadExistingPhoto();

    // Cleanup function to revoke object URL
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [user.profilePhotoUrl]);

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return user.profilePhotoUrl || null;
    
    try {
      const filename = await uploadDocument(photoFile);
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Greška pri upload-u slike');
      return null;
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
      
      // Upload photo first if a new one was selected
      let photoFilename = user.profilePhotoUrl;
      if (photoFile) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          // Photo upload failed, don't proceed
          return;
        }
        photoFilename = uploadedFilename;
      }
      
      // Update user with new data including photo
      const updatedData = {
        ...formData,
        profilePhotoUrl: photoFilename,
      };
      
      const updatedUser = await updateUser(user.id, updatedData);
      onUpdate(updatedUser);
      setPhotoFile(null); // Clear the selected photo after successful save
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
    setPhotoFile(null); // Clear selected photo on cancel
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
        <CardContent>
          <div className="flex items-center gap-6 mt-5">
            {/* Circular Avatar Photo Upload */}
            <div className="relative group">
              <input
                ref={(ref) => {
                  if (ref) (window as any)._profilePhotoInput = ref;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Slika je prevelika. Maksimalna veličina je 5MB.');
                      return;
                    }
                    handlePhotoChange(file);
                  }
                }}
                className="hidden"
                id="profile-photo-input"
              />
              <label
                htmlFor="profile-photo-input"
                className="cursor-pointer block"
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-border bg-muted group-hover:border-primary transition-colors">
                  {isLoadingPhoto ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : photoFile ? (
                    <img
                      src={URL.createObjectURL(photoFile)}
                      alt={user.name || user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={user.name || user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-semibold">
                      {getInitials()}
                    </div>
                  )}
                  {!isLoadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {user.role === 'admin' ? 'Administrator' : 'Zaposlenik'}
              </p>
              {photoFile && (
                <p className="text-xs text-primary mt-2">
                  Nova slika odabrana - kliknite Sačuvaj za potvrdu
                </p>
              )}
            </div>
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
