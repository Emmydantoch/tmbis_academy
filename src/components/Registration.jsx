import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Registration() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [guarantor, setGuarantor] = useState('');
  const [guarantor_number, setGuarantorNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('auth/register/', {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone_number,
        guarantor: guarantor,
        guarantor_number: guarantor_number,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface-container rounded-lg border">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <div className="text-sm text-error mb-4">{JSON.stringify(error)}</div>}
        {success ? (
          <div className="text-green-600">Registration saved. Proceed to login after payment.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm">Phone number</label>
              <input value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm">Guarantor name</label>
              <input value={guarantor} onChange={(e) => setGuarantor(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm">Guarantor phone</label>
              <input value={guarantor_number} onChange={(e) => setGuarantorNumber(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <button type="submit" className="w-full py-2 bg-primary text-on-primary rounded">Register</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
