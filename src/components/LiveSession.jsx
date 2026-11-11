import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

export default function LiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    meeting_link: '',
    target_level: '',
    start_time: '',
    end_time: '',
  });
  const [isLecturer] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return (
        user?.is_staff === true ||
        user?.is_superuser === true ||
        ['lecturer', 'teacher', 'instructor', 'admin'].includes(user?.role)
      );
    } catch {
      return false;
    }
  });
  const [recordingSessionId, setRecordingSessionId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.get('live-sessions/');
      setSessions(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load live sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScheduleChange = (event) => {
    const { name, value } = event.target;
    setScheduleForm((current) => ({ ...current, [name]: value }));
  };

  const scheduleSession = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setScheduling(true);
    try {
      await api.post('live-sessions/', {
        ...scheduleForm,
        start_time: new Date(scheduleForm.start_time).toISOString(),
        end_time: new Date(scheduleForm.end_time).toISOString(),
      });
      setScheduleForm({
        title: '',
        description: '',
        meeting_link: '',
        target_level: '',
        start_time: '',
        end_time: '',
      });
      setMessage('Live session scheduled. Students in the selected level have been notified.');
      await fetchSessions();
    } catch (requestError) {
      console.error('Unable to schedule live session:', requestError);
      const responseData = requestError.response?.data;
      const fieldError = responseData?.target_level || responseData?.end_time;
      setError(
        responseData?.detail ||
        (Array.isArray(fieldError) ? fieldError[0] : fieldError) ||
        'Could not schedule the live session. Check the details and try again.'
      );
    } finally {
      setScheduling(false);
    }
  };

  useEffect(() => {
    const initialFetch = setTimeout(fetchSessions, 0);
    const interval = setInterval(fetchSessions, 60000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchSessions]);

  // Cleanup if user leaves page while recording
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
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

  const downloadNotes = (session) => {
    const blob = new Blob([session.lecture_notes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'lecture-notes'}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const startRecording = async (sessionId) => {
    setMessage('');
    setError('');

    try {
      // Must run from a button click — browser will show share popup
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      // If user stops sharing from browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopAndUpload(sessionId);
        }
      };

      recorder.start(1000);
      setRecordingSessionId(sessionId);
      setMessage(
        'Recording started. Share this tab or the Zoom window. Click Stop & save when class ends.'
      );
    } catch (err) {
      console.error(err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Permission denied. Allow screen/tab sharing to record the class.'
          : 'Could not start recording. Try Chrome/Edge and allow screen share.'
      );
    }
  };

  const stopAndUpload = async (sessionId) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setRecordingSessionId(null);
      return;
    }

    setUploading(true);
    setMessage('Stopping and uploading recording...');

    await new Promise((resolve) => {
      recorder.onstop = resolve;
      recorder.stop();
    });

    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    chunksRef.current = [];

    if (blob.size < 1000) {
      setError('Recording was too short or empty.');
      setUploading(false);
      setRecordingSessionId(null);
      return;
    }

    try {
      const form = new FormData();
      form.append('file', blob, `session-${sessionId}.webm`);

      await api.post(`live-sessions/${sessionId}/recording/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Recording saved. Students can use Watch recording.');
      // Refresh list so recording_link appears
      await fetchSessions();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Upload failed. Check login role (lecturer) and API route.'
      );
    } finally {
      setUploading(false);
      setRecordingSessionId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary">Live Sessions</h2>
        <p className="text-on-surface-variant mt-1">
          {isLecturer
            ? 'Schedule level-specific classes, manage sessions, and upload recordings.'
            : 'Join live classes and catch up on recordings.'}
        </p>
      </div>

      {isLecturer && (
        <form
          onSubmit={scheduleSession}
          className="mb-8 rounded-2xl border border-outline-variant bg-surface-container p-6"
        >
          <h3 className="text-xl font-bold text-on-surface">Schedule a live session</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Only students in the selected level will see the session or its join link.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-on-surface">
              Session title
              <input
                required
                name="title"
                value={scheduleForm.title}
                onChange={handleScheduleChange}
                maxLength={200}
                className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
              />
            </label>
            <label className="text-sm font-medium text-on-surface">
              Student level
              <select
                required
                name="target_level"
                value={scheduleForm.target_level}
                onChange={handleScheduleChange}
                className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
              >
                <option value="">Select a level</option>
                {['100', '200', '300', '400', '500', '600'].map((level) => (
                  <option key={level} value={level}>{level} Level</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-on-surface md:col-span-2">
              Meeting link
              <input
                required
                type="url"
                name="meeting_link"
                value={scheduleForm.meeting_link}
                onChange={handleScheduleChange}
                placeholder="https://..."
                className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
              />
            </label>
            <label className="text-sm font-medium text-on-surface">
              Starts
              <input
                required
                type="datetime-local"
                name="start_time"
                value={scheduleForm.start_time}
                onChange={handleScheduleChange}
                className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
              />
            </label>
            <label className="text-sm font-medium text-on-surface">
              Ends
              <input
                required
                type="datetime-local"
                name="end_time"
                value={scheduleForm.end_time}
                onChange={handleScheduleChange}
                className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
              />
            </label>
            <label className="text-sm font-medium text-on-surface md:col-span-2">
              Description (optional)
              <textarea
                name="description"
                value={scheduleForm.description}
                onChange={handleScheduleChange}
                rows={3}
                className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={scheduling}
            className="mt-5 rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-60"
          >
            {scheduling ? 'Scheduling…' : 'Schedule session'}
          </button>
        </form>
      )}

      {message && (
        <div className="mb-6 rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      )}

      {loading && <p className="text-on-surface-variant">Loading sessions...</p>}

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
                  {recordingSessionId === session.id && (
                    <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                      REC
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-primary mb-1">{session.title}</h2>
                <p className="text-on-surface-variant mb-1">with {session.lecturer_name}</p>
                {session.target_level && (
                  <p className="text-sm font-medium text-primary mb-1">
                    Level {session.target_level}
                  </p>
                )}
                <p className="text-sm text-on-surface-variant">
                  {new Date(session.start_time).toLocaleString()} –{' '}
                  {new Date(session.end_time).toLocaleTimeString()}
                </p>
                {session.description && (
                  <p className="mt-3 text-sm text-on-surface-variant">{session.description}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
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
                    <span className="material-symbols-outlined">event_available</span>
                    Session Ended
                  </button>
                )}

                {/* Lecturer recording controls */}
                {isLecturer && session.status === 'live' && (
                  recordingSessionId === session.id ? (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => stopAndUpload(session.id)}
                      className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-2xl font-semibold disabled:opacity-70"
                    >
                      <span className="material-symbols-outlined">stop_circle</span>
                      {uploading ? 'Uploading...' : 'Stop & save'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={recordingSessionId !== null || uploading}
                      onClick={() => startRecording(session.id)}
                      className="inline-flex items-center gap-2 border border-error text-error hover:bg-error/10 px-5 py-3 rounded-2xl font-semibold disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">radio_button_checked</span>
                      Record this class
                    </button>
                  )
                )}

                {session.recording_link && (
                  <a
                    href={session.recording_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/10 px-5 py-3 rounded-2xl font-semibold transition-all"
                  >
                    <span className="material-symbols-outlined">play_circle</span>
                    Watch recording
                  </a>
                )}

                {session.lecture_notes && (
                  <button
                    type="button"
                    onClick={() => downloadNotes(session)}
                    className="inline-flex items-center gap-2 border border-outline-variant text-on-surface hover:bg-surface-container-high px-5 py-3 rounded-2xl font-semibold transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download notes
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