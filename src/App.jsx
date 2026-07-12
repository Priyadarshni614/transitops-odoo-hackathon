import "./App.css";

const kpis = [
  { title: "Total Vehicles", value: "0" },
  { title: "Available Vehicles", value: "0" },
  { title: "Active Trips", value: "0" },
  { title: "Drivers On Duty", value: "0" },
  { title: "Vehicles In Maintenance", value: "0" },
  { title: "Fleet Utilization", value: "0%" },
];

function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>TransitOps</h1>
          <p>Smart Transport Platform</p>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Vehicles</button>
          <button className="nav-item">Drivers</button>
          <button className="nav-item">Trips</button>
          <button className="nav-item">Maintenance</button>
          <button className="nav-item">Fuel & Expenses</button>
          <button className="nav-item">Reports</button>
        </nav>

        <button className="logout-button">Logout</button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Fleet Dashboard</h2>
            <p>Monitor your transport operations in real time.</p>
          </div>

          <div className="user-profile">
            <span className="avatar">PH</span>

            <div>
              <strong>Priya H</strong>
              <p>Fleet Manager</p>
            </div>
          </div>
        </header>

        <section className="kpi-grid">
          {kpis.map((kpi) => (
            <article className="kpi-card" key={kpi.title}>
              <p>{kpi.title}</p>
              <h3>{kpi.value}</h3>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <h3>Recent Trips</h3>
              <button type="button">View All</button>
            </div>

            <div className="empty-state">
              <h4>No trips available</h4>
              <p>Newly created trips will appear here.</p>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h3>Quick Actions</h3>
            </div>

            <div className="quick-actions">
              <button type="button">Register Vehicle</button>
              <button type="button">Add Driver</button>
              <button type="button">Create Trip</button>
              <button type="button">Add Maintenance</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;