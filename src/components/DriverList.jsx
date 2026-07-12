function DriverList({ drivers = [], onDelete }) {
  // Ensure drivers is always an array
  const driverList = Array.isArray(drivers) ? drivers : [];

  return (
    <div>
      <h2>Driver List</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>License No</th>
            <th>Category</th>
            <th>Expiry Date</th>
            <th>Contact Number</th>
            <th>Safety Score</th>
            <th>Trips Completed</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {driverList.length > 0 ? (
            driverList.map((driver) => (
              <tr key={driver._id}>
                <td>{driver.name}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.licenseCategory}</td>
                <td>
                  {new Date(driver.licenseExpiry).toLocaleDateString()}
                </td>
                <td>{driver.contactNumber}</td>
                <td>{driver.safetyScore}</td>
                <td>{driver.tripsCompleted}</td>
                <td>{driver.status}</td>
                <td>
                  <button onClick={() => onDelete(driver._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No drivers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DriverList;