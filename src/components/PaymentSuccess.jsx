import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment...');

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
          setMessage('Payment confirmed. Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setMessage('Payment not confirmed yet. Please wait a few moments.');
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage('Error verifying payment.');
      });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-surface-container rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Payment Status</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
