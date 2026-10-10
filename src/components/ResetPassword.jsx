import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!uid || !token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('auth/reset-password/', {
        uid,
        token,
        password,
        password2,
      });
      setSuccess(res.data.detail || 'Password updated.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Reset failed. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-surface-container-low rounded-2xl border border-outline-variant/30 p-8 md:p-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-4xl text-primary">password</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Set New Password</h1>
          <p className="mt-2 text-on-surface-variant text-sm">
            Choose a strong password for your TMBIS account.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-primary">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-outline bg-surface-container px-4 py-4 text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-outline bg-surface-container px-4 py-4 text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-4 font-bold text-on-primary hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}