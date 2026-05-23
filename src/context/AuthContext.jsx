import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Simple localStorage-based "database" for demo purposes
const DB_KEY = 'therapy_ai_users';
const SESSION_KEY = 'therapy_ai_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try { setUser(JSON.parse(session)); } catch { /**/ }
    }
    setLoading(false);
  }, []);

  const register = async ({ name, email, password }) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, hash this!
      plan: null,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const sessionUser = { ...newUser, password: undefined };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const login = async ({ email, password }) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password.');
    const sessionUser = { ...found, password: undefined };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updatePlan = (plan) => {
    const updated = { ...user, plan };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    // Also update in users DB
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], plan };
      saveUsers(users);
    }
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
