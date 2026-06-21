import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Layout from '../components/Layout';
import {
  Users,
  BookOpen,
  BookmarkCheck,
  TrendingUp,
  Clock,
  UserCheck,
  Calendar,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [notices, setNotices] = useState([]);
  const [studyStats, setStudyStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user.role === 'student') {
          // Fetch student analytics
          const res = await api.analytics.student(user.id);
          // Fetch notices
          const noticesRes = await api.notices.list();
          // Fetch recommendations (FastAPI)
          let recs = [];
          try {
            const historyRes = await api.borrow.studentHistory(user.id);
            const allBooksRes = await api.books.list({ limit: 100 });
            if (historyRes.success && allBooksRes.success) {
              const aiRecs = await api.fastapi.recommendations(historyRes.data, allBooksRes.data);
              recs = aiRecs.recommendations || [];
            }
          } catch (aiErr) {
            console.error('FastAPI Recommendations fail, using mock:', aiErr.message);
            // Mock recommendations fallback
            const allBooks = await api.books.list({ limit: 4 });
            recs = allBooks.data || [];
          }

          if (res.success) {
            setData(res.data);
          }
          if (noticesRes.success) {
            setNotices(noticesRes.data);
          }
          setRecommendations(recs);

          // Fetch study statistics (streaks, consistency, etc.)
          try {
            const statsRes = await api.ai.studyStats();
            if (statsRes.success) {
              setStudyStats(statsRes.data);
            }
          } catch (statsErr) {
            console.error('Failed to load study stats:', statsErr.message);
          }
        } else {
          // Fetch Admin/Librarian SaaS analytics
          const res = await api.analytics.dashboard();
          if (res.success) {
            setData(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  // Render Student view
  if (user.role === 'student') {
    const summary = data?.summary || {};
    
    // Reading Trends Chart Config
    const readingChartData = {
      labels: data?.monthlyReadingTrend?.map(item => item.month) || ['No Data'],
      datasets: [
        {
          fill: true,
          label: 'Books Borrowed',
          data: data?.monthlyReadingTrend?.map(item => item.books) || [0],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#8b5cf6'
        }
      ]
    };

    return (
      <Layout title="Student Learning Hub">
        <div className="space-y-6">
          {/* Welcome Panel */}
          <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 p-6 md:p-8 text-white text-left shadow-lg shadow-brand-500/10">
            <h2 className="text-2xl font-bold font-outfit">Welcome back, {user.name}!</h2>
            <p className="text-brand-100 text-sm mt-1">Keep track of your borrowed textbooks, seats, and coursework learning statistics.</p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Active Borrowed Books</p>
                <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.activeBorrows}</h3>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <BookmarkCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Total Books Read</p>
                <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.totalBorrowed}</h3>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Attendance Percentage</p>
                <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.attendancePercentage}%</h3>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Active Reserved Seat</p>
                <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.reservedSeat}</h3>
              </div>
            </div>
          </div>

          {/* Study Streaks & Consistency Widgets */}
          {studyStats && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Daily Streak Card */}
              <div className="glass-panel p-5 rounded-2xl text-left flex items-center gap-4 border-l-4 border-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
                <span className="text-3xl">🔥</span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Current Check-In Streak</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit">{studyStats.streaks}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Days Consecutive</span>
                  </div>
                </div>
              </div>

              {/* Consistency Meter Card */}
              <div className="glass-panel p-5 rounded-2xl text-left flex items-center gap-4 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <span className="text-3xl">📈</span>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-slate-400">Consistency Score</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit">{studyStats.consistencyScore}%</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Target Consistency</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${studyStats.consistencyScore}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Weekly Reading Hours Card */}
              <div className="glass-panel p-5 rounded-2xl text-left flex items-center gap-4 border-l-4 border-violet-500 bg-gradient-to-br from-violet-500/5 to-transparent">
                <span className="text-3xl">⚡</span>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-slate-400">Weekly Target Progress</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit">{studyStats.weeklyHours} hrs</span>
                    <span className="text-xs text-slate-450">/ 20 hrs target</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                    <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (studyStats.weeklyHours / 20) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Reading Trend Chart */}
            <div className="glass-panel p-5 rounded-2xl lg:col-span-2 text-left">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-500" />
                <span>Reading Trend (Borrows per Month)</span>
              </h3>
              <div className="h-64">
                <Line
                  data={readingChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { ticks: { stepSize: 1 } }
                    }
                  }}
                />
              </div>
            </div>

            {/* Notice Billboard */}
            <div className="glass-panel p-5 rounded-2xl text-left flex flex-col">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-brand-500" />
                <span>Library Notice Board</span>
              </h3>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-64 pr-2">
                {notices.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No announcements posted</p>
                ) : (
                  notices.map(notice => (
                    <div key={notice._id} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{notice.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed pl-3.5">
                        {notice.content}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2.5 pl-3.5 border-l border-slate-200 dark:border-slate-800">
                        <span>Issued by: <strong className="text-slate-500 dark:text-slate-350">{notice.publishedBy?.name || 'Library Admin'}</strong> ({notice.publishedBy?.role || 'Admin'})</span>
                        <span className="font-mono">{new Date(notice.scheduledFor).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-panel p-6 rounded-2xl text-left">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500 animate-pulse" />
              <span>AI Recommended Readings (Based on Borrowing Patterns)</span>
            </h3>
            {recommendations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No recommendations ready yet. Start borrowing books to train your model!</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {recommendations.map(book => (
                  <div key={book._id} className="rounded-xl border border-slate-200/50 p-3 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/30 flex flex-col justify-between">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-32 w-full object-cover rounded-lg mb-2.5 shadow-sm"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{book.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{book.author}</p>
                      <span className="inline-block mt-2 text-[9px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full capitalize">
                        {book.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Render Librarian / Admin SaaS View
  const summary = data?.summary || {};
  
  // Book Category Doughnut/Bar Chart Config
  const categoryChartData = {
    labels: data?.categories?.map(item => item.name) || ['None'],
    datasets: [
      {
        label: 'Book Quantity',
        data: data?.categories?.map(item => item.value) || [0],
        backgroundColor: [
          'rgba(124, 58, 237, 0.75)',
          'rgba(99, 102, 241, 0.75)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(239, 68, 68, 0.75)',
          'rgba(107, 114, 128, 0.75)'
        ],
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  // 7 Days Attendance Trend Config
  const attendanceChartData = {
    labels: data?.attendanceTrend?.map(item => item.date) || ['None'],
    datasets: [
      {
        fill: true,
        label: 'Attendance Count',
        data: data?.attendanceTrend?.map(item => item.count) || [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  return (
    <Layout title="Administrative Dashboard">
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Students</p>
              <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.students}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Book Titles</p>
              <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.books}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <BookmarkCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Books Issued</p>
              <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.issuedBooks}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Seat Utilization</p>
              <h3 className="text-xl font-bold font-outfit text-slate-700 dark:text-slate-200 mt-0.5">{summary.seatUtilization}%</h3>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Books Category Analytics */}
          <div className="glass-panel p-5 rounded-2xl text-left">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Books Distribution by Category</h3>
            <div className="h-64">
              <Bar
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
          </div>

          {/* Daily Attendance Trend */}
          <div className="glass-panel p-5 rounded-2xl text-left">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Library Attendance Logs (Last 7 Days)</h3>
            <div className="h-64">
              <Line
                data={attendanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities Panel */}
        <div className="glass-panel p-5 rounded-2xl text-left">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Recent Library Activity Logs</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {!data || !data.recentActivities || data.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent activity logs found</p>
            ) : (
              data?.recentActivities?.map(act => (
                <div key={act.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      act.type === 'issue' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <BookmarkCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{act.message}</p>
                      <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                    act.type === 'issue' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {act.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
