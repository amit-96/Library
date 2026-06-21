import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Award, CreditCard, UserCheck, BookOpen, Armchair, BarChart, Printer, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Resolve target student ID: route param, or fall back to current user's ID
  const studentId = id || user?.id || user?._id;

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Additional records state
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [gamificationStats, setGamificationStats] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.students.get(studentId);
      if (res.success) {
        setProfileData(res.data);
      }
      
      // Fetch Borrow History
      try {
        const borrowRes = await api.borrow.studentHistory(studentId);
        if (borrowRes.success) {
          setBorrowHistory(borrowRes.data || []);
        }
      } catch (be) {
        // Fallback mock borrows
        setBorrowHistory([
          { bookId: { title: 'Introduction to Algorithms', isbn: '9780262033848' }, borrowDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'Returned' },
          { bookId: { title: 'Clean Code: A Handbook', isbn: '9780132350884' }, borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), returnDate: null, status: 'Issued' }
        ]);
      }

      // Fetch Gamification & streaks
      try {
        const gamRes = await api.gamification.stats();
        if (gamRes.success) {
          setGamificationStats(gamRes.data);
        }
      } catch (ge) {
        setGamificationStats({
          points: 185,
          level: 3,
          badges: ['Early Bird Check-in', 'Tech Reader'],
          streakDays: 4
        });
      }

    } catch (err) {
      setError(err.message || 'Failed to retrieve student profile records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchProfile();
    }
  }, [studentId]);

  const getStatusColor = (status) => {
    if (status === 'Active' || status === 'Paid') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (status === 'Pending' || status === 'Unpaid') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20'; // Expired / Suspended / Overdue
  };

  if (loading) {
    return (
      <Layout title="Student profile">
        <div className="py-24 text-center">
          <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Assembling profile records...</p>
        </div>
      </Layout>
    );
  }

  if (error || !profileData) {
    return (
      <Layout title="Student profile">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50 text-center">
          {error || 'Student profile records could not be resolved.'}
        </div>
      </Layout>
    );
  }

  const { student, membership, timing, feeHistory, attendance } = profileData;

  return (
    <Layout title={`${student.name} - Profile Details`}>
      <div className="space-y-6 text-left pb-12">
        {/* Profile Card Header */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-100 dark:border-blue-950 flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0 uppercase">
              {student.name.charAt(0)}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-outfit">{student.name}</h2>
              <span className="text-[10px] text-slate-400 block font-semibold">{student.studentId} | {student.course} ({student.semester})</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block ${getStatusColor(student.membershipStatus)}`}>{student.membershipStatus || 'Pending'}</span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Allocated shift</span>
            <span className="text-base font-extrabold text-brand-600 dark:text-brand-400 block font-outfit">{student.libraryShift ? `${student.libraryShift} Shift` : 'Morning Shift'}</span>
            <span className="text-[10px] text-slate-450 block font-medium">({timing?.startTime || '08:00 AM'} - {timing?.endTime || '12:00 PM'})</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800/60 overflow-x-auto gap-2">
          {[
            { id: 'profile', label: 'Overview', icon: User },
            { id: 'membership', label: 'Membership', icon: Award },
            { id: 'fees', label: 'Fee History', icon: CreditCard },
            { id: 'attendance', label: 'Attendance', icon: UserCheck },
            { id: 'borrows', label: 'Borrows', icon: BookOpen },
            { id: 'analytics', label: 'Gamification & Streaks', icon: BarChart }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <IconComp size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content panels */}
        <div className="mt-4">
          {/* PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="glass-panel p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 dark:text-slate-350">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Roll Number</span>
                    <span>{student.rollNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Registration No</span>
                    <span>{student.registrationNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Gender</span>
                    <span>{student.gender}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Date of Birth</span>
                    <span>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Email</span>
                    <span>{student.email}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Phone</span>
                    <span>{student.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="pt-2 text-xs font-medium">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Address</span>
                  <span>{student.address || 'No registered address.'}</span>
                </div>
              </div>

              {/* Academic & Shift Details */}
              <div className="glass-panel p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Academic & Enrollment details</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 dark:text-slate-350">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Department</span>
                    <span>{student.department}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Course</span>
                    <span>{student.course || 'B.Tech'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Academic Year</span>
                    <span>{student.year || '1st Year'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Current Semester</span>
                    <span>{student.semester || '1st Semester'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Membership Card ID</span>
                    <span>{student.membershipNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Joining Date</span>
                    <span>{new Date(student.joiningDate || student.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERSHIP PLAN */}
          {activeTab === 'membership' && (
            <div className="max-w-md mx-auto glass-panel p-6 rounded-3xl space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">Active library Plan</span>
                <h3 className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 font-outfit uppercase">
                  {membership?.membershipType || 'Monthly'}
                </h3>
                <span className={`px-3 py-0.5 rounded border inline-block text-[10px] font-bold ${getStatusColor(student.membershipStatus)}`}>
                  {student.membershipStatus || 'Pending'}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3.5 text-xs font-medium text-slate-650 dark:text-slate-350">
                <div className="flex justify-between">
                  <span>Start Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{membership?.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiry Date</span>
                  <span className="font-bold text-slate-850 dark:text-slate-100">{membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-100 dark:border-slate-800 pt-3">
                  <span>Timing Shift Assigned</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{student.libraryShift ? `${student.libraryShift} Shift` : 'Morning Shift'}</span>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed font-semibold">
                ⚠️ **Expirations & Renewal:** If your membership expires or is suspended, library seats reservation privileges will be disabled automatically. Please contact the librarian desk for plan renewals or modifications.
              </div>
            </div>
          )}

          {/* FEE HISTORY */}
          {activeTab === 'fees' && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Fee record History</h4>
              </div>
              
              {feeHistory.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-xs font-medium">No payment invoices registered.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                        <th className="py-3 px-4">Billing Month</th>
                        <th className="py-3 px-4">Amount Invoice</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Transaction Reference</th>
                        <th className="py-3 px-4 font-center">Status</th>
                        <th className="py-3 px-4 text-right">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                      {feeHistory.map((fee) => (
                        <tr key={fee._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                            {fee.month} {fee.year}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            Rs. {fee.amount}
                          </td>
                          <td className="py-3 px-4">
                            {fee.paymentMethod || 'Cash'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px]">
                            {fee.transactionId || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(fee.status)}`}>
                              {fee.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-450">
                            {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Circular Meter */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center space-y-4">
                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">Attendance Percentage</span>
                <div className="relative h-32 w-32 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-3xl font-extrabold font-outfit text-brand-650 dark:text-brand-400">{attendance.percentage}%</span>
                </div>
                <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                  <div>
                    <span className="block text-green-500 font-extrabold">{attendance.presentCount} Days</span>
                    <span>Present</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div>
                    <span className="block text-rose-500 font-extrabold">{attendance.absentCount} Days</span>
                    <span>Absent</span>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Attendance logs</h4>
                </div>

                {attendance.logs.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 text-xs font-medium">No checkin logs recorded.</div>
                ) : (
                  <div className="overflow-y-auto max-h-[300px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px] sticky top-0">
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Check-In</th>
                          <th className="py-2.5 px-4">Check-Out</th>
                          <th className="py-2.5 px-4">Source Method</th>
                          <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                        {attendance.logs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-100">{log.date}</td>
                            <td className="py-2.5 px-4">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : 'N/A'}</td>
                            <td className="py-2.5 px-4">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : 'N/A'}</td>
                            <td className="py-2.5 px-4 font-bold">{log.method || 'Manual'}</td>
                            <td className="py-2.5 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.status === 'Present' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BORROW HISTORY */}
          {activeTab === 'borrows' && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Book Borrowing Logs</h4>
              </div>

              {borrowHistory.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-xs font-medium">No borrowed books recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                        <th className="py-3 px-4">Book Title</th>
                        <th className="py-3 px-4">ISBN</th>
                        <th className="py-3 px-4">Borrow Date</th>
                        <th className="py-3 px-4">Return Date</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                      {borrowHistory.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-150">{b.bookId?.title || 'Book Title'}</td>
                          <td className="py-3 px-4 font-mono text-[10px]">{b.bookId?.isbn || 'N/A'}</td>
                          <td className="py-3 px-4">{new Date(b.borrowDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${b.status === 'Returned' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* GAMIFICATION & STREAKS */}
          {activeTab === 'analytics' && gamificationStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Streaks level card */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">Level Milepost</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 font-outfit">Level {gamificationStats.level}</span>
                    <span className="text-xs text-slate-400">({gamificationStats.points} XP Total)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>XP progress to Level {gamificationStats.level + 1}</span>
                    <span>{gamificationStats.points % 100} / 100 XP</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${gamificationStats.points % 100}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{gamificationStats.streakDays} Days study streak!</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Keep checking in daily to maintain streaks points.</span>
                  </div>
                </div>
              </div>

              {/* Earned Badges card */}
              <div className="glass-panel p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Earned Achievements</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {gamificationStats.badges && gamificationStats.badges.length > 0 ? (
                    gamificationStats.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-brand-200/50 flex items-center gap-1.5 transition-colors"
                      >
                        <Award size={12} />
                        <span>{badge}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-450">Complete quizzes and mock tasks to unlock badges!</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
