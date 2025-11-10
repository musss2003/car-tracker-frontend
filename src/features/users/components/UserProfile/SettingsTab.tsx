import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Settings as SettingsIcon } from 'lucide-react';
import { User } from '../../types/user.types';
import { useState, useEffect } from 'react';

interface SettingsTabProps {
  user: User;
  onUpdate: (user: User) => void;
}

const SettingsTab = ({ user, onUpdate }: SettingsTabProps) => {
  const [theme, setTheme] = useState<string>('system');
  const [language, setLanguage] = useState<string>('bs');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);

    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'bs';
    setLanguage(savedLanguage);
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem('theme', value);

    // Apply theme
    const root = document.documentElement;
    if (value === 'dark') {
      root.classList.add('dark');
    } else if (value === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('language', value);
    // In a real app, this would trigger i18n language change
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <div>
              <CardTitle>Izgled</CardTitle>
              <CardDescription>
                Prilagodite izgled aplikacije
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Odaberite temu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Svijetla</SelectItem>
                <SelectItem value="dark">Tamna</SelectItem>
                <SelectItem value="system">Sistemska</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Odaberite kako želite da aplikacija izgleda
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Jezik</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Odaberite jezik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bs">Bosanski</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hr">Hrvatski</SelectItem>
                <SelectItem value="sr">Srpski</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Odaberite jezik aplikacije
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privatnost</CardTitle>
          <CardDescription>
            Kontrolišite vašu privatnost i vidljivost
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-online">Prikaži status online</Label>
              <p className="text-xs text-muted-foreground">
                Ostali korisnici mogu vidjeti kada ste online
              </p>
            </div>
            <Switch
              id="show-online"
              defaultChecked
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-email">Prikaži email adresu</Label>
              <p className="text-xs text-muted-foreground">
                Dozvoli drugim korisnicima da vide vašu email adresu
              </p>
            </div>
            <Switch
              id="show-email"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-phone">Prikaži telefon</Label>
              <p className="text-xs text-muted-foreground">
                Dozvoli drugim korisnicima da vide vaš broj telefona
              </p>
            </div>
            <Switch
              id="show-phone"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Podaci i skladištenje</CardTitle>
          <CardDescription>
            Upravljajte vašim podacima i kešom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Keš pregledača</p>
              <p className="text-sm text-muted-foreground">
                Očistite keš da oslobodite prostor
              </p>
            </div>
            <button className="text-sm text-primary hover:underline">
              Očisti keš
            </button>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Preuzmi moje podatke</p>
              <p className="text-sm text-muted-foreground">
                Preuzmite kopiju vaših podataka
              </p>
            </div>
            <button className="text-sm text-primary hover:underline">
              Preuzmi
            </button>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium">Obriši nalog</p>
              <p className="text-sm text-muted-foreground text-destructive">
                Trajno obrišite vaš nalog i sve podatke
              </p>
            </div>
            <button className="text-sm text-destructive hover:underline">
              Obriši
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
