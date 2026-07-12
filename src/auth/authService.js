const USERS = [
  {
    name: "Priya H",
    email: "fleet@transitops.com",
    password: "transit123",
    role: "Fleet Manager",
  },
  {
    name: "Priya K",
    email: "dispatch@transitops.com",
    password: "transit123",
    role: "Dispatcher",
  },
  {
    name: "Nithyasri S",
    email: "safety@transitops.com",
    password: "transit123",
    role: "Safety Officer",
  },
  {
    name: "Nithya V",
    email: "finance@transitops.com",
    password: "transit123",
    role: "Financial Analyst",
  },
];

const USER_KEY = "transitops_current_user";

export function loginUser(email, password, role) {
  const user = USERS.find(
    (item) =>
      item.email.toLowerCase() === email.trim().toLowerCase() &&
      item.password === password &&
      item.role === role,
  );

  if (!user) {
    throw new Error("Invalid email, password or role.");
  }

  const safeUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}