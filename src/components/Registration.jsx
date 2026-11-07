import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { DEPARTMENTS } from '../constants/departments';
import { STUDY_CENTERS } from '../constants/studyCenters';

const inputClassName = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-on-surface" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Registration() {
  const [activeTab, setActiveTab] = useState('student');
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    contact_address: '',
    phone_number: '',
    whatsapp_number: '',
    gender: '',
    guarantor: '',
    guarantor_number: '',
    department: '',
    mode_of_entry: '',
    year_of_entry: '',
    level: '',
    matric_no: '',
    study_center: '',
  });
  const [lecturerForm, setLecturerForm] = useState({
    full_name: '',
    faculty: '',
    department: '',
    email: '',
    contact_address: '',
    phone_number: '',
    lecturer_id: '',
    lecturer_course_preferences: '',
    lecturer_level_preferences: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateLecturerField = (event) => {
    const { name, value } = event.target;
    setLecturerForm((current) => ({ ...current, [name]: value }));
  };

  const formatFullName = () => {
    const names = form.full_name.trim().split(/\s+/).filter(Boolean);
    if (!names.length) return;
    const formattedName = [names[0].toUpperCase(), ...names.slice(1).map((name) => name.toLowerCase())].join(' ');
    setForm((current) => ({ ...current, full_name: formattedName }));
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profilePicture) formData.append('profile_picture', profilePicture);

      await api.post('auth/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('student');
      setTimeout(() => navigate('/payment', {
        state: {
          email: form.email,
          mode_of_entry: form.mode_of_entry,
        },
      }), 1500);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLecturerSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('auth/register/lecturer/', lecturerForm);
      setSuccess('lecturer');
    } catch (requestError) {
      console.error(requestError);
      const data = requestError.response?.data;
      setError(
        typeof data === 'string'
          ? data
          : data?.detail ||
            Object.entries(data || {})
              .map(([field, messages]) => `${field.replaceAll('_', ' ')}: ${Array.isArray(messages) ? messages.join(' ') : messages}`)
              .join(' ') ||
            'Lecturer registration failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatLecturerName = () => {
    const names = lecturerForm.full_name.trim().split(/\s+/).filter(Boolean);
    if (!names.length) return;
    setLecturerForm((current) => ({
      ...current,
      full_name: [names[0].toUpperCase(), ...names.slice(1).map((name) => name.toLowerCase())].join(' '),
    }));
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-outline-variant bg-surface-container p-5 shadow-xl sm:p-8 lg:p-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Home
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface">
            {activeTab === 'student' ? 'Registration' : 'Lecturer Registration'}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {activeTab === 'student'
              ? 'Choose your registration type, then enter the required details.'
              : 'Submit your lecturer details for administrator review.'}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3" role="tablist" aria-label="Registration type">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'student'}
            onClick={() => { setActiveTab('student'); setError(''); setSuccess(''); }}
            className={`rounded-xl border px-4 py-3 font-semibold transition ${
              activeTab === 'student' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lecturer'}
            onClick={() => { setActiveTab('lecturer'); setError(''); setSuccess(''); }}
            className={`rounded-xl border px-4 py-3 font-semibold transition ${
              activeTab === 'lecturer' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'
            }`}
          >
            Lecturer
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {success ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 font-medium text-primary">
            {success === 'student'
              ? 'Details saved! Redirecting you to make payment...'
              : 'Your lecturer application has been submitted. An administrator will review it and email you a secure password setup link if approved.'}
          </div>
        ) : activeTab === 'student' ? (
          <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field label="Full name (surname first) *" htmlFor="full-name">
              <input
                id="full-name"
                name="full_name"
                value={form.full_name}
                onChange={updateField}
                onBlur={formatFullName}
                autoComplete="name"
                placeholder="SURNAME Firstname Othername"
                required
                className={inputClassName}
              />
              <span className="mt-1 block text-xs text-on-surface-variant">
                Surname will be uppercase; other names will be lowercase.
              </span>
            </Field>
            <Field label="Email *" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Contact address *" htmlFor="contact-address">
              <textarea
                id="contact-address"
                name="contact_address"
                value={form.contact_address}
                onChange={updateField}
                autoComplete="street-address"
                rows="2"
                required
                className={inputClassName}
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-2">
              <Field label="Contact number *" htmlFor="phone-number">
                <input
                  id="phone-number"
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={updateField}
                  autoComplete="tel"
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="WhatsApp number" htmlFor="whatsapp-number">
                <input
                  id="whatsapp-number"
                  name="whatsapp_number"
                  type="tel"
                  value={form.whatsapp_number}
                  onChange={updateField}
                  placeholder="If different from contact number"
                  className={inputClassName}
                />
              </Field>
            </div>
            <Field label="Gender *" htmlFor="gender">
              <select id="gender" name="gender" value={form.gender} onChange={updateField} required className={inputClassName}>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </Field>
            <Field label="Name of guardian *" htmlFor="guardian-name">
              <input
                id="guardian-name"
                name="guarantor"
                value={form.guarantor}
                onChange={updateField}
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Contact of guardian *" htmlFor="guardian-number">
              <input
                id="guardian-number"
                name="guarantor_number"
                type="tel"
                value={form.guarantor_number}
                onChange={updateField}
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Course of study *" htmlFor="department">
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={updateField}
                required
                className={inputClassName}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Programme type *" htmlFor="mode-of-entry">
              <select
                id="mode-of-entry"
                name="mode_of_entry"
                value={form.mode_of_entry}
                onChange={updateField}
                required
                className={inputClassName}
              >
                <option value="">Select mode of entry</option>
                <option value="utme">UTME — 5 years</option>
                <option value="direct_entry">Direct Entry — 4 years</option>
                <option value="top_up">Top Up — 2 years</option>
              </select>
            </Field>
            <Field label="Year of entry *" htmlFor="year-of-entry">
              <input
                id="year-of-entry"
                name="year_of_entry"
                value={form.year_of_entry}
                onChange={updateField}
                placeholder="2026 or 2026/2027"
                pattern="\d{4}(/\d{4})?"
                title="Enter a year such as 2026 or an academic year such as 2026/2027"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Study centre *" htmlFor="study-center">
              <select
                id="study-center"
                name="study_center"
                value={form.study_center}
                onChange={updateField}
                required
                className={inputClassName}
              >
                <option value="">Select study centre</option>
                {STUDY_CENTERS.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Current level *" htmlFor="level">
              <input
                id="level"
                name="level"
                value={form.level}
                onChange={updateField}
                placeholder="e.g. 100 level"
                required
                className={inputClassName}
              />
            </Field>
            <div className="md:col-span-2">
              <details className="rounded-2xl border border-outline-variant p-4">
                <summary className="cursor-pointer font-medium text-on-surface">
                  Additional details (optional)
                </summary>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Matric number" htmlFor="matric-no">
                    <input
                      id="matric-no"
                      name="matric_no"
                      value={form.matric_no}
                      onChange={updateField}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Profile photo (optional)" htmlFor="profile-picture" className="md:col-span-2">
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => setProfilePicture(event.target.files?.[0] || null)}
                      className={`${inputClassName} file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-on-primary`}
                    />
                    <span className="mt-1 block text-xs text-on-surface-variant">
                      You can add or change this later from your profile menu.
                    </span>
                  </Field>
                </div>
              </details>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              {submitting ? 'Submitting…' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLecturerSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field label="Full name (surname first) *" htmlFor="lecturer-full-name">
              <input
                id="lecturer-full-name"
                name="full_name"
                value={lecturerForm.full_name}
                onChange={updateLecturerField}
                onBlur={formatLecturerName}
                autoComplete="name"
                placeholder="SURNAME Firstname Othername"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Email *" htmlFor="lecturer-email">
              <input
                id="lecturer-email"
                name="email"
                type="email"
                value={lecturerForm.email}
                onChange={updateLecturerField}
                autoComplete="email"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Faculty *" htmlFor="lecturer-faculty">
              <input
                id="lecturer-faculty"
                name="faculty"
                value={lecturerForm.faculty}
                onChange={updateLecturerField}
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Department *" htmlFor="lecturer-department">
              <select
                id="lecturer-department"
                name="department"
                value={lecturerForm.department}
                onChange={updateLecturerField}
                required
                className={inputClassName}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </Field>
            <Field label="Contact address *" htmlFor="lecturer-address">
              <textarea
                id="lecturer-address"
                name="contact_address"
                value={lecturerForm.contact_address}
                onChange={updateLecturerField}
                autoComplete="street-address"
                rows="2"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Contact number *" htmlFor="lecturer-phone">
              <input
                id="lecturer-phone"
                name="phone_number"
                type="tel"
                value={lecturerForm.phone_number}
                onChange={updateLecturerField}
                autoComplete="tel"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Lecturer ID *" htmlFor="lecturer-id">
              <input
                id="lecturer-id"
                name="lecturer_id"
                value={lecturerForm.lecturer_id}
                onChange={updateLecturerField}
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Courses you handle (optional)" htmlFor="lecturer-courses">
              <textarea
                id="lecturer-courses"
                name="lecturer_course_preferences"
                value={lecturerForm.lecturer_course_preferences}
                onChange={updateLecturerField}
                rows="2"
                placeholder="For administrator reference; final assignments are set by the school."
                className={inputClassName}
              />
            </Field>
            <Field label="Levels you handle (optional)" htmlFor="lecturer-levels">
              <input
                id="lecturer-levels"
                name="lecturer_level_preferences"
                value={lecturerForm.lecturer_level_preferences}
                onChange={updateLecturerField}
                placeholder="e.g. 100, 200"
                className={inputClassName}
              />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              {submitting ? 'Submitting…' : 'Submit lecturer application'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
