export default function ProfileSection() {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-4">
        <h2 className="text-xl font-medium text-gray-700 mb-2">Profile Information</h2>
        <form>
          {/* Example input field */}
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          {/* Add additional fields as needed */}
          <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-md text-white">Update Profile</button>
        </form>
      </div>
    );
  }
  