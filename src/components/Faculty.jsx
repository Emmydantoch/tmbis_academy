const principalOfficers = [
  {
    name: "Dr. O. Ogunrotimi",
    role: "HOD/Deputy Director",
  },
  {
    name: "Prof. K. K. Arogundade",
    role: "Dean/Director",
  },
  {
    name: "Dr. Ayo Olatunde",
    role: "Director Academic Affairs",
  },
];

export default function Faculty() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-primary">Principal Officers</h1>
        <p className="text-on-surface-variant mt-2">
          Meet the principal officers serving TMBIS Academy.
        </p>
      </header>

      <section
        aria-label="Principal officers"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {principalOfficers.map((officer) => (
          <article
            key={officer.role}
            className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant"
          >
            <div
              aria-label="Officer photo coming soon"
              className="h-56 flex items-center justify-center bg-surface-container-high text-primary"
            >
              <span className="material-symbols-outlined text-6xl" aria-hidden="true">
                account_circle
              </span>
            </div>
            <div className="p-6">
              <h2 className="font-bold text-xl text-primary">{officer.name}</h2>
              <p className="text-on-surface-variant mt-2">{officer.role}</p>
              <p className="text-on-surface-variant text-sm mt-4">
                Photo coming soon.
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
