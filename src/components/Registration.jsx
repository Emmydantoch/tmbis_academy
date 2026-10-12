import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Registration() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
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
      const formData = new FormData();
      formData.append('email', email);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone_number', phone_number);
      formData.append('guarantor', guarantor);
      formData.append('guarantor_number', guarantor_number);
      if (profilePicture) formData.append('profile_picture', profilePicture);

      await api.post('auth/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/payment'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface-container rounded-lg border">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Home
        </Link>
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <div className="text-sm text-error mb-4">{JSON.stringify(error)}</div>}
        {success ? (
        <div className="text-green-600 font-medium">
            ✅ Details saved! Redirecting you to make payment...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface font-medium placeholder:text-on-surface-variant" />
            </div>
            <div>
              <label className="block text-sm">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface font-medium placeholder:text-on-surface-variant" />
            </div>
            <div>
              <label className="block text-sm">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface font-medium placeholder:text-on-surface-variant" />
            </div>
            <div>
              <label className="block text-sm" htmlFor="profile-picture">Profile photo (optional)</label>
              <input
                id="profile-picture"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-on-primary"
              />
              <p className="mt-1 text-xs text-on-surface-variant">You can add or change this later from your profile menu.</p>
            </div>
            <div>
              <label className="block text-sm">Phone number</label>
              <input value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface font-medium placeholder:text-on-surface-variant" />
            </div>
            <div>
              <label className="block text-sm">Guarantor name</label>
              <input value={guarantor} onChange={(e) => setGuarantor(e.target.value)} className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface font-medium placeholder:text-on-surface-variant" />
            </div>
            <div>
              <label className="block text-sm">Guarantor phone</label>
              <input value={guarantor_number} onChange={(e) => setGuarantorNumber(e.target.value)} className="w-full px-3 py-2 rounded border bg-surface-container-lowest text-on-surface font-medium placeholder:text-on-surface-variant" />
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
