export default function ThemeSelectionSection() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <h2 className="text-xl font-medium text-gray-700 mb-2">Theme Selection</h2>
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Dark Mode</span>
        <input type="checkbox" className="toggle-checkbox" />
      </label>
    </div>
  );
}