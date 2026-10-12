import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const getAvatarUrl = (profile) =>
  profile?.avatar || profile?.profile_picture || profile?.avatar_url || null;

export default function ProfileAvatarMenu({
  profile,
  onProfileUpdate,
  avatarClassName = 'h-9 w-9',
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('');
  const profileMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  const userName =
    fullName ||
    profile?.full_name ||
    profile?.username ||
    profile?.email?.split('@')[0] ||
    'User';
  const initials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = getAvatarUrl(profile);
  const roleLabel =
    profile?.is_admin ||
    profile?.is_staff ||
    profile?.is_superuser ||
    profile?.role === 'admin' ||
    profile?.role === 'superuser'
      ? 'Administrator'
      : profile?.role === 'lecturer' || profile?.role === 'teacher' || profile?.role === 'instructor'
        ? 'Lecturer'
        : 'Student';

  useEffect(() => {
    let active = true;
    api.get('auth/profile/')
      .then((response) => {
        if (active) {
          onProfileUpdate((currentProfile) => ({
            ...currentProfile,
            ...response.data,
          }));
        }
      })
      .catch((requestError) => {
        console.error('Failed to load user profile:', requestError);
      });
    return () => {
      active = false;
    };
  }, [onProfileUpdate]);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (event.type === 'keydown' && event.key === 'Escape') {
        setOpen(false);
      } else if (
        event.type === 'pointerdown' &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeProfileMenu);
    document.addEventListener('keydown', closeProfileMenu);
    return () => {
      document.removeEventListener('pointerdown', closeProfileMenu);
      document.removeEventListener('keydown', closeProfileMenu);
    };
  }, []);

  const saveProfile = (updatedProfile) => {
    const nextProfile = { ...(profile || {}), ...updatedProfile };
    localStorage.setItem('user', JSON.stringify(nextProfile));
    onProfileUpdate(nextProfile);
    setFailedAvatarUrl('');
  };

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setSaving(true);
    setError('');
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await api.patch('auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      saveProfile(response.data);
    } catch (requestError) {
      console.error('Failed to upload profile photo:', requestError);
      setError(
        requestError.response?.data?.avatar?.[0] ||
        requestError.response?.data?.detail ||
        'Unable to upload your photo. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await api.delete('auth/profile/');
      saveProfile(response.data);
    } catch (requestError) {
      console.error('Failed to remove profile photo:', requestError);
      setError(
        requestError.response?.data?.detail ||
        'Unable to remove your photo. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex ${avatarClassName} items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-low text-sm font-semibold text-primary hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary`}
      >
        {avatarUrl && failedAvatarUrl !== avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailedAvatarUrl(avatarUrl)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Profile menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl"
        >
          <div className="border-b border-outline-variant px-4 py-3">
            <p className="truncate text-sm font-semibold text-on-surface">{userName}</p>
            {profile?.email && (
              <p className="truncate text-xs text-on-surface-variant">{profile.email}</p>
            )}
            <p className="mt-1 text-xs text-on-surface-variant">{roleLabel}</p>
          </div>
          {error && (
            <p role="alert" className="px-4 pt-3 text-xs text-error">
              {error}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoSelected}
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-container disabled:opacity-60"
          >
            <span className="material-symbols-outlined">
              {saving ? 'progress_activity' : 'photo_camera'}
            </span>
            <span>{saving ? 'Saving photo...' : avatarUrl ? 'Change photo' : 'Add profile photo'}</span>
          </button>
          {avatarUrl && (
            <button
              type="button"
              disabled={saving}
              onClick={handleRemovePhoto}
              className="flex w-full items-center gap-3 border-t border-outline-variant px-4 py-3 text-left text-sm text-error hover:bg-surface-container disabled:opacity-60"
            >
              <span className="material-symbols-outlined">delete</span>
              <span>Remove photo</span>
            </button>
          )}
          {profile?.is_admin ||
          profile?.is_staff ||
          profile?.is_superuser ||
          profile?.role === 'admin' ||
          profile?.role === 'superuser' ? (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
              }}
              className="flex w-full items-center gap-3 border-t border-outline-variant px-4 py-3 text-left text-sm text-error hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Log out</span>
            </button>
          ) : null}
        </section>
      )}
    </div>
  );
}
