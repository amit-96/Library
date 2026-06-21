import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { Search, Sparkles, BookOpen, MapPin, Eye, CheckCircle, XCircle, Mic, MicOff } from 'lucide-react';

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [useSemantic, setUseSemantic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-IN');

  // Load books and categories initially
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const booksRes = await api.books.list({ limit: 50 });
      const catsRes = await api.books.categories();
      if (booksRes.success) setBooks(booksRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to load books:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSearch = async (query, semanticActive) => {
    setLoading(true);
    try {
      if (semanticActive && query.trim()) {
        const allBooksRes = await api.books.list({ limit: 100 });
        if (allBooksRes.success) {
          const aiRes = await api.fastapi.semanticSearch(query, allBooksRes.data);
          setBooks(aiRes.results || []);
        }
      } else {
        const res = await api.books.list({
          search: query,
          category: selectedCategory
        });
        if (res.success) setBooks(res.data);
      }
    } catch (err) {
      console.error('Search failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && !selectedCategory) {
      fetchInitialData();
      return;
    }
    await triggerSearch(searchQuery, useSemantic);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search is not supported in this browser. Please try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      triggerSearch(speechToText, useSemantic);
    };

    recognition.start();
  };

  return (
    <Layout title="Smart Book Catalog">
      <div className="space-y-6">
        {/* Search Panel Card */}
        <div className="glass-panel p-6 rounded-2xl text-left">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder={useSemantic ? "Describe what you want to learn (e.g. 'coding design principles')" : "Search by book title, author, or ISBN..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 py-3 pl-10 pr-10 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:border-brand-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`absolute right-3 p-1.5 rounded-lg transition-all ${
                  isListening 
                    ? 'text-red-500 bg-red-500/10 dark:bg-red-950/30 animate-pulse' 
                    : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-255'
                }`}
                title="Voice Search (English, Hindi, Bengali)"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {/* Voice Language Selector */}
            <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/20 px-3.5 py-3 text-xs text-slate-650 dark:text-slate-300">
              <span className="text-[10px] font-bold text-slate-455 uppercase shrink-0">Voice Lang:</span>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-250 w-full"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="bn-IN">Bengali (বাংলা)</option>
              </select>
            </div>

            {/* Category Dropdown */}
            {!useSemantic && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-3 text-sm text-slate-650 dark:text-slate-355 focus:outline-none shrink-0"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-brand-500 hover:to-indigo-500 transition-colors shadow-md shadow-brand-500/10 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Semantic Toggle */}
          <div className="flex items-center gap-2 mt-4 select-none">
            <input
              type="checkbox"
              id="semantic-toggle"
              checked={useSemantic}
              onChange={(e) => {
                setUseSemantic(e.target.checked);
                setSelectedCategory('');
              }}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="semantic-toggle" className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
              <Sparkles size={14} className="text-brand-500" />
              <span>Enable AI Semantic Search (NLP Context Matching)</span>
            </label>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="glass-panel py-16 text-center text-slate-400 rounded-2xl">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-sm">No books found in the library catalog matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {books.map(book => (
              <div
                key={book._id}
                className="glass-panel p-4 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all text-left"
              >
                <div>
                  <div className="relative">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-44 w-full object-cover rounded-xl shadow-sm mb-3.5"
                    />
                    {book.score !== undefined && (
                      <span className="absolute top-2 right-2 bg-brand-600/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles size={8} /> Match: {Math.round(book.score * 100)}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{book.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{book.author}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2.5 py-0.5 rounded-full">
                      {book.category}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                      Ed. {book.edition}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3.5 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    {book.availableQuantity > 0 ? (
                      <CheckCircle size={14} className="text-emerald-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                    <span className={book.availableQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500 font-medium'}>
                      {book.availableQuantity > 0 ? `${book.availableQuantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-0.5 transition-colors"
                  >
                    <Eye size={14} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedBook && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 relative text-left shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
              <div className="flex flex-col sm:flex-row gap-5">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-32 h-44 object-cover rounded-xl shadow"
                />
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100 leading-snug">{selectedBook.title}</h3>
                  <p className="text-sm text-slate-400 font-medium">By {selectedBook.author}</p>
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
                    <div><strong>Edition:</strong> {selectedBook.edition}</div>
                    <div><strong>Shelf Location:</strong> <span className="inline-flex items-center gap-0.5 text-brand-500 font-semibold"><MapPin size={12}/>{selectedBook.shelfLocation}</span></div>
                    <div><strong>Stock status:</strong> {selectedBook.availableQuantity} available out of {selectedBook.quantity} total</div>
                  </div>
                  <span className="inline-block text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-3 py-1 rounded-full capitalize">
                    {selectedBook.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookSearch;
