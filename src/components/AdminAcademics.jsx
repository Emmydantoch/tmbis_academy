import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

const emptyCatalogForm = {
  department: '',
  semester: '',
  level: '',
  course_code: '',
  title: '',
  units: '',
};

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
  { icon: 'people', label: 'Users', to: '/admin/users' },
  { icon: 'school', label: 'Courses', to: '/admin/courses' },
  { icon: 'library_books', label: 'Academic Management', to: '/admin/academics' },
  { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments' },
  { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
];

const tabs = [
  { id: 'curricula', label: 'Curriculum Repository', icon: 'menu_book' },
  { id: 'lecturers', label: 'Lecturer Directory', icon: 'groups' },
  { id: 'allocation', label: 'Course Allocation', icon: 'assignment_ind' },
];

export default function AdminAcademics() {
  const [activeTab, setActiveTab] = useState('curricula');
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [levels, setLevels] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [courseFilters, setCourseFilters] = useState(emptyCatalogForm);
  const [allocationFilters, setAllocationFilters] = useState({
    department: '',
    semester: '',
    level: '',
  });
  const [courseForm, setCourseForm] = useState(emptyCatalogForm);
  const [courseFile, setCourseFile] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingAllocation, setSavingAllocation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [catalogResponse, lecturerResponse, allocationResponse] =
        await Promise.all([
          api.get('auth/admin-academic/courses/'),
          api.get('auth/admin-academic/lecturers/'),
          api.get('auth/admin-academic/allocations/'),
        ]);
      setCourses(catalogResponse.data.courses || []);
      setDepartments(catalogResponse.data.departments || []);
      setSemesters(catalogResponse.data.semesters || []);
      setLevels(catalogResponse.data.levels || []);
      setLecturers(lecturerResponse.data.lecturers || []);
      setAllocations(allocationResponse.data.allocations || []);
      setError('');
    } catch (requestError) {
      console.error('Unable to load academic administration data:', requestError);
      setError(
        requestError.response?.data?.detail ||
          'Unable to load the curriculum, lecturer, and allocation data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, []);

  const visibleCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          (!courseFilters.department ||
            course.department === courseFilters.department) &&
          (!courseFilters.semester ||
            String(course.semester) === String(courseFilters.semester)) &&
          (!courseFilters.level || course.level === courseFilters.level),
      ),
    [courseFilters, courses],
  );

  const allocationCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          (!allocationFilters.department ||
            course.department === allocationFilters.department) &&
          (!allocationFilters.semester ||
            String(course.semester) === String(allocationFilters.semester)) &&
          (!allocationFilters.level ||
            course.level === allocationFilters.level),
      ),
    [allocationFilters, courses],
  );

  const visibleAllocations = useMemo(
    () =>
      allocations.filter(
        (allocation) =>
          (!allocationFilters.department ||
            allocation.department === allocationFilters.department) &&
          (!allocationFilters.semester ||
            String(allocation.semester_id) ===
              String(allocationFilters.semester)) &&
          (!allocationFilters.level ||
            allocation.level === allocationFilters.level),
      ),
    [allocationFilters, allocations],
  );

  const updateForm = (event) => {
    const { name, value } = event.target;
    setCourseForm((current) => ({ ...current, [name]: value }));
  };

  const resetCourseForm = () => {
    setCourseForm(emptyCatalogForm);
    setCourseFile(null);
    setEditingCourseId(null);
  };

  const startEditingCourse = (course) => {
    setCourseForm({
      department: course.department,
      semester: String(course.semester),
      level: course.level,
      course_code: course.course_code,
      title: course.title,
      units: course.units ?? '',
    });
    setCourseFile(null);
    setEditingCourseId(course.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCourse = async (event) => {
    event.preventDefault();
    setSavingCourse(true);
    setError('');
    setSuccess('');
    const payload = new FormData();
    Object.entries(courseForm).forEach(([key, value]) => {
      if (value !== '') payload.append(key, value);
    });
    if (courseFile) payload.append('curriculum_file', courseFile);

    try {
      if (editingCourseId) {
        await api.patch(
          `auth/admin-academic/courses/${editingCourseId}/`,
          payload,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        setSuccess('Curriculum course updated.');
      } else {
        await api.post('auth/admin-academic/courses/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Course added to the curriculum repository.');
      }
      resetCourseForm();
      await loadData();
    } catch (requestError) {
      console.error('Unable to save curriculum course:', requestError);
      setError(
        requestError.response?.data?.detail ||
          firstValidationMessage(requestError.response?.data) ||
          'Unable to save the course.',
      );
    } finally {
      setSavingCourse(false);
    }
  };

  const deleteCourse = async (course) => {
    if (
      !window.confirm(
        `Delete ${course.course_code} — ${course.title}? Any lecturer allocations for it will also be removed.`,
      )
    ) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`auth/admin-academic/courses/${course.id}/`);
      setSuccess(`${course.course_code} was deleted.`);
      await loadData();
    } catch (requestError) {
      console.error('Unable to delete curriculum course:', requestError);
      setError(
        requestError.response?.data?.detail || 'Unable to delete the course.',
      );
    }
  };

  const createAllocation = async (event) => {
    event.preventDefault();
    setSavingAllocation(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('auth/admin-academic/allocations/', {
        lecturer_id: selectedLecturerId,
        course_id: selectedCourseId,
      });
      setSuccess(response.data.detail);
      setSelectedCourseId('');
      await loadData();
    } catch (requestError) {
      console.error('Unable to allocate course to lecturer:', requestError);
      setError(
        requestError.response?.data?.detail || 'Unable to create the allocation.',
      );
    } finally {
      setSavingAllocation(false);
    }
  };

  const removeAllocation = async (allocation) => {
    if (
      !window.confirm(
        `Remove ${allocation.course_code} from ${allocation.lecturer_name}?`,
      )
    ) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(
        `auth/admin-academic/allocations/${allocation.id}/`,
      );
      setSuccess('Course allocation removed.');
      await loadData();
    } catch (requestError) {
      console.error('Unable to remove course allocation:', requestError);
      setError(
        requestError.response?.data?.detail ||
          'Unable to remove the course allocation.',
      );
    }
  };

  return (
    <SidebarLayout
      title="TMBIS Academy"
      subtitle="Admin Portal"
      headerTitle="Academic Management"
      navItems={navItems}
      showSearch
      searchPlaceholder="Search academic records..."
    >
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Academic Management
          </h1>
          <p className="text-on-surface-variant mt-2">
            Maintain curriculum records, view lecturers, and allocate
            semester-specific courses.
          </p>
        </div>

        <div
          className="mb-8 flex flex-wrap gap-2 border-b border-outline-variant"
          role="tablist"
          aria-label="Academic management sections"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`academic-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`academic-panel-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 font-medium ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-error"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-primary"
          >
            {success}
          </div>
        )}
        {loading ? (
          <p className="py-12 text-center text-on-surface-variant">
            Loading academic records…
          </p>
        ) : (
          <>
            {activeTab === 'curricula' && (
              <section
                id="academic-panel-curricula"
                role="tabpanel"
                aria-labelledby="academic-tab-curricula"
              >
                <CourseRepository
                  courses={visibleCourses}
                  departments={departments}
                  semesters={semesters}
                  levels={levels}
                  filters={courseFilters}
                  onFilterChange={(name, value) =>
                    setCourseFilters((current) => ({
                      ...current,
                      [name]: value,
                    }))
                  }
                  form={courseForm}
                  onFormChange={updateForm}
                  onFileChange={setCourseFile}
                  onSubmit={saveCourse}
                  onReset={resetCourseForm}
                  onEdit={startEditingCourse}
                  onDelete={deleteCourse}
                  file={courseFile}
                  editing={Boolean(editingCourseId)}
                  saving={savingCourse}
                />
              </section>
            )}
            {activeTab === 'lecturers' && (
              <section
                id="academic-panel-lecturers"
                role="tabpanel"
                aria-labelledby="academic-tab-lecturers"
              >
                <LecturerDirectory lecturers={lecturers} />
              </section>
            )}
            {activeTab === 'allocation' && (
              <section
                id="academic-panel-allocation"
                role="tabpanel"
                aria-labelledby="academic-tab-allocation"
              >
                <CourseAllocation
                  departments={departments}
                  semesters={semesters}
                  levels={levels}
                  lecturers={lecturers.filter((lecturer) => lecturer.is_approved)}
                  courses={allocationCourses}
                  allocations={visibleAllocations}
                  filters={allocationFilters}
                  onFilterChange={(name, value) => {
                    setAllocationFilters((current) => ({
                      ...current,
                      [name]: value,
                    }));
                    setSelectedCourseId('');
                  }}
                  selectedCourseId={selectedCourseId}
                  onCourseChange={setSelectedCourseId}
                  selectedLecturerId={selectedLecturerId}
                  onLecturerChange={setSelectedLecturerId}
                  onSubmit={createAllocation}
                  onRemove={removeAllocation}
                  saving={savingAllocation}
                />
              </section>
            )}
          </>
        )}
      </main>
    </SidebarLayout>
  );
}

