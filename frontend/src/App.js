import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import BookSearch from './pages/BookSearch';
import BookManage from './pages/BookManage';
import BorrowDesk from './pages/BorrowDesk';
import SeatReservation from './pages/SeatReservation';
import Chatbot from './pages/Chatbot';
import PDFAssistant from './pages/PDFAssistant';
import DigitalID from './pages/DigitalID';
import ExamPrep from './pages/ExamPrep';
import AttendanceLogs from './pages/AttendanceLogs';
import NoticeManage from './pages/NoticeManage';
import UserManage from './pages/UserManage';
import CareerMentor from './pages/CareerMentor';
import InterviewPrep from './pages/InterviewPrep';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import StudyPlanner from './pages/StudyPlanner';
import Leaderboard from './pages/Leaderboard';
import AdminCommandCenter from './pages/AdminCommandCenter';
import PremiumMembership from './pages/PremiumMembership';

import StudentAdd from './pages/StudentAdd';
import StudentList from './pages/StudentList';
import StudentMembership from './pages/StudentMembership';
import StudentFees from './pages/StudentFees';
import StudentTimings from './pages/StudentTimings';
import StudentAttendance from './pages/StudentAttendance';
import StudentReports from './pages/StudentReports';
import StudentProfile from './pages/StudentProfile';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<VerifyEmail />} />

            {/* Protected SaaS Dashboards (Admin/Librarian/Student Dynamic Router) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />


            {/* Protected Catalog & Assistant Routes */}
            <Route
              path="/books/search"
              element={
                <ProtectedRoute>
                  <BookSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-librarian"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seats"
              element={
                <ProtectedRoute>
                  <SeatReservation />
                </ProtectedRoute>
              }
            />

            {/* Protected Student Specific Modules */}
            <Route
              path="/pdf-assistant"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PDFAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/digital-id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DigitalID />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-prep"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamPrep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-mentor"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CareerMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-prep"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <InterviewPrep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-analyzer"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ResumeAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-planner"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudyPlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/premium"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PremiumMembership />
                </ProtectedRoute>
              }
            />

            {/* Protected Librarian/Admin Inventory & Desk Modules */}
            <Route
              path="/books/manage"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <BookManage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrow/issue-desk"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <BorrowDesk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/reports"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <AttendanceLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices/manage"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <NoticeManage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Controls */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/command-center"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCommandCenter />
                </ProtectedRoute>
              }
            />

            {/* Student Center Module Routes */}
            <Route
              path="/students/add"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/list"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/membership"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentMembership />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/fees"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/timings"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentTimings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/attendance"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/reports"
              element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <StudentReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
