import { useEffect, useState, useRef, JSX } from 'react';

import { toast } from 'react-toastify';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  CogIcon,
  LogoutIcon,
  PhotographIcon,
  XIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid';
import defaultAvatar from '../../../../assets/default_avatar.png';
import './UserProfile.css';
import { User } from '../../types/user.types';
import {
  deleteUser,
  getUser,
  updateUser,
  uploadProfilePhoto,
} from '../../services/userService';

const UserProfile = ({ id }: { id: string }) => {
  // State management
  // User or null
  const [user, setUser] = useState<User | null>(null);

  // Boolean
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // String or null
  const [error, setError] = useState<string | null>(null);
  const [currentEdit, setCurrentEdit] = useState<keyof User | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Active tab (limit to specific string literals if possible)
  const [activeTab, setActiveTab] = useState<
    'profile' | 'settings' | 'notifications' | 'security'
  >('profile');

  // File handling
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getUser(id);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        if (error instanceof Error) {
          setError(error.message);
          toast.error(error.message);
        } else {
          setError('Failed to load user profile');
          toast.error('Failed to load user profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Focus input when editing
  useEffect(() => {
    if (!currentEdit) return;

    // Focus the correct input based on the field type
    if (['name', 'email', 'phone'].includes(currentEdit)) {
      inputRef.current?.focus();
    } else if (['address', 'bio'].includes(currentEdit)) {
      textareaRef.current?.focus();
    }
  }, [currentEdit]);

  // Handle edit mode
  const handleEdit = (field: keyof User) => {
    setCurrentEdit(field);
    setEditValue(user?.[field]?.toString() || '');
  };

  // Handle save
  const handleSave = async () => {
    if (!currentEdit) return;

    // Validate input
    if (!editValue.trim() && ['name', 'email'].includes(currentEdit)) {
      toast.error(
        `${
          currentEdit.charAt(0).toUpperCase() + currentEdit.slice(1)
        } cannot be empty`
      );
      return;
    }

    if (currentEdit === 'email' && !validateEmail(editValue)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (
      currentEdit === 'phone' &&
      editValue.trim() &&
      !validatePhone(editValue)
    ) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setSaving(true);
    const updatedData: Partial<User> = {
      [currentEdit]: editValue.trim(),
    } as Partial<User>;

    try {
      await updateUser(id, updatedData);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, ...updatedData } : prevUser
      );
      toast.success(`Updated ${formatFieldName(currentEdit)}`);
      setCurrentEdit(null);
    } catch (error) {
      const message = (error as Error).message || 'Unknown error';
      console.error(`Update failed for ${currentEdit}:`, message);
      toast.error(
        `Failed to update ${formatFieldName(currentEdit)}: ${message}`
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setCurrentEdit(null);
    setEditValue('');
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await deleteUser(id);
      toast.warning('User account deleted');
      // Redirect or handle post-deletion logic here
      window.location.href = '/login'; // Example redirect
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to delete user', message);
      toast.error(`Failed to delete user: ${message}`);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle photo upload click
  const handlePhotoUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    setUploadingPhoto(true);
    try {
      const response = await uploadProfilePhoto(id, photoFile);
      setUser((prevUser) => {
        if (!prevUser) return null;

        return {
          ...prevUser,
          profilePhotoUrl: response.profilePhotoUrl || prevUser.profilePhotoUrl,
        };
      });
      toast.success('Profile photo updated');

      // Reset state
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Failed to upload photo:', error);

      if (error instanceof Error) {
        toast.error(`Failed to upload photo: ${error.message}`);
      } else {
        toast.error('Failed to upload photo: Unknown error');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle cancel photo upload
  const handleCancelPhotoUpload = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Format field name for display
  const formatFieldName = (field: string): string => {
    if (!field) return '';
    return field
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  // Format date
  const formatDate = (date?: string | Date): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date?: string | Date): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    } catch {
      return 'Invalid datetime';
    }
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate phone
  const validatePhone = (phone: string): boolean => {
    return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);
  };

  // Get field icon
  const getFieldIcon = (field: string): JSX.Element => {
    switch (field) {
      case 'name':
        return <UserIcon className="field-icon" />;
      case 'email':
        return <MailIcon className="field-icon" />;
      case 'phone':
        return <PhoneIcon className="field-icon" />;
      case 'address':
        return <LocationMarkerIcon className="field-icon" />;
      case 'birthdate':
        return <CalendarIcon className="field-icon" />;
      default:
        return <UserIcon className="field-icon" />;
    }
  };

  // Render loading state
  if (loading && !user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Render error state
  if (error && !user) {
    return (
      <div className="profile-error">
        <ExclamationCircleIcon className="error-icon" />
        <h3>Failed to load profile</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render profile
  return (
    <div className="user-profile-container">
      {/* Profile Header */}
      <div className="user-profile-header">
        <div className="profile-photo-container">
          {photoPreview ? (
            <img
              src={photoPreview || '/placeholder.svg'}
              className="user-profile-avatar"
              alt="Profile Preview"
            />
          ) : (
            <img
              src={user?.profilePhotoUrl || defaultAvatar}
              className="user-profile-avatar"
              alt={`${user?.name || 'User'}'s Avatar`}
            />
          )}

          {!photoFile && (
            <button
              onClick={handlePhotoUploadClick}
              className="photo-edit-button"
              aria-label="Change profile photo"
            >
              <PhotographIcon className="button-icon" />
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden-file-input"
          />
        </div>

        <div className="profile-header-info">
          <h2 className="profile-name">{user?.name || 'User'}</h2>
          <p className="profile-role">{user?.role || 'Member'}</p>

          {photoFile && (
            <div className="photo-actions">
              <button
                onClick={handlePhotoUpload}
                className="photo-save-button"
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  <>
                    <CheckIcon className="button-icon-small" />
                    Save Photo
                  </>
                )}
              </button>
              <button
                onClick={handleCancelPhotoUpload}
                className="photo-cancel-button"
                disabled={uploadingPhoto}
              >
                <XIcon className="button-icon-small" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon className="tab-icon" />
          <span className="tab-text">Profile</span>
        </button>
        <button
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheckIcon className="tab-icon" />
          <span className="tab-text">Security</span>
        </button>
        <button
          className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <CogIcon className="tab-icon" />
          <span className="tab-text">Settings</span>
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3 className="section-title">Personal Information</h3>

            <div className="profile-fields">
              {/* Name Field */}
              <div className="profile-field">
                <div className="field-header">
                  <div className="field-label">
                    {getFieldIcon('name')}
                    <span>Full Name</span>
                  </div>

                  {currentEdit !== 'name' && (
                    <button
                      onClick={() => handleEdit('name')}
                      className="edit-button"
                      aria-label="Edit name"
                    >
                      <PencilIcon className="button-icon-small" />
                    </button>
                  )}
                </div>

                {currentEdit === 'name' ? (
                  <div className="edit-field">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Enter your full name"
                      ref={inputRef}
                    />
                    <div className="edit-actions">
                      <button
                        onClick={handleSave}
                        className="save-button"
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="loading-spinner-small"></span>
                        ) : (
                          <>
                            <CheckIcon className="button-icon-small" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-button"
                        disabled={saving}
                      >
                        <XIcon className="button-icon-small" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-value">{user?.name || 'Not set'}</div>
                )}
              </div>

              {/* Email Field */}
              <div className="profile-field">
                <div className="field-header">
                  <div className="field-label">
                    {getFieldIcon('email')}
                    <span>Email Address</span>
                  </div>

                  {currentEdit !== 'email' && (
                    <button
                      onClick={() => handleEdit('email')}
                      className="edit-button"
                      aria-label="Edit email"
                    >
                      <PencilIcon className="button-icon-small" />
                    </button>
                  )}
                </div>

                {currentEdit === 'email' ? (
                  <div className="edit-field">
                    <input
                      type="email"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Enter your email address"
                      ref={inputRef}
                    />
                    <div className="edit-actions">
                      <button
                        onClick={handleSave}
                        className="save-button"
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="loading-spinner-small"></span>
                        ) : (
                          <>
                            <CheckIcon className="button-icon-small" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-button"
                        disabled={saving}
                      >
                        <XIcon className="button-icon-small" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-value">{user?.email || 'Not set'}</div>
                )}
              </div>

              {/* Phone Field */}
              <div className="profile-field">
                <div className="field-header">
                  <div className="field-label">
                    {getFieldIcon('phone')}
                    <span>Phone Number</span>
                  </div>

                  {currentEdit !== 'phone' && (
                    <button
                      onClick={() => handleEdit('phone')}
                      className="edit-button"
                      aria-label="Edit phone"
                    >
                      <PencilIcon className="button-icon-small" />
                    </button>
                  )}
                </div>

                {currentEdit === 'phone' ? (
                  <div className="edit-field">
                    <input
                      type="tel"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Enter your phone number"
                      ref={inputRef}
                    />
                    <div className="edit-actions">
                      <button
                        onClick={handleSave}
                        className="save-button"
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="loading-spinner-small"></span>
                        ) : (
                          <>
                            <CheckIcon className="button-icon-small" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-button"
                        disabled={saving}
                      >
                        <XIcon className="button-icon-small" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-value">{user?.phone || 'Not set'}</div>
                )}
              </div>

              {/* Address Field */}
              <div className="profile-field">
                <div className="field-header">
                  <div className="field-label">
                    {getFieldIcon('address')}
                    <span>Address</span>
                  </div>

                  {currentEdit !== 'address' && (
                    <button
                      onClick={() => handleEdit('address')}
                      className="edit-button"
                      aria-label="Edit address"
                    >
                      <PencilIcon className="button-icon-small" />
                    </button>
                  )}
                </div>

                {currentEdit === 'address' ? (
                  <div className="edit-field">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-textarea"
                      placeholder="Enter your address"
                      ref={textareaRef}
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button
                        onClick={handleSave}
                        className="save-button"
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="loading-spinner-small"></span>
                        ) : (
                          <>
                            <CheckIcon className="button-icon-small" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-button"
                        disabled={saving}
                      >
                        <XIcon className="button-icon-small" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-value">
                    {user?.address || 'Not set'}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-info-section">
              <h3 className="section-title">Account Information</h3>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">
                    {formatDate(user?.createdAt)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">
                    {formatDateTime(user?.updatedAt)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Status</span>
                  <span className="info-value status-active">Active</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type</span>
                  <span className="info-value">{user?.role || 'Standard'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-section">
            <h3 className="section-title">Security Settings</h3>

            <div className="security-options">
              <div className="security-option">
                <div className="option-info">
                  <h4>Change Password</h4>
                  <p>Update your password to keep your account secure</p>
                </div>
                <button className="primary-button">Change Password</button>
              </div>

              <div className="security-option">
                <div className="option-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="primary-button">Enable 2FA</button>
              </div>

              <div className="security-option">
                <div className="option-info">
                  <h4>Login History</h4>
                  <p>View your recent login activity</p>
                </div>
                <button className="secondary-button">View History</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="profile-section">
            <h3 className="section-title">Account Settings</h3>

            <div className="settings-options">
              <div className="settings-option">
                <div className="option-info">
                  <h4>Email Notifications</h4>
                  <p>Manage your email notification preferences</p>
                </div>
                <button className="secondary-button">Manage</button>
              </div>

              <div className="settings-option">
                <div className="option-info">
                  <h4>Language Preferences</h4>
                  <p>Change your preferred language</p>
                </div>
                <select className="settings-select">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="settings-option">
                <div className="option-info">
                  <h4>Privacy Settings</h4>
                  <p>Control who can see your profile information</p>
                </div>
                <button className="secondary-button">Manage Privacy</button>
              </div>

              <div className="danger-zone">
                <h4 className="danger-title">Danger Zone</h4>

                <div className="danger-option">
                  <div className="option-info">
                    <h4>Log Out of All Devices</h4>
                    <p>
                      This will log you out from all devices except this one
                    </p>
                  </div>
                  <button className="warning-button">
                    <LogoutIcon className="button-icon-small" />
                    Log Out Everywhere
                  </button>
                </div>

                <div className="danger-option">
                  <div className="option-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all your data</p>
                  </div>
                  <button
                    className="danger-button"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <TrashIcon className="button-icon-small" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Delete Account</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="Close"
              >
                <XIcon className="button-icon" />
              </button>
            </div>

            <div className="modal-content">
              <div className="warning-icon-container">
                <ExclamationCircleIcon className="warning-icon" />
              </div>

              <p className="modal-message">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently deleted.
              </p>

              <div className="modal-actions">
                <button
                  className="cancel-modal-button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className="delete-modal-button"
                  onClick={handleDeleteUser}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner-small"></span>
                  ) : (
                    <>
                      <TrashIcon className="button-icon-small" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
