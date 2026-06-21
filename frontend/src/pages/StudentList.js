import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Eye, UserPlus, SlidersHorizontal, Loader2, X } from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter state
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [libraryShift, setLibraryShift] = useState('');
  const [membershipStatus, setMembershipStatus] = useState('');

  // Edit Drawer state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    course: '',
    year: '',
    semester: '',
    membershipStatus: '',
    libraryShift: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.students.list({
        search,
        department,
        libraryShift,
        membershipStatus
      });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      setError('Failed to fetch student list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, libraryShift, membershipStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student and all their library data? This action is irreversible.')) {
      return;
    }
    try {
      const res = await api.students.delete(id);
      if (res.success) {
        setStudents(students.filter(s => s._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete student.');
    }
  };

  const openEditDrawer = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      department: student.department || 'Computer Science',
      course: student.course || 'B.Tech',
      year: student.year || '1st Year',
      semester: student.semester || '1st Semester',
      membershipStatus: student.membershipStatus || 'Pending',
      libraryShift: student.libraryShift || 'Morning'
    });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const res = await api.students.update(editingStudent._id, editForm);
      if (res.success) {
        setStudents(students.map(s => s._id === editingStudent._id ? res.data : s));
        setEditingStudent(null);
      } else {
        setEditError(res.message || 'Failed to update student.');
      }
    } catch (err) {
      setEditError(err.message || 'Error updating student record.');
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'bg-green-50 text-green-650 border-green-200/50 dark:bg-green-950/20 dark:text-green-400';
    if (status === 'Pending') return 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400';
    if (status === 'Suspended') return 'bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400';
    return 'bg-slate-50 text-slate-500 border-slate-200/50 dark:bg-slate-850 dark:text-slate-400'; // Expired
  };

  return (
    <Layout title="Student Directory">
      <div className="space-y-6 text-left relative min-h-screen pb-12">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by student name, ID, email, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <Link
            to="/students/add"
            className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-stretch sm:self-auto text-center justify-center"
          >
            <UserPlus size={15} />
            <span>Add Student</span>
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <SlidersHorizontal size={14} />
            <span>Filters:</span>
          </div>
          
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>

          <select
            value={libraryShift}
            onChange={(e) => setLibraryShift(e.target.value)}
            className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Shifts</option>
            <option value="Morning">Morning Shift</option>
            <option value="Afternoon">Afternoon Shift</option>
            <option value="Evening">Evening Shift</option>
            <option value="Custom">Custom/Custom Shifts</option>
          </select>

          <select
            value={membershipStatus}
            onChange={(e) => setMembershipStatus(e.target.value)}
            className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Membership Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Suspended">Suspended</option>
          </select>

          {(department || libraryShift || membershipStatus || search) && (
            <button
              onClick={() => {
                setDepartment('');
                setLibraryShift('');
                setMembershipStatus('');
                setSearch('');
              }}
              className="text-xs text-brand-600 hover:text-brand-500 font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Directory Table */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/55 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading student directory...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center text-red-500 text-xs">{error}</div>
          ) : students.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-xs">No students found matching current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                    <th className="py-3.5 px-6">Student ID / Name</th>
                    <th className="py-3.5 px-4">Roll / Registration</th>
                    <th className="py-3.5 px-4">Department & Course</th>
                    <th className="py-3.5 px-4">Shift timings</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-500/10 to-indigo-600/10 border border-brand-200/30 flex items-center justify-center text-brand-600 font-bold shrink-0 uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-850 dark:text-slate-150 block">{student.name}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold">{student.studentId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="block font-semibold">{student.rollNumber || 'N/A'}</span>
                        <span className="text-[10px] text-slate-400 block">{student.registrationNumber || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="block">{student.course || 'B.Tech'} - {student.semester || '1st Sem'}</span>
                        <span className="text-[10px] text-slate-400 block">{student.department}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-650 dark:text-slate-350">
                        {student.libraryShift ? `${student.libraryShift} Shift` : 'Morning Shift'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(student.membershipStatus)}`}>
                          {student.membershipStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2.5 justify-end">
                          <Link
                            to={`/students/${student._id}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => openEditDrawer(student)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            title="Edit Student"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Slide-over Drawer for Editing Student */}
        {editingStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto space-y-6 animate-slide-in flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Modify Student Record</h3>
                  <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                {editError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50">
                    {editError}
                  </div>
                )}

                <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input type="text" name="name" required value={editForm.name} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</label>
                    <input type="text" name="phone" required value={editForm.phone} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Course</label>
                    <input type="text" name="course" required value={editForm.course} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                      <select name="year" value={editForm.year} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Semester</label>
                      <select name="semester" value={editForm.semester} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                        {Array.from({ length: 8 }, (_, i) => (
                          <option key={i} value={`${i+1} semester`}>{i+1}th Semester</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Library Shift</label>
                      <select name="libraryShift" value={editForm.libraryShift} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                        <option value="Morning">Morning Shift</option>
                        <option value="Afternoon">Afternoon Shift</option>
                        <option value="Evening">Evening Shift</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Membership Status</label>
                      <select name="membershipStatus" value={editForm.membershipStatus} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Expired">Expired</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {editLoading && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentList;
