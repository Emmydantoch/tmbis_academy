import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function LecturerCourses() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const groupedAssignments = assignments.reduce((groups, assignment) => {
    const group = assignment.semester_name
      || assignment.programme_name
      || 'Other assignments';
    if (!groups[group]) groups[group] = [];
    groups[group].push(assignment);
    return groups;
  }, {});

  useEffect(() => {
    let active = true;
    api.get('auth/lecturer/assignments/')
      .then(({ data }) => {
        if (active) setAssignments(data.assignments || []);
      })
      .catch((requestError) => {
        console.error('Unable to load lecturer assignments:', requestError);
        if (active) setError('Unable to load your teaching assignments.');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary">Lecturer workspace</p>
        <h1 className="text-3xl font-bold text-on-surface mt-2">My Courses</h1>
        <p className="text-on-surface-variant mt-2">Review your teaching assignments and prepare your next class.</p>
      </div>

      {error && <p role="alert" className="mb-6 rounded-xl bg-error/10 px-4 py-3 text-error">{error}</p>}
      {!error && assignments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-outline-variant p-10 text-center text-on-surface-variant">
          No courses have been assigned yet. Please check back after your administrator updates your teaching assignments.
        </div>
      )}
      {Object.entries(groupedAssignments).map(([semester, semesterAssignments]) => (
        <section key={semester} className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-primary">{semester}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {semesterAssignments.map((assignment) => (
              <article
                key={`${assignment.course_code || 'legacy'}-${assignment.id}`}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-primary font-semibold">
                      {[
                        assignment.department,
                        assignment.level ? `Level ${assignment.level}` : '',
                        assignment.units ? `${assignment.units} units` : '',
                      ].filter(Boolean).join(' · ') || 'Shared catalogue course'}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {assignment.programme_name || 'Programme not specified'}
                    </p>
                    {assignment.course_code && (
                      <p className="mt-2 text-sm font-semibold text-on-surface-variant">
                        {assignment.course_code}
                      </p>
                    )}
                    <h3 className="text-xl font-bold text-on-surface mt-1">
                      {assignment.course_name}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-primary">school</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
