import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All Stories");

  const categories = ["All Stories", "Student Success", "Engineering Tips", "Platform Updates", "Research"];

  const posts = [
    {
      id: 1,
      category: "Tutorial",
      title: "Mastering Deep Focus: The 4-Hour Block Strategy",
      excerpt: "Techniques used by senior developers to achieve flow states during complex architectural overhauls.",
      date: "Oct 24, 2026",
      readTime: "8 min read",
      author: "James Dalton",
      image: "https://lh3.googleusercontent.com/aida-public/...",
    },
    {
      id: 2,
      category: "Engineering",
      title: "Optimizing Latency for Global Virtual Classrooms",
      excerpt: "A deep dive into our edge computing strategy that reduced classroom lag by 40% across APAC and EMEA.",
      date: "Oct 21, 2026",
      readTime: "12 min read",
      author: "Sarah Tan",
      image: "https://lh3.googleusercontent.com/aida-public/...",
    },
    {
      id: 3,
      category: "Success Story",
      title: "From Self-Taught to Lead Engineer: Maria’s Journey",
      excerpt: "How Maria leveraged AcademiaPro's deep-focus tracks to pivot from sales to senior software leadership.",
      date: "Oct 18, 2026",
      readTime: "6 min read",
      author: "Maria Kovac",
      image: "https://lh3.googleusercontent.com/aida-public/...",
    },
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
          <NavItem to="/contact" icon="contact_support" label="contact" />
        </div>


        <div className="mt-auto pt-6">
          <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:brightness-110 transition-all">
            Upgrade Plan
          </button>
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
            <h1 className="font-headline-md font-bold text-primary">Academic Insights</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80 hidden md:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                placeholder="Search insights..." 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-11 py-3 focus:border-primary focus:outline-none"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-surface-container relative">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Page Intro */}
          <div className="mb-12">
            <h2 className="font-headline-xl text-headline-xl text-primary mb-3">Academic Insights</h2>
            <p className="text-on-surface-variant max-w-2xl text-lg">
              The latest from TMBIS Academy: Student successes, pedagogical shifts, and platform evolution designed for the deep-focus technical professional.
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-label-md text-sm transition-all ${
                  activeCategory === cat 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-low border border-outline-variant hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-8 group relative overflow-hidden rounded-3xl aspect-video bg-surface-container-high border border-outline-variant hover:border-primary transition-all">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/...')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="bg-primary/90 text-on-primary text-xs px-4 py-2 rounded-full">Featured Update</span>
                <h3 className="text-3xl font-bold text-white mt-4 leading-tight">The Future of Asynchronous Collaboration in STEM Education</h3>
                <p className="text-white/80 mt-3 max-w-xl">How our new collaborative IDE integration is bridging the gap between isolated study and team-based research.</p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <SmallCard title="Biometric Authentication 2.0" category="Platform Update" />
              <SmallCard title="Top Researcher Spotlight: Dr. Elena Voss" category="Community" />
            </div>
          </div>

          {/* Main Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article key={post.id} className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant hover:border-primary transition-all group">
                <div className="h-52 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-primary font-medium">{post.category}</span>
                    <span className="text-on-surface-variant">{post.date}</span>
                  </div>
                  <h4 className="font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors">{post.title}</h4>
                  <p className="text-on-surface-variant text-sm line-clamp-3 mb-6">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-surface-container-high rounded-full flex items-center justify-center text-xs font-bold">JD</div>
                      <span>{post.author}</span>
                    </div>
                    <span className="text-on-surface-variant">{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter */}
          <div className="mt-20 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-3xl p-12 text-center border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">Deep Insights, Delivered</h3>
            <p className="max-w-md mx-auto text-on-surface-variant mb-8">Join 15,000+ researchers receiving our bi-weekly dispatch on the technical edge of education.</p>
            
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="professional@email.com" 
                className="flex-1 bg-surface-container border border-outline-variant rounded-2xl px-6 py-4 focus:border-primary focus:outline-none" 
              />
              <button className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold hover:brightness-110 transition-all">
                Subscribe
              </button>
            </div>
          </div>
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

function SmallCard({ title, category }) {
  return (
    <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant hover:border-primary transition-all cursor-pointer h-full flex flex-col">
      <span className="text-xs uppercase tracking-widest text-primary font-medium">{category}</span>
      <h4 className="font-bold text-lg mt-3 leading-tight flex-1">{title}</h4>
    </div>
  );
}