function CourseRepository({
  courses,
  departments,
  semesters,
  levels,
  filters,
  onFilterChange,
  form,
  onFormChange,
  onFileChange,
  onSubmit,
  onReset,
  onEdit,
  onDelete,
  file,
  editing,
  saving,
}) {
  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-outline-variant bg-surface-container p-6"
      >
        <h2 className="text-xl font-bold text-primary">
          {editing ? 'Edit curriculum course' : 'Add course to curriculum'}
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField
            label="Department"
            name="department"
            value={form.department}
            options={departments}
            onChange={onFormChange}
            required
          />
          <SelectField
            label="Semester"
            name="semester"
            value={form.semester}
            options={semesters.map((semester) => ({
              value: String(semester.id),
              label: semester.name,
            }))}
            onChange={onFormChange}
            required
          />
          <SelectField
            label="Level"
            name="level"
            value={form.level}
            options={levels}
            onChange={onFormChange}
            required
          />
          <TextField
            label="Course code"
            name="course_code"
            value={form.course_code}
            onChange={onFormChange}
            required
          />
          <TextField
            label="Course title"
            name="title"
            value={form.title}
            onChange={onFormChange}
            required
          />
          <TextField
            label="Units (optional)"
            name="units"
            type="number"
            min="1"
            value={form.units}
            onChange={onFormChange}
          />
          <label className="flex flex-col gap-2 text-sm text-on-surface-variant md:col-span-3">
            Curriculum document (PDF, DOC, or DOCX; max 20 MB)
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => onFileChange(event.target.files?.[0] || null)}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2"
            />
            {file && <span>Selected: {file.name}</span>}
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-60"
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add course'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-outline-variant px-5 py-3"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-outline-variant bg-surface-container p-5">
        <h2 className="font-bold text-primary">Find curriculum courses</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField
            label="Department filter"
            name="department"
            value={filters.department}
            options={departments}
            onChange={(event) =>
              onFilterChange(event.target.name, event.target.value)
            }
          />
          <SelectField
            label="Semester filter"
            name="semester"
            value={filters.semester}
            options={semesters.map((semester) => ({
              value: String(semester.id),
              label: semester.name,
            }))}
            onChange={(event) =>
              onFilterChange(event.target.name, event.target.value)
            }
          />
          <SelectField
            label="Level filter"
            name="level"
            value={filters.level}
            options={levels}
            onChange={(event) =>
              onFilterChange(event.target.name, event.target.value)
            }
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Department / level</th>
              <th className="px-5 py-4">Semester</th>
              <th className="px-5 py-4">Units</th>
              <th className="px-5 py-4">Curriculum</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-5 py-4">
                  <strong className="block text-on-surface">
                    {course.course_code} · {course.title}
                  </strong>
                </td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">
                  {course.department} · {course.level} Level
                </td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">
                  {course.semester_name}
                </td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">
                  {course.units || '—'}
                </td>
                <td className="px-5 py-4">
                  {course.curriculum_file_url ? (
                    <a
                      href={course.curriculum_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      View file
                    </a>
                  ) : (
                    <span className="text-sm text-on-surface-variant">
                      Not uploaded
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(course)}
                      className="text-primary underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(course)}
                      className="text-error underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-10 text-center text-on-surface-variant"
                >
                  No courses match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LecturerDirectory({ lecturers }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container">
      <table className="w-full min-w-[640px] text-left">
        <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
          <tr>
            <th className="px-5 py-4">Lecturer</th>
            <th className="px-5 py-4">Lecturer ID</th>
            <th className="px-5 py-4">Faculty / department</th>
            <th className="px-5 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/30">
          {lecturers.map((lecturer) => (
            <tr key={lecturer.id}>
              <td className="px-5 py-4">
                <strong className="block">{lecturer.name || 'Name not provided'}</strong>
                <span className="text-sm text-on-surface-variant">
                  {lecturer.email}
                </span>
              </td>
              <td className="px-5 py-4 text-sm">{lecturer.lecturer_id || '—'}</td>
              <td className="px-5 py-4 text-sm">
                {[lecturer.faculty, lecturer.department].filter(Boolean).join(' · ') ||
                  '—'}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    lecturer.is_approved
                      ? 'bg-primary/10 text-primary'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {lecturer.is_approved ? 'Approved' : 'Pending approval'}
                </span>
              </td>
            </tr>
          ))}
          {lecturers.length === 0 && (
            <tr>
              <td
                colSpan="4"
                className="px-5 py-10 text-center text-on-surface-variant"
              >
                No lecturer profiles are registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CourseAllocation({
  departments,
  semesters,
  levels,
  lecturers,
  courses,
  allocations,
  filters,
  onFilterChange,
  selectedCourseId,
  onCourseChange,
  selectedLecturerId,
  onLecturerChange,
  onSubmit,
  onRemove,
  saving,
}) {
  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-outline-variant bg-surface-container p-6"
      >
        <h2 className="text-xl font-bold text-primary">
          Allocate courses to lecturers
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Choose a department, semester, and level to restrict the course list.
          Only approved lecturers can be assigned courses.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField
            label="Department"
            name="department"
            value={filters.department}
            options={departments}
            onChange={(event) =>
              onFilterChange(event.target.name, event.target.value)
            }
          />
          <SelectField
            label="Semester"
            name="semester"
            value={filters.semester}
            options={semesters.map((semester) => ({
              value: String(semester.id),
              label: semester.name,
            }))}
            onChange={(event) =>
              onFilterChange(event.target.name, event.target.value)
            }
          />
          <SelectField
            label="Level"
            name="level"
            value={filters.level}
            options={levels}
            onChange={(event) =>
              onFilterChange(event.target.name, event.target.value)
            }
          />
          <SelectField
            label="Curriculum course"
            name="course"
            value={selectedCourseId}
            options={courses.map((course) => ({
              value: String(course.id),
              label: `${course.course_code} · ${course.title} (${course.level} Level)`,
            }))}
            onChange={(event) => onCourseChange(event.target.value)}
            required
            disabled={courses.length === 0}
          />
          <SelectField
            label="Approved lecturer"
            name="lecturer"
            value={selectedLecturerId}
            options={lecturers.map((lecturer) => ({
              value: String(lecturer.id),
              label: `${lecturer.name || lecturer.email}${
                lecturer.lecturer_id ? ` · ${lecturer.lecturer_id}` : ''
              }`,
            }))}
            onChange={(event) => onLecturerChange(event.target.value)}
            required
            disabled={lecturers.length === 0}
          />
        </div>
        {courses.length === 0 && (
          <p className="mt-3 text-sm text-warning">
            There are no catalog courses matching the selected filters. Add
            courses in the Curriculum Repository first.
          </p>
        )}
        {lecturers.length === 0 && (
          <p className="mt-3 text-sm text-warning">
            No approved lecturers are available for assignment.
          </p>
        )}
        <button
          type="submit"
          disabled={saving || courses.length === 0 || lecturers.length === 0}
          className="mt-5 rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-60"
        >
          {saving ? 'Allocating…' : 'Allocate course'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container">
        <table className="w-full min-w-[820px] text-left">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Department / level</th>
              <th className="px-5 py-4">Semester</th>
              <th className="px-5 py-4">Lecturer</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {allocations.map((allocation) => (
              <tr key={allocation.id}>
                <td className="px-5 py-4">
                  <strong>{allocation.course_code}</strong>
                  <span className="block text-sm text-on-surface-variant">
                    {allocation.course_title}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm">
                  {allocation.department} · {allocation.level} Level
                </td>
                <td className="px-5 py-4 text-sm">
                  {allocation.semester_name}
                </td>
                <td className="px-5 py-4">{allocation.lecturer_name}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onRemove(allocation)}
                    className="text-error underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {allocations.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-10 text-center text-on-surface-variant"
                >
                  No allocations match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
}) {
  const placeholder = required ? 'Select...' : 'All';
  return (
    <label className="flex flex-col gap-2 text-sm text-on-surface-variant">
      {label}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-3 text-on-surface disabled:opacity-60"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({ label, name, value, onChange, ...inputProps }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-on-surface-variant">
      {label}
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-3 text-on-surface"
        {...inputProps}
      />
    </label>
  );
}

function firstValidationMessage(data) {
  if (!data || typeof data !== 'object') return '';
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length) return String(value[0]);
    if (typeof value === 'string') return value;
  }
  return '';
}
