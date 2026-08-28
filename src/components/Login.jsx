import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const header = document.querySelector('header');

    const handleScroll = () => {
      if (!header) return;
      if (window.scrollY > 20) {
        header.classList.add('bg-surface/90', 'backdrop-blur-md', 'shadow-xl');
      } else {
        header.classList.remove('bg-surface/90', 'backdrop-blur-md', 'shadow-xl');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      // Store tokens + user info
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      const user = response.data.user;
      const justActivated = response.data.just_activated;

      if (user.is_staff || user.is_superuser) {
        navigate('/admin/dashboard');   // Admin Dashboard
      } else if (justActivated) {
        navigate('/dashboard/change-password');  // First login — set password
      } else {
        navigate('/dashboard');         // Student Dashboard
      }

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant/10 bg-surface transition-all duration-200 ease-in-out">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-margin-desktop">
          <div className="flex items-center gap-base">
            <img
              src="https://res-console.cloudinary.com/o68u6tlz/thumbnails/v1/image/upload/v1785240187/VE1CSVNfTG9nb195dW12ejY=/drilldown"
              alt="TMBIS Academy logo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-headline-lg text-headline-lg font-bold text-primary">
              TMBIS Academy
            </span>
          </div>

          <div className="hidden items-center gap-xl md:flex">
            <Link to="/" className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary">
              Programs
            </Link>
          </div>

          <div className="flex items-center gap-md">
            <Link to="/login" className="hidden font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary md:block">
              Login
            </Link>
            <Link to="/apply" className="rounded-lg bg-primary-fixed px-md py-sm font-bold text-on-primary transition-all hover:brightness-110">
              Enroll Now
            </Link>
          </div>
        </nav>
      </header>

      {/* Login Content */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-8 md:p-10 shadow-xl backdrop-blur-sm">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-5xl text-primary">school</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                Welcome Back
              </h1>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Login to access your student portal, only after successful Tuition Payment.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    mail
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@tmbis.edu"
                    required
                    className="w-full rounded-xl border border-outline bg-surface-container pl-11 py-4 text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                  Token 
                  </label>
                  <a href="#" className="font-label-md text-primary hover:underline transition-all">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    lock
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password or Activation Token"
                    required
                    className="w-full rounded-xl border border-outline bg-surface-container pl-11 py-4 text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full rounded-xl bg-primary py-4 font-bold text-on-primary transition-all hover:brightness-110 active:scale-[0.985] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 border-t border-outline-variant"></div>
              <span className="font-body-sm text-on-surface-variant">OR</span>
              <div className="flex-1 border-t border-outline-variant"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-outline py-3 hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">g_mobiledata</span>
                <span className="font-body-md">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-outline py-3 hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">apple</span>
                <span className="font-body-md">Apple</span>
              </button>
            </div>

            <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
              New to TMBIS Academy?{' '}
              <Link to="/apply" className="text-primary hover:underline font-medium">
                Enroll Now
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-on-surface-variant/70">
            © 2026 TMBIS Academy of Research. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}