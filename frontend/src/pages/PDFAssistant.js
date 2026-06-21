import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { UploadCloud, BookOpen, FileText, CheckCircle, HelpCircle, GraduationCap, AlertTriangle, Play, Camera, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const PDFAssistant = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [activeMode, setActiveMode] = useState('notes'); // notes / mcq
  const [loading, setLoading] = useState(false);

  // File Upload states
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Notes Gen states
  const [noteType, setNoteType] = useState('short'); // short, long, exam, revision
  const [generatedNotes, setGeneratedNotes] = useState('');

  // MCQ Gen states
  const [quantity, setQuantity] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [mcqs, setMcqs] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qIndex: optionText }
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // OCR state hooks
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPDFs();
  }, []);

  const handleOcrFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOcrFile(selectedFile);
    }
  };

  const handleOcrScan = async (e) => {
    e.preventDefault();
    if (!ocrFile) return;

    setOcrLoading(true);
    setOcrText('');
    const formData = new FormData();
    formData.append('file', ocrFile);

    try {
      const res = await api.ai.ocrScan(formData);
      if (res.success || res.text) {
        setOcrText(res.text);
      } else {
        setOcrText('Failed to extract text. Please try again.');
      }
    } catch (err) {
      setOcrText(`Scan failed: ${err.message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!ocrText) return;
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchPDFs = async () => {
    try {
      const res = await api.ai.pdfs();
      if (res.success) {
        setPdfs(res.data);
        if (res.data.length > 0 && !selectedPdf) {
          setSelectedPdf(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load PDFs:', err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace('.pdf', ''));
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setUploadProgress('Uploading and parsing PDF...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await api.ai.uploadPDF(formData);
      if (res.success) {
        setFile(null);
        setTitle('');
        setUploadProgress('Index built successfully!');
        fetchPDFs();
        if (res.data) setSelectedPdf(res.data);
      }
    } catch (err) {
      setUploadProgress(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(''), 4000);
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setGeneratedNotes('');
    try {
      const res = await api.fastapi.pdfNotes(selectedPdf.vectorIndexKey, noteType);
      setGeneratedNotes(res.notes);
    } catch (err) {
      setGeneratedNotes(`Failed to generate notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMCQs = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setMcqs([]);
    setSelectedAnswers({});
    setShowResults(false);
    try {
      const res = await api.fastapi.pdfMCQ(selectedPdf.vectorIndexKey, quantity, difficulty);
      setMcqs(res.mcqs || []);
    } catch (err) {
      alert(`MCQ generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIdx, option) => {
    if (showResults) return; // locked after submission
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitQuiz = () => {
    if (mcqs.length === 0) return;
    
    let correctCount = 0;
    mcqs.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    const percent = (correctCount / mcqs.length) * 100;
    if (percent >= 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  return (
    <Layout title="PDF RAG Learning Assistant">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-left">
        {/* Left Sidebar: PDF uploads and management */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[75vh]">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Study Guides</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Upload textbook PDFs, slide decks, or lecture materials for indexing.</p>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="space-y-3 p-3.5 rounded-xl border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50/20">
              <div className="flex flex-col items-center justify-center p-3 text-center cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-all">
                <input
                  type="file"
                  id="pdf-file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="pdf-file" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <UploadCloud size={24} className="text-brand-500" />
                  <span className="text-[10px] font-bold text-slate-500">
                    {file ? file.name : 'Select Textbook PDF'}
                  </span>
                </label>
              </div>

              {file && (
                <div className="space-y-3 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Document Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 px-3 py-2 text-xs text-slate-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-sm"
                  >
                    Build Vector Index
                  </button>
                </div>
              )}

              {uploadProgress && (
                <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-1 text-center">
                  {uploadProgress}
                </p>
              )}
            </form>

            {/* List of PDFs */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indexed Documents</h4>
              <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1">
                {pdfs.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-3 text-center">No PDFs uploaded yet.</p>
                ) : (
                  pdfs.map(pdf => (
                    <button
                      key={pdf._id}
                      onClick={() => {
                        setSelectedPdf(pdf);
                        setGeneratedNotes('');
                        setMcqs([]);
                        setShowResults(false);
                      }}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-left w-full truncate border ${
                        selectedPdf?._id === pdf._id
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-450 dark:hover:bg-slate-800/40 border-transparent'
                      }`}
                    >
                      <FileText size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{pdf.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Study Mode Space */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col h-[75vh]">
          {/* Context Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {activeMode === 'ocr' ? 'AI Book Page Scanner' : selectedPdf ? `Learning Space: "${selectedPdf.title}"` : 'Learning Assistant'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeMode === 'ocr' 
                  ? 'Extract editable text from textbook snaps using Optical Character Recognition.' 
                  : 'Use vector search segments to write notes or take practice quizzes.'}
              </p>
            </div>

            {/* Study Module Selector */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950/40 p-1 border border-slate-200/50 dark:border-slate-800/40 shrink-0">
              <button
                onClick={() => setActiveMode('notes')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'notes'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                }`}
              >
                Notes Gen
              </button>
              <button
                onClick={() => setActiveMode('mcq')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'mcq'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                }`}
              >
                MCQ Quiz
              </button>
              <button
                onClick={() => setActiveMode('ocr')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'ocr'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                }`}
              >
                OCR Scanner
              </button>
            </div>
          </div>

          {/* Study Workspace Panel */}
          <div className="flex-1 overflow-y-auto mt-5 pr-1">
            {/* 1. STUDY NOTES GENERATOR */}
            {activeMode === 'notes' && (
              selectedPdf ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/60 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note format:</span>
                    {['short', 'long', 'exam', 'revision'].map(type => (
                      <button
                        key={type}
                        onClick={() => setNoteType(type)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize border transition-all ${
                          noteType === type
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                    <button
                      onClick={handleGenerateNotes}
                      disabled={loading}
                      className="ml-auto rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-brand-500 hover:to-indigo-500 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Compiling...' : 'Generate Notes'}
                    </button>
                  </div>

                  {generatedNotes && (
                    <div className="rounded-2xl border border-slate-200/50 p-5 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/30 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans select-text text-left">
                      {generatedNotes}
                    </div>
                  )}

                  {!generatedNotes && !loading && (
                    <div className="py-24 text-center text-slate-400">
                      <FileText size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-750" />
                      <p className="text-xs">Select a note format above and click "Generate Notes" to compile study guides.</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="py-24 text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-3"></div>
                      <p className="text-xs text-slate-400">AI is compiling textbook segments to draft notes...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-24 text-slate-400 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 dark:bg-brand-950/40 dark:text-brand-400">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-355">Notes Workspace</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs text-center leading-relaxed">
                    Select an indexed textbook PDF on the left panel to generate summaries and lecture notes.
                  </p>
                </div>
              )
            )}

            {/* 2. MCQ PRACTICE QUIZ */}
            {activeMode === 'mcq' && (
              selectedPdf ? (
                <div className="space-y-6">
                  {/* Setup Controls */}
                  {mcqs.length === 0 && !loading && (
                    <div className="max-w-md mx-auto p-6 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-5 bg-slate-50/50 dark:bg-slate-900/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400 mx-auto">
                        <GraduationCap size={20} />
                      </div>
                      <h4 className="text-xs font-bold text-center text-slate-700 dark:text-slate-355">Configure Self-Assessment Test</h4>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Difficulty</label>
                            <select
                              value={difficulty}
                              onChange={(e) => setDifficulty(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Quantity</label>
                            <select
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value={10}>10 Questions</option>
                              <option value={20}>20 Questions</option>
                              <option value={50}>50 Questions</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={handleGenerateMCQs}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-sm"
                        >
                          <Play size={12} />
                          <span>Start Assessment Quiz</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="py-24 text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-3"></div>
                      <p className="text-xs text-slate-400">AI is analyzing text passages to draft test questions...</p>
                    </div>
                  )}

                  {/* Quiz Active View */}
                  {mcqs.length > 0 && (
                    <div className="space-y-6">
                      {showResults && (
                        <div className="rounded-2xl p-4 bg-brand-500/10 border border-brand-500/20 flex items-center justify-between text-left">
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Assessment Complete!</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">You scored {score} out of {mcqs.length} correct.</p>
                          </div>
                          <span className="text-lg font-extrabold text-brand-500 font-outfit">
                            {Math.round((score / mcqs.length) * 100)}%
                          </span>
                        </div>
                      )}

                      <div className="space-y-5">
                        {mcqs.map((q, qIdx) => (
                          <div key={qIdx} className="p-5 border border-slate-150 dark:border-slate-800/80 rounded-2xl bg-white/40 dark:bg-slate-900/20 text-left">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {qIdx + 1}. {q.question}
                            </h4>
                            
                            <div className="mt-3.5 space-y-2">
                              {q.options.map((option, oIdx) => {
                                const isSelected = selectedAnswers[qIdx] === option;
                                const isCorrect = q.answer === option;
                                let optionStyle = 'border-slate-200/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50';

                                if (showResults) {
                                  if (isCorrect) {
                                    optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold';
                                  } else if (isSelected) {
                                    optionStyle = 'border-red-500 bg-red-500/10 text-red-500 font-semibold';
                                  }
                                } else if (isSelected) {
                                  optionStyle = 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleOptionSelect(qIdx, option)}
                                    className={`w-full text-left rounded-xl border p-3 text-xs transition-all ${optionStyle}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {showResults && (
                              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 leading-relaxed">
                                <strong>Explanation:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {!showResults ? (
                        <button
                          onClick={handleSubmitQuiz}
                          className="w-full rounded-xl bg-brand-600 py-3.5 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/10"
                        >
                          Submit Assessment Test
                        </button>
                      ) : (
                        <button
                          onClick={() => setMcqs([])}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Try Another Quiz
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-24 text-slate-400 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 dark:bg-brand-950/40 dark:text-brand-400">
                    <GraduationCap size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-355">MCQ Practice Workspace</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs text-center leading-relaxed">
                    Select an indexed textbook PDF on the left panel to generate quiz questions.
                  </p>
                </div>
              )
            )}

            {/* 3. OCR BOOK PAGE SCANNER */}
            {activeMode === 'ocr' && (
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* File Selector Dropzone */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/10 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-250 flex items-center gap-1.5">
                        <Camera size={14} className="text-brand-500" />
                        <span>Upload Textbook Image</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Drag & drop or select a photo of a textbook page (JPG/PNG).</p>
                    </div>

                    <form onSubmit={handleOcrScan} className="space-y-4 mt-5">
                      <div className="flex flex-col items-center justify-center p-6 text-center cursor-pointer border border-dashed border-slate-300 dark:border-slate-750 hover:border-slate-450 dark:hover:border-slate-650 rounded-xl transition-all relative">
                        <input
                          type="file"
                          id="ocr-file-input"
                          accept="image/*"
                          onChange={handleOcrFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <UploadCloud size={30} className="text-slate-455 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500">
                          {ocrFile ? ocrFile.name : 'Select JPG / PNG file'}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={!ocrFile || ocrLoading}
                        className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {ocrLoading ? 'Scanning Page Landmarks...' : 'Perform OCR Scan'}
                      </button>
                    </form>
                  </div>

                  {/* OCR Results Panel */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-250">Extracted Text Content</h4>
                      {ocrText && (
                        <button
                          onClick={handleCopyText}
                          className="flex items-center gap-1 text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 mt-4 min-h-[180px] flex flex-col">
                      {ocrLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-450 space-y-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                          <span className="text-[10px]">Processing image and running OCR matching models...</span>
                        </div>
                      ) : ocrText ? (
                        <textarea
                          value={ocrText}
                          onChange={(e) => setOcrText(e.target.value)}
                          className="w-full flex-1 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/20 p-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none font-mono resize-none leading-relaxed select-text"
                        />
                      ) : (
                        <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-center p-4">
                          <span className="text-[10px]">Scan a book page to view extracted digital text.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PDFAssistant;
