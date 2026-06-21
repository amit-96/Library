import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Contact, Sparkles } from 'lucide-react';

const DigitalID = () => {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout title="Digital Student Card">
      <div className="space-y-6 max-w-md mx-auto">
        {/* Printable Card Area */}
        <div id="printable-id-card" className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 select-none text-left print:border-0 print:shadow-none">
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-5 text-white flex justify-between items-center relative overflow-hidden">
            {/* Background vector glow */}
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit tracking-wide uppercase">Nalanda Digital Library Smart Library</h3>
              <p className="text-[9px] text-brand-100 uppercase tracking-widest mt-0.5">Digital Student ID</p>
            </div>
            <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs font-outfit">
              L
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            <div className="flex gap-5">
              {/* Profile image avatar placeholder */}
              <div className="h-28 w-24 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200/40 shrink-0">
                <Contact size={32} />
                <span className="text-[8px] font-bold mt-1 text-slate-400/80">AVATAR</span>
              </div>

              {/* Student details */}
              <div className="space-y-2 text-xs flex-1">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Student ID Number</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{user?.studentId || 'LIB-548962'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Department</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">CS & IT</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Role</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code and Barcode Markings */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-5 flex items-center justify-between gap-4">
              {/* Fake barcode block for scanner simulation */}
              <div className="flex-1 space-y-1.5">
                <div className="h-9 w-full bg-[repeating-linear-gradient(90deg,#000,#000_1px,#fff_1px,#fff_4px,#000_4px,#000_6px,#fff_6px,#fff_8px)] dark:bg-[repeating-linear-gradient(90deg,#fff,#fff_1px,#000_1px,#000_4px,#fff_4px,#fff_6px,#000_6px,#000_8px)] opacity-85"></div>
                <div className="text-[9px] font-mono text-slate-400 text-center tracking-widest uppercase">{user?.id || 'LIBRAAITRACKERCODE'}</div>
              </div>

              {/* Scannable QR Code */}
              <div className="bg-white p-2 rounded-xl border border-slate-200/50 shrink-0">
                <QRCodeSVG
                  value={JSON.stringify({ userId: user?.id, studentId: user?.studentId || 'LIB-548962' })}
                  size={60}
                  level="M"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-3 text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer size={15} />
            <span>Print Student Card</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DigitalID;
