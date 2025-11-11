import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Settings as SettingsIcon } from 'lucide-react';
import { User } from '../types/user.types';
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


    </div>
  );
};

export default SettingsTab;
