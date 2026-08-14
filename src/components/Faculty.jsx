import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Faculty() {
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const leadership = [
    {
      name: "Dr. Elena Sterling",
      role: "Provost & Chief Academic Officer",
      description: "Leads the academic vision with 20 years of experience in higher education strategy and computational linguistics.",
      image: "https://lh3.googleusercontent.com/...",
      department: "Leadership"
    },
    {
      name: "Marcus Vane",
      role: "Dean of Technical Research",
      description: "Former lead engineer at GlobalTech. Oversees research laboratories and industry partnerships.",
      image: "https://lh3.googleusercontent.com/...",
      department: "Leadership"
    },
    {
      name: "Sarah J. Miller",
      role: "Head of Student Success",
      description: "Focuses on the end-to-end student journey to ensure every learner has the support to excel.",
      image: "https://lh3.googleusercontent.com/...",
      department: "Leadership"
    }
  ];

  const faculty = [
    {
      name: "Prof. David Koda",
      role: "Cybersecurity Systems",
      specialties: ["Cryptography", "AI Safety"],
      image: "https://lh3.googleusercontent.com/...",
    },
    {
      name: "Dr. Maya Lin",
      role: "Neural Networks",
      specialties: ["Bio-Tech", "Data Visualization"],
      image: "https://lh3.googleusercontent.com/...",
    },
    {
      name: "Prof. Arjun Mehta",
      role: "Quantum Computing",
      specialties: ["Physics", "Logic"],
      image: "https://lh3.googleusercontent.com/...",
    },
    {
      name: "Dr. Lena Ross",
      role: "Systems Architecture",
      specialties: ["DevOps", "Scalability"],
      image: "https://lh3.googleusercontent.com/...",
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar */}
      <nav className="hidden md:flex w-64 flex-col h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-20 p-4">
        <div className="mb-8 px-2">
          <h1 className="font-headline-lg font-bold text-primary">TMBIS Academy</h1>
          <p className="text-on-surface-variant text-sm">Student Portal</p>
        </div>

        <div className="flex-1 space-y-1">
          <NavItem to="/" icon="" label="Landing Page" />
          <NavItem to="/resources" icon="" label="Resources" />
          <NavItem to="/contact" icon="" label="Support" />
          <NavItem to="/faculty" icon="group" label="Faculty" active />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-outline-variant flex items-center px-6 sticky top-0 z-10">
          <div className="flex-1 flex items-center gap-6">
            <button className="md:hidden p-2 rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md font-bold text-primary">Meet Our Faculty</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2 border border-outline-variant rounded-2xl p-1">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl ${viewMode === "grid" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl ${viewMode === "list" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Leadership Section */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-headline-lg text-headline-lg text-primary">Executive Leadership</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leadership.map((leader, index) => (
                <div key={index} className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant hover:border-primary transition-all group">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-xl text-primary">{leader.name}</h4>
                    <p className="text-primary text-sm mb-4">{leader.role}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{leader.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Faculty Section */}
          <section>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Department Faculty</h2>
                <p className="text-on-surface-variant">24 distinguished members</p>
              </div>
              <span className="text-sm text-on-surface-variant">Showing all departments</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {faculty.map((member, index) => (
                <div key={index} className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant hover:border-primary transition-all group">
                  <div className="h-52 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-6">
                    <h5 className="font-bold text-lg text-primary">{member.name}</h5>
                    <p className="text-primary text-sm mb-4">{member.role}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((spec, i) => (
                        <span key={i} className="text-xs bg-surface-container-high px-3 py-1 rounded-full text-on-surface-variant">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active = false }) {
  const className = `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`;

  if (to) {
    return (
      <Link to={to} className={className}>
        <span className="material-symbols-outlined">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <a href="#" className={className}>
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </a>
  );
}