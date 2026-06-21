import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { GraduationCap, BookOpen, Layers, Award, AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const ExamPrep = () => {
  const [activeTab, setActiveTab] = useState('flashcards'); // flashcards / revision / mock-test
  
  // Flashcards state
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flashcards = [
    { term: 'RAG (Retrieval-Augmented Generation)', definition: 'An AI framework that retrieves documents from an external knowledge base to anchor LLM responses on factual content.' },
    { term: 'FAISS (Facebook AI Similarity Search)', definition: 'A library for efficient similarity search and clustering of dense vectors, running highly optimized L2 or Cosine operations.' },
    { term: 'OCR (Optical Character Recognition)', definition: 'Technology used to convert scanned document page images into editable, searchable machine-readable text.' },
    { term: 'Collaborative Filtering', definition: 'A recommendation algorithm that makes predictions about a user\'s interests by collecting preferences from many similar users.' },
    { term: 'XGBoost', definition: 'An optimized distributed gradient boosting library designed to be highly efficient, flexible, and portable for predictive regressions.' }
  ];

  // Revision Notes state
  const [topicName, setTopicName] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  // Mock Test state
  const [testTopic, setTestTopic] = useState('');
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testFinished, setTestFinished] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testLoading, setTestLoading] = useState(false);
  const [weakTopics, setWeakTopics] = useState(['TCP Congestion Control (Mock Test failed)']);

  const handleGenerateRevision = async (topic = null) => {
    const target = topic || topicName;
    if (!target.trim()) return;
    setNotesLoading(true);
    setRevisionNotes('');
    try {
      // Simulate generating a high-quality revision summary using chatbot logic
      const prompt = `Write a comprehensive, bulleted One-Page Exam Revision note for the topic: "${target}". Define key terms, outline major processes, and summarize applications.`;
      const res = await api.fastapi.pdfChat(prompt, 'global'); // calls global general assistant fallback
      setRevisionNotes(res.answer);
    } catch (err) {
      setRevisionNotes(`### Revision Summary: ${target}\n\n* **Definition**: Key concept in core engineering curricula.\n* **Key Principles**: Quantitative assessments outline system complexity.\n* **Applications**: Deployed in high-throughput network architectures.\n\n*(Connect to AI backend to generate full dynamic summaries).*`);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleStartMockTest = async () => {
    if (!testTopic.trim()) return;
    setTestLoading(true);
    setTestQuestions([]);
    setSelectedAnswers({});
    setTestFinished(false);

    try {
      // Generate 5 MCQs on the topic
      const res = await api.fastapi.pdfMCQ('global', 5, 'medium');
      // Set topic custom questions or fallback if mock returned general topic
      const questions = res.mcqs.map((q, idx) => ({
        ...q,
        question: q.question.replace('Self-Assessment Question', `Exam Question [${testTopic}]`)
      }));
      setTestQuestions(questions);
    } catch (err) {
      // Fallback MCQs on the selected topic
      const fallbackMCQs = [
        {
          question: `Which of the following is core to understanding ${testTopic}?`,
          options: ['Primary parameter definitions', 'Neglecting environmental factors', 'System testing criteria', 'None of the above'],
          answer: 'Primary parameter definitions',
          explanation: 'Understanding the primary parameters defines the system constraints and limits.'
        },
        {
          question: `What is the secondary challenge in deploying ${testTopic}?`,
          options: ['Memory management overrides', 'Scaling latency overheads', 'CSS alignment errors', 'Database indexing delays'],
          answer: 'Scaling latency overheads',
          explanation: 'Scaling latency overrides are critical bottlenecks in high-throughput operations.'
        }
      ];
      setTestQuestions(fallbackMCQs);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSelectAnswer = (qIdx, option) => {
    if (testFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitMockTest = () => {
    let score = 0;
    testQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score += 1;
      }
    });

    setTestScore(score);
    setTestFinished(true);

    const percentage = (score / testQuestions.length) * 100;
    if (percentage >= 70) {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
    } else {
      // Add topic to weak topics list
      setWeakTopics(prev => [...new Set([...prev, `${testTopic} (${Math.round(percentage)}% Score)`])]);
    }
  };

  return (
    <Layout title="AI Exam Preparation Room">
      <div className="space-y-6 text-left">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'flashcards'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'revision'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            One Page Notes
          </button>
          <button
            onClick={() => setActiveTab('mock-test')}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'mock-test'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Mock Tests & Strengths
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          {/* FLASHCARDS WIDGET */}
          {activeTab === 'flashcards' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card {flashcardIdx + 1} of {flashcards.length}</span>
              </div>

              {/* Flashcard container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-64 w-full cursor-pointer rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 flex items-center justify-center p-8 text-center shadow-lg relative perspective hover:shadow-xl transition-all"
              >
                <div className="absolute top-4 right-4 text-[9px] bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {isFlipped ? 'Answer' : 'Question'}
                </div>
                
                <div className="select-none leading-relaxed transition-all duration-300">
                  {isFlipped ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{flashcards[flashcardIdx].definition}</p>
                  ) : (
                    <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100">{flashcards[flashcardIdx].term}</h3>
                  )}
                </div>
              </div>

              {/* Flashcard Controls */}
              <div className="flex justify-between gap-4">
                <button
                  disabled={flashcardIdx === 0}
                  onClick={() => {
                    setFlashcardIdx(prev => prev - 1);
                    setIsFlipped(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={flashcardIdx === flashcards.length - 1}
                  onClick={() => {
                    setFlashcardIdx(prev => prev + 1);
                    setIsFlipped(false);
                  }}
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ONE PAGE REVISION NOTES */}
          {activeTab === 'revision' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGenerateRevision();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Enter study topic (e.g. 'TCP Congestion Control', 'DBMS Normalization')..."
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-4 py-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={notesLoading}
                    className="rounded-xl bg-brand-600 px-6 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md disabled:opacity-50"
                  >
                    {notesLoading ? 'Writing...' : 'Write Revision Notes'}
                  </button>
                </form>
              </div>

              {notesLoading && (
                <div className="py-24 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-xs text-slate-400">AI is drafting revision summary cards...</p>
                </div>
              )}

              {revisionNotes && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-350 leading-relaxed select-text font-sans">
                  {revisionNotes}
                </div>
              )}
            </div>
          )}

          {/* MOCK TEST & WEAK TOPICS */}
          {activeTab === 'mock-test' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Quiz panel */}
              <div className="lg:col-span-2 space-y-6">
                {testQuestions.length === 0 && !testLoading && (
                  <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto">
                    <div className="h-10 w-10 bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Generate Mock Exam</h3>
                    
                    <div className="space-y-4 text-left">
                      <input
                        type="text"
                        placeholder="Enter mock topic (e.g. 'Software Engineering')..."
                        value={testTopic}
                        onChange={(e) => setTestTopic(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-250 focus:outline-none"
                      />
                      <button
                        onClick={handleStartMockTest}
                        disabled={!testTopic.trim()}
                        className="w-full rounded-xl bg-brand-600 py-3 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md disabled:opacity-50"
                      >
                        Generate Mock Exam
                      </button>
                    </div>
                  </div>
                )}

                {testLoading && (
                  <div className="py-24 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-xs text-slate-400">AI is compiling exam-style questions...</p>
                  </div>
                )}

                {testQuestions.length > 0 && (
                  <div className="space-y-6">
                    {testFinished && (
                      <div className="rounded-2xl p-4 bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Exam Test Finished!</h4>
                          <p className="text-[10px] text-slate-400">You scored {testScore} out of {testQuestions.length} correct.</p>
                        </div>
                        <span className="text-lg font-extrabold text-brand-500 font-outfit">
                          {Math.round((testScore / testQuestions.length) * 100)}%
                        </span>
                      </div>
                    )}

                    <div className="space-y-5">
                      {testQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-left">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{qIdx + 1}. {q.question}</h4>
                          <div className="mt-3.5 space-y-2">
                            {q.options.map((option, oIdx) => {
                              const isSelected = selectedAnswers[qIdx] === option;
                              const isCorrect = q.answer === option;
                              let optionStyle = 'border-slate-200/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50';

                              if (testFinished) {
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
                                  onClick={() => handleSelectAnswer(qIdx, option)}
                                  className={`w-full text-left rounded-xl border p-3 text-xs transition-all ${optionStyle}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {testFinished && (
                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl text-[11px] text-slate-500 dark:text-slate-450 border border-slate-100 dark:border-slate-800">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!testFinished ? (
                      <button
                        onClick={handleSubmitMockTest}
                        className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-md"
                      >
                        Submit Test
                      </button>
                    ) : (
                      <button
                        onClick={() => setTestQuestions([])}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Start Another Exam Test
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Weak Topic Detection sidebar */}
              <div className="glass-panel p-5 rounded-2xl h-fit space-y-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-amber-500 animate-pulse" />
                  <span>Weak Topic Detector</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">Topics where you scored below 70% in mock exams are listed below. Click revise to write summaries instantly.</p>
                
                <div className="space-y-2.5 pt-2">
                  {weakTopics.length === 0 ? (
                    <div className="text-[10px] text-slate-400 text-center py-4 flex items-center justify-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>All evaluated categories are strong!</span>
                    </div>
                  ) : (
                    weakTopics.map((topic, idx) => {
                      const nameOnly = topic.split(' (')[0];
                      return (
                        <div key={idx} className="rounded-xl border border-slate-200/50 p-3 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/30 flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-350 truncate">{nameOnly}</span>
                          <button
                            onClick={() => {
                              setActiveTab('revision');
                              setTopicName(nameOnly);
                              handleGenerateRevision(nameOnly);
                            }}
                            className="rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 px-2.5 py-1 text-[10px] font-bold shrink-0 transition-colors"
                          >
                            Revise
                          </button>
                        </div>
                      );
                    })
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

export default ExamPrep;
