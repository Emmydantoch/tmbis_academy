const gradeTasks = [
  { title: 'UXD 201 midterm submissions', due: 'Due this week', count: 32 },
  { title: 'CSC 204 seminar feedback', due: 'Due next week', count: 28 },
];

export default function LecturerGrades() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary">Lecturer workspace</p>
        <h1 className="text-3xl font-bold text-on-surface mt-2">Grades</h1>
        <p className="text-on-surface-variant mt-2">Track grading tasks and feedback that still need your attention.</p>
      </div>

      <div className="space-y-4">
        {gradeTasks.map((task) => (
          <article key={task.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">grading</span>
              <div>
                <h2 className="text-lg font-bold text-on-surface">{task.title}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{task.count} submissions awaiting review</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-on-surface-variant">{task.due}</span>
              <button type="button" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110">
                Open gradebook
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
