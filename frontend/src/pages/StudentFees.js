import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { IndianRupee, Bell, CreditCard, Receipt, FileSpreadsheet, Search, CheckCircle, AlertTriangle, Loader2, SlidersHorizontal } from 'lucide-react';


const StudentFees = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search student for fee record
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fee collection modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeForm, setFeeForm] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    admissionFee: 0,
    monthlyFee: 499,
    securityDeposit: 0,
    paymentMethod: 'UPI',
    transactionId: '',
    status: 'Paid'
  });
  const [collecting, setCollecting] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Receipt printable state
  const [receiptData, setReceiptData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.students.getFeesDashboard();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError('Failed to fetch fees statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSearchStudents = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await api.students.list({ search: query });
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const openCollectionModal = (student) => {
    setSelectedStudent(student);
    
    // Determine monthly fee dynamically based on flyer pricing structure
    let defaultFee = 499;
    if (student && student.libraryShift) {
      const shift = student.libraryShift.toLowerCase();
      const cycle = student.membershipType || 'Monthly';
      
      let shiftType = '6h';
      if (shift.includes('24') || shift.includes('full')) {
        shiftType = '24h';
      } else if (shift.includes('12') || shift.includes('full day')) {
        shiftType = '12h';
      } else if (shift.includes('night')) {
        shiftType = 'night';
      }

      const matrix = {
        '24h': { 'Monthly': 599, 'Quarterly': 1499, 'Half-Yearly': 2999, 'Yearly': 5999 },
        '12h': { 'Monthly': 499, 'Quarterly': 1249, 'Half-Yearly': 2499, 'Yearly': 4999 },
        '6h': { 'Monthly': 299, 'Quarterly': 749, 'Half-Yearly': 1499, 'Yearly': 2999 },
        'night': { 'Monthly': 299, 'Quarterly': 749, 'Half-Yearly': 1499, 'Yearly': 2999 }
      };

      if (matrix[shiftType] && matrix[shiftType][cycle]) {
        defaultFee = matrix[shiftType][cycle];
      } else {
        defaultFee = cycle === 'Yearly' ? 2999 : (cycle === 'Half-Yearly' ? 1499 : (cycle === 'Quarterly' ? 749 : 299));
      }
    }

    setFeeForm({
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      admissionFee: 0,
      monthlyFee: defaultFee,
      securityDeposit: 0,
      paymentMethod: 'UPI',
      transactionId: '',
      status: 'Paid'
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    setCollecting(true);
    setSuccessMsg('');
    try {
      const totalAmount = Number(feeForm.admissionFee) + Number(feeForm.monthlyFee) + Number(feeForm.securityDeposit);
      const res = await api.students.collectFees(selectedStudent._id, {
        ...feeForm,
        amount: totalAmount
      });
      if (res.success) {
        setSuccessMsg(`Fees collected successfully for ${selectedStudent.name}!`);
        fetchDashboard();
        setSelectedStudent(null);
        
        // Load Receipt view details
        setReceiptData({
          student: selectedStudent,
          fee: res.data,
          totalAmount
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit payment record.');
    } finally {
      setCollecting(false);
    }
  };

  const triggerOverdueReminders = async () => {
    setReminderLoading(true);
    setSuccessMsg('');
    try {
      const res = await api.students.sendFeeReminders();
      if (res.success) {
        setSuccessMsg(res.message);
        fetchDashboard();
      }
    } catch (err) {
      setError('Failed to dispatch payment alerts.');
    } finally {
      setReminderLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Layout title="Monthly Fee Registry">
      <div className="space-y-6 text-left pb-12 print:bg-white print:p-0">
        {/* Print only receipt wrapper */}
        {receiptData && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:relative print:inset-auto print:bg-white print:p-0">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 print:border-none print:shadow-none print:max-w-full print:p-0">
              <div className="text-center space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="h-10 w-10 bg-brand-500 text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto print:hidden">L</div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-outfit">Nalanda Digital Library Smart Library</h3>
                <span className="text-[10px] text-slate-400 block font-semibold">FEE PAYMENT RECEIPT</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Student Name</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{receiptData.student.name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Student ID</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{receiptData.student.studentId}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Payment Month</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{receiptData.fee.month} {receiptData.fee.year}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Receipt No</span>
                  <span className="text-slate-850 dark:text-slate-150 font-mono font-bold">{receiptData.fee._id.substring(18)}</span>
                </div>
              </div>

              <div className="border-y border-slate-100 dark:border-slate-800 py-3 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between font-medium">
                  <span>Admission Fee</span>
                  <span>Rs. {receiptData.fee.admissionFee || 0}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Library Monthly Fee</span>
                  <span>Rs. {receiptData.fee.monthlyFee || 0}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Security Deposit</span>
                  <span>Rs. {receiptData.fee.securityDeposit || 0}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-dashed border-slate-200 dark:border-slate-800 pt-2.5 text-slate-900 dark:text-white">
                  <span>Total Amount Paid</span>
                  <span>Rs. {receiptData.totalAmount}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                <span className="block">Method: {receiptData.fee.paymentMethod}</span>
                {receiptData.fee.transactionId && <span className="block">Transaction ID: {receiptData.fee.transactionId}</span>}
                <span className="block">Date: {new Date(receiptData.fee.paymentDate || Date.now()).toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden">
                <button onClick={() => setReceiptData(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-xs font-bold transition-colors">Close</button>
                <button onClick={handlePrintReceipt} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"><Receipt size={14} /><span>Print receipt</span></button>
              </div>
            </div>
          </div>
        )}

        {/* Search for payment */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search student to record payments..."
              value={searchQuery}
              onChange={handleSearchStudents}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {searchResults.map(s => (
                  <button
                    key={s._id}
                    onClick={() => openCollectionModal(s)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-850 dark:text-slate-200 block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 block">{s.studentId}</span>
                    </div>
                    <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-lg border border-brand-100">Collect</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={triggerOverdueReminders}
            disabled={reminderLoading}
            className="border border-amber-250 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/20 text-amber-600 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {reminderLoading ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
            <span>Trigger Dues Reminders</span>
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50 print:hidden">{error}</div>}
        {successMsg && <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-650 dark:text-green-400 text-xs border border-green-200/50 print:hidden">{successMsg}</div>}

        {/* Dashboard summary stats */}
        {dashboardData && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
              <div className="glass-panel p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center font-bold">
                  <CreditCard size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Collected</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">Rs. {dashboardData.stats.totalFeesCollected}</span>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center font-bold">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Collections</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">Rs. {dashboardData.stats.pendingFees}</span>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center font-bold">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Payments</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">Rs. {dashboardData.stats.overduePayments}</span>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center font-bold">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Revenue</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-outfit">Rs. {Math.round(dashboardData.stats.monthlyRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Collection Reports Bar Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
              <div className="md:col-span-2 glass-panel p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><FileSpreadsheet size={15} /><span>Monthly Collection Report</span></h4>
                <div className="space-y-3 pt-2">
                  {dashboardData.monthlyCollectionReport.slice(0, 4).map((m, idx) => {
                    const total = m.collected + m.pending;
                    const percentCollected = total > 0 ? (m.collected / total) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-350">{m.month}</span>
                          <span className="text-slate-500">Collected: Rs. {m.collected} / Pending: Rs. {m.pending}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                          <div className="bg-brand-500 h-full" style={{ width: `${percentCollected}%` }}></div>
                          <div className="bg-amber-500 h-full" style={{ width: `${100 - percentCollected}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Pie Chart Representation */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><SlidersHorizontal size={15} /><span>Collection Ratios</span></h4>
                <div className="flex flex-col gap-3 py-2">
                  {dashboardData.statusBreakdown.map((item, idx) => {
                    const color = item.name === 'Paid' ? 'bg-green-500' : (item.name === 'Unpaid' ? 'bg-amber-500' : 'bg-rose-500');
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-650 dark:text-slate-350">
                          <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
                          <span>{item.name} Logs</span>
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.value} Records</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Defaulters list */}
            <div className="glass-panel p-5 rounded-3xl space-y-4 print:hidden">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-red-500"><AlertTriangle size={15} /><span>Defaulters List & Payment Actions</span></h4>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/40 text-slate-450 uppercase tracking-wider font-extrabold text-[9px]">
                      <th className="py-2.5 px-4">Student ID / Name</th>
                      <th className="py-2.5 px-4">Department & Sem</th>
                      <th className="py-2.5 px-4">Overdue Month</th>
                      <th className="py-2.5 px-4">Balance Due</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-750 dark:text-slate-250 font-medium">
                    {dashboardData.defaulters.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-850 dark:text-slate-150">
                          <span className="block">{record.studentId?.name || 'Deleted Student'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{record.studentId?.studentId || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{record.studentId?.course || 'B.Tech'} - {record.studentId?.semester || '1st Sem'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-650 dark:text-slate-350">
                          {record.month} {record.year}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-rose-500">
                          Rs. {record.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${record.status === 'Overdue' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-amber-50 border-amber-250 text-amber-600'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openCollectionModal(record.studentId)}
                            className="bg-brand-600 hover:bg-brand-500 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-sm"
                          >
                            Collect Fees
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Collect Fees Dialog Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log Fees Payment</h4>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
              </div>

              <div>
                <span className="font-extrabold text-slate-855 dark:text-slate-100 text-sm block">{selectedStudent.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{selectedStudent.studentId} | {selectedStudent.course}</span>
              </div>

              <form onSubmit={handleCollectSubmit} className="space-y-3.5 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Month</label>
                    <select
                      value={feeForm.month}
                      onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                    <input
                      type="number"
                      value={feeForm.year}
                      onChange={(e) => setFeeForm({ ...feeForm, year: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Admission</label>
                    <input
                      type="number"
                      value={feeForm.admissionFee}
                      onChange={(e) => setFeeForm({ ...feeForm, admissionFee: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Monthly Fee</label>
                    <input
                      type="number"
                      value={feeForm.monthlyFee}
                      onChange={(e) => setFeeForm({ ...feeForm, monthlyFee: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Security</label>
                    <input
                      type="number"
                      value={feeForm.securityDeposit}
                      onChange={(e) => setFeeForm({ ...feeForm, securityDeposit: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                    <select
                      value={feeForm.paymentMethod}
                      onChange={(e) => setFeeForm({ ...feeForm, paymentMethod: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                    <select
                      value={feeForm.status}
                      onChange={(e) => setFeeForm({ ...feeForm, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Transaction ID / Reference</label>
                  <input
                    type="text"
                    value={feeForm.transactionId}
                    onChange={(e) => setFeeForm({ ...feeForm, transactionId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                    placeholder="tx_78596412"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-250/50 dark:border-slate-800/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center">
                  <span>Total Payable:</span>
                  <span>Rs. {Number(feeForm.admissionFee) + Number(feeForm.monthlyFee) + Number(feeForm.securityDeposit)}</span>
                </div>

                <button
                  type="submit"
                  disabled={collecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl py-3 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {collecting && <Loader2 size={14} className="animate-spin" />}
                  <span>Confirm payment collection</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentFees;
