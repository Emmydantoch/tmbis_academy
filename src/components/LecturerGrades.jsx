import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export default function LecturerGrades() {
  const [attempts, setAttempts] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('exams/attempts/')
      .then(({ data }) => {
        if (active) setAttempts(data);
      })
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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary">Lecturer workspace</p>
        <h1 className="text-3xl font-bold text-on-surface mt-2">Grades</h1>
        <p className="text-on-surface-variant mt-2">
          Track grading tasks and feedback that still need your attention.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="exam-filter" className="text-sm font-semibold text-on-surface">Exam</label>
        <select id="exam-filter" value={selectedExam} onChange={(event) => setSelectedExam(event.target.value)} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface">
          <option value="all">All submitted exams</option>
          {exams.map(([examId, title]) => <option key={examId} value={examId}>{title}</option>)}
        </select>
      </div>

      {loading && <p className="text-on-surface-variant">Loading submissions...</p>}
      {error && <p className="text-error">{error}</p>}
      {!loading && !error && visibleAttempts.length === 0 && (
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface-variant">
          No submitted exams are available for review.
        </div>
      )}

      <div className="space-y-3">
        {visibleAttempts.map((attempt) => (
          <article key={attempt.id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">{attempt.exam_title}</p>
              <h2 className="mt-1 text-lg font-bold text-on-surface">{attempt.student_name}</h2>
              <p className="text-sm text-on-surface-variant">{attempt.student_email} · {attempt.percentage}% ({attempt.score}/{attempt.total_points})</p>
            </div>
            {attempt.working_paper_url ? (
              <a href={attempt.working_paper_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110">
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Open rough work
              </a>
            ) : (
              <span className="text-sm text-on-surface-variant">No rough work uploaded</span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
