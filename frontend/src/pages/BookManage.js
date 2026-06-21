import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react';

const BookManage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [edition, setEdition] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shelfLocation, setShelfLocation] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.books.list({ limit: 100 });
      if (res.success) setBooks(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedBookId(null);
    setTitle('');
    setAuthor('');
    setCategory('');
    setIsbn('');
    setEdition('1st Edition');
    setQuantity(1);
    setShelfLocation('');
    setCoverImage('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (book) => {
    setIsEditing(true);
    setSelectedBookId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setIsbn(book.isbn);
    setEdition(book.edition);
    setQuantity(book.quantity);
    setShelfLocation(book.shelfLocation);
    setCoverImage(book.coverImage);
    setError('');
    setShowModal(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await api.books.delete(bookId);
      if (res.success) {
        setBooks(prev => prev.filter(b => b._id !== bookId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      title,
      author,
      category,
      isbn,
      edition,
      quantity: parseInt(quantity),
      shelfLocation,
      coverImage: coverImage || undefined
    };

    try {
      if (isEditing) {
        const res = await api.books.update(selectedBookId, payload);
        if (res.success) {
          setBooks(prev => prev.map(b => b._id === selectedBookId ? res.data : b));
          setShowModal(false);
        }
      } else {
        const res = await api.books.add(payload);
        if (res.success) {
          setBooks(prev => [res.data, ...prev]);
          setShowModal(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  return (
    <Layout title="Inventory Management">
      <div className="space-y-6">
        {/* Actions panel */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, or delete items in the library catalog.</p>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/10"
          >
            <Plus size={16} />
            <span>Add Book</span>
          </button>
        </div>

        {/* Books Table */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="glass-panel py-16 text-center text-slate-400 rounded-2xl">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-sm">No books registered in the catalog yet.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 text-xs font-semibold">
                    <th className="px-6 py-4">Title / Author</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">ISBN</th>
                    <th className="px-6 py-4">Edition</th>
                    <th className="px-6 py-4">Shelf location</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-700 dark:text-slate-300">
                  {books.map(book => (
                    <tr key={book._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <img src={book.coverImage} alt="" className="h-10 w-8 object-cover rounded shadow-sm" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{book.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{book.author}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full capitalize">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[10px]">{book.isbn}</td>
                      <td className="px-6 py-3.5">{book.edition}</td>
                      <td className="px-6 py-3.5 font-semibold text-brand-500">{book.shelfLocation}</td>
                      <td className="px-6 py-3.5">
                        {book.availableQuantity} / {book.quantity}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors inline-block"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 relative text-left shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
              
              <h3 className="text-base font-bold font-outfit text-slate-850 dark:text-slate-100 mb-5">
                {isEditing ? 'Modify Book Information' : 'Register New Book Title'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Book Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Book Author</label>
                    <input
                      type="text"
                      required
                      placeholder="Author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">ISBN Code</label>
                    <input
                      type="text"
                      required
                      disabled={isEditing}
                      placeholder="ISBN"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science, Physics"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Edition</label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd Edition"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Total Quantity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Shelf Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-02-B"
                      value={shelfLocation}
                      onChange={(e) => setShelfLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/10"
                  >
                    {isEditing ? 'Save Changes' : 'Register Title'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookManage;
