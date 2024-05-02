function PasswordChangeSection() {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-4">
        <h2 className="text-xl font-medium text-gray-700 mb-2">Change Password</h2>
        <form>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input type="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-md text-white">Change Password</button>
        </form>
      </div>
    );
  }
  
  export default PasswordChangeSection;