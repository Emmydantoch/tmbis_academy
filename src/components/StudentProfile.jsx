import { useEffect, useState } from 'react';
import api from '../api/axios';
import { STUDY_CENTERS } from '../constants/studyCenters';

const editableFields = [
  'full_name',
  'contact_address',
  'phone_number',
  'whatsapp_number',
  'gender',
  'guarantor',
  'guarantor_number',
  'department',
  'mode_of_entry',
  'year_of_entry',
  'level',
  'study_center',
];

const inputClassName = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function getProfileForm(profile) {
  return Object.fromEntries(
    editableFields.map((field) => [field, profile[field] || ''])
  );
}

function ProfileField({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-on-surface">
        {label}
      </label>
      {children}
    </div>
  );
}

function getErrorMessage(data) {
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field.replaceAll('_', ' ')}: ${Array.isArray(messages) ? messages.join(' ') : messages}`)
      .join(' ');
  }
  return 'Unable to save your profile. Please try again.';
}

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    api.get('auth/profile/')
      .then(({ data }) => {
        if (!active) return;
        setProfile(data);
        setForm(getProfileForm(data));
      })
      .catch((requestError) => {
        console.error('Failed to load student profile:', requestError);
        if (active) setError(getErrorMessage(requestError.response?.data));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setSuccess('');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch('auth/profile/', form);
      setProfile(data);
      setForm(getProfileForm(data));
      localStorage.setItem('user', JSON.stringify({
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        ...data,
      }));
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
      setSuccess('Your profile has been updated.');
    } catch (requestError) {
      console.error('Failed to update student profile:', requestError);
      setError(getErrorMessage(requestError.response?.data));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-10">
      <section className="rounded-3xl border border-outline-variant bg-surface-container p-5 sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Personal and study details</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Update your contact and student information. Your email and matric number can’t be changed here.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
              {success}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-on-surface-variant">Loading your profile…</p>
          ) : profile ? (
            <form onSubmit={saveProfile} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <ProfileField label="Full name (surname first)" htmlFor="profile-full-name">
                <input
                  id="profile-full-name"
                  name="full_name"
                  value={form.full_name}
                  onChange={updateField}
                  autoComplete="name"
                  required
                  placeholder="SURNAME Firstname Othername"
                  className={inputClassName}
                />
              </ProfileField>
              <ProfileField label="Email (not editable)" htmlFor="profile-email">
                <input id="profile-email" value={profile.email || ''} readOnly className={`${inputClassName} cursor-not-allowed opacity-70`} />
              </ProfileField>
              <ProfileField label="Contact address" htmlFor="profile-address">
                <textarea
                  id="profile-address"
                  name="contact_address"
                  value={form.contact_address}
                  onChange={updateField}
                  autoComplete="street-address"
                  rows="3"
                  className={inputClassName}
                />
              </ProfileField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ProfileField label="Contact number" htmlFor="profile-phone">
                  <input
                    id="profile-phone"
                    name="phone_number"
                    type="tel"
                    value={form.phone_number}
                    onChange={updateField}
                    autoComplete="tel"
                    className={inputClassName}
                  />
                </ProfileField>
                <ProfileField label="WhatsApp number" htmlFor="profile-whatsapp">
                  <input
                    id="profile-whatsapp"
                    name="whatsapp_number"
                    type="tel"
                    value={form.whatsapp_number}
                    onChange={updateField}
                    className={inputClassName}
                  />
                </ProfileField>
              </div>
              <ProfileField label="Gender" htmlFor="profile-gender">
                <select id="profile-gender" name="gender" value={form.gender} onChange={updateField} className={inputClassName}>
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </ProfileField>
              <ProfileField label="Name of guardian" htmlFor="profile-guardian">
                <input id="profile-guardian" name="guarantor" value={form.guarantor} onChange={updateField} className={inputClassName} />
              </ProfileField>
              <ProfileField label="Contact of guardian" htmlFor="profile-guardian-phone">
                <input id="profile-guardian-phone" name="guarantor_number" type="tel" value={form.guarantor_number} onChange={updateField} className={inputClassName} />
              </ProfileField>
              <ProfileField label="Course of study" htmlFor="profile-course">
                <input id="profile-course" name="department" value={form.department} onChange={updateField} className={inputClassName} />
              </ProfileField>
              <ProfileField label="Programme type" htmlFor="profile-entry-mode">
                <select id="profile-entry-mode" name="mode_of_entry" value={form.mode_of_entry} onChange={updateField} className={inputClassName}>
                  <option value="">Select mode of entry</option>
                  <option value="utme">UTME — 5 years</option>
                  <option value="direct_entry">Direct Entry — 4 years</option>
                  <option value="top_up">Top Up — 2 years</option>
                </select>
              </ProfileField>
              <ProfileField label="Year of entry" htmlFor="profile-entry-year">
                <input
                  id="profile-entry-year"
                  name="year_of_entry"
                  value={form.year_of_entry}
                  onChange={updateField}
                  placeholder="2026 or 2026/2027"
                  pattern="\d{4}(/\d{4})?"
                  title="Enter a year such as 2026 or an academic year such as 2026/2027"
                  className={inputClassName}
                />
              </ProfileField>
              <ProfileField label="Current level" htmlFor="profile-level">
                <input id="profile-level" name="level" value={form.level} onChange={updateField} className={inputClassName} />
              </ProfileField>
              <ProfileField label="Study centre" htmlFor="profile-study-center">
                <select
                  id="profile-study-center"
                  name="study_center"
                  value={form.study_center}
                  onChange={updateField}
                  className={inputClassName}
                >
                  <option value="">Select study centre</option>
                  {form.study_center && !STUDY_CENTERS.includes(form.study_center) && (
                    <option value={form.study_center}>
                      {form.study_center} (existing value)
                    </option>
                  )}
                  {STUDY_CENTERS.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="Matric number (not editable)" htmlFor="profile-matric">
                <input id="profile-matric" value={profile.matric_no || ''} readOnly className={`${inputClassName} cursor-not-allowed opacity-70`} />
              </ProfileField>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
                >
                  {saving ? 'Saving changes…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-on-surface-variant">Your profile could not be loaded.</p>
          )}
      </section>
    </div>
  );
}
