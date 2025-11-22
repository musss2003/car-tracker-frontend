import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import * as userService from '../services/userService';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee' | 'user',
    citizenshipId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      toast.error('Molimo popunite sva obavezna polja');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    try {
      setLoading(true);
      await userService.createUser({
        ...formData,
        sendCredentials,
      });

      toast.success(
        sendCredentials
          ? 'Korisnik je kreiran i kredencijali su poslati na email'
          : 'Korisnik je uspješno kreiran'
      );
      navigate('/users');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri kreiranju korisnika');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const password =
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).slice(-4).toUpperCase();
    setFormData({ ...formData, password });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novi korisnik</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kreirajte novi korisnički nalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informacije o korisniku</CardTitle>
            <CardDescription>Unesite podatke o novom korisniku</CardDescription>
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="korisnik@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Lozinka <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Unesite lozinku"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                >
                  Generiši
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 karaktera. Kliknite "Generiši" za automatsku lozinku.
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Uloga <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'employee' | 'user') =>
                  setFormData({ ...formData, role: value })
                }
              >
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
                <strong>Zaposleni:</strong> Interni korisnici sistema
                (preporučeno)
                <br />
                <strong>Administrator:</strong> Pun pristup svim funkcijama
                <br />
                <strong>Korisnik:</strong> Eksterni korisnici (za buduću
                upotrebu)
              </p>
            </div>

            {/* Citizenship ID */}
            <div className="space-y-2">
              <Label htmlFor="citizenshipId">JMBG (Opciono)</Label>
              <Input
                id="citizenshipId"
                value={formData.citizenshipId}
                onChange={(e) =>
                  setFormData({ ...formData, citizenshipId: e.target.value })
                }
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>

            {/* Send Credentials Checkbox */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <input
                type="checkbox"
                id="sendCredentials"
                checked={sendCredentials}
                onChange={(e) => setSendCredentials(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <Label
                htmlFor="sendCredentials"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Pošalji kredencijale na email
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/users')}
            disabled={loading}
          >
            Odustani
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Kreiranje...' : 'Kreiraj korisnika'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
