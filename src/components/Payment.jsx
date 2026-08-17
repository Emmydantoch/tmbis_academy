import { useState } from 'react';
import api from '../api/axios'; // make sure this path is correct

export default function Payment() {
  const [amount, setAmount] = useState('4250');
  const [paymentType, setPaymentType] = useState('Tuition Fee');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');          // student email (required by Paystack)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transferPending, setTransferPending] = useState(false);

  // Payment reference for transfer instructions
  const [paymentReference, setPaymentReference] = useState(null);

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
      if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvv)) {
        setError('Please complete your card details before proceeding.');
        return;
      }

      setIsProcessing(true);

      try {
        // 1. Call your Django backend to create the payment
        const response = await api.post('payments/initialize/', {
          email: email,
          amount: parseFloat(amount),          // in Naira
          payment_type: paymentType,
          payment_method: paymentMethod,
        });

        const { public_key, access_code, reference, authorization_url } = response.data;

        // Save reference for transfer instructions
        setPaymentReference(reference);

        // For card payments, redirect to Paystack's hosted payment page
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container p-8 rounded-2xl border border-outline-variant">
          <p className="uppercase tracking-widest text-primary-fixed text-sm font-medium">Current Balance</p>
          <h2 className="text-5xl font-bold text-primary mt-2 mb-4">₦4,250.00</h2>
          <div className="flex items-center gap-4">
            <div className="bg-error-container/20 text-error px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">event_busy</span>
              Due in 14 days
            </div>
            <p className="text-on-surface-variant">Last paid: ₦1,200 on Sep 12</p>
          </div>
        </div>

        <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant flex flex-col justify-center">
          <h3 className="font-semibold mb-4">Upcoming</h3>
          <div className="space-y-6">
            <div className="flex justify-between">
              <div>
                <p>Tuition Installment #3</p>
                <p className="text-sm text-on-surface-variant">Oct 15, 2026</p>
              </div>
              <p className="font-bold text-primary">₦2,125</p>
            </div>
            <div className="flex justify-between opacity-75">
              <div>
                <p>Exam Fee - Semester</p>
                <p className="text-sm text-on-surface-variant">Nov 01, 2026</p>
              </div>
              <p className="font-bold">₦450</p>
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

          {success ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-green-400">check_circle</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">Payment Successful!</h3>
              <p className="text-on-surface-variant">
                Your activation token has been sent to your email.<br />
                Use it to log in to your student portal.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
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
                  <label className="block text-sm text-on-surface-variant mb-2">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-on-surface-variant">₦</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="100"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 py-4 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Payment For</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                  >
                    <option>Tuition Fee</option>
                    <option>Exam Fee</option>
                    <option>Full Semester Balance</option>
                    <option>Custom Amount</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4">
                <p className="text-sm text-on-surface-variant">Step {step} of 2</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-on-surface">
                  <div className={`rounded-2xl p-3 ${step === 1 ? 'bg-primary/10 border border-primary' : 'bg-surface-container'} `}>
                    <p className="font-semibold">1. Enter details</p>
                    <p className="text-on-surface-variant">Amount and purpose</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${step === 2 ? 'bg-primary/10 border border-primary' : 'bg-surface-container'} `}>
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
                        className={`rounded-2xl border px-4 py-4 text-left transition ${paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-low'}`}
                      >
                        <p className="font-semibold">Card</p>
                        <p className="text-sm text-on-surface-variant">Pay with card, CVV, expiry date</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('transfer')}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${paymentMethod === 'transfer' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-low'}`}
                      >
                        <p className="font-semibold">Bank transfer</p>
                        <p className="text-sm text-on-surface-variant">Pay from your bank app</p>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-on-surface-variant mb-2">Expiry</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-on-surface-variant mb-2">CVV</label>
                          <input
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="123"
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6">
                      <p className="text-sm text-on-surface-variant mb-3">Use bank transfer to pay with your bank app. After clicking continue, you will be shown transfer instructions and account details.</p>
                      <div className="space-y-3 text-sm text-on-surface">
                        <div>
                          <p className="font-semibold">Bank Name</p>
                          <p>First Bank</p>
                        </div>
                        <div>
                          <p className="font-semibold">Account Name</p>
                          <p>TMBIS Academy</p>
                        </div>
                        <div>
                          <p className="font-semibold">Account Number</p>
                          <p>0123456789</p>
                        </div>
                      </div>
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
                  <p className="text-sm text-on-surface-variant">Your payment is being prepared. Use the details below to complete the transfer from your bank app.</p>
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
  );
}