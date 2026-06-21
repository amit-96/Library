import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { User, BookOpen, Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const StudentAdd = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    department: 'Computer Science',
    course: 'B.Tech',
    year: '1st Year',
    semester: '1st Semester',
    rollNumber: '',
    registrationNumber: '',
    address: '',
    profilePhoto: '',
    membershipType: 'Monthly',
    libraryShift: 'Morning',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.students.add(formData);
      if (res.success) {
        setSuccess(`Student ${res.data.student.name} added successfully! Student ID: ${res.data.student.studentId}`);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          gender: 'Male',
          dateOfBirth: '',
          department: 'Computer Science',
          course: 'B.Tech',
          year: '1st Year',
          semester: '1st Semester',
          rollNumber: '',
          registrationNumber: '',
          address: '',
          profilePhoto: '',
          membershipType: 'Monthly',
          libraryShift: 'Morning',
          joiningDate: new Date().toISOString().split('T')[0]
        });
        setStep(1);
      } else {
        setError(res.message || 'Failed to register student.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please check database connections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add New Student">
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        {/* Stepper Header */}
        <div className="flex justify-between items-center glass-panel p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>1</div>
            <span className={`text-xs font-bold ${step === 1 ? 'text-slate-850 dark:text-slate-100' : 'text-slate-400'}`}>Personal & Academic</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4"></div>
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>2</div>
            <span className={`text-xs font-bold ${step === 2 ? 'text-slate-850 dark:text-slate-100' : 'text-slate-400'}`}>Library & Membership</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs border border-red-200/50 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-650 dark:text-green-400 text-xs border border-green-200/50 flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User size={16} className="text-brand-500" />
                <span>Personal Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Photo URL</label>
                  <input type="text" name="profilePhoto" placeholder="https://images.unsplash.com/..." value={formData.profilePhoto} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 pt-4">
                <BookOpen size={16} className="text-brand-500" />
                <span>Academic details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</label>
                  <input type="text" name="rollNumber" required value={formData.rollNumber} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Registration Number</label>
                  <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Home Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
              </div>


              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setStep(2)} className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all">
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Clock size={16} className="text-brand-500" />
                <span>Library Setup & Membership</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Membership Plan</label>
                  <select name="membershipType" value={formData.membershipType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                    <option value="Monthly">Monthly Plan (30 Days)</option>
                    <option value="Quarterly">Quarterly Plan (90 Days)</option>
                    <option value="Half-Yearly">Half-Yearly Plan (180 Days)</option>
                    <option value="Yearly">Yearly Plan (365 Days)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Library Shift</label>
                  <select name="libraryShift" value={formData.libraryShift} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none">
                    <option value="Morning">Morning Shift (08:00 AM - 12:00 PM)</option>
                    <option value="Afternoon">Afternoon Shift (12:00 PM - 04:00 PM)</option>
                    <option value="Evening">Evening Shift (04:00 PM - 08:00 PM)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Joining Date</label>
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none" />
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-blue-500/5 border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                <strong>💡 Automatic Configurations:</strong> Submitting will auto-generate a unique Student ID (`LIB-XXXXXX`), assign their timing shift constraints, and log an unpaid initial Month Fee record (covering the Admission Fee, Security Deposit, and the selected Monthly Membership rate).
              </div>

              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(1)} className="border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-xl px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all">
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 py-2.5 text-xs font-bold shadow-md transition-all">
                  {loading ? 'Creating Student Profile...' : 'Save & Register Student'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default StudentAdd;
