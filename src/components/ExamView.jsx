import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ExamView() {
  const navigate = useNavigate();
  const { examId } = useParams(); // route: /exams/:examId 

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [hasWorkingPaper, setHasWorkingPaper] = useState(false);
  const [workingPaperFile, setWorkingPaperFile] = useState(null);
  const [uploadPromptOpen, setUploadPromptOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [result, setResult] = useState(null);

  // Load exam + questions from backend
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const res = await api.get(`exams/${examId}/`);
        

        setExam(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft((res.data.duration_minutes || 45) * 60);
      } catch (err) {
        console.error(err);
        setLoadError(
          err.response?.data?.detail ||
          'Failed to load exam. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExam();
  }, [examId]);

  // Timer
  useEffect(() => {
    if (loading || submitSuccess || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitSuccess, timeLeft]);

  // Auto-save indicator
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (Object.keys(studentAnswers).length > 0) {
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(autoSave);
  }, [studentAnswers]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const selectAnswer = (optionIndex) => {
    if (isSubmitting || submitSuccess || !questions[currentIndex]) return;
    setStudentAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: optionIndex
    }));
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitSuccess) return;

    setShowSubmitModal(false);
    setUploadPromptOpen(false);
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const answersPayload = {};
      Object.keys(studentAnswers).forEach((qId) => {
        answersPayload[qId] = studentAnswers[qId];
      });

      const durationSeconds = (exam?.duration_minutes || 45) * 60;
      const payload = {
        answers: answersPayload,
        time_taken_seconds: durationSeconds - timeLeft,
        has_working_paper: hasWorkingPaper,
      };

      if (hasWorkingPaper && workingPaperFile) {
        const formData = new FormData();
        formData.append('answers', JSON.stringify(answersPayload));
        formData.append('time_taken_seconds', String(durationSeconds - timeLeft));
        formData.append('has_working_paper', 'true');
        formData.append('working_paper_file', workingPaperFile);
        const response = await api.post(`exams/${examId}/submit/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setResult(response.data);
        setSubmitSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      const response = await api.post(`exams/${examId}/submit/`, payload);
      setResult(response.data);
      setSubmitSuccess(true);

      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.detail ||
        err.response?.data?.working_paper_file?.[0] ||
        'Failed to submit exam. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-on-surface-variant">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Load error
  if (loadError || !exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface p-6">
        <div className="bg-surface-container rounded-3xl border border-outline-variant p-10 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
          <h2 className="text-xl font-bold mb-2">Unable to load exam</h2>
          <p className="text-on-surface-variant mb-6">{loadError || 'No questions found.'}</p>
          <Link to="/dashboard" className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Success screen
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
        <div className="bg-surface-container rounded-3xl border border-outline-variant p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-green-500">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Exam Submitted!</h2>
          <p className="text-on-surface-variant mb-6">Your answers have been saved.</p>

          {result && (
            <div className="bg-surface-container-low rounded-2xl p-6 mb-6 text-left">
              <p className="text-sm text-on-surface-variant mb-2">Your Score</p>
              <p className="text-3xl font-bold text-primary">
                {result.score ?? 0} / {result.total ?? questions.length}
              </p>
              {result.percentage !== undefined && (
                <p className="text-on-surface-variant mt-1">{result.percentage}%</p>
              )}
            </div>
          )}

          <Link to="/dashboard" className="inline-block px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Top bar */}
      <div className="bg-surface border-b border-outline-variant flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-primary p-2 rounded-xl hover:bg-surface-container">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-sm font-bold">{exam.title}</h1>
        </div>

        <div className="flex items-center gap-6">
          <span className="font-label-md text-on-surface-variant uppercase tracking-widest">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-2 bg-surface-container-low px-5 py-2 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined">timer</span>
            <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-error' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {submitError && (
            <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
              {submitError}
            </div>
          )}

          <div className="bg-surface border border-outline-variant rounded-2xl p-8 md:p-12">
            {lastSaved && (
              <p className="text-right text-xs text-on-surface-variant mb-4">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}

            <div className="flex gap-3 mb-8">
              <span className="bg-surface-container-high px-4 py-1 rounded-full text-sm">
                {currentQuestion.question_type || currentQuestion.type}
              </span>
              <span className="bg-surface-container-high px-4 py-1 rounded-full text-sm">
                {currentQuestion.points} Points
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold leading-tight mb-10">
              {currentQuestion.question_text || currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {(currentQuestion.options || []).map((option, index) => (
                <label
                  key={index}
                  className={`block p-6 rounded-2xl border cursor-pointer transition-all hover:border-primary
                    ${studentAnswers[currentQuestion.id] === index
                      ? 'border-primary bg-primary-container/10'
                      : 'border-outline-variant hover:bg-surface-container-low'}`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name={`q${currentQuestion.id}`}
                      checked={studentAnswers[currentQuestion.id] === index}
                      onChange={() => selectAnswer(index)}
                      className="mt-1 accent-primary"
                      disabled={isSubmitting}
                    />
                    <span className="ml-5 text-on-surface">{option}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bg-surface border-t border-outline-variant p-6 shrink-0">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0 || isSubmitting}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-primary text-primary disabled:opacity-40"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setUploadPromptOpen(true);
                setShowSubmitModal(false);
              }}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-2xl border border-error text-error hover:bg-error/10 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1 || isSubmitting}
              className="flex items-center gap-3 px-10 py-4 bg-primary text-on-primary rounded-2xl font-bold disabled:opacity-50"
            >
              Save &amp; Next
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full border border-outline-variant">
            <h3 className="text-2xl font-bold mb-4">Submit Exam?</h3>
            <p className="text-on-surface-variant mb-8">
              You have answered {Object.keys(studentAnswers).length} out of {questions.length} questions.
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-4 border border-outline-variant rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setUploadPromptOpen(true);
                }}
                className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadPromptOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-surface rounded-3xl p-8 max-w-xl w-full border border-outline-variant">
            <h3 className="text-2xl font-bold mb-4">Any rough work on paper?</h3>
            <p className="text-on-surface-variant mb-6">
              If you used handwritten workings, you can upload a photo or scan before submitting your exam.
              If not, you can proceed without uploading.
            </p>

            <div className="space-y-4 mb-8">
              <label className="flex items-center gap-3 text-on-surface">
                <input
                  type="radio"
                  name="working-paper-choice"
                  checked={hasWorkingPaper === true}
                  onChange={() => setHasWorkingPaper(true)}
                />
                Yes, I have paper workings to upload
              </label>
              <label className="flex items-center gap-3 text-on-surface">
                <input
                  type="radio"
                  name="working-paper-choice"
                  checked={hasWorkingPaper === false}
                  onChange={() => setHasWorkingPaper(false)}
                />
                No, I am submitting without paper workings
              </label>
            </div>

            {hasWorkingPaper && (
              <div className="mb-6">
                <label className="block text-sm text-on-surface mb-2">Upload rough work file</label>
                <input
                  type="file"
                  accept="image/*,.pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setWorkingPaperFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-dashed border-outline-variant p-4"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setUploadPromptOpen(false);
                  setHasWorkingPaper(false);
                  setWorkingPaperFile(null);
                }}
                className="flex-1 py-4 border border-outline-variant rounded-2xl"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (hasWorkingPaper && !workingPaperFile) {
                    setSubmitError('Please upload your rough work file before submitting.');
                    return;
                  }
                  setUploadPromptOpen(false);
                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold"
              >
                {isSubmitting ? 'Submitting...' : 'Proceed to submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}