import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment...');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    if (!reference) {
      setMessage('No payment reference provided.');
      return;
    }

    api.get('payments/verify/', { params: { reference } })
      .then((res) => {
        if (res.data?.status === 'success') {
          setIsVerified(true);
          setMessage('Payment confirmed! Redirecting to home...');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setMessage('Payment not confirmed yet. Please wait a few moments.');
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage('Error verifying payment. Please contact support.');
      });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-10 bg-surface-container rounded-2xl border border-outline-variant max-w-md w-full mx-4 shadow-xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className={`material-symbols-outlined text-5xl ${isVerified ? 'text-primary' : 'text-on-surface-variant'}`}>
            {isVerified ? 'check_circle' : 'hourglass_empty'}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-on-surface">Payment Status</h2>
        <p className="text-on-surface-variant mb-8">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined">home</span>
          Go to Home
        </Link>
      </div>
    </div>
  );
}
