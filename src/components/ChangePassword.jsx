import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (!u.has_usable_password) {
          setIsFirstLogin(true);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('auth/change-password/', {
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      // Update local user data
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          u.has_usable_password = true;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch (e) {
        // ignore
      }

      setSuccess('Password changed successfully! Redirecting to dashboard...');
      setFormData({ new_password: '', confirm_password: '' });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else if (data?.new_password) {
        setError(data.new_password[0]);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[600px] mx-auto">
      {/* First-login banner */}
      {isFirstLogin && (
        <div className="mb-6 rounded-2xl bg-primary/10 border border-primary/30 px-6 py-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <h3 className="font-semibold text-on-surface">Set Your Password</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              You logged in with an activation token. Please set a permanent password so you can log in easily next time.
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-8 md:p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-5xl text-primary">lock_reset</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
            {isFirstLogin ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            {isFirstLogin
              ? 'Create a strong password to secure your account.'
              : 'Enter your new password below.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="new_password">
              New Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                lock
              </span>
              <input
                id="new_password"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter new password (min. 8 characters)"
                required
                minLength={8}
                className="w-full rounded-xl border border-outline bg-surface-container pl-11 py-4 text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm_password">
              Confirm Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                lock_clock
              </span>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter your new password"
                required
                minLength={8}
                className="w-full rounded-xl border border-outline bg-surface-container pl-11 py-4 text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Password strength hint */}
          {formData.new_password && (
            <div className="text-xs text-on-surface-variant space-y-1">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-sm ${formData.new_password.length >= 8 ? 'text-green-400' : 'text-on-surface-variant/50'}`}>
                  {formData.new_password.length >= 8 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                At least 8 characters
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-sm ${formData.new_password === formData.confirm_password && formData.confirm_password ? 'text-green-400' : 'text-on-surface-variant/50'}`}>
                  {formData.new_password === formData.confirm_password && formData.confirm_password ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                Passwords match
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full rounded-xl bg-primary py-4 font-bold text-on-primary transition-all hover:brightness-110 active:scale-[0.985] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                {isFirstLogin ? 'Set Password' : 'Change Password'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
