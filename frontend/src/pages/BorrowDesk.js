import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { ClipboardList, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const BorrowDesk = () => {
  const [activeTab, setActiveTab] = useState('issue'); // issue / active
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fineDetails, setFineDetails] = useState(null); // stores { fine, bookTitle, studentName }

  // Issue Form fields
  const [studentEmail, setStudentEmail] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'active') {
      fetchActiveBorrows();
    }
  }, [activeTab]);

  const fetchActiveBorrows = async () => {
    setLoading(true);
    try {
      const res = await api.borrow.active();
      if (res.success) {
        setActiveBorrows(res.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.borrow.issue(studentEmail, bookIsbn, durationDays);
      if (res.success) {
        setSuccess(`Book successfully checked out! Due date: ${new Date(res.data.dueDate).toLocaleDateString()}`);
        setStudentEmail('');
        setBookIsbn('');
      }
    } catch (err) {
      setError(err.message || 'Book checkout failed');
    }
  };

  const handleReturn = async (borrowId, bookTitle, studentName) => {
    setError('');
    try {
      const res = await api.borrow.return(borrowId);
      if (res.success) {
        // Display fine summary if any
        setFineDetails({
          fine: res.data.fine,
          bookTitle,
          studentName
        });
        // Remove from list
        setActiveBorrows(prev => prev.filter(item => item._id !== borrowId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout title="Issue & Return Desk">
      <div className="space-y-6">
        {/* Navigation tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'issue'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Issue Book
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'active'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Active Issued Books
          </button>
        </div>

        {/* Issue Book View */}
        {activeTab === 'issue' && (
          <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl text-left border border-slate-200/50 dark:border-slate-800/40 mt-4">
            <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100 mb-6">Issue Book to Student</h3>
            
            <form onSubmit={handleIssue} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Student Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@libra.ai"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Book ISBN Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9780132350884"
                  value={bookIsbn}
                  onChange={(e) => setBookIsbn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Borrow Duration (Days)</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (1 Month)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-3 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/10 active:scale-98"
              >
                Issue Book
              </button>
            </form>
          </div>
        )}

        {/* Active Issued Books List */}
        {activeTab === 'active' && (
          <div className="mt-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : activeBorrows.length === 0 ? (
              <div className="glass-panel py-16 text-center text-slate-400 rounded-2xl">
                <ClipboardList size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p className="text-sm">No books currently issued to students.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 text-xs font-semibold">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Book Details</th>
                        <th className="px-6 py-4">Issue Date</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-700 dark:text-slate-300">
                      {activeBorrows.map(item => {
                        const isOverdue = new Date() > new Date(item.dueDate);
                        return (
                          <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{item.studentId?.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{item.studentId?.email}</div>
                              <div className="text-[9px] font-mono text-slate-400 mt-0.5">{item.studentId?.studentId}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-700 dark:text-slate-200">{item.bookId?.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">ISBN: {item.bookId?.isbn}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(item.issueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-slate-500">{new Date(item.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isOverdue
                                  ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
                                  : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400'
                              }`}>
                                {isOverdue ? 'Overdue' : 'Issued'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleReturn(item._id, item.bookId?.title, item.studentId?.name)}
                                className="rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-400 px-3.5 py-2 text-xs font-semibold transition-colors"
                              >
                                Return
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Return Details Summary Modal */}
        {fineDetails && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100">Book Returned Successfully</h3>
              
              <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-500 dark:text-slate-400 space-y-2 text-left border border-slate-100 dark:border-slate-800/80">
                <div><strong>Student:</strong> {fineDetails.studentName}</div>
                <div><strong>Book Title:</strong> {fineDetails.bookTitle}</div>
                <div className="border-t border-slate-200/50 dark:border-slate-800 mt-2 pt-2 flex items-center justify-between">
                  <span className="font-bold">Overdue Fine:</span>
                  <span className={`font-mono font-bold ${fineDetails.fine > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {fineDetails.fine > 0 ? `₹${fineDetails.fine}` : '₹0 (On Time)'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setFineDetails(null)}
                className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md"
              >
                Close Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BorrowDesk;
