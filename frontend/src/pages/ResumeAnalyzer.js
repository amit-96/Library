import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResumeText(''); // clear text box when file is selected
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() && !file) return;

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await api.ai.analyzeResume(formData);
      } else {
        res = await api.ai.analyzeResume({ text: resumeText });
      }

      if (res.success) {
        setAnalysis(res.data);
      } else {
        setError('Failed to analyze resume details.');
      }
    } catch (err) {
      setError('Could not evaluate resume. Please check server connections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Resume Analyzer & ATS Benchmarking">
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        {/* Intro Banner */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-100 dark:border-blue-950 flex flex-col md:flex-row gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Optimize Your Resume for ATS Filters</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload your resume in PDF/Word format or paste your raw text summaries. The AI parser runs an ATS checklist evaluation to highlight key matched elements, identify missing requirements, and suggest edits to land interviews.
            </p>
          </div>
        </div>

        {/* Input box / File upload grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paste Resume Contents</h3>
            <textarea
              rows={8}
              placeholder="Paste details, roles, academic scores, and core skill listings here..."
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setFile(null);
              }}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            {/* File Drag zone */}
            <div className="glass-panel p-6 rounded-3xl border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-center flex flex-col items-center justify-center space-y-3 flex-1 min-h-[180px]">
              <UploadCloud size={32} className="text-slate-400" />
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Drag & Drop Resume File</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Supports PDF, JPG, PNG (Max 10MB)</span>
              </div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="resume-file-picker"
              />
              <label
                htmlFor="resume-file-picker"
                className="cursor-pointer text-[10px] font-bold px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-650 hover:bg-slate-50 transition-colors"
              >
                Choose File
              </label>
              {file && (
                <span className="text-[10px] font-semibold text-brand-650 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20 px-2 py-0.5 rounded-lg border border-brand-200/50">
                  {file.name}
                </span>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || (!resumeText.trim() && !file)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Evaluating resume structures...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze Resume Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs text-center border border-red-200/50">
            {error}
          </div>
        )}

        {/* Output Panel results */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ATS Score card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ATS Match Index</span>
              <div className="relative h-36 w-36 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {/* SVG circular track placeholder */}
                <span className="text-4xl font-extrabold font-outfit text-indigo-650 dark:text-indigo-450">{analysis.atsScore}</span>
                <span className="text-[10px] font-semibold text-slate-400 absolute bottom-4">/ 100</span>
              </div>
              <span className="text-[11px] font-bold text-slate-650 dark:text-slate-350 text-center">
                {analysis.atsScore >= 75 ? '🔥 Job Ready Resume Profile!' : '⚠️ Needs Structural Enhancements'}
              </span>
            </div>

            {/* Recommendations & suggestions */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              {/* Keywords found/missing grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched skills */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle size={15} />
                    <h4 className="text-xs font-bold">Keywords Matched</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.length > 0 ? (
                      analysis.matchedSkills.map((sk, idx) => (
                        <span key={idx} className="text-[9px] font-bold px-2.5 py-0.5 rounded bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/50">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">None detected. Add key technical skills.</span>
                    )}
                  </div>
                </div>

                {/* Missing skills */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <AlertTriangle size={15} />
                    <h4 className="text-xs font-bold">Missing Core Keywords</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.length > 0 ? (
                      analysis.missingSkills.map((sk, idx) => (
                        <span key={idx} className="text-[9px] font-bold px-2.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">Perfect match! No core skills missing.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions bullets */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Enhancement Recommendations</h4>
                <div className="space-y-2.5 mt-3">
                  {analysis.suggestions.map((sug, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[11px] text-slate-500 dark:text-slate-400">
                      <ArrowRight size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResumeAnalyzer;
