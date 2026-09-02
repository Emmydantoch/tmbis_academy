import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';   // the axios instance we created

export default function AdmissionForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    program: '',
    level: '',
    previousEducation: '',
    startTerm: '',
    motivation: '',
    howDidYouHear: '',
    agreeTerms: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Auto-redirect to home after 4 seconds when application is submitted
    useEffect(() => {
        if (submitted) {
            const timer = setTimeout(() => {
                navigate('/');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [submitted, navigate]);

    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
    };

        // inside the component
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        await api.post('apply/', formData);
        setSubmitted(true);
        } catch (error) {
        console.error(error);
        alert('Something went wrong. Please try again.');
        } finally {
        setIsSubmitting(false);
        }
        };

    // Submission state is managed by handleSubmit.

    if (submitted) {
    return (
        <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
        <div className="bg-surface-container max-w-lg w-full rounded-3xl p-12 text-center border border-outline-variant">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary">check_circle</span>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">Application Submitted!</h2>
            <p className="text-on-surface-variant mb-8">
            Thank you for applying to TMBIS Academy. Our admissions team will review your application and contact you within 5–7 business days.
            </p>
            <p className="text-sm text-on-surface-variant mb-6">
            Redirecting to home page in a few seconds...
            </p>
            <button
            onClick={() => navigate('/')}
            className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold hover:brightness-110 transition-all"
            >
            Go to Home Now
            </button>
        </div>
        </div>
    );
    }

    return (
    <div className="min-h-screen bg-background text-on-surface flex">
        {/* Sidebar */}
        <nav className="hidden md:flex w-64 flex-col h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-20 p-4">
        <div className="mb-8 px-2">
            <h1 className="font-headline-lg font-bold text-primary">TMBIS Academy</h1>
            <p className="text-on-surface-variant text-sm">Student Portal</p>
        </div>

        <div className="flex-1 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all">
            <span className="material-symbols-outlined">Home</span>
            <span>Home</span>
            </Link>
            <Link to="/contact" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all">
            <span className="material-symbols-outlined">contact_support</span>
            <span>Contact Us</span>
            </Link>
        </div>
        </nav>


        {/* Main Content */}
        <div className="flex-1 md:ml-64">
        <header className="h-16 bg-surface border-b border-outline-variant flex items-center px-6 sticky top-0 z-10">
            <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden p-2 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md font-bold text-primary">Admission Application</h1>
            </div>
        </header>

        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
            <h2 className="text-3xl font-bold text-primary mb-3">Apply for Admission</h2>
            <p className="text-on-surface-variant text-lg">
                Complete the form below to begin your journey at TMBIS Academy. All fields marked with * are required.
            </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Information */}
            <section className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">person</span>
                Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">First Name *</label>
                    <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    placeholder="Femi"
                    />
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Last Name *</label>
                    <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    placeholder="Adewale"
                    />
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Email Address *</label>
                    <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    placeholder="femi@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Phone Number *</label>
                    <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    placeholder="+1 555 123 4567"
                    />
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Date of Birth *</label>
                    <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Gender</label>
                    <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                    </select>
                </div>
                </div>
            </section>

            {/* Academic Information */}
            <section className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">school</span>
                Academic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Preferred Program *</label>
                    <select
                    name="program"
                    required
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    >
                    <option value="">Select Program</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="data-science">Data Science & AI</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="business">Business Administration</option>
                    <option value="research">Research Methods</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Level of Study *</label>
                    <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    >
                    <option value="">Select Level</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate / Masters</option>
                    <option value="doctorate">Doctorate / PhD</option>
                    <option value="certificate">Professional Certificate</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm text-on-surface-variant mb-2">Previous Education / Highest Qualification *</label>
                    <input
                    type="text"
                    name="previousEducation"
                    required
                    value={formData.previousEducation}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    placeholder="e.g. High School Diploma, BSc Computer Science..."
                    />
                </div>

                <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Preferred Start Term *</label>
                    <select
                    name="startTerm"
                    required
                    value={formData.startTerm}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none"
                    >
                    <option value="">Select Term</option>
                    <option value="2026/2027 Academic Session">2026/2027 Academic Session</option>
                    <option value="First Semester (2026/2027)">First Semester (2026/2027)</option>
                    <option value="Second Semester (2026/2027)">Second Semester (2026/2027)</option>
                    </select>
                </div>
                </div>
            </section>

            {/* Motivation */}
            <section className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">edit_note</span>
                Motivation Statement
                </h3>

                <div>
                <label className="block text-sm text-on-surface-variant mb-2">
                    Why do you want to join TMBIS Academy? *
                </label>
                <textarea
                    name="motivation"
                    required
                    rows="5"
                    value={formData.motivation}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 focus:border-primary focus:outline-none resize-y"
                    placeholder="Tell us about your goals, interests, and what you hope to achieve..."
                />
                </div>
            </section>

            {/* Agreement */}
            <div className="flex items-start gap-4">
                <input
                type="checkbox"
                name="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-5 h-5 accent-primary"
                />
                <label className="text-sm text-on-surface-variant">
                I confirm that the information provided is accurate and I agree to the 
                <a href="#" className="text-primary hover:underline mx-1">Terms of Service</a> 
                and 
                <a href="#" className="text-primary hover:underline mx-1">Privacy Policy</a> of TMBIS Academy.
                </label>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-primary text-on-primary font-bold rounded-2xl text-lg hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
                {isSubmitting ? (
                <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Submitting Application...
                </>
                ) : (
                <>
                    Submit Application
                    <span className="material-symbols-outlined">send</span>
                </>
                )}
            </button>
            </form>
        </div>
        </div>
    </div>
    );
    }

    function NavItem({ icon, label, active = false }) {
    return (
    <a
        href="#"
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
        active ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'
        }`}
    >
        <span className="material-symbols-outlined">{icon}</span>
        <span>{label}</span>
    </a>
    );
}