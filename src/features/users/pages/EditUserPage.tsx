import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import * as userService from '../services/userService';
import { User } from '../types/user.types';

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'employee' as 'admin' | 'employee' | 'user',
    citizenshipId: '',
  });

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      setFetching(true);
      const data = await userService.getUser(userId);
      setUser(data);
      setFormData({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        role: data.role as 'admin' | 'employee' | 'user',
        citizenshipId: data.citizenshipId || '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Greška pri učitavanju korisnika');
      navigate('/users');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.email) {
      toast.error('Molimo popunite sva obavezna polja');
      return;
    }

    if (!id) {
      toast.error('ID korisnika nije pronađen');
      return;
    }

    try {
      setLoading(true);
      await userService.updateUser(id, formData);
      
      toast.success('Korisnik je uspješno ažuriran');
      navigate('/users');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju korisnika');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Korisnik nije pronađen</p>
            <Button onClick={() => navigate('/users')} className="mt-4">
              Nazad na listu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uredi korisnika</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ažurirajte informacije o korisniku
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informacije o korisniku</CardTitle>
            <CardDescription>
              Izmjenite podatke o korisniku (lozinka se ne mijenja)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Puno ime <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ime Prezime"
                required
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Korisničko ime <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="korisnicko.ime"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="korisnik@example.com"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Uloga <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'employee' | 'user') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite ulogu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Zaposleni</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="user">Korisnik (Eksterni)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                <strong>Zaposleni:</strong> Interni korisnici sistema (preporučeno)<br/>
                <strong>Administrator:</strong> Pun pristup svim funkcijama<br/>
                <strong>Korisnik:</strong> Eksterni korisnici (za buduću upotrebu)
              </p>
            </div>

            {/* Citizenship ID */}
            <div className="space-y-2">
              <Label htmlFor="citizenshipId">JMBG (Opciono)</Label>
              <Input
                id="citizenshipId"
                value={formData.citizenshipId}
                onChange={(e) => setFormData({ ...formData, citizenshipId: e.target.value })}
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>

            {/* Info about password */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Napomena:</strong> Lozinka se ne mijenja prilikom uređivanja korisnika. 
                Za resetovanje lozinke koristite opciju "Resetuj lozinku" na listi korisnika.
              </p>
            </div>

            {/* User metadata */}
            <div className="pt-4 border-t space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kreiran:</span>
                  <p className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString('bs-BA') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Posljednja izmjena:</span>
                  <p className="font-medium">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleString('bs-BA') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Posljednja prijava:</span>
                  <p className="font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('bs-BA') : 'Nikada'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/users')} disabled={loading}>
            Odustani
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Čuvanje...' : 'Sačuvaj izmjene'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
