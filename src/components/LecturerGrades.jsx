import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export default function LecturerGrades() {
  const [attempts, setAttempts] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshAttempts = () => api.get('exams/attempts/').then(({ data }) => setAttempts(data));

  const gradeTasks = useMemo(() => {
    const grouped = new Map();
    attempts.forEach((attempt) => {
      const existing = grouped.get(attempt.exam_id) ?? {
        id: attempt.exam_id,
        title: attempt.exam_title,
        attempts: [],
      };
      existing.attempts.push(attempt);
      grouped.set(attempt.exam_id, existing);
    });
    return [...grouped.values()].map((task) => ({
      ...task,
      pending: task.attempts.filter((attempt) => !attempt.is_reviewed).length,
      reviewed: task.attempts.length > 0 && task.attempts.every((attempt) => attempt.is_reviewed),
    }));
  }, [attempts]);

  const activeTask = useMemo(
    () => gradeTasks.find((task) => String(task.id) === selectedExam) ?? gradeTasks[0],
    [gradeTasks, selectedExam],
  );

  useEffect(() => {
    let active = true;
    refreshAttempts()
      .then(() => {})
      .catch(() => {
        if (active) setError('Unable to load submitted exams.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const exams = useMemo(
    () => [...new Map(attempts.map((attempt) => [attempt.exam_id, attempt.exam_title])).entries()],
    [attempts],
  );
  const visibleAttempts = selectedExam === 'all'
    ? attempts
    : attempts.filter((attempt) => String(attempt.exam_id) === selectedExam);

  const openGradebook = (examId) => {
    setSelectedExam(String(examId));
    document.getElementById('exam-submissions-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const reviewTask = async (task) => {
    setActionLoading(true);
    setError('');
    const nextReviewed = !task.reviewed;
    try {
      await Promise.all(task.attempts.map((attempt) => (
        api.patch(`exams/attempts/${attempt.id}/review/`, { is_reviewed: nextReviewed })
      )));
      await refreshAttempts();
    } catch {
      setError('Unable to update the review status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary">Lecturer workspace</p>
        <h1 className="text-3xl font-bold text-on-surface mt-2">Grades</h1>
        <p className="text-on-surface-variant mt-2">
          Track grading tasks and feedback that still need your attention.
        </p>
      </div>

      <div className="space-y-4">
        {gradeTasks.map((task) => {
          return (
            <article key={task.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">grading</span>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">{task.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-1">{task.pending} submissions awaiting review</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-on-surface-variant">{task.attempts.length} submitted</span>
                <button type="button" onClick={() => openGradebook(task.id)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110 transition">
                  {String(selectedExam) === String(task.id) ? 'Gradebook open' : 'Open gradebook'}
                </button>
                <button type="button" disabled={actionLoading} onClick={() => reviewTask(task)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${task.reviewed ? 'border-success text-success bg-success/10' : 'border-outline-variant text-on-surface hover:border-primary'}`}>
                  {task.reviewed ? 'Mark needs attention' : 'Mark reviewed'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl border border-outline-variant bg-surface-container p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Selected task</p>
            <h3 className="text-2xl font-bold text-on-surface mt-2">{activeTask?.title ?? 'No submitted tasks'}</h3>
          </div>
          <button type="button" disabled={!activeTask || actionLoading} onClick={() => activeTask && openGradebook(activeTask.id)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:brightness-110">
            Review now
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Pending</p>
            <p className="mt-2 text-3xl font-bold text-on-surface">{activeTask?.pending ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Deadline</p>
            <p className="mt-2 text-lg font-semibold text-on-surface">{activeTask ? `${activeTask.attempts.length} submitted` : 'No submissions'}</p>
          </div>
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Status</p>
            <p className="mt-2 text-lg font-semibold text-on-surface">{activeTask?.reviewed ? 'Reviewed' : 'Needs attention'}</p>
          </div>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="exam-submissions-heading">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">New exam uploads</p>
            <h2 id="exam-submissions-heading" className="text-2xl font-bold text-on-surface mt-2">Submitted exams</h2>
          </div>
          <select aria-label="Filter submitted exams" value={selectedExam} onChange={(event) => setSelectedExam(event.target.value)} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface">
            <option value="all">All submitted exams</option>
            {exams.map(([examId, title]) => <option key={examId} value={examId}>{title}</option>)}
          </select>
        </div>
        {loading && <p className="text-on-surface-variant">Loading submissions...</p>}
        {error && <p className="text-error">{error}</p>}
        {!loading && !error && visibleAttempts.length === 0 && <div className="rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface-variant">No submitted exams are available for review.</div>}
        <div className="space-y-3">
          {visibleAttempts.map((attempt) => (
            <article key={attempt.id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary">{attempt.exam_title}</p>
                <h3 className="mt-1 text-lg font-bold text-on-surface">{attempt.student_name}</h3>
                <p className="text-sm text-on-surface-variant">{attempt.student_email} · {attempt.percentage}% ({attempt.score}/{attempt.total_points})</p>
              </div>
              {attempt.working_paper_url ? (
                <a href={attempt.working_paper_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Open rough work
                </a>
              ) : <span className="text-sm text-on-surface-variant">No rough work uploaded</span>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
