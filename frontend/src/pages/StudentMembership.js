import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Calendar, ShieldAlert, Award, ArrowUpRight, Search, CheckCircle, Loader2 } from 'lucide-react';

const StudentMembership = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Plan modification state
  const [modifyingStudent, setModifyingStudent] = useState(null);
  const [mType, setMType] = useState('Monthly');
  const [mStatus, setMStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await api.students.list({ search });
      if (res.success) {
        // Fetch detailed profiles to get membership sub-docs
        const detailsPromises = res.data.map(s => api.students.get(s._id));
        const detailsResponses = await Promise.all(detailsPromises);
        const compiled = detailsResponses.map(r => r.data);
        setStudents(compiled);
      }
    } catch (err) {
      setError('Failed to fetch membership records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [search]);

  const handleUpdateMembership = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    try {
      const res = await api.students.updateMembership(modifyingStudent._id, {
        membershipType: mType,
        status: mStatus
      });
      if (res.success) {
        setSuccess('Membership updated successfully!');
        setStudents(students.map(s => 
          s.student._id === modifyingStudent._id 
            ? { ...s, membership: res.data, student: { ...s.student, membershipStatus: mStatus } } 
            : s
        ));
        setModifyingStudent(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to update membership.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (status === 'Pending') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (status === 'Suspended') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20'; // Expired
  };

  // Stats
  const activeCount = students.filter(s => s.student.membershipStatus === 'Active').length;
  const pendingCount = students.filter(s => s.student.membershipStatus === 'Pending').length;
  const expiredCount = students.filter(s => s.student.membershipStatus === 'Expired' || !s.student.membershipStatus).length;

  return (
    <Layout title="Membership Control Desk">
      <div className="space-y-6 text-left pb-12">
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center font-bold">
              <CheckCircle size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Memberships</span>
              <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">{activeCount}</span>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center font-bold">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Registrations</span>
              <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">{pendingCount}</span>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center font-bold">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expired / Suspended</span>
              <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">{expiredCount}</span>
            </div>
          </div>
        </div>

        {/* Directory Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search student subscription records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs border border-red-200/50">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-650 dark:text-green-400 text-xs border border-green-200/50">
            {success}
          </div>
        )}

        {/* Memberships table grid */}
        <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading memberships desk...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-xs">No active memberships logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                    <th className="py-3.5 px-6">Student details</th>
                    <th className="py-3.5 px-4">Membership Type</th>
                    <th className="py-3.5 px-4">Start Date</th>
                    <th className="py-3.5 px-4">End Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                  {students.map(({ student, membership }) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-150 block">{student.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{student.studentId} | {student.course}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {membership?.membershipType || 'Monthly'}
                      </td>
                      <td className="py-4 px-4">
                        {membership?.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-650 dark:text-slate-350">
                        {membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(student.membershipStatus)}`}>
                          {student.membershipStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setModifyingStudent(student);
                            setMType(membership?.membershipType || 'Monthly');
                            setMStatus(student.membershipStatus || 'Pending');
                          }}
                          className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-900/30 text-brand-650 dark:text-brand-400 px-3 py-1.5 rounded-lg font-bold text-[10px] border border-brand-200/50 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <span>Manage plan</span>
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

        {/* Membership Modification Modal */}
        {modifyingStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription settings</h4>
                <button onClick={() => setModifyingStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
              </div>
              
              <div>
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">{modifyingStudent.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{modifyingStudent.studentId}</span>
              </div>

              <form onSubmit={handleUpdateMembership} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Membership Plan Type</label>
                  <select
                    value={mType}
                    onChange={(e) => setMType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subscription Status</label>
                  <select
                    value={mStatus}
                    onChange={(e) => setMStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl py-3 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Plan Configurations</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentMembership;
