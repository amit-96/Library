import 'package:flutter/material';
import 'services/api_service.dart';

void main() {
  runApp(const LibraAiApp());
}

class LibraAiApp extends StatelessWidget {
  const LibraAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LibraAI Mobile',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

// ----------------------------------------------------
// 1. LOGIN SCREEN
// ----------------------------------------------------
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String _error = '';

  void _handleLogin() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _loading = false;
        _error = 'Please fill all fields';
      });
      return;
    }

    final res = await ApiService.login(email, password);
    setState(() {
      _loading = false;
    });

    if (res['success'] == true) {
      final token = res['token'];
      if (token != null) {
        await ApiService.saveToken(token);
      }
      
      final role = res['user'] != null ? res['user']['role'] : 'student';

      if (role == 'student') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const StudentHomeScreen()),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const AdminHomeScreen()),
        );
      }
    } else {
      // Offline fallback credentials mapping for presentation demo
      if ((email == 'student@libra.ai' || email == 'admin@libra.ai') && password == 'password123') {
        if (email == 'student@libra.ai') {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const StudentHomeScreen()),
          );
        } else {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const AdminHomeScreen()),
          );
        }
      } else {
        setState(() {
          _error = res['message'] ?? 'Invalid email ID or password';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.indigo, Colors.deepPurple],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            child: Card(
              margin: const EdgeInsets.all(24),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              elevation: 8,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.indigo,
                      child: Icon(Icons.school, size: 32, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'LibraAI Ecosystem',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Smart Education portal & Library',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        prefixIcon: Icon(Icons.email),
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock),
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                    ),
                    const SizedBox(height: 16),
                    if (_error.isNotEmpty)
                      Text(
                        _error,
                        style: const TextStyle(color: Colors.red, fontSize: 12),
                      ),
                    const SizedBox(height: 16),
                    _loading
                        ? const CircularProgressIndicator()
                        : SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _handleLogin,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.indigo,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text('Login'),
                            ),
                          ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ----------------------------------------------------
// 2. STUDENT HOME VIEW
// ----------------------------------------------------
class StudentHomeScreen extends StatefulWidget {
  const StudentHomeScreen({super.key});

  @override
  State<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends State<StudentHomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const StudentDashboardTab(),
    const BookSearchTab(),
    const SeatBookingTab(),
    const AIChatTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LibraAI Student Dashboard', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ApiService.logout();
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Catalog'),
          BottomNavigationBarItem(icon: Icon(Icons.chair), label: 'Seats'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'AI Librarian'),
        ],
      ),
    );
  }
}

// ----------------------------------------------------
// 3. STUDENT TABS DEFINITIONS
// ----------------------------------------------------
class StudentDashboardTab extends StatelessWidget {
  const StudentDashboardTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: Colors.indigo.shade50,
          child: const Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Welcome Back, Student!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo)),
                SizedBox(height: 8),
                Text('Streamline your revision. Access class notes, check seat counts, or speak with the AI Career Mentor.', style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Quick Access Actions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _buildActionCard(context, Icons.contact_mail, 'Digital ID Card', Colors.amber),
            _buildActionCard(context, Icons.auto_graph, 'Learning Streaks', Colors.teal),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(BuildContext context, IconData icon, String title, Color color) {
    return InkWell(
      onTap: () {
        if (title == 'Digital ID Card') {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const DigitalIdCardScreen()));
        }
      },
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 28, color: color),
              const SizedBox(height: 8),
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}

class BookSearchTab extends StatefulWidget {
  const BookSearchTab({super.key});

  @override
  State<BookSearchTab> createState() => _BookSearchTabState();
}

class _BookSearchTabState extends State<BookSearchTab> {
  final _searchController = TextEditingController();
  List<dynamic> _books = [];
  bool _loading = false;

