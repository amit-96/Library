import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { UserCheck, Search, Clock, Plus, Loader2, ArrowRight } from 'lucide-react';

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Manual checkin/checkout form modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:00',
    checkOutTime: '12:00',
    status: 'Present'
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchAttendanceList = async () => {
    setLoading(true);
    try {
      const res = await api.students.list({ search });
      if (res.success) {
        // Fetch detailed profiles to get attendance sub-docs
        const detailsPromises = res.data.map(s => api.students.get(s._id));
        const detailsResponses = await Promise.all(detailsPromises);
        const compiled = detailsResponses.map(r => r.data);
        setStudents(compiled);
      }
    } catch (err) {
      setError('Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceList();
  }, [search]);

  const handleManualEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    try {
      const res = await api.students.logManualAttendance(selectedStudent._id, attendanceForm);
      if (res.success) {
        setSuccess(`Manual attendance logged for ${selectedStudent.name}!`);
        fetchAttendanceList();
        setSelectedStudent(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to log manual attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPercentageColor = (percent) => {
    if (percent >= 85) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (percent >= 75) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <Layout title="Attendance Dashboard">
      <div className="space-y-6 text-left pb-12">
        {/* Attendance Search and Trigger Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search students directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50">{error}</div>}
        {success && <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-650 dark:text-green-400 text-xs border border-green-200/50">{success}</div>}

        {/* Directory overview table */}
        <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading attendance data...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-xs">No student attendance records logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                    <th className="py-3.5 px-6">Student ID / Name</th>
                    <th className="py-3.5 px-4">Allocated Shift</th>
                    <th className="py-3.5 px-4 text-center">Days Present</th>
                    <th className="py-3.5 px-4 text-center">Days Absent</th>
                    <th className="py-3.5 px-4 text-center">Attendance %</th>
                    <th className="py-3.5 px-6 text-right">Log Manual Checkin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                  {students.map(({ student, attendance }) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-150 block">{student.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{student.studentId} | {student.course}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-650 dark:text-slate-350">
                          {student.libraryShift ? `${student.libraryShift} Shift` : 'Morning Shift'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-center text-green-500">
                        {attendance?.presentCount || 0} Days
                      </td>
                      <td className="py-4 px-4 font-bold text-center text-rose-500">
                        {attendance?.absentCount || 0} Days
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPercentageColor(attendance?.percentage || 100)}`}>
                          {attendance?.percentage || 100}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setAttendanceForm({
                              date: new Date().toISOString().split('T')[0],
                              checkInTime: student.libraryShift === 'Evening' ? '16:00' : (student.libraryShift === 'Afternoon' ? '12:00' : '08:00'),
                              checkOutTime: student.libraryShift === 'Evening' ? '20:00' : (student.libraryShift === 'Afternoon' ? '16:00' : '12:00'),
                              status: 'Present'
                            });
                          }}
                          className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-900/30 text-brand-650 dark:text-brand-400 px-3 py-1.5 rounded-lg font-bold text-[10px] border border-brand-200/50 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Plus size={12} />
                          <span>Manual log</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Attendance Entry Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><UserCheck size={14} /><span>Log Manual Entry</span></h4>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
              </div>

              <div>
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">{selectedStudent.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{selectedStudent.studentId} | {selectedStudent.libraryShift} Shift</span>
              </div>

              <form onSubmit={handleManualEntry} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Entry Date</label>
                  <input
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Check-In Time</label>
                    <input
                      type="time"
                      value={attendanceForm.checkInTime}
                      disabled={attendanceForm.status === 'Absent'}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, checkInTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:opacity-50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Check-Out Time</label>
                    <input
                      type="time"
                      value={attendanceForm.checkOutTime}
                      disabled={attendanceForm.status === 'Absent'}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOutTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:opacity-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl py-3 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Attendance Log</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAttendance;
