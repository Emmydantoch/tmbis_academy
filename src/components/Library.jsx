import { useCallback, useEffect, useState } from 'react';
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
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [canUpload] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isAdmin =
        user?.is_admin === true ||
        user?.is_staff === true ||
        user?.role === 'admin' ||
        user?.role === 'superuser';
      const isLecturer = ['lecturer', 'teacher', 'instructor'].includes(user?.role);
      return isAdmin || isLecturer;
    } catch {
      return false;
    }
  });
  const [uploadMode, setUploadMode] = useState('material');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [targetSemester, setTargetSemester] = useState('');
  const [departments] = useState([
    'Accounting', 'Business Administration', 'Entrepreneurship', 'Finance',
    'Industrial Relations and Personal Management', 'Marketing', 'Mass Communication',
    'Economics', 'Geography and Planning', 'Political Science', 'Psychology',
    'Sociology', 'Tourism', 'Computer Science', 'SLT Biotech', 'SLT Biochem',
    'SLT Chem', 'Statistics', 'History & International Studies', 'English and Literary Studies'
  ]);

  const filters = ["All Materials", "Textbooks", "Lecture Notes", "Research Papers", "Case Studies", "Video Lectures"];

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await api.get('library/materials/');
      const materials = response?.data || [];
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
  }, []);

  useEffect(() => {
    const initialFetch = setTimeout(fetchMaterials, 0);
    return () => clearTimeout(initialFetch);
  }, [fetchMaterials]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please choose a file to upload.');
      return;
    }

    const formData = new FormData();
    const isVideo = uploadMode === 'video' || isVideoFile(file.name, file.type);
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('course', course);
    formData.append('file', file);
    formData.append('file_type', file.type || inferType(file.name));
    formData.append('file_size', String(file.size));
    formData.append('department', targetDepartment);
    formData.append('level', targetLevel);
    if (targetSemester) {
      formData.append('semester', targetSemester);
    }
    if (isVideo) {
      formData.append('category', 'Video Lectures');
    }

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
      setTargetDepartment('');
      setTargetLevel('');
      setTargetSemester('');
      event.target.reset();
      await fetchMaterials();
      setMessage('Material uploaded successfully.');
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.detail ||
        'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId, materialTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${materialTitle || 'this material'}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(materialId);
      setMessage('');
      await api.delete(`library/materials/${materialId}/`);
      setResources((prev) => prev.filter((r) => r.id !== materialId));
      setMessage('Material deleted successfully.');
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.detail || 'Failed to delete material. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredResources = resources.filter(resource => 
    (activeFilter === "All Materials" || resource.type === activeFilter) &&
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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

      {/* Search */}
      <div className="mb-8">
        <div className="relative w-full max-w-md">
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

      {/* Upload Section — restricted to admins and lecturers only */}
      {canUpload ? (
        <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
            <div>
              <h3 className="font-bold text-xl">Upload New Material</h3>
              <p className="text-on-surface-variant text-sm">Share notes, slides, papers, videos, and other files with students</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUploadMode('material')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${uploadMode === 'material' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant'}`}
            >
              Document / Notes
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('video')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${uploadMode === 'video' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant'}`}
            >
              Video Lecture
            </button>
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
            
            {/* Targeting Section */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50">
              <p className="text-sm font-semibold text-on-surface mb-3">
                <span className="material-symbols-outlined text-lg align-middle mr-1">visibility</span>
                Target Students (Optional)
              </p>
              <p className="text-xs text-on-surface-variant mb-4">
                Leave empty to make this material visible to all students. Specify to restrict access.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="">All Levels</option>
                  {['100', '200', '300', '400', '500', '600'].map(level => (
                    <option key={level} value={level}>{level} Level</option>
                  ))}
                </select>
                <select
                  value={targetSemester}
                  onChange={(e) => setTargetSemester(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="">All Semesters</option>
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </select>
              </div>
            </div>

            <input
              type="file"
              accept={uploadMode === 'video' ? 'video/*,.mp4,.mov,.avi,.mkv,.webm' : '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv,.json'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-dashed border-outline-variant p-4"
            />
            {message ? <p className="text-sm text-primary">{message}</p> : null}
            <button
              type="submit"
              disabled={uploading}
              className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-semibold disabled:opacity-70"
            >
              {uploading ? 'Uploading...' : uploadMode === 'video' ? 'Upload Video' : 'Upload Material'}
            </button>
          </form>
        </div>
      ) : null}

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map(resource => (
          <div key={resource.id} className="group flex flex-col md:flex-row md:items-center justify-between bg-surface-container p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all gap-4">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-surface-container-high rounded-2xl flex items-center justify-center text-3xl text-primary shrink-0">
                <span className="material-symbols-outlined">{resource.icon}</span>
              </div>
              <div>
                <h4 className="font-semibold text-on-surface group-hover:text-primary transition-colors">{resource.title}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant mt-1.5">
                  <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-medium">{resource.type}</span>
                  {resource.course ? <span className="text-xs font-medium text-primary">• {resource.course}</span> : null}
                  {resource.department ? (
                    <span className="bg-surface-container-high px-2.5 py-0.5 rounded-full text-xs">
                      {resource.department}
                    </span>
                  ) : null}
                  {resource.level ? (
                    <span className="bg-surface-container-high px-2.5 py-0.5 rounded-full text-xs">
                      {resource.level} Level
                    </span>
                  ) : null}
                  {resource.semester_name ? (
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {resource.semester_name}
                    </span>
                  ) : (
                    <span className="bg-surface-container-high/60 px-2.5 py-0.5 rounded-full text-xs text-on-surface-variant">
                      All Semesters
                    </span>
                  )}
                  <span className="text-xs text-on-surface-variant">• {resource.size}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 md:gap-4 text-sm self-end md:self-center">
              <span className="text-on-surface-variant hidden md:block">Added {resource.added}</span>
              {canUpload ? (
                <button
                  type="button"
                  disabled={deletingId === resource.id}
                  onClick={() => handleDelete(resource.id, resource.title)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-error border border-error/30 hover:bg-error-container/20 hover:border-error transition-all font-medium text-xs md:text-sm disabled:opacity-50"
                  title="Delete material"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span>{deletingId === resource.id ? 'Deleting...' : 'Delete'}</span>
                </button>
              ) : null}
              <a
                href={resource.file_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-2xl hover:brightness-110 transition-all font-semibold"
              >
                <span className="material-symbols-outlined">download</span>
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function inferType(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('mp4') || text.includes('mov') || text.includes('avi') || text.includes('mkv') || text.includes('webm') || text.includes('video')) {
    return 'Video Lectures';
  }
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
  if (type.includes('mp4') || type.includes('mov') || type.includes('avi') || type.includes('mkv') || type.includes('webm') || type.includes('video')) return 'movie';
  if (type.includes('pdf')) return 'picture_as_pdf';
  if (type.includes('doc') || type.includes('ppt') || type.includes('txt') || type.includes('md')) return 'description';
  if (type.includes('image')) return 'image';
  return 'attach_file';
}

function isVideoFile(name = '', type = '') {
  const combined = `${name} ${type}`.toLowerCase();
  return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'video'].some((token) => combined.includes(token));
}