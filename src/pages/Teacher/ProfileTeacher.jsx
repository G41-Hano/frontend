import { useState, useEffect } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    avatar: null,
    username: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProfile(response.data);
      setFormData({
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        avatar: null,
        username: response.data.username
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN);
        navigate('/login');
      } else {
        setError('Failed to load profile information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };

  // Clean up preview URL when component unmounts or when editing is cancelled
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleCancel = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    setIsEditing(false);
    setFormData({
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar: null,
      username: profile.username
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await api.put('/api/profile/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      setIsEditing(false);
      setError(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Update user context with new profile data
      updateUser(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN);
        navigate('/login');
      } else {
        setError('Failed to update profile information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#EEF1F5] to-[#E6E9FF]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#4C53B4] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-user text-[#4C53B4] text-2xl animate-pulse"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-400 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check-circle text-xl"></i>
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#4C53B4] mb-2 flex items-center gap-2">
                <i className="fa-solid fa-user-circle text-[#4C53B4]"></i>
                Profile Settings
              </h1>
              <p className="text-[#4C53B4]">Manage your personal information</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="group px-6 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-pen-to-square group-hover:rotate-12 transition-transform"></i>
                  Edit Profile
                </span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl animate-shake border-2 border-red-200">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-xl"></i>
                {error}
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF6B6B]/20 transition-all duration-300 group-hover:border-[#FF6B6B]/40 group-hover:scale-105 group-hover:rotate-3">
                    {avatarPreview || profile?.avatar ? (
                      <img
                        src={avatarPreview || profile?.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4C53B4] flex items-center justify-center text-white text-4xl font-bold">
                        {profile?.first_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-2 right-2 bg-[#FF6B6B] text-white p-2 rounded-full cursor-pointer hover:bg-[#FF8E8E] transition-all duration-300 transform hover:scale-110 shadow-lg hover:rotate-12"
                  >
                    <i className="fa-solid fa-camera text-lg"></i>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-[#4C53B4] mb-2">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <div className="inline-block px-4 py-2 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full text-sm font-medium">
                    {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                  </div>
                </div>
              </div>

              <div 
                className={`relative p-4 rounded-2xl transition-all duration-300 ${
                  hoveredField === 'username' ? 'bg-[#FF6B6B]/5' : 'bg-[#E6F3FF]'
                } hover:scale-[1.02]`}
                onMouseEnter={() => setHoveredField('username')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                  <i className="fa-solid fa-user mr-2"></i>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all bg-white"
                  disabled
                />
                {hoveredField === 'username' && (
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#FF6B6B] rounded-full animate-ping"></div>
                )}
                <p className="text-sm text-[#4C53B4] mt-1">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Username cannot be changed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    hoveredField === 'first_name' ? 'bg-[#FF6B6B]/5' : 'bg-[#E6F3FF]'
                  } hover:scale-[1.02]`}
                  onMouseEnter={() => setHoveredField('first_name')}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                    <i className="fa-solid fa-signature mr-2"></i>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all bg-white"
                  />
                  {hoveredField === 'first_name' && (
                    <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#FF6B6B] rounded-full animate-ping"></div>
                  )}
                </div>
                <div 
                  className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    hoveredField === 'last_name' ? 'bg-[#FF6B6B]/5' : 'bg-[#E6F3FF]'
                  } hover:scale-[1.02]`}
                  onMouseEnter={() => setHoveredField('last_name')}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                    <i className="fa-solid fa-signature mr-2"></i>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all bg-white"
                  />
                  {hoveredField === 'last_name' && (
                    <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#FF6B6B] rounded-full animate-ping"></div>
                  )}
                </div>
              </div>

              <div 
                className={`relative p-4 rounded-2xl transition-all duration-300 ${
                  hoveredField === 'email' ? 'bg-[#FF6B6B]/5' : 'bg-[#E6F3FF]'
                } hover:scale-[1.02]`}
                onMouseEnter={() => setHoveredField('email')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                  <i className="fa-solid fa-envelope mr-2"></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all bg-white"
                />
                {hoveredField === 'email' && (
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#FF6B6B] rounded-full animate-ping"></div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border-2 border-[#FF6B6B]/20 text-[#FF6B6B] rounded-xl hover:bg-[#FF6B6B]/5 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-check"></i>
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF6B6B]/20 transition-all duration-300 group-hover:border-[#FF6B6B]/40 group-hover:scale-105 group-hover:rotate-3">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4C53B4] flex items-center justify-center text-white text-4xl font-bold">
                        {profile?.first_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-[#4C53B4] mb-2">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <div className="inline-block px-4 py-2 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full text-sm font-medium">
                    {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#E6F3FF] rounded-2xl hover:bg-[#FF6B6B]/5 transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                  <i className="fa-solid fa-user mr-2"></i>
                  Username
                </label>
                <p className="text-[#FF6B6B] text-lg">{profile?.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#E6F3FF] rounded-2xl hover:bg-[#FF6B6B]/5 transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                    <i className="fa-solid fa-signature mr-2"></i>
                    First Name
                  </label>
                  <p className="text-[#FF6B6B] text-lg">{profile?.first_name}</p>
                </div>
                <div className="p-4 bg-[#E6F3FF] rounded-2xl hover:bg-[#FF6B6B]/5 transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                    <i className="fa-solid fa-signature mr-2"></i>
                    Last Name
                  </label>
                  <p className="text-[#FF6B6B] text-lg">{profile?.last_name}</p>
                </div>
              </div>

              <div className="p-4 bg-[#E6F3FF] rounded-2xl hover:bg-[#FF6B6B]/5 transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-[#4C53B4] mb-1">
                  <i className="fa-solid fa-envelope mr-2"></i>
                  Email
                </label>
                <p className="text-[#FF6B6B] text-lg">{profile?.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 