import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { FileDown, Printer, FileText, Loader2, Table } from 'lucide-react';

const StudentReports = () => {
  const [reportType, setReportType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);
    try {
      const res = await api.students.getReports(reportType);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      setError('Failed to compile report records.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;

    // Build CSV Content
    let csvHeaders = [];
    let csvRows = [];

    if (reportType === 'student') {
      csvHeaders = ['Name', 'Student ID', 'Email', 'Phone', 'Course', 'Semester', 'Department', 'Membership Status', 'Library Shift'];
      csvRows = reportData.map(r => [
        `"${r.name}"`,
        `"${r.studentId || ''}"`,
        `"${r.email}"`,
        `"${r.phone || ''}"`,
        `"${r.course || 'B.Tech'}"`,
        `"${r.semester || '1st Sem'}"`,
        `"${r.department}"`,
        `"${r.membershipStatus || 'Pending'}"`,
        `"${r.libraryShift || 'Morning'}"`
      ]);
    } else if (reportType === 'membership') {
      csvHeaders = ['Student Name', 'Student ID', 'Membership Type', 'Start Date', 'End Date', 'Status'];
      csvRows = reportData.map(r => [
        `"${r.user?.name || 'N/A'}"`,
        `"${r.user?.studentId || 'N/A'}"`,
        `"${r.membershipType || 'Monthly'}"`,
        `"${r.startDate ? new Date(r.startDate).toLocaleDateString() : 'N/A'}"`,
        `"${r.endDate ? new Date(r.endDate).toLocaleDateString() : 'N/A'}"`,
        `"${r.status || 'Pending'}"`
      ]);
    } else if (reportType === 'fee' || reportType === 'defaulters') {
      csvHeaders = ['Student Name', 'Student ID', 'Month', 'Year', 'Total Amount', 'Payment Method', 'Transaction ID', 'Status'];
      csvRows = reportData.map(r => [
        `"${r.studentId?.name || 'N/A'}"`,
        `"${r.studentId?.studentId || 'N/A'}"`,
        `"${r.month}"`,
        `"${r.year}"`,
        `"${r.amount}"`,
        `"${r.paymentMethod || 'Cash'}"`,
        `"${r.transactionId || ''}"`,
        `"${r.status}"`
      ]);
    } else if (reportType === 'attendance') {
      csvHeaders = ['Student Name', 'Student ID', 'Date', 'Check-In', 'Check-Out', 'Status'];
      csvRows = reportData.map(r => [
        `"${r.studentId?.name || 'N/A'}"`,
        `"${r.studentId?.studentId || 'N/A'}"`,
        `"${r.date}"`,
        `"${r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : 'N/A'}"`,
        `"${r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A'}"`,
        `"${r.status}"`
      ]);
    }

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Nalanda Digital Library_${reportType}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout title="Library Reports Center">
      <div className="space-y-6 text-left pb-12 print:bg-white print:p-0">
        {/* Controls Header */}
        <div className="glass-panel p-5 rounded-3xl space-y-4 print:hidden">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report criteria selection</h4>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="student">Student Enrollment Directory</option>
                <option value="membership">Library Membership Registry</option>
                <option value="fee">Fee Collection Records</option>
                <option value="defaulters">Fee Defaulters Directory</option>
                <option value="attendance">Daily Attendance Logs</option>
              </select>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-6 py-3 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Table size={15} />}
                <span>Generate Report</span>
              </button>

              {reportData && (
                <>
                  <button
                    onClick={handleExportCSV}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl px-4 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileDown size={15} />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl px-4 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Printer size={15} />
                    <span>Print</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50 print:hidden">{error}</div>}

        {/* Report Preview */}
        {reportData && (
          <div className="glass-panel p-6 rounded-3xl space-y-4 print:border-none print:shadow-none print:p-0">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><FileText size={15} className="text-brand-500" /><span>Report Output Preview</span></h3>
              <span className="text-[10px] text-slate-400">Records Compiled: {reportData.length}</span>
            </div>

            {reportData.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs">No records matching the selected report type.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                      {reportType === 'student' && (
                        <>
                          <th className="py-2.5 px-4">Student ID</th>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Course & Sem</th>
                          <th className="py-2.5 px-4">Shift</th>
                          <th className="py-2.5 px-4">Status</th>
                        </>
                      )}
                      {reportType === 'membership' && (
                        <>
                          <th className="py-2.5 px-4">Student Name</th>
                          <th className="py-2.5 px-4">Student ID</th>
                          <th className="py-2.5 px-4">Plan Type</th>
                          <th className="py-2.5 px-4">Start Date</th>
                          <th className="py-2.5 px-4">End Date</th>
                          <th className="py-2.5 px-4">Status</th>
                        </>
                      )}
                      {(reportType === 'fee' || reportType === 'defaulters') && (
                        <>
                          <th className="py-2.5 px-4">Student Name</th>
                          <th className="py-2.5 px-4">Student ID</th>
                          <th className="py-2.5 px-4">Month/Year</th>
                          <th className="py-2.5 px-4">Amount Due</th>
                          <th className="py-2.5 px-4">Method</th>
                          <th className="py-2.5 px-4">Status</th>
                        </>
                      )}
                      {reportType === 'attendance' && (
                        <>
                          <th className="py-2.5 px-4">Student Name</th>
                          <th className="py-2.5 px-4">Student ID</th>
                          <th className="py-2.5 px-4">Entry Date</th>
                          <th className="py-2.5 px-4">Check-In</th>
                          <th className="py-2.5 px-4">Check-Out</th>
                          <th className="py-2.5 px-4">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350 font-medium">
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        {reportType === 'student' && (
                          <>
                            <td className="py-3 px-4 font-mono font-bold text-slate-855 dark:text-slate-150">{item.studentId}</td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                            <td className="py-3 px-4">{item.email}</td>
                            <td className="py-3 px-4">{item.course || 'B.Tech'} - {item.semester || '1st Sem'}</td>
                            <td className="py-3 px-4">{item.libraryShift ? `${item.libraryShift} Shift` : 'Morning Shift'}</td>
                            <td className="py-3 px-4 font-bold text-green-500">{item.membershipStatus || 'Pending'}</td>
                          </>
                        )}
                        {reportType === 'membership' && (
                          <>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.user?.name || 'N/A'}</td>
                            <td className="py-3 px-4 font-mono">{item.user?.studentId || 'N/A'}</td>
                            <td className="py-3 px-4 font-bold">{item.membershipType || 'Monthly'}</td>
                            <td className="py-3 px-4">{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-3 px-4">{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-3 px-4 font-bold text-green-500">{item.status || 'Pending'}</td>
                          </>
                        )}
                        {(reportType === 'fee' || reportType === 'defaulters') && (
                          <>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.studentId?.name || 'N/A'}</td>
                            <td className="py-3 px-4 font-mono">{item.studentId?.studentId || 'N/A'}</td>
                            <td className="py-3 px-4 font-bold">{item.month} {item.year}</td>
                            <td className="py-3 px-4 font-bold text-rose-500">Rs. {item.amount}</td>
                            <td className="py-3 px-4">{item.paymentMethod || 'Cash'}</td>
                            <td className="py-3 px-4 font-bold text-green-500">{item.status}</td>
                          </>
                        )}
                        {reportType === 'attendance' && (
                          <>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.studentId?.name || 'N/A'}</td>
                            <td className="py-3 px-4 font-mono">{item.studentId?.studentId || 'N/A'}</td>
                            <td className="py-3 px-4 font-bold">{item.date}</td>
                            <td className="py-3 px-4">{item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : 'N/A'}</td>
                            <td className="py-3 px-4">{item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : 'N/A'}</td>
                            <td className="py-3 px-4 font-bold text-green-500">{item.status}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentReports;
