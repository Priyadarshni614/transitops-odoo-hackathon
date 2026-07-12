import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../auth/authService";

const navigationByRole = {
  "Fleet Manager": [
    ["Dashboard", "/dashboard"],
    ["Fleet", "/fleet"],
    ["Drivers", "/drivers"],
    ["Trips", "/trips"],
    ["Maintenance", "/maintenance"],
    ["Fuel & Expenses", "/expenses"],
    ["Analytics", "/analytics"],
    ["Settings", "/settings"],
  ],

  Dispatcher: [
    ["Dashboard", "/dashboard"],
    ["Fleet", "/fleet"],
    ["Trips", "/trips"],
  ],

  "Safety Officer": [
    ["Dashboard", "/dashboard"],
    ["Drivers", "/drivers"],
    ["Trips", "/trips"],
  ],

  "Financial Analyst": [
    ["Dashboard", "/dashboard"],
    ["Fleet", "/fleet"],
    ["Fuel & Expenses", "/expenses"],
    ["Analytics", "/analytics"],
  ],
};

function AppLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const navigation = navigationByRole[user?.role] || [];

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TO";

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>TransitOps</h1>
          <p>Smart Transport Platform</p>
        </div>

        <nav className="sidebar-nav">
          {navigation.map(([label, path]) => (
            <NavLink
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              to={path}
              key={path}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>TransitOps</h2>
            <p>Smart transport operations management</p>
          </div>

          <div className="user-profile">
            <span className="avatar">{initials}</span>

            <div>
              <strong>{user?.name}</strong>
              <p>{user?.role}</p>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;