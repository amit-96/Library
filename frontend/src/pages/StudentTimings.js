import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Clock, Calendar, Search, ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react';

const StudentTimings = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Shift assignment state
  const [modifyingStudent, setModifyingStudent] = useState(null);
  const [shiftName, setShiftName] = useState('Morning Shift');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchTimings = async () => {
    setLoading(true);
    try {
      const res = await api.students.list({ search });
      if (res.success) {
        // Fetch detailed profiles to get timing sub-docs
        const detailsPromises = res.data.map(s => api.students.get(s._id));
        const detailsResponses = await Promise.all(detailsPromises);
        const compiled = detailsResponses.map(r => r.data);
        setStudents(compiled);
      }
    } catch (err) {
      setError('Failed to fetch library timings records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimings();
  }, [search]);

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    try {
      const res = await api.students.assignTiming(modifyingStudent._id, {
        shiftName,
        startTime,
        endTime
      });
      if (res.success) {
        setSuccess('Library shift and hours updated successfully!');
        setStudents(students.map(s => 
          s.student._id === modifyingStudent._id 
            ? { 
                ...s, 
                timing: res.data, 
                student: { 
                  ...s.student, 
                  libraryShift: shiftName.includes('Shift') ? shiftName.replace(' Shift', '') : 'Custom' 
                } 
              } 
            : s
        ));
        setModifyingStudent(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign timing.');
    } finally {
      setSubmitting(false);
    }
  };

  const getShiftColor = (shift) => {
    if (shift === 'Morning') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (shift === 'Afternoon') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (shift === 'Evening') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20'; // Custom
  };

  // Pre-configured shift hours
  const handleShiftSelect = (val) => {
    setShiftName(val);
    if (val === 'Morning Shift') {
      setStartTime('08:00 AM');
      setEndTime('12:00 PM');
    } else if (val === 'Afternoon Shift') {
      setStartTime('12:00 PM');
      setEndTime('04:00 PM');
    } else if (val === 'Evening Shift') {
      setStartTime('04:00 PM');
      setEndTime('08:00 PM');
    }
  };

  return (
    <Layout title="Timing & Shifts Controls">
      <div className="space-y-6 text-left pb-12">
        {/* Timing Shift Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Morning Shift</span>
              <span className="text-sm font-extrabold text-blue-500 font-outfit">08:00 AM - 12:00 PM</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">Allocated mostly for early study groups and technical references.</p>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Afternoon Shift</span>
              <span className="text-sm font-extrabold text-amber-500 font-outfit">12:00 PM - 04:00 PM</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">Allocated for regular syllabus revisions and seat occupancies.</p>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evening Shift</span>
              <span className="text-sm font-extrabold text-purple-500 font-outfit">04:00 PM - 08:00 PM</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">Allocated for capstone final revisions and group discussions.</p>
          </div>
        </div>

        {/* Directory Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search students to assign timings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50">{error}</div>}
        {success && <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-650 dark:text-green-400 text-xs border border-green-200/50">{success}</div>}

        {/* Timings table grid */}
        <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading timings desk...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-xs">No active students logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                    <th className="py-3.5 px-6">Student details</th>
                    <th className="py-3.5 px-4">Allocated Shift</th>
                    <th className="py-3.5 px-4">Start Time</th>
                    <th className="py-3.5 px-4">End Time</th>
                    <th className="py-3.5 px-4">Assigned Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                  {students.map(({ student, timing }) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-slate-855 dark:text-slate-150 block">{student.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{student.studentId} | {student.course}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${getShiftColor(student.libraryShift)}`}>
                          {student.libraryShift ? `${student.libraryShift} Shift` : 'Morning Shift'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {timing?.startTime || '08:00 AM'}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {timing?.endTime || '12:00 PM'}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {timing?.assignedDate ? new Date(timing.assignedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setModifyingStudent(student);
                            setShiftName(timing?.shiftName || 'Morning Shift');
                            setStartTime(timing?.startTime || '08:00 AM');
                            setEndTime(timing?.endTime || '12:00 PM');
                          }}
                          className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-900/30 text-brand-650 dark:text-brand-400 px-3 py-1.5 rounded-lg font-bold text-[10px] border border-brand-200/50 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <span>Assign shift</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Timing Shift Assignment Modal */}
        {modifyingStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocate shift timings</h4>
                <button onClick={() => setModifyingStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
              </div>

              <div>
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">{modifyingStudent.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{modifyingStudent.studentId}</span>
              </div>

              <form onSubmit={handleUpdateShift} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Library Shift</label>
                  <select
                    value={shiftName}
                    onChange={(e) => handleShiftSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Morning Shift">Morning Shift (08:00 AM - 12:00 PM)</option>
                    <option value="Afternoon Shift">Afternoon Shift (12:00 PM - 04:00 PM)</option>
                    <option value="Evening Shift">Evening Shift (04:00 PM - 08:00 PM)</option>
                    <option value="Custom Timing">Custom Timing</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      disabled={shiftName !== 'Custom Timing'}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:opacity-60 focus:outline-none"
                      placeholder="e.g. 08:00 AM"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      disabled={shiftName !== 'Custom Timing'}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:opacity-60 focus:outline-none"
                      placeholder="e.g. 12:00 PM"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl py-3 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save timing allocations</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentTimings;
