import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function LecturerSchedule() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('live-sessions/')
      .then((response) => setSessions(response.data || []))
      .catch(() => setError('Unable to load the live teaching schedule.'));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary">Lecturer workspace</p>
        <h1 className="text-3xl font-bold text-on-surface mt-2">Schedule</h1>
        <p className="text-on-surface-variant mt-2">Keep track of upcoming live sessions and teaching times.</p>
      </div>

      {error && <p className="mb-6 rounded-xl bg-error/10 px-4 py-3 text-error">{error}</p>}
      <div className="space-y-4">
        {sessions.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-outline-variant p-10 text-center text-on-surface-variant">
            No published sessions are scheduled yet.
          </div>
        )}
        {sessions.map((session) => (
          <article key={session.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-primary font-semibold">{session.status}</p>
              <h2 className="text-xl font-bold text-on-surface mt-1">{session.title}</h2>
              <p className="text-on-surface-variant mt-1">{session.description || 'No description provided.'}</p>
            </div>
            <div className="text-sm text-on-surface-variant md:text-right">
              <p>{new Date(session.start_time).toLocaleString()}</p>
              <a href={session.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-primary font-semibold hover:underline">
                <span className="material-symbols-outlined text-base">videocam</span>
                Open meeting
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
