import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Library() {
  const [activeFilter, setActiveFilter] = useState("All Materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const filters = ["All Materials", "Textbooks", "Lecture Notes", "Research Papers", "Case Studies"];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('library/materials/');
      const materials = response.data || [];
      setResources(materials.map((item) => ({
        ...item,
        type: inferType(item.file_type || item.file || ''),
        size: formatFileSize(item.file_size || ''),
        added: formatDate(item.uploaded_at),
        icon: iconForType(item.file_type || item.file || '')
      })));
    } catch (error) {
      console.error(error);
      setMessage('Unable to load materials right now.');
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please choose a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('course', course);
    formData.append('file', file);
    formData.append('file_type', file.type || inferType(file.name));
    formData.append('file_size', String(file.size));

    try {
      setUploading(true);
      setMessage('');
      await api.post('library/materials/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setCourse('');
      setFile(null);
      event.target.reset();
      await fetchMaterials();
      setMessage('Material uploaded successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredResources = resources.filter(resource => 
    (activeFilter === "All Materials" || resource.type === activeFilter) &&
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <NavItem to="/library" icon="library_books" label="Library" active />
        </div>

        <div className="mt-auto pt-8">
          <button className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 transition-all">
            Upload Material
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
            <h1 className="font-headline-md font-bold text-primary">Library & Resources</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80 hidden md:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources, textbooks, or papers..." 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-11 py-3 focus:border-primary focus:outline-none text-sm"
              />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Hero Banner */}
          <div className="bg-surface-container rounded-3xl p-10 mb-12 flex flex-col md:flex-row items-center gap-10 border border-outline-variant">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-primary mb-4">Library & Resources</h2>
              <p className="text-on-surface-variant text-lg max-w-md">
                Access a vast ocean of technical knowledge. From peer-reviewed papers to interactive lecture notes.
              </p>
            </div>
            <div className="text-7xl opacity-20">📚</div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeFilter === filter 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container border border-outline-variant hover:border-primary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Upload Section */}
          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
              <div>
                <h3 className="font-bold text-xl">Upload New Material</h3>
                <p className="text-on-surface-variant text-sm">Share notes, slides, papers, and other files with students</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Material title"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-3"
                />
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Course or category"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-3"
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-3 min-h-24"
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-dashed border-outline-variant p-4"
              />
              {message ? <p className="text-sm text-primary">{message}</p> : null}
              <button
                type="submit"
                disabled={uploading}
                className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-semibold disabled:opacity-70"
              >
                {uploading ? 'Uploading...' : 'Upload Material'}
              </button>
            </form>
          </div>

          {/* Resources List */}
          <div className="space-y-4">
            {filteredResources.map(resource => (
              <div key={resource.id} className="group flex items-center justify-between bg-surface-container p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-surface-container-high rounded-2xl flex items-center justify-center text-3xl text-primary">
                    <span className="material-symbols-outlined">{resource.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface group-hover:text-primary transition-colors">{resource.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant mt-1">
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs">{resource.type}</span>
                      <span>{resource.course}</span>
                      <span>• {resource.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <span className="text-on-surface-variant hidden md:block">Added {resource.added}</span>
                  <a
                    href={resource.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-2xl hover:brightness-110 transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function inferType(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('pdf') || text.includes('doc') || text.includes('ppt') || text.includes('txt') || text.includes('md')) {
    return 'Lecture Notes';
  }
  if (text.includes('paper') || text.includes('research') || text.includes('journal') || text.includes('thesis')) {
    return 'Research Papers';
  }
  if (text.includes('case')) {
    return 'Case Studies';
  }
  if (text.includes('book') || text.includes('textbook')) {
    return 'Textbooks';
  }
  return 'Lecture Notes';
}

function formatFileSize(value) {
  const size = Number(value || 0);
  if (!size || Number.isNaN(size)) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let current = size;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(current >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value) {
  if (!value) return 'recently added';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently added';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function iconForType(value) {
  const type = String(value || '').toLowerCase();
  if (type.includes('pdf')) return 'picture_as_pdf';
  if (type.includes('doc') || type.includes('ppt') || type.includes('txt') || type.includes('md')) return 'description';
  if (type.includes('video')) return 'movie';
  if (type.includes('image')) return 'image';
  return 'attach_file';
}

function NavItem({ icon, label, active = false, to }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}