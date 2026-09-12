const assignments = [
  {
    name: 'Introduction to UX Design',
    code: 'UXD 201',
    students: 32,
    progress: '8 modules published',
  },
  {
    name: 'Data Structures Seminar',
    code: 'CSC 204',
    students: 28,
    progress: 'Next session tomorrow',
  },
];

export default function LecturerCourses() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary">Lecturer workspace</p>
        <h1 className="text-3xl font-bold text-on-surface mt-2">My Courses</h1>
        <p className="text-on-surface-variant mt-2">Review your teaching assignments and prepare your next class.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <article key={assignment.code} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-primary font-semibold">{assignment.code}</p>
                <h2 className="text-xl font-bold text-on-surface mt-2">{assignment.name}</h2>
              </div>
              <span className="material-symbols-outlined text-primary">school</span>
            </div>
            <div className="mt-8 flex items-center justify-between text-sm text-on-surface-variant">
              <span>{assignment.students} enrolled students</span>
              <span>{assignment.progress}</span>
            </div>
            <a href="/dashboard/library" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              <span className="material-symbols-outlined text-base">library_books</span>
              Manage materials
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
