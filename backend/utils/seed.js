const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Book = require('../models/Book');
const Seat = require('../models/Seat');
const StudyRoom = require('../models/StudyRoom');
const Notice = require('../models/Notice');
const Membership = require('../models/Membership');
const LibraryTiming = require('../models/LibraryTiming');
const FeeRecord = require('../models/FeeRecord');
const Attendance = require('../models/Attendance');

dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully to Atlas for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Book.deleteMany();
    await Seat.deleteMany();
    await StudyRoom.deleteMany();
    await Notice.deleteMany();
    await Membership.deleteMany();
    await LibraryTiming.deleteMany();
    await FeeRecord.deleteMany();
    await Attendance.deleteMany();
    console.log('Cleared existing collections.');

    // Seed Users (pass plain text 'password123' so the schema pre-save hook hashes it exactly once)
    const adminUser = await User.create({
      name: 'Dr. Amitabh (Admin)',
      email: 'admin@libra.ai',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });

    const librarianUser = await User.create({
      name: 'Mrs. Sarah Connor',
      email: 'librarian@libra.ai',
      password: 'password123',
      role: 'librarian',
      isVerified: true
    });

    const studentUser = await User.create({
      name: 'Amit Kumar',
      email: 'student@libra.ai',
      password: 'password123',
      role: 'student',
      isVerified: true,
      studentId: 'LIB-548962',
      rollNumber: 'CS-2023-085',
      registrationNumber: 'REG-987654321',
      gender: 'Male',
      dateOfBirth: new Date('2003-05-15'),
      course: 'B.Tech',
      year: '3rd Year',
      semester: '6th Semester',
      address: 'Hostel 4, IIT campus, Delhi, India',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      phone: '9876543210',
      membershipNumber: 'MEM-785962',
      joiningDate: new Date('2025-08-01'),
      membershipStatus: 'Active',
      libraryShift: 'Morning'
    });

    const studentPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@libra.ai',
      password: 'password123',
      role: 'student',
      isVerified: true,
      studentId: 'LIB-852147',
      rollNumber: 'CS-2023-012',
      registrationNumber: 'REG-147852369',
      gender: 'Female',
      dateOfBirth: new Date('2002-09-22'),
      course: 'B.Tech',
      year: '4th Year',
      semester: '8th Semester',
      address: 'Block A-202, Sunshine Apts, Delhi',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      phone: '9876543211',
      membershipNumber: 'MEM-147852',
      joiningDate: new Date('2025-08-01'),
      membershipStatus: 'Suspended',
      libraryShift: 'Afternoon'
    });

    const studentRohit = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit@libra.ai',
      password: 'password123',
      role: 'student',
      isVerified: true,
      studentId: 'LIB-369852',
      rollNumber: 'CS-2024-045',
      registrationNumber: 'REG-258963147',
      gender: 'Male',
      dateOfBirth: new Date('2004-11-05'),
      course: 'B.Tech',
      year: '2nd Year',
      semester: '4th Semester',
      address: 'Sector 15, Rohini, Delhi',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '9876543212',
      membershipNumber: 'MEM-369852',
      joiningDate: new Date('2025-08-01'),
      membershipStatus: 'Expired',
      libraryShift: 'Evening'
    });

    console.log('Seeded Users: admin@libra.ai, librarian@libra.ai, student@libra.ai, priya@libra.ai, rohit@libra.ai');

    // Seed Memberships
    await Membership.create([
      { user: studentUser._id, plan: 'Free', membershipType: 'Monthly', startDate: new Date('2026-05-01'), endDate: new Date('2026-07-01'), status: 'Active' },
      { user: studentPriya._id, plan: 'Premium', membershipType: 'Quarterly', startDate: new Date('2026-04-10'), endDate: new Date('2026-07-10'), status: 'Suspended' },
      { user: studentRohit._id, plan: 'Free', membershipType: 'Monthly', startDate: new Date('2026-04-01'), endDate: new Date('2026-05-01'), status: 'Expired' }
    ]);

    // Seed Timing assignments
    await LibraryTiming.create([
      { studentId: studentUser._id, shiftName: 'Morning Shift', startTime: '08:00 AM', endTime: '12:00 PM', assignedBy: adminUser._id },
      { studentId: studentPriya._id, shiftName: 'Afternoon Shift', startTime: '12:00 PM', endTime: '04:00 PM', assignedBy: adminUser._id },
      { studentId: studentRohit._id, shiftName: 'Evening Shift', startTime: '04:00 PM', endTime: '08:00 PM', assignedBy: adminUser._id }
    ]);

    // Seed Fee records
    await FeeRecord.create([
      { studentId: studentUser._id, month: 'May', year: 2026, amount: 1200, paymentDate: new Date('2026-05-02'), paymentMethod: 'UPI', transactionId: 'upi_123456789', status: 'Paid' },
      { studentId: studentUser._id, month: 'June', year: 2026, amount: 1200, paymentDate: new Date('2026-06-03'), paymentMethod: 'UPI', transactionId: 'upi_987654321', status: 'Paid' },
      { studentId: studentPriya._id, month: 'April', year: 2026, amount: 2500, paymentDate: new Date('2026-04-12'), paymentMethod: 'Card', transactionId: 'card_789456123', status: 'Paid' },
      { studentId: studentPriya._id, month: 'May', year: 2026, amount: 2500, status: 'Unpaid' },
      { studentId: studentRohit._id, month: 'April', year: 2026, amount: 1200, paymentDate: new Date('2026-04-02'), paymentMethod: 'Cash', transactionId: 'cash_321654987', status: 'Paid' },
      { studentId: studentRohit._id, month: 'May', year: 2026, amount: 1200, status: 'Overdue' }
    ]);

    // Seed Attendance Logs
    const attendanceLogs = [];
    const dates = ['2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17'];
    
    dates.forEach(d => {
      attendanceLogs.push({ studentId: studentUser._id, date: d, checkIn: new Date(`${d}T08:15:00`), checkOut: new Date(`${d}T11:45:00`), method: 'QR', status: 'Present' });
      attendanceLogs.push({ studentId: studentPriya._id, date: d, checkIn: new Date(`${d}T12:05:00`), checkOut: new Date(`${d}T15:55:00`), method: 'Face', status: 'Present' });
      attendanceLogs.push({ studentId: studentRohit._id, date: d, checkIn: new Date(`${d}T16:10:00`), checkOut: new Date(`${d}T19:50:00`), method: 'QR', status: 'Present' });
    });
    
    // add an absent day
    attendanceLogs.push({ studentId: studentUser._id, date: '2026-06-18', method: 'QR', status: 'Absent' });

    await Attendance.insertMany(attendanceLogs);
    console.log('Seeded student memberships, timings, fee records, and attendance logs.');

    // Seed Books
    const books = [
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        category: 'Computer Science',
        isbn: '9780262033848',
        edition: '3rd Edition',
        quantity: 5,
        availableQuantity: 5,
        shelfLocation: 'CS-01-A',
        coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80'
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Computer Science',
        isbn: '9780132350884',
        edition: '1st Edition',
        quantity: 8,
        availableQuantity: 8,
        shelfLocation: 'CS-02-B',
        coverImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80'
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell',
        category: 'Artificial Intelligence',
        isbn: '9780136086208',
        edition: '3rd Edition',
        quantity: 4,
        availableQuantity: 4,
        shelfLocation: 'AI-01-A',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        category: 'Physics',
        isbn: '9780553380163',
        edition: 'Book Club Edition',
        quantity: 6,
        availableQuantity: 6,
        shelfLocation: 'PH-04-C',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80'
      },
      {
        title: 'Calculus',
        author: 'James Stewart',
        category: 'Mathematics',
        isbn: '9780538497817',
        edition: '7th Edition',
        quantity: 3,
        availableQuantity: 3,
        shelfLocation: 'MA-02-D',
        coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Literature',
        isbn: '9780446310789',
        edition: 'Grand Central Edition',
        quantity: 10,
        availableQuantity: 10,
        shelfLocation: 'LI-03-F',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'
      }
    ];

    await Book.insertMany(books);
    console.log('Seeded books.');

    // Seed Seats (16 seats for Floor 1, 16 for Floor 2)
    const seats = [];
    for (let f = 1; f <= 2; f++) {
      for (let s = 1; s <= 16; s++) {
        const seatNum = `${f}F-${String(s).padStart(3, '0')}`;
        seats.push({
          seatNumber: seatNum,
          floor: f,
          status: 'Available'
        });
      }
    }
    await Seat.insertMany(seats);
    console.log('Seeded seats.');

    // Seed Study Rooms
    const studyRooms = [
      { name: 'Quantum Hub (Room 1)', capacity: 6 },
      { name: 'Ada Lab (Room 2)', capacity: 8 },
      { name: 'Einstein Study (Room 3)', capacity: 4 }
    ];
    await StudyRoom.insertMany(studyRooms);
    console.log('Seeded study rooms.');

    // Seed notices
    await Notice.create({
      title: 'Exam Period Study Extension',
      content: 'Starting next week, the main study wing and quantum hub study rooms will remain open 24/7 to accommodate students preparing for end-semester assessments.',
      publishedBy: adminUser._id
    });

    await Notice.create({
      title: 'Introducing AI Librarian Chatbot',
      content: 'We are thrilled to launch Nalanda Digital Library - our new intelligent assistant. You can now chat with the AI chatbot to get immediate answers, upload study guides, or generate revision notes.',
      publishedBy: adminUser._id
    });

    console.log('Seeded notices.');
    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

// Execute if run directly
if (require.main === module) {
  seedData();
}
