export default function NotificationSettingsSection() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <h2 className="text-xl font-medium text-gray-700 mb-2">Notification Settings</h2>
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
        <input type="checkbox" className="toggle-checkbox" />
      </label>
    </div>
  );
}