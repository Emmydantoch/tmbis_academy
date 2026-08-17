import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function LiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('live-sessions/');
        setSessions(res.data);
      } catch (err) {
        setError('Failed to load live sessions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Refresh every 60 seconds so status updates automatically
    const interval = setInterval(fetchSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'live') {
      return (
        <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE NOW
        </span>
      );
    }
    if (status === 'upcoming') {
      return (
        <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full">
          Upcoming
        </span>
      );
    }
    return (
      <span className="bg-surface-container-high text-on-surface-variant text-xs px-3 py-1 rounded-full">
        Ended
      </span>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary">Live Sessions</h2>
        <p className="text-on-surface-variant mt-1">Join live classes and catch up on recordings.</p>
      </div>

      {loading && (
        <p className="text-on-surface-variant">Loading sessions...</p>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
            videocam_off
          </span>
          <p className="text-on-surface-variant text-lg">
            No live sessions scheduled yet.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-surface-container rounded-2xl border border-outline-variant p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(session.status)}
                  {session.starts_in && (
                    <span className="text-sm text-on-surface-variant">
                      {session.starts_in}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-primary mb-1">
                  {session.title}
                </h2>
                <p className="text-on-surface-variant mb-1">
                  with {session.lecturer_name}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {new Date(session.start_time).toLocaleString()} –{' '}
                  {new Date(session.end_time).toLocaleTimeString()}
                </p>
                {session.description && (
                  <p className="mt-3 text-sm text-on-surface-variant">
                    {session.description}
                  </p>
                )}
              </div>

              <div>
                {session.status === 'live' ? (
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-bold transition-all"
                  >
                    <span className="material-symbols-outlined">videocam</span>
                    Join Live Now
                  </a>
                ) : session.status === 'upcoming' ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-8 py-4 rounded-2xl font-bold cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">schedule</span>
                    Not Started Yet
                  </button>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-8 py-4 rounded-2xl font-bold cursor-not-allowed"
                  >
                    Session Ended
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}