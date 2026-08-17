import { useState } from 'react';
import api from '../api/axios'; // make sure this path is correct

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post('contact/', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (response.status === 201) {
        setShowSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });

        // Hide success message after 4 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container rounded-3xl p-8 md:p-12 border border-outline-variant relative overflow-hidden min-h-[620px] flex flex-col">
            {!showSuccess ? (
              <>
                <div className="mb-10">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                    Inquiry Portal
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
                    Get in Touch
                  </h2>
                  <p className="text-on-surface-variant mt-3">
                    Our team is ready to assist you.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-6 py-4 focus:border-primary focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-6 py-4 focus:border-primary focus:outline-none"
                        placeholder="john.doe@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-on-surface-variant mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-6 py-4 focus:border-primary focus:outline-none"
                      placeholder="Technical Support, Partnership..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-on-surface-variant mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="7"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-3xl px-6 py-5 focus:border-primary focus:outline-none resize-y"
                      placeholder="Describe your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-on-primary font-bold rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">
                          progress_activity
                        </span>
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Animation */
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-28 h-28 rounded-full bg-green-500/10 flex items-center justify-center mb-8 animate-pulse">
                  <span className="material-symbols-outlined text-7xl text-green-400">
                    check_circle
                  </span>
                </div>
                <h3 className="text-4xl font-bold text-primary mb-3">
                  Message Received!
                </h3>
                <p className="text-on-surface-variant max-w-xs text-lg">
                  Thank you. Our team will respond within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info + Maps */}
        <div className="lg:col-span-5 space-y-8">
          {/* Support Hours */}
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant">
            <h3 className="font-bold text-xl mb-6">Support Hours</h3>
            <div className="space-y-6">
              <div>
                <p className="font-medium text-primary">Global Technical Support</p>
                <p className="text-on-surface-variant">Mon – Fri, 09:00 – 18:00 UTC</p>
              </div>
              <div>
                <p className="font-medium text-primary">Emergency Line</p>
                <p className="text-on-surface-variant">24/7 for Critical Issues</p>
              </div>
            </div>
          </div>

          {/* Map Placeholders */}
          <div className="space-y-6">
            {/* San Francisco */}
            <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant">
              <div className="h-48 bg-gradient-to-br from-blue-950 to-cyan-950 relative">
                <div className="absolute inset-0 bg-[radial-gradient(#64ffda_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  HEADQUARTERS
                </div>
                <div className="absolute bottom-4 right-4 text-white text-right">
                  <p className="font-bold">San Francisco</p>
                  <p className="text-xs opacity-75">The Silicon Reef</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-on-surface-variant">
                  450 Tech Avenue, Suite 100
                  <br />
                  San Francisco, CA 94105
                </p>
                <p className="mt-4 text-primary font-medium">+1 (555) 012-9876</p>
              </div>
            </div>

            {/* London */}
            <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant">
              <div className="h-48 bg-gradient-to-br from-indigo-950 to-blue-950 relative">
                <div className="absolute inset-0 bg-[radial-gradient(#64ffda_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  EUROPEAN HUB
                </div>
                <div className="absolute bottom-4 right-4 text-white text-right">
                  <p className="font-bold">London</p>
                  <p className="text-xs opacity-75">The Atlantic Trench</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-on-surface-variant">
                  12 High Street, Innovation Quarter
                  <br />
                  London, EC1V 2NX
                </p>
                <p className="mt-4 text-primary font-medium">euro-desk@academiapro.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}