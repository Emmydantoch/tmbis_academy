import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { EXAM_FEE, PROGRAMME_TYPES } from '../constants/programmeFees';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [storedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [modeOfEntry, setModeOfEntry] = useState(
    location.state?.mode_of_entry || storedUser?.mode_of_entry || ''
  );
  const [paymentType, setPaymentType] = useState('Tuition Installment 1/2');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(location.state?.email || storedUser?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transferPending, setTransferPending] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const selectedProgramme = PROGRAMME_TYPES.find(
    (programme) => programme.value === modeOfEntry
  );
  const amount = paymentType === 'Exam Fee'
    ? EXAM_FEE
    : (selectedProgramme?.fee || 0) / 2;
  const formatCurrency = (value) => `₦${value.toLocaleString('en-NG')}`;

  useEffect(() => {
    if (!localStorage.getItem('access_token')) return;

    let active = true;
    api.get('payments/status/')
      .then(({ data }) => {
        if (!active) return;
        setPaymentStatus(data);
        if (data.installment_1_paid && !data.installment_2_paid) {
          setPaymentType('Tuition Installment 2/2');
        } else if (data.tuition_complete && !data.exam_fee_paid) {
          setPaymentType('Exam Fee');
        }
      })
      .catch((requestError) => {
        console.error('Unable to load semester payment status:', requestError);
        if (active) setStatusError('Could not load your semester payment status.');
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!email) {
        setError('Please enter your email address');
        return;
      }

      setIsProcessing(true);

      try {
        const response = await api.post('payments/initialize/', {
          email: email,
          mode_of_entry: modeOfEntry,
          payment_type: paymentType,
          payment_method: paymentMethod,
        });

        const { reference, authorization_url } = response.data;
        setPaymentReference(reference);

        if (paymentMethod === 'card') {
          window.location.href = authorization_url;
        } else {
          setTransferPending(true);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to initialize payment. Please try again.'
        );
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar */}
      <nav className="hidden md:flex w-64 flex-col h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-20 p-4">
        <div className="mb-8 px-2">
          <h1 className="font-headline-lg font-bold text-primary">TMBIS Academy</h1>
          <p className="text-on-surface-variant text-sm">Student Portal</p>
        </div>

        <div className="flex-1 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">Home</span>
            <span>Home</span>
          </Link>
          <Link
            to="/dashboard/payment"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary text-on-primary transition-all"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Payments</span>
          </Link>
          

          <Link
            to="/contact"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">contact_support</span>
            <span>Contact Us</span>
          </Link>
        </div>

        <div className="mt-auto pt-6 border-t border-outline-variant space-y-1">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="h-16 bg-surface border-b border-outline-variant flex items-center px-6 sticky top-0 z-10">
          <h1 className="font-headline-md font-bold text-primary">Payments &amp; Billing</h1>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          {/* Balance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container p-8 rounded-2xl border border-outline-variant">
              <p className="uppercase tracking-widest text-primary-fixed text-sm font-medium">
                Semester Fees
              </p>
              <h2 className="text-5xl font-bold text-primary mt-2 mb-4">
                {formatCurrency(selectedProgramme?.fee || 0)}
              </h2>
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-high text-on-surface px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">event_busy</span>
                  Tuition paid: {formatCurrency(Number(paymentStatus?.tuition_paid || 0))}
                </div>
                <p className="text-on-surface-variant">
                  Exam fee: {paymentStatus?.exam_fee_paid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant flex flex-col justify-center">
              <h3 className="font-semibold mb-4">Upcoming</h3>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <div>
                    <p>Programme tuition fee</p>
                    <p className="text-sm text-on-surface-variant">
                      {selectedProgramme?.label || 'Select your programme type'}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    {formatCurrency(selectedProgramme?.fee || 0)}
                  </p>
                </div>
                <div className="flex justify-between opacity-75">
                  <div>
                    <p>Exam Fee</p>
                    <p className="text-sm text-on-surface-variant">
                      {paymentStatus?.first_exam_at
                        ? new Date(paymentStatus.first_exam_at).toLocaleDateString()
                        : 'Scheduled by the school'}
                    </p>
                  </div>
                  <p className="font-bold">{formatCurrency(EXAM_FEE)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Make Payment Section */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-3 bg-surface-container p-8 rounded-2xl border border-outline-variant">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-primary">Make a Payment</h3>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-surface-container-high rounded text-xs">VISA</div>
                  <div className="px-3 py-1 bg-surface-container-high rounded text-xs">MC</div>
                  <div className="px-3 py-1 bg-surface-container-high rounded text-xs">Transfer</div>
                </div>
              </div>

              {paymentStatus?.tuition_complete && paymentStatus?.exam_fee_paid ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 text-on-surface">
                  <h4 className="text-lg font-bold text-primary">
                    All semester payments are complete
                  </h4>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Your tuition and exam fee have both been paid.
                  </p>
                </div>
              ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                  {error && (
                    <div className="rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                      {error}
                    </div>
                  )}
                  {statusError && (
                    <div role="alert" className="rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                      {statusError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="student@tmbis.edu"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Programme type</label>
                      <select
                      value={modeOfEntry}
                      onChange={(event) => setModeOfEntry(event.target.value)}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                      >
                      <option value="">Select programme type</option>
                      {PROGRAMME_TYPES.map((programme) => (
                        <option key={programme.value} value={programme.value}>
                          {programme.label} — {formatCurrency(programme.fee)}
                        </option>
                      ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Payment For</label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                      >
                        <option
                          value="Tuition Installment 1/2"
                          disabled={Boolean(paymentStatus?.installment_1_paid)}
                        >
                          Tuition installment 1 of 2
                        </option>
                        <option
                          value="Tuition Installment 2/2"
                          disabled={
                            !paymentStatus?.installment_1_paid ||
                            Boolean(paymentStatus?.installment_2_paid)
                          }
                        >
                          Tuition installment 2 of 2
                        </option>
                        <option value="Exam Fee" disabled={Boolean(paymentStatus?.exam_fee_paid)}>
                          Exam Fee
                        </option>
                      </select>
                    </div>
                  </div>
                  <p className="rounded-xl bg-surface-container-lowest border border-outline-variant px-4 py-3 text-on-surface">
                    Amount due: <strong>{formatCurrency(amount)}</strong>
                    {paymentType !== 'Exam Fee' && ' (one half of tuition)'}
                  </p>

                  <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4">
                    <p className="text-sm text-on-surface-variant">Step {step} of 2</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-on-surface">
                      <div className={`rounded-2xl p-3 ${step === 1 ? 'bg-primary/10 border border-primary' : 'bg-surface-container'}`}>
                        <p className="font-semibold">1. Enter details</p>
                        <p className="text-on-surface-variant">Amount and purpose</p>
                      </div>
                      <div className={`rounded-2xl p-3 ${step === 2 ? 'bg-primary/10 border border-primary' : 'bg-surface-container'}`}>
                        <p className="font-semibold">2. Choose payment</p>
                        <p className="text-on-surface-variant">Card or bank transfer</p>
                      </div>
                    </div>
                  </div>

                  {step === 1 && (
                    <button
                      type="submit"
                      className="w-full py-5 bg-primary text-on-primary font-bold rounded-2xl text-lg hover:brightness-110 transition-all"
                    >
                      Proceed
                    </button>
                  )}

                  {step === 2 && !transferPending && (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-on-surface">Select payment method</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                              paymentMethod === 'card'
                                ? 'border-primary bg-primary/10'
                                : 'border-outline-variant bg-surface-container-low'
                            }`}
                          >
                            <p className="font-semibold">Card</p>
                            <p className="text-sm text-on-surface-variant">Pay with card</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('transfer')}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                              paymentMethod === 'transfer'
                                ? 'border-primary bg-primary/10'
                                : 'border-outline-variant bg-surface-container-low'
                            }`}
                          >
                            <p className="font-semibold">Bank transfer</p>
                            <p className="text-sm text-on-surface-variant">Pay from your bank app</p>
                          </button>
                        </div>
                      </div>

                      {paymentMethod === 'card' && (
                        <p className="text-sm text-on-surface-variant">
                          You will be redirected to Paystack’s secure page to complete card payment.
                        </p>
                      )}

                      {paymentMethod === 'transfer' && (
                        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6">
                          <p className="text-sm text-on-surface-variant mb-3">
                            After clicking continue, transfer instructions will be shown.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-full py-4 border border-outline-variant rounded-2xl text-sm text-on-surface hover:bg-surface-container transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full py-5 bg-primary text-on-primary font-bold rounded-2xl text-lg hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <span className="material-symbols-outlined animate-spin">progress_activity</span>
                              Processing...
                            </>
                          ) : (
                            'Continue to Payment'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {transferPending && (
                    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 space-y-4">
                      <h4 className="font-semibold">Bank Transfer Instructions</h4>
                      <p className="text-sm text-on-surface-variant">
                        Use the details below to complete the transfer from your bank app.
                      </p>
                      <div className="grid gap-3 text-sm text-on-surface">
                        <div className="rounded-2xl bg-surface-container p-4 border border-outline-variant">
                          <p className="font-semibold">Bank Name</p>
                          <p>First Bank</p>
                        </div>
                        <div className="rounded-2xl bg-surface-container p-4 border border-outline-variant">
                          <p className="font-semibold">Account Name</p>
                          <p>TMBIS Academy</p>
                        </div>
                        <div className="rounded-2xl bg-surface-container p-4 border border-outline-variant">
                          <p className="font-semibold">Account Number</p>
                          <p>0123456789</p>
                        </div>
                        <div className="rounded-2xl bg-surface-container p-4 border border-outline-variant">
                          <p className="font-semibold">Reference</p>
                          <p>{paymentReference || 'Use your payment reference'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTransferPending(false);
                          setStep(1);
                        }}
                        className="w-full py-4 bg-primary/10 text-primary font-semibold rounded-2xl border border-primary hover:bg-primary/20 transition"
                      >
                        Return to payment details
                      </button>
                    </div>
                  )}

                  <p className="text-center text-sm text-on-surface-variant">
                    Secured by Paystack • Cards And Bank Transfer
                  </p>
              </form>
              )}
            </div>

            {/* Right Column */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant">
                <h3 className="font-bold text-lg mb-6">Saved Payment Methods</h3>
                <p className="text-on-surface-variant text-sm">No saved methods yet.</p>
              </div>

              <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant">
                <h3 className="font-bold text-lg mb-6">Recent Transactions</h3>
                <p className="text-on-surface-variant text-sm">No transactions yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}