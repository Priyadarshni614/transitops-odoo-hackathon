const kpis = [
  { title: "Active Vehicles", value: "0" },
  { title: "Available Vehicles", value: "0" },
  { title: "Vehicles In Maintenance", value: "0" },
  { title: "Active Trips", value: "0" },
  { title: "Pending Trips", value: "0" },
  { title: "Drivers On Duty", value: "0" },
  { title: "Fleet Utilization", value: "0%" },
];

function Dashboard() {
  return (
    <>
      <section className="page-heading">
        <h1>Fleet Dashboard</h1>
        <p>Monitor your transport operations in real time.</p>
      </section>

      <section className="dashboard-filters">
        <select>
          <option>Vehicle Type: All</option>
        </select>

        <select>
          <option>Status: All</option>
        </select>

        <select>
          <option>Region: All</option>
        </select>
      </section>

      <section className="kpi-grid dashboard-kpis">
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
            <h3>Vehicle Status</h3>
          </div>

          <div className="status-summary">
            <div>
              <span>Available</span>
              <progress value="0" max="100" />
            </div>

            <div>
              <span>On Trip</span>
              <progress value="0" max="100" />
            </div>

            <div>
              <span>In Shop</span>
              <progress value="0" max="100" />
            </div>

            <div>
              <span>Retired</span>
              <progress value="0" max="100" />
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

export default Dashboard;