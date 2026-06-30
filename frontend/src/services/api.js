const BACKEND_URL = 'http://127.0.0.1:5000';
const AI_SERVICE_URL = 'http://127.0.0.1:8000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Reusable fetch wrapper
const request = async (url, options = {}) => {
  const headers = getHeaders();
  
  // Handle files (multipart) upload differently (don't set application/json content-type)
  if (options.body instanceof FormData) {
    options.headers = { ...options.headers };
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    options.headers = { ...headers, ...options.headers };
  }

  const response = await fetch(url, options);
  
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { success: false, message: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const api = {
  // Auth API
  auth: {
    register: (name, email, password, role) =>
      request(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      }),
    verifyEmail: (email, code) =>
      request(`${BACKEND_URL}/api/auth/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ email, code })
      }),
    login: (email, password) =>
      request(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    getMe: () => request(`${BACKEND_URL}/api/auth/me`),
    forgotPassword: (email) =>
      request(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email })
      }),
    resetPassword: (token, newPassword) =>
      request(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      }),
    sendOTP: (identifier) =>
      request(`${BACKEND_URL}/api/auth/otp/send`, {
        method: 'POST',
        body: JSON.stringify({ identifier })
      }),
    verifyOTP: (identifier, code) =>
      request(`${BACKEND_URL}/api/auth/otp/verify`, {
        method: 'POST',
        body: JSON.stringify({ identifier, code })
      })
  },

  // Users Management API (Admin only)
  users: {
    list: () => request(`${BACKEND_URL}/api/users`),
    updateRole: (userId, role) =>
      request(`${BACKEND_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      }),
    delete: (userId) =>
      request(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'DELETE'
      })
  },

  // Books API
  books: {
    list: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return request(`${BACKEND_URL}/api/books?${queryParams}`);
    },
    get: (id) => request(`${BACKEND_URL}/api/books/${id}`),
    add: (bookData) =>
      request(`${BACKEND_URL}/api/books`, {
        method: 'POST',
        body: JSON.stringify(bookData)
      }),
    update: (id, bookData) =>
      request(`${BACKEND_URL}/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      }),
    delete: (id) =>
      request(`${BACKEND_URL}/api/books/${id}`, {
        method: 'DELETE'
      }),
    categories: () => request(`${BACKEND_URL}/api/books/categories`)
  },

  // Borrow/Issue API
  borrow: {
    issue: (studentEmail, bookIsbn, durationDays) =>
      request(`${BACKEND_URL}/api/borrow/issue`, {
        method: 'POST',
        body: JSON.stringify({ studentEmail, bookIsbn, durationDays })
      }),
    return: (borrowId) =>
      request(`${BACKEND_URL}/api/borrow/return`, {
        method: 'POST',
        body: JSON.stringify({ borrowId })
      }),
    studentHistory: (studentId) => request(`${BACKEND_URL}/api/borrow/student/${studentId}`),
    active: () => request(`${BACKEND_URL}/api/borrow/active`)
  },

  // Seats & Study Rooms API
  seats: {
    list: () => request(`${BACKEND_URL}/api/seats`),
    reserve: (seatNumber, durationHours) =>
      request(`${BACKEND_URL}/api/seats/reserve`, {
        method: 'POST',
        body: JSON.stringify({ seatNumber, durationHours })
      }),
    cancel: (seatNumber) =>
      request(`${BACKEND_URL}/api/seats/cancel`, {
        method: 'POST',
        body: JSON.stringify({ seatNumber })
      }),
    rooms: () => request(`${BACKEND_URL}/api/seats/study-rooms`),
    reserveRoom: (roomId, startTime, endTime) =>
      request(`${BACKEND_URL}/api/seats/study-rooms/reserve`, {
        method: 'POST',
        body: JSON.stringify({ roomId, startTime, endTime })
      })
  },

  // Attendance API
  attendance: {
    qrCheckin: () =>
      request(`${BACKEND_URL}/api/attendance/qr-checkin`, {
        method: 'POST'
      }),
    getReports: () => request(`${BACKEND_URL}/api/attendance/reports`),
    studentStats: (studentId) => request(`${BACKEND_URL}/api/attendance/student/${studentId}`)
  },

  // Notice board & alerts API
  notices: {
    list: () => request(`${BACKEND_URL}/api/notices`),
    create: (noticeData) =>
      request(`${BACKEND_URL}/api/notices`, {
        method: 'POST',
        body: JSON.stringify(noticeData)
      }),
    delete: (id) =>
      request(`${BACKEND_URL}/api/notices/${id}`, {
        method: 'DELETE'
      }),
    notifications: () => request(`${BACKEND_URL}/api/notices/notifications`),
    readNotifications: () =>
      request(`${BACKEND_URL}/api/notices/notifications/read`, {
        method: 'PUT'
      })
  },

  // Analytics API
  analytics: {
    dashboard: () => request(`${BACKEND_URL}/api/analytics/dashboard`),
    student: (studentId) => request(`${BACKEND_URL}/api/analytics/student/${studentId}`)
  },

  // PDF Document uploads & Chats API (Backend coordinates)
  ai: {
    uploadPDF: (formData) =>
      request(`${BACKEND_URL}/api/ai/pdf/upload`, {
        method: 'POST',
        body: formData // must be FormData
      }),
    pdfs: () => request(`${BACKEND_URL}/api/ai/pdf`),
    getChat: (docId) => request(`${BACKEND_URL}/api/ai/chat${docId ? '/' + docId : ''}`),
    saveChat: (contextDocId, role, content) =>
      request(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        body: JSON.stringify({ contextDocId, role, content })
      }),
    ocrScan: (formData) =>
      request(`${BACKEND_URL}/api/ai/ocr/scan`, {
        method: 'POST',
        body: formData
      }),
    predictions: () => request(`${BACKEND_URL}/api/ai/predictions/seats`),
    studyStats: () => request(`${BACKEND_URL}/api/ai/study-stats`),
    cctvStatus: () => request(`${BACKEND_URL}/api/ai/cctv/status`),
    careerMentor: (goal, currentSkills) =>
      request(`${BACKEND_URL}/api/ai/career/mentor`, {
        method: 'POST',
        body: JSON.stringify({ goal, currentSkills })
      }),
    interviewSession: (domain, interviewType) =>
      request(`${BACKEND_URL}/api/ai/interview/session`, {
        method: 'POST',
        body: JSON.stringify({ domain, interviewType })
      }),
    interviewFeedback: (question, answer) =>
      request(`${BACKEND_URL}/api/ai/interview/feedback`, {
        method: 'POST',
        body: JSON.stringify({ question, answer })
      }),
    analyzeResume: (body) =>
      request(`${BACKEND_URL}/api/ai/resume/analyze`, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
      }),
    studyPlanner: (examName, daysRemaining, dailyHours) =>
      request(`${BACKEND_URL}/api/ai/study-planner`, {
        method: 'POST',
        body: JSON.stringify({ examName, daysRemaining, dailyHours })
      })
  },

  // Students Management API
  students: {
    list: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return request(`${BACKEND_URL}/api/students?${queryParams}`);
    },
    get: (id) => request(`${BACKEND_URL}/api/students/${id}`),
    add: (studentData) =>
      request(`${BACKEND_URL}/api/students`, {
        method: 'POST',
        body: JSON.stringify(studentData)
      }),
    update: (id, studentData) =>
      request(`${BACKEND_URL}/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData)
      }),
    delete: (id) =>
      request(`${BACKEND_URL}/api/students/${id}`, {
        method: 'DELETE'
      }),
    assignTiming: (id, timingData) =>
      request(`${BACKEND_URL}/api/students/${id}/timing`, {
        method: 'POST',
        body: JSON.stringify(timingData)
      }),
    updateMembership: (id, membershipData) =>
      request(`${BACKEND_URL}/api/students/${id}/membership`, {
        method: 'POST',
        body: JSON.stringify(membershipData)
      }),
    collectFees: (id, feeData) =>
      request(`${BACKEND_URL}/api/students/${id}/fees`, {
        method: 'POST',
        body: JSON.stringify(feeData)
      }),
    getFeesDashboard: () => request(`${BACKEND_URL}/api/students/dashboard/fees`),
    sendFeeReminders: (month, year) =>
      request(`${BACKEND_URL}/api/students/fees/reminders`, {
        method: 'POST',
        body: JSON.stringify({ month, year })
      }),
    logManualAttendance: (id, attendanceData) =>
      request(`${BACKEND_URL}/api/students/${id}/attendance/manual`, {
        method: 'POST',
        body: JSON.stringify(attendanceData)
      }),
    getReports: (reportType) => request(`${BACKEND_URL}/api/students/reports/export?reportType=${reportType}`)
  },

  // Gamification API
  gamification: {
    stats: () => request(`${BACKEND_URL}/api/gamification/stats`),
    leaderboard: () => request(`${BACKEND_URL}/api/gamification/leaderboard`),
    addPoints: (activityType) =>
      request(`${BACKEND_URL}/api/gamification/add-points`, {
        method: 'POST',
        body: JSON.stringify({ activityType })
      })
  },

  // Membership API
  membership: {
    status: () => request(`${BACKEND_URL}/api/membership/status`),
    upgrade: (plan, amount) =>
      request(`${BACKEND_URL}/api/membership/upgrade`, {
        method: 'POST',
        body: JSON.stringify({ plan, amount })
      })
  },

  // Jobs API
  jobs: {
    list: () => request(`${BACKEND_URL}/api/jobs`),
    matches: () => request(`${BACKEND_URL}/api/jobs/matches`),
    post: (jobData) =>
      request(`${BACKEND_URL}/api/jobs`, {
        method: 'POST',
        body: JSON.stringify(jobData)
      })
  },

  // FastAPI direct endpoints
  fastapi: {
    semanticSearch: (query, books, topK = 5) =>
      request(`${AI_SERVICE_URL}/ai/search/semantic`, {
        method: 'POST',
        body: JSON.stringify({ query, books, top_k: topK })
      }),
    recommendations: (userHistory, allBooks, topK = 4) =>
      request(`${AI_SERVICE_URL}/ai/recommendations`, {
        method: 'POST',
        body: JSON.stringify({ user_history: userHistory, all_books: allBooks, top_k: topK })
      }),
    pdfChat: (query, indexKey) =>
      request(`${AI_SERVICE_URL}/ai/pdf/chat`, {
        method: 'POST',
        body: JSON.stringify({ query, index_key: indexKey })
      }),
    pdfNotes: (indexKey, noteType = 'short') =>
      request(`${AI_SERVICE_URL}/ai/pdf/notes`, {
        method: 'POST',
        body: JSON.stringify({ index_key: indexKey, note_type: noteType })
      }),
    pdfMCQ: (indexKey, quantity = 10, difficulty = 'medium') =>
      request(`${AI_SERVICE_URL}/ai/pdf/mcq`, {
        method: 'POST',
        body: JSON.stringify({ index_key: indexKey, quantity, difficulty })
      }),
    registerFace: (formData) =>
      request(`${AI_SERVICE_URL}/ai/face/register`, {
        method: 'POST',
        body: formData // must be FormData containing file
      }),
    verifyFace: (formData) =>
      request(`${AI_SERVICE_URL}/ai/face/verify`, {
        method: 'POST',
        body: formData // must be FormData containing file and student db profiles
      }),
    predictSeats: (date, timeSlot) =>
      request(`${AI_SERVICE_URL}/ai/predict/seats`, {
        method: 'POST',
        body: JSON.stringify({ date, time_slot: timeSlot })
      }),
    ocrScan: (formData) =>
      request(`${AI_SERVICE_URL}/ai/ocr/scan`, {
        method: 'POST',
        body: formData
      })
  }
};
export { BACKEND_URL, AI_SERVICE_URL };
export default api;

