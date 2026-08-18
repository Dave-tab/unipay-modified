import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'PARENT' | 'MERCHANT';
  studentId?: string;
  department?: string;
  wardName?: string;
  wardId?: string;
  businessName?: string;
  category?: string;
  avatar: string;
  balance: number;
}

const dbUsers: Record<string, UserRecord> = {
  STUDENT: {
    id: 'STU-24-00192',
    name: 'Sarah Davies',
    email: 'sarah.davies@uni.edu',
    role: 'STUDENT',
    studentId: '24-00192',
    department: 'Computer Science • 300L',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    balance: 12500,
  },
  PARENT: {
    id: 'PAR-8821',
    name: 'Dr. Robert Davies',
    email: 'robert.davies@gmail.com',
    role: 'PARENT',
    wardName: 'Sarah Davies',
    wardId: '24-00192',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024e',
    balance: 12500,
  },
  MERCHANT: {
    id: 'MER-0042',
    name: 'Main Campus Cafe',
    email: 'cafe@campus.edu',
    role: 'MERCHANT',
    businessName: 'Main Campus Cafe',
    category: 'Cafeteria',
    avatar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150',
    balance: 450000,
  },
};

const transactionsStore = [
  { id: '1', category: 'Cafeteria', merchant: 'Main Cafe', time: '12:30 PM', amount: 1500, type: 'debit', date: 'Today' },
  { id: '2', category: 'Printing', merchant: 'Library Print Hub', time: '09:15 AM', amount: 200, type: 'debit', date: 'Today' },
  { id: '3', category: 'Top-up', merchant: 'Bank Transfer', time: 'Yesterday', amount: 5000, type: 'credit', date: 'Yesterday' },
  { id: '4', category: 'Transport', merchant: 'Campus Shuttle', time: '08:00 AM', amount: 150, type: 'debit', date: 'Yesterday' },
  { id: '5', category: 'Bookstore', merchant: 'Uni Store', time: '14:20 PM', amount: 3500, type: 'debit', date: '21 Oct' },
  { id: '6', category: 'Transfer', merchant: 'John Doe', time: '10:00 AM', amount: 1000, type: 'credit', date: '20 Oct' },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add standard middlewares
  app.use(express.json());

  // ==========================================
  // API ROUTES
  // ==========================================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "UniPay Backend is running" });
  });

  // User Authentication
  app.post("/api/login", (req, res) => {
    const { role = 'STUDENT', identifier, password } = req.body;
    const user = dbUsers[role as keyof typeof dbUsers] || dbUsers.STUDENT;

    res.json({
      success: true,
      token: `jwt-session-${Date.now()}`,
      user,
      balance: user.balance,
      transactions: transactionsStore
    });
  });

  // User Registration
  app.post("/api/register", (req, res) => {
    const { role = 'STUDENT', name, email, studentId, wardId, businessName } = req.body;
    const newId = `${role.slice(0, 3)}-${Date.now().toString().slice(-5)}`;
    
    const newUser: UserRecord = {
      id: newId,
      name: name || 'Campus User',
      email: email || 'user@uni.edu',
      role: role as any,
      studentId: studentId || (role === 'STUDENT' ? newId : undefined),
      wardName: wardId ? 'Sarah Davies' : undefined,
      wardId: wardId,
      businessName: businessName,
      category: role === 'MERCHANT' ? 'Cafeteria' : undefined,
      avatar: `https://i.pravatar.cc/150?u=${newId}`,
      balance: 10000
    };

    dbUsers[role] = newUser;

    res.json({
      success: true,
      token: `jwt-session-${Date.now()}`,
      user: newUser,
      balance: newUser.balance,
      transactions: transactionsStore
    });
  });

  // Wallet Top Up
  app.post("/api/topup", (req, res) => {
    const { role = 'STUDENT', amount = 0, channel = 'Card' } = req.body;
    const user = dbUsers[role as keyof typeof dbUsers] || dbUsers.STUDENT;
    user.balance += amount;

    const newTx = {
      id: Math.random().toString().slice(2, 8),
      category: 'Top-up',
      merchant: channel,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: amount,
      type: 'credit',
      date: 'Today',
    };

    transactionsStore.unshift(newTx);

    res.json({
      success: true,
      balance: user.balance,
      transaction: newTx
    });
  });

  // Merchant Charge
  app.post("/api/charge", (req, res) => {
    const { amount = 0, category = 'Cafeteria', merchant = 'Main Cafe' } = req.body;
    const user = dbUsers.STUDENT;
    user.balance = Math.max(0, user.balance - amount);

    const newTx = {
      id: Math.random().toString().slice(2, 8),
      category,
      merchant,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount,
      type: 'debit',
      date: 'Today',
    };

    transactionsStore.unshift(newTx);

    res.json({
      success: true,
      balance: user.balance,
      transaction: newTx
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (Frontend serving)
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development mode: Use Vite's development server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static files from the React build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
