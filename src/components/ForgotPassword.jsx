import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('auth/forgot-password/', {
        email: email.trim(),
      });
      setSuccess(res.data.detail || 'Check your email for a reset link.');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Something went wrong. Please try again.'
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
            <span className="material-symbols-outlined text-4xl text-primary">lock_reset</span>
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-primary">Forgot Password?</h1>
          <p className="mt-2 text-on-surface-variant text-sm">
            Enter the email you used to register. We’ll send a reset link.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@email.com"
                className="w-full rounded-xl border border-outline bg-surface-container pl-11 py-4 text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-4 font-bold text-on-primary hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}