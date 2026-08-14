import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ExamView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60 + 12); // 45 minutes 12 seconds
  const [studentAnswers, setStudentAnswers] = useState({}); // {1: 0, 2: 2, ...}
  const [lastSaved, setLastSaved] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Sample Questions Array
  const questions = [
    {
      id: 1,
      type: "Multiple Choice",
      points: 2,
      question: "Which of the following best describes the 'Ideate' phase in the Design Thinking process?",
      options: [
        "Building a physical or digital representation of a potential solution.",
        "Generating a wide range of creative solutions without immediate judgment.",
        "Defining the core problem statement based on user research.",
        "Conducting interviews to understand user needs."
      ]
    },
    {
      id: 2,
      type: "Multiple Choice",
      points: 2,
      question: "What is the main purpose of the 'Empathize' stage?",
      options: [
        "To generate as many ideas as possible.",
        "To deeply understand the user's feelings and needs.",
        "To test prototypes with real users.",
        "To define the problem statement clearly."
      ]
    },
    {
      id: 3,
      type: "True/False",
      points: 1,
      question: "Design Thinking is a strictly linear process.",
      options: ["True", "False"]
    }
    // Add more questions here...
  ];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto Save
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
    setStudentAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: optionIndex
    }));
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    setShowSubmitModal(false);
    alert(`✅ Exam Submitted Successfully!\nYou answered ${Object.keys(studentAnswers).length} out of ${questions.length} questions.`);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-surface border-b border-outline-variant flex items-center px-6 shrink-0">
        <div className="flex-1 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:bg-surface-container p-2 rounded-xl transition-all"
            title="Back to Home"
          >
            <span className="material-symbols-outlined">home</span>
          </Link>
          <span className="font-headline-md font-bold text-primary">TMBIS Academy</span>
          <h1 className="font-headline-sm text-on-surface hidden md:block">Final Exam: Design Thinking</h1>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 md:p-12">
            {lastSaved && (
              <p className="text-right text-xs text-on-surface-variant mb-4">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}

            <div className="flex gap-3 mb-8">
              <span className="bg-surface-container-high px-4 py-1 rounded-full text-sm">{currentQuestion.type}</span>
              <span className="bg-surface-container-high px-4 py-1 rounded-full text-sm">{currentQuestion.points} Points</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold leading-tight mb-10">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-6 rounded-2xl border cursor-pointer transition-all hover:border-primary
                    ${studentAnswers[currentQuestion.id] === index ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:bg-surface-container-low'}`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name={`q${currentQuestion.id}`}
                      checked={studentAnswers[currentQuestion.id] === index}
                      onChange={() => selectAnswer(index)}
                      className="mt-1 accent-primary"
                    />
                    <span className="ml-5 text-on-surface">{option}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-surface border-t border-outline-variant p-6 shrink-0">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button 
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-primary text-primary disabled:opacity-40 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-8 py-4 rounded-2xl border border-error text-error hover:bg-error/10 font-medium"
            >
              Submit Exam
            </button>

            <button 
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-3 px-10 py-4 bg-primary text-on-primary rounded-2xl font-bold disabled:opacity-50 transition-all"
            >
              Save &amp; Next
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full border border-outline-variant">
            <h3 className="text-2xl font-bold mb-4">Submit Final Exam?</h3>
            <p className="text-on-surface-variant mb-8">
              You have answered {Object.keys(studentAnswers).length} out of {questions.length} questions.<br/>
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-4 border border-outline-variant rounded-2xl hover:bg-surface-container"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}