  void _search() async {
    setState(() => _loading = true);
    final query = _searchController.text.trim();
    final res = await ApiService.searchBooks(query);
    setState(() => _loading = false);
    if (res['success'] == true) {
      setState(() {
        _books = res['data'] ?? [];
      });
    } else {
      // Mock search results fallback
      setState(() {
        _books = [
          {"title": "Introduction to Algorithms", "author": "Thomas Cormen", "isbn": "9780262033848"},
          {"title": "Clean Code", "author": "Robert C. Martin", "isbn": "9780132350884"}
        ];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    hintText: 'Search book catalog...',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.search),
                onPressed: _search,
              ),
            ],
          ),
          const SizedBox(height: 16),
          _loading
              ? const CircularProgressIndicator()
              : Expanded(
                  child: ListView.builder(
                    itemCount: _books.length,
                    itemBuilder: (context, idx) {
                      final b = _books[idx];
                      return Card(
                        child: ListTile(
                          title: Text(b['title'] ?? 'Title'),
                          subtitle: Text(b['author'] ?? 'Author'),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                        ),
                      );
                    },
                  ),
                ),
        ],
      ),
    );
  }
}

class SeatBookingTab extends StatefulWidget {
  const SeatBookingTab({super.key});

  @override
  State<SeatBookingTab> createState() => _SeatBookingTabState();
}

class _SeatBookingTabState extends State<SeatBookingTab> {
  String _message = '';

  void _bookSeat(String seat) async {
    final res = await ApiService.reserveSeat(seat);
    setState(() {
      _message = res['message'] ?? 'Reserved seat $seat successfully!';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Text('Select Library study seat grid:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.count(
              crossAxisCount: 4,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: List.generate(16, (index) {
                final seatNum = '1F-0${index + 1}';
                return ElevatedButton(
                  onPressed: () => _bookSeat(seatNum),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo.shade100,
                  ),
                  child: Text(seatNum, style: const TextStyle(fontSize: 10)),
                );
              }),
            ),
          ),
          if (_message.isNotEmpty)
            Text(
              _message,
              style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
            ),
        ],
      ),
    );
  }
}

class AIChatTab extends StatefulWidget {
  const AIChatTab({super.key});

  @override
  State<AIChatTab> createState() => _AIChatTabState();
}

class _AIChatTabState extends State<AIChatTab> {
  final _msgController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _sending = false;

  void _send() async {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _sending = true;
    });
    _msgController.clear();

    final res = await ApiService.chatWithLibrarian(text);
    setState(() {
      _sending = false;
    });

    if (res['success'] == true) {
      // Simply refresh chat or read the generated answer
      setState(() {
        _messages.add({'role': 'assistant', 'content': 'I am searching the catalog for you. Ensure the Python API is active.'});
      });
    } else {
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': 'Hello! I am your AI Librarian. Ask me anything, or upload a coursework PDF to start learning!'
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final m = _messages[idx];
                final isUser = m['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.indigo.shade500 : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      m['content'] ?? '',
                      style: TextStyle(color: isUser ? Colors.white : Colors.black87),
                    ),
                  ),
                );
              },
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _msgController,
                  decoration: const InputDecoration(hintText: 'Ask AI Librarian...'),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send),
                onPressed: _send,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ----------------------------------------------------
// 4. DIGITAL STUDENT CARD SCREEN
// ----------------------------------------------------
class DigitalIdCardScreen extends StatelessWidget {
  const DigitalIdCardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Digital ID Card')),
      body: Center(
        child: Card(
          margin: const EdgeInsets.all(32),
          elevation: 6,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('LibraAI Smart Library', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.indigo)),
                const Divider(),
                const SizedBox(height: 16),
                const Icon(Icons.account_circle, size: 80, color: Colors.grey),
                const SizedBox(height: 16),
                const Text('Amit Kumar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Text('ID: LIB-548962', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
                // Mock barcode/QR space
                Container(
                  padding: const EdgeInsets.all(12),
                  color: Colors.grey.shade100,
                  child: const Icon(Icons.qr_code_2, size: 100),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ----------------------------------------------------
// 5. ADMIN HOME SCREEN
// ----------------------------------------------------
class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LibraAI Command Center (Admin)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ApiService.logout();
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              color: Colors.red.shade50,
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Enterprise Command Center', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
                    SizedBox(height: 8),
                    Text('Monitor active servers, inspect CCTV occupancy alerts, and oversee book distributions.', style: TextStyle(fontSize: 12)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Admin Actions Dashboard', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.book, color: Colors.blue),
              title: const Text('Manage Catalog Inventory'),
              trailing: const Icon(Icons.arrow_forward),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.security, color: Colors.orange),
              title: const Text('Live CCTV Occupancy Alerts'),
              trailing: const Icon(Icons.arrow_forward),
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }
}
