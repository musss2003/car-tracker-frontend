import React from 'react';
import ProfileSection from './ProfileSection';
import PasswordChangeSection from './PasswordChangeSection';
import NotificationSettingsSection from './NotificationSettingsSection';
import ThemeSelectionSection from './ThemeSelectionSection';

function Settings() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-semibold text-gray-800 my-4">Settings</h1>
      <ProfileSection />
      <PasswordChangeSection />
      <NotificationSettingsSection />
      <ThemeSelectionSection />
    </div>
  );
}

export default Settings;
