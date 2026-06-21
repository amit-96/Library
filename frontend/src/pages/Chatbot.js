import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { Send, Sparkles, MessageSquare, Bot, User as UserIcon, BookOpen } from 'lucide-react';

const Chatbot = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null); // null = General AI Librarian
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load PDFs and general chat history initially
  useEffect(() => {
    fetchPDFs();
    loadChatHistory(null);
  }, []);

  const fetchPDFs = async () => {
    try {
      const res = await api.ai.pdfs();
      if (res.success) setPdfs(res.data);
    } catch (err) {
      console.error('Failed to load PDFs:', err.message);
    }
  };

  const loadChatHistory = async (pdfDoc) => {
    setLoading(true);
    try {
      const res = await api.ai.getChat(pdfDoc?._id || '');
      if (res.success) {
        setMessages(res.data?.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSelect = (pdf) => {
    setSelectedPdf(pdf);
    loadChatHistory(pdf);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    // Add user message to UI state immediately
    const tempUserMsg = { _id: Date.now().toString(), role: 'user', content: userMsg };
    setMessages(prev => [...prev, tempUserMsg]);

    setLoading(true);
    try {
      // 1. Save User message to DB
      await api.ai.saveChat(selectedPdf?._id, 'user', userMsg);

      // 2. Query FastAPI microservice
      let aiAnswer = '';
      if (selectedPdf) {
        // PDF RAG query
        const aiRes = await api.fastapi.pdfChat(userMsg, selectedPdf.vectorIndexKey);
        aiAnswer = aiRes.answer;
      } else {
        // General catalog/library queries:
        // Query over all book descriptors for general search, or run fallback query
        try {
          const allBooks = await api.books.list({ limit: 100 });
          // FastAPI semantic search
          const aiSearch = await api.fastapi.semanticSearch(userMsg, allBooks.data, 3);
          if (aiSearch.results && aiSearch.results.length > 0) {
            const matches = aiSearch.results.map(b => `* **${b.title}** by ${b.author} (Shelf: ${b.shelfLocation})`).join('\n');
            aiAnswer = `Hello! Based on the library catalog, here are the books most matching your question:\n\n${matches}\n\nHow else can I assist you?`;
          } else {
            aiAnswer = "I couldn't find any direct matches in the book catalog. I am your AI Library Assistant. Ask me to recommend books, find shelf locations, explain study concepts, or upload a textbook PDF to use the PDF RAG Learning Assistant!";
          }
        } catch (fastApiErr) {
          aiAnswer = "Hello! I am your AI Librarian. To search the catalog semantically, please ensure the Python FastAPI AI service is running. Ask me anything, or upload a coursework PDF to start learning!";
        }
      }

      // 3. Save AI message to DB
      await api.ai.saveChat(selectedPdf?._id, 'assistant', aiAnswer);

      // 4. Update UI state with response
      const tempAiMsg = { _id: (Date.now() + 1).toString(), role: 'assistant', content: aiAnswer };
      setMessages(prev => [...prev, tempAiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = { _id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${err.message || 'Could not contact RAG service'}` };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Layout title="AI Librarian Chatbot">
      <div className="glass-panel rounded-3xl h-[78vh] flex overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
        {/* Sidebar: Chat context selection */}
        <div className="w-64 border-r border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col p-4 text-left shrink-0">
          <h3 className="text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase">Conversational context</h3>
          
          <button
            onClick={() => handlePdfSelect(null)}
            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left mb-3 ${
              !selectedPdf
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800'
            }`}
          >
            <Bot size={16} />
            <span>General Librarian AI</span>
          </button>

          <div className="border-t border-slate-200/50 dark:border-slate-800 my-2 pt-4">
            <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-1">
              <BookOpen size={10} />
              <span>Reference Textbook PDFs</span>
            </h4>
            <div className="space-y-1.5 overflow-y-auto max-h-[48vh] pr-1">
              {pdfs.length === 0 ? (
                <div className="text-[10px] text-slate-400 py-4 text-center">No PDFs uploaded yet. Go to PDF Learning Assistant to upload.</div>
              ) : (
                pdfs.map(pdf => (
                  <button
                    key={pdf._id}
                    onClick={() => handlePdfSelect(pdf)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left w-full text-[11px] font-medium truncate transition-all ${
                      selectedPdf?._id === pdf._id
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <MessageSquare size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{pdf.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-white/40 dark:bg-slate-950/10">
          {/* Active Context Banner */}
          <div className="px-6 py-3 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 flex items-center gap-2 text-left">
            <Sparkles size={16} className="text-brand-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Active Context: {selectedPdf ? `RAG Querying over "${selectedPdf.title}"` : 'General Library Catalog Search'}
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 dark:bg-brand-950/40 dark:text-brand-400">
                  <Bot size={24} />
                </div>
                <div className="text-center max-w-sm">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Start a Conversation</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {selectedPdf
                      ? `Ask questions about content inside "${selectedPdf.title}". The AI Librarian will scan vector segments to answer.`
                      : 'Ask about book recommendations, library policies, or catalog searches.'}
                  </p>
                </div>
              </div>
            ) : (
              messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-3 max-w-[80%] ${
                      isUser ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                      isUser
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                    }`}>
                      {isUser ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="space-y-1">
                      <div className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-slate-400 block px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/10 flex gap-3 z-10">
            <input
              type="text"
              placeholder={loading ? 'AI Librarian is thinking...' : 'Ask a question or explain a concept...'}
              disabled={loading}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-4 py-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 text-white transition-colors shadow-md flex items-center justify-center disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Chatbot;
