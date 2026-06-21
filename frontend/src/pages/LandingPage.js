import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Wifi, Shield, Zap, Lock, BookOpen, MapPin, Phone, MessageSquare, Star, ArrowRight, CheckCircle, Clock, VolumeX,
  Wind, Award, Compass, CreditCard, ChevronRight, Menu, X, Check, Eye
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const facilities = [
    { name: 'Fully Air Conditioned', icon: Wind, desc: 'Keep your focus cool with dual-tower silent AC ventilation maintaining optimum study temperatures.' },
    { name: 'CCTV Surveillance', icon: Shield, desc: '24/7 CCTV smart cameras monitoring study halls and locker zones for absolute security.' },
    { name: 'High Speed Wi-Fi', icon: Wifi, desc: 'Ultra high-speed fiber internet with unlimited access to digital references and online tutorials.' },
    { name: '24×7 Power Backup', icon: Zap, desc: 'Automatic generator backup ensures zero downtime in light, fans, charging sockets, or routers.' },
    { name: 'RO Drinking Water', icon: Award, desc: 'Chilled and hot RO purified water dispenser accessible to all registered students.' },
    { name: 'Personal Lockers', icon: Lock, desc: 'Private lockable compartments to securely store your textbooks, laptops, and study kits.' },
    { name: 'Spacious Tables & Comfort Chairs', icon: BookOpen, desc: 'Ergonomic high-back cushioned seats paired with wide partitioned study tables.' },
    { name: 'Individual Charging Points', icon: Zap, desc: 'Dedicated socket boards and USB portals right at your desk to power up all your devices.' },
    { name: 'Daily Newspapers', icon: BookOpen, desc: 'Stay updated with local and national newspapers (The Hindu, Indian Express, Dainik Jagran) daily.' },
    { name: 'Magazines & Books', icon: BookOpen, desc: 'Free access to academic magazines, competition guides, novels, and educational journals.' },
    { name: 'Nearby Market Connectivity', icon: Compass, desc: 'Conveniently located in Parwalpur main hub with stationery shops and eateries steps away.' },
    { name: 'Peaceful Study Environment', icon: VolumeX, desc: 'Strict silence boundaries enforced by hall wardens to guarantee noise-free concentration.' }
  ];

  const features = [
    { title: 'Online Seat Booking', desc: 'Pre-book your favorite seat number directly from your mobile app, avoiding desk occupancy rushes.' },
    { title: 'Digital Attendance', desc: 'Scan and log daily check-ins using automated high-security QR scanners at the entry gate.' },
    { title: 'QR Membership Card', desc: 'Get your digital RFID-based credentials card dynamically stored in your student cabinet portal.' },
    { title: 'AI Study Assistant', desc: 'Query our intelligent chatbot to translate terms, solve equations, and compile references instantly.' },
    { title: 'PDF Learning Assistant', desc: 'Upload documents or book scans to search semantics, generate short summaries, or ask questions.' },
    { title: 'AI Notes Generator', desc: 'Transform complex textbook paragraphs into simple, bullet-point revisions and exam flashcards.' },
    { title: 'Smart Library Management', desc: 'Easy control center for librarians to manage timings, memberships, fee ledgers, and seat availability.' }
  ];

  const timings = [
    { shift: 'Morning Shift', hours: '08:00 AM - 12:00 PM', desc: 'Fresh morning focus for competitive revisions and mock exams.' },
    { shift: 'Afternoon Shift', hours: '12:00 PM - 04:00 PM', desc: 'Quiet afternoon session for deep study, book reading, and notes cataloging.' },
    { shift: 'Evening Shift', hours: '04:00 PM - 08:00 PM', desc: 'Post-college study circle to collaborate on projects or prepare for interviews.' },
    { shift: '24×7 Access Shift', hours: 'Always Open', desc: 'Available for premium package holders to study at any time day or night.' }
  ];

  const pricing = [
    { name: 'Monthly Membership', price: '₹1,200', period: 'month', features: ['Single Shift Slot access', 'High-Speed Wi-Fi', 'Individual Charging Socket', 'Chilled RO Water', 'Daily Newspapers Access'], actionText: 'Join Monthly', highlight: false },
    { name: 'Quarterly Membership', price: '₹3,250', period: '3 months', features: ['Dual Shift access or Single Lock slot', 'Personal locker allocation', 'High-Speed Wi-Fi & Charging', 'AI Study Assistant basic', 'Free Library Book lending (1 book)'], actionText: 'Book 3 Months', highlight: false },
    { name: 'Half-Yearly Membership', price: '₹6,000', period: '6 months', features: ['Flexible Shift hours access', 'Personal locker guaranteed', 'High-Speed Wi-Fi & Charging', 'AI chatbot & PDF RAG assistant', 'Free Library Book lending (2 books)', 'Prioritized Seat reservations'], actionText: 'Get 6 Months', highlight: true },
    { name: 'Yearly Membership', price: '₹11,000', period: 'year', features: ['Full 24x7 access pass', 'Dedicated personal locker', 'Unlimited High-Speed Wi-Fi', 'Premium AI Study suite access', 'Free Library Book lending (4 books)', 'Prioritized VIP Seat allocation', 'Mock Interview sessions grading'], actionText: 'Go Annual', highlight: false }
  ];

  const testimonials = [
    { name: 'Rahul Sen', role: 'UPSC Aspirant', rating: 5, text: 'Nalanda Digital Library has been a game-changer for my preparation. The quiet cabins, high-speed WiFi, and AC environment provide the perfect study space. Highly recommended!' },
    { name: 'Sneha Verma', role: 'Software Engineer', rating: 5, text: 'Excellent co-work space in Parwalpur. The power backup is 100% reliable, and the tables are spacious. The addition of the AI study tool is amazing for coding references.' },
    { name: 'Amit Kumar', role: 'SSC Candidate', rating: 4.8, text: 'Clean water, personal lockers, and convenient timing shifts. The staff is polite, and the student community here creates a highly motivating atmosphere.' }
  ];

  const gallery = [
    { title: 'Library Interior', img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80', desc: 'Neat, comfortable, and well-lit individual study cabins.' },
    { title: 'Study Area', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', desc: 'Equipped with individual power sockets and wide study desks.' },
    { title: 'Reading Zone', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80', desc: 'Stocked library cabinets containing textbooks and newspapers.' },
    { title: 'Locker Area', img: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&q=80', desc: 'Secure digital and key lock systems for books and laptops.' },
    { title: 'Student Activities', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80', desc: 'Active environment with students preparing for exams.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#FFD700] selection:text-[#0B2E6B]">
      
      {/* HEADER NAVBAR */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B2E6B] shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-10 w-10 bg-[#FFD700] text-[#0B2E6B] rounded-xl flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
              N
            </div>
            <div className="text-left">
              <span className={`text-lg font-bold block leading-tight font-outfit ${scrolled ? 'text-[#FFD700]' : 'text-white'}`}>Nalanda</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-200 block -mt-1">Digital Library</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-100">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#FFD700] transition-colors">Home</button>
            <button onClick={() => handleScrollTo('facilities')} className="hover:text-[#FFD700] transition-colors">Facilities</button>
            <button onClick={() => handleScrollTo('features')} className="hover:text-[#FFD700] transition-colors">Features</button>
            <button onClick={() => handleScrollTo('timings')} className="hover:text-[#FFD700] transition-colors">Timings</button>
            <button onClick={() => handleScrollTo('pricing')} className="hover:text-[#FFD700] transition-colors">Membership</button>
            <button onClick={() => handleScrollTo('gallery')} className="hover:text-[#FFD700] transition-colors">Gallery</button>
            <button onClick={() => handleScrollTo('contact')} className="hover:text-[#FFD700] transition-colors">Contact</button>
          </nav>

          {/* Nav Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-[#FFD700] hover:bg-[#ffe23b] text-[#0B2E6B] text-xs font-bold px-5 py-2.5 rounded-xl shadow-md border-2 border-[#0B2E6B] transition-all flex items-center gap-1">
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-[#FFD700] text-xs font-bold transition-colors px-3">
                  Login
                </Link>
                <Link to="/signup" className="bg-[#D62828] hover:bg-[#f03838] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="lg:hidden text-white hover:text-[#FFD700] p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0B2E6B] flex flex-col justify-center px-8 space-y-6 pt-16">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Home</button>
          <button onClick={() => handleScrollTo('facilities')} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Facilities</button>
          <button onClick={() => handleScrollTo('features')} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Features</button>
          <button onClick={() => handleScrollTo('timings')} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Timings</button>
          <button onClick={() => handleScrollTo('pricing')} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Membership</button>
          <button onClick={() => handleScrollTo('gallery')} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Gallery</button>
          <button onClick={() => handleScrollTo('contact')} className="text-xl font-bold text-white text-left hover:text-[#FFD700] py-2">Contact</button>
          
          <div className="h-px bg-blue-800 w-full my-4"></div>
          
          {isAuthenticated ? (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="bg-[#FFD700] text-[#0B2E6B] text-center font-bold py-3.5 rounded-xl shadow-md">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-white text-center font-bold py-3 hover:text-[#FFD700]">
                Login
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-[#D62828] text-white text-center font-bold py-3.5 rounded-xl shadow-md">
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative bg-[#0B2E6B] pt-32 pb-20 md:pb-28 text-white overflow-hidden">
        <div className="absolute inset-0 bg-radial-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-800 px-3 py-1.5 rounded-full text-xs font-bold text-[#FFD700]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D62828] animate-pulse"></span>
              <span>Bihar's Premium Co-Study Lounge</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit leading-tight">
              Nalanda <span className="text-[#FFD700]">Digital Library</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-200 font-semibold max-w-xl">
              Best Place for Self Study & Co-Work. Set your goals, sit in absolute silent zones, and clear your examinations with modern facilities.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/signup" className="bg-[#D62828] hover:bg-[#ef3535] text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-0.5 transition-all">
                Join Now
              </Link>
              <Link to="/seats" className="bg-[#FFD700] hover:bg-[#ffe343] text-[#0B2E6B] text-xs font-bold px-8 py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all">
                Book Your Seat
              </Link>
              <button onClick={() => handleScrollTo('contact')} className="border-2 border-white hover:bg-white/10 text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all">
                Contact Us
              </button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-blue-900/60">
              <div className="p-3 bg-blue-900/30 rounded-2xl border border-blue-800/40 text-center">
                <span className="text-xl font-extrabold text-[#FFD700] block font-outfit">500+</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Students</span>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-2xl border border-blue-800/40 text-center">
                <span className="text-xl font-extrabold text-[#FFD700] block font-outfit">200+</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Seats Available</span>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-2xl border border-blue-800/40 text-center">
                <span className="text-xl font-extrabold text-[#FFD700] block font-outfit">24 × 7</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Access Slots</span>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-2xl border border-blue-800/40 text-center">
                <span className="text-xl font-extrabold text-[#FFD700] block font-outfit">100 Mbps</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">High-Speed WiFi</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Flyer Display */}
          <div className="flex justify-center relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#FFD700] to-[#D62828] rounded-3xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-blue-950 p-3 rounded-3xl border border-blue-900 shadow-2xl overflow-hidden max-w-md md:max-w-lg">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80" 
                alt="Modern Nalanda Library interior Study Hall" 
                className="rounded-2xl w-full object-cover aspect-[4/3] shadow-inner"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-gradient-to-t from-black/80 to-black/20 rounded-xl text-left border border-white/10 backdrop-blur-sm">
                <span className="text-xs font-bold text-[#FFD700] block uppercase tracking-wider">Silent Co-Study Area</span>
                <span className="text-[10px] text-slate-200 mt-1 block">Dedicated charging ports, partitions, and high-back comfort chairs.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES SECTION */}
      <section id="facilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Premium Amenities</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">Library Facilities</h2>
            <p className="text-slate-500 text-xs sm:text-sm">We provide an ecosystem curated to eliminate all study friction so you can focus entirely on clearing goals.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(11, 46, 107, 0.1)', borderColor: '#D62828' }}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-start text-left space-y-3 transition-all duration-300 hover:border-[#D62828]"
                >
                  <div className="h-10 w-10 bg-[#0B2E6B]/5 text-[#0B2E6B] rounded-2xl flex items-center justify-center shrink-0 border border-[#0B2E6B]/10">
                    <Icon size={20} className="text-[#0B2E6B]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0B2E6B]">{fac.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">{fac.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIBRARY FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Features Left Column */}
          <div className="text-left space-y-6">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Smart Integration</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">Advanced AI & Smart Platform</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Nalanda Digital Library is integrated directly with the **Nalanda Digital Library platform**, delivering final-year capstone grade AI assistance to students right at their study desks.
            </p>

            <div className="space-y-4 pt-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="h-7 w-7 bg-[#FFD700]/15 text-[#0B2E6B] rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-[#FFD700]/30">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2E6B]">{feat.title}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Right Column Image */}
          <div className="flex justify-center relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#D62828] to-[#FFD700] rounded-3xl blur-lg opacity-20"></div>
            <div className="relative bg-white p-4 rounded-3xl border border-slate-200 shadow-2xl max-w-md overflow-hidden">
              <h3 className="text-xs font-bold text-[#0B2E6B] uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center justify-between">
                <span>Nalanda Digital Library Cabinet Interface</span>
                <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-150">Active Connection</span>
              </h3>
              
              {/* Simulated UI layout */}
              <div className="space-y-3 text-left">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div className="flex gap-2.5 items-center">
                    <div className="h-8 w-8 rounded-lg bg-[#0B2E6B] text-white flex items-center justify-center font-bold">L</div>
                    <div>
                      <span className="font-bold text-[#0B2E6B] block">Digital Entry Pass</span>
                      <span className="text-[9px] text-slate-400 block">Seat Assigned: 1F-024</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-[#FFD700] text-[#0B2E6B] px-2 py-0.5 rounded-lg">QR Active</span>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#0B2E6B] block">AI Chatbot Query Fallback</span>
                  <div className="bg-white p-2.5 rounded-lg text-[10px] text-slate-500 border border-blue-150 leading-relaxed">
                    "Searching FAISS index for physics papers... 3 references retrieved."
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>STUDY HOURS METER</span>
                    <span className="text-[#0B2E6B]">78% Goal</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#D62828] to-[#FFD700] h-2 w-[78%] rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Link to="/login" className="bg-[#0B2E6B] text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-[#061d43]">
                  Verify Seat Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMINGS SECTION */}
      <section id="timings" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Flexible Schedule</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">Library Timing Shifts</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Choose the slot that best fits your workflow. Multiple shifts are coordinated to maintain proper desk sanitizations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {timings.map((time, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl bg-[#0B2E6B] text-white border border-blue-900 shadow-lg flex flex-col justify-between items-start text-left space-y-4">
                <div className="space-y-2">
                  <div className="h-8 w-8 bg-[#FFD700] text-[#0B2E6B] rounded-lg flex items-center justify-center font-bold">
                    <Clock size={16} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#FFD700]">{time.shift}</h3>
                  <span className="text-base font-extrabold block font-outfit">{time.hours}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-200 leading-relaxed border-t border-blue-900/60 pt-3 w-full">{time.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP PLANS */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Affordable Seating</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">Membership Pricing Plans</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Select a subscription cycle to book your dedicated desk space. No extra admission fees or surprise taxes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricing.map((plan, idx) => (
              <div 
                key={idx} 
                className={`glass-panel rounded-3xl bg-white p-6 border flex flex-col justify-between relative shadow-md transition-all ${
                  plan.highlight 
                    ? 'border-2 border-[#D62828] shadow-xl md:-translate-y-2' 
                    : 'border-slate-200/80'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#D62828] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B2E6B]">{plan.name}</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">{plan.price}</span>
                      <span className="text-slate-400 text-xs ml-1">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 border-t border-slate-100 pt-4 text-[10px] sm:text-xs text-slate-500">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex gap-2 items-center">
                        <Check size={14} className="text-green-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Link 
                    to="/signup" 
                    className={`w-full text-center block text-xs font-bold py-2.5 rounded-xl transition-all shadow-md ${
                      plan.highlight
                        ? 'bg-[#D62828] hover:bg-[#eb3333] text-white'
                        : 'bg-[#0B2E6B] hover:bg-[#061e47] text-white'
                    }`}
                  >
                    {plan.actionText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Photo Catalog</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">Library Gallery</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Explore real snapshots of our cabins, study bays, and reference libraries in Nalanda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {gallery.map((item, idx) => (
              <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-sm h-64 border border-slate-200">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-left opacity-90 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">{item.title}</h4>
                  <p className="text-[10px] text-slate-200 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Student Feedback</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">What Students Say</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Verified feedback from successful aspirants and students studying at Nalanda Digital Library.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between text-left space-y-4">
                <div className="space-y-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed italic">"{test.text}"</p>
                </div>
                
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-[#0B2E6B] text-white flex items-center justify-center font-bold text-xs">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0B2E6B] block">{test.name}</span>
                    <span className="text-[9px] text-[#D62828] font-bold uppercase tracking-wider block">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#D62828] uppercase tracking-widest block">Locate & Call Us</span>
            <h2 className="text-3xl font-extrabold text-[#0B2E6B] font-outfit">Contact & Location Details</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Reach out to reserve your cabin seats or visit us directly at the center in Parwalpur.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            
            {/* Contact Details Card */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl bg-[#0B2E6B] text-white border border-blue-900 shadow-xl flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#FFD700] uppercase tracking-wider border-b border-blue-900/60 pb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Our Address</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold">
                  Gayatri Mandir Road,<br />
                  Near Kundan Teaching Center,<br />
                  Parwalpur, Nalanda,<br />
                  Bihar, India
                </p>

                <h3 className="text-sm font-bold text-[#FFD700] uppercase tracking-wider border-b border-blue-900/60 pb-2 pt-4 flex items-center gap-2">
                  <Phone size={16} />
                  <span>Call to Inquire</span>
                </h3>
                
                <div className="flex flex-col gap-2.5">
                  <a href="tel:6200248532" className="flex items-center gap-3 bg-blue-950 p-3 rounded-xl border border-blue-900 hover:bg-blue-900 transition-colors text-xs font-bold text-white">
                    <Phone size={14} className="text-[#FFD700]" />
                    <span>+91 6200248532</span>
                  </a>
                  <a href="tel:9546941396" className="flex items-center gap-3 bg-blue-950 p-3 rounded-xl border border-blue-900 hover:bg-blue-900 transition-colors text-xs font-bold text-white">
                    <Phone size={14} className="text-[#FFD700]" />
                    <span>+91 9546941396</span>
                  </a>
                  <a href="tel:7856892939" className="flex items-center gap-3 bg-blue-950 p-3 rounded-xl border border-blue-900 hover:bg-blue-900 transition-colors text-xs font-bold text-white">
                    <Phone size={14} className="text-[#FFD700]" />
                    <span>+91 7856892939</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-blue-900/60">
                <a 
                  href="https://wa.me/916200248532?text=Hello%20Nalanda%20Digital%20Library,%20I%20want%20to%20inquire%20about%20seat%20reservations." 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={14} />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Map Frame Card */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md h-[380px] bg-slate-100 relative">
              <iframe 
                title="Nalanda Digital Library Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3612.012587522588!2d85.2891393!3d25.1352467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f28cf081079373%3A0xe5102008fb944e4b!2sParwalpur%2C%20Bihar%20803114!5e0!3m2!1sen!2sin!4v1718700000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B2E6B] text-slate-300 pt-16 pb-8 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#FFD700] text-[#0B2E6B] rounded-lg flex items-center justify-center font-bold text-base">
                N
              </div>
              <span className="text-base font-bold text-white font-outfit">Nalanda Digital Library</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              Bihar's premier silent study zone. Built in Parwalpur, Nalanda to support aspirants preparing for civil services, JEE, NEET, banking, and government jobs.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-[11px] sm:text-xs">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#FFD700] transition-colors">Home</button></li>
              <li><button onClick={() => handleScrollTo('facilities')} className="hover:text-[#FFD700] transition-colors">Facilities</button></li>
              <li><button onClick={() => handleScrollTo('timings')} className="hover:text-[#FFD700] transition-colors">Timings</button></li>
              <li><button onClick={() => handleScrollTo('pricing')} className="hover:text-[#FFD700] transition-colors">Membership</button></li>
              <li><Link to="/login" className="hover:text-[#FFD700] transition-colors">Student Login</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Facilities</h4>
            <ul className="space-y-2 text-[11px] sm:text-xs">
              <li>Air Conditioned Halls</li>
              <li>Uncapped fiber internet</li>
              <li>Automatic Generator Backup</li>
              <li>Pure RO purified water</li>
              <li>Secure Cabin lockers</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Details</h4>
            <p className="text-[11px] sm:text-xs leading-relaxed">
              Gayatri Mandir Road,<br />
              Near Kundan Teaching Center,<br />
              Parwalpur, Nalanda - 803114
            </p>
            <p className="text-[11px] sm:text-xs font-bold text-[#FFD700]">
              Phones: +91 6200248532, 9546941396
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-blue-900/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
          <span className="text-[10px] text-slate-400">
            © {new Date().getFullYear()} Nalanda Digital Library. All Rights Reserved. Powered by Nalanda Digital Library Suite.
          </span>
          <div className="flex gap-4 text-[10px] text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
