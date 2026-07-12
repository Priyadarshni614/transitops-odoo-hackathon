function DriverList({ drivers, onDelete }) {
  return (
    <div>
      <h2>Driver List</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>License</th>
            <th>Phone</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr key={driver._id}>
              <td>{driver.name}</td>
              <td>{driver.licenseNumber}</td>
              <td>{driver.phone}</td>
              <td>{driver.vehicleAssigned}</td>
              <td>{driver.status}</td>
              <td>
                <button onClick={() => onDelete(driver._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DriverList;