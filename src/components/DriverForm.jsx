import { useState } from "react";

function DriverForm({ onAdd }) {
  const [driver, setDriver] = useState({
    name: "",
    licenseNumber: "",
    phone: "",
    vehicleAssigned: "",
    status: "Available",
  });

  const handleChange = (e) => {
    setDriver({
      ...driver,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(driver);

    setDriver({
      name: "",
      licenseNumber: "",
      phone: "",
      vehicleAssigned: "",
      status: "Available",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Driver</h2>

      <input
        type="text"
        name="name"
        placeholder="Driver Name"
        value={driver.name}
        onChange={handleChange}
        required
      />

      <br /><br />

      <input
        type="text"
        name="licenseNumber"
        placeholder="License Number"
        value={driver.licenseNumber}
        onChange={handleChange}
        required
      />

      <br /><br />

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={driver.phone}
        onChange={handleChange}
        required
      />

      <br /><br />

      <input
        type="text"
        name="vehicleAssigned"
        placeholder="Vehicle Assigned"
        value={driver.vehicleAssigned}
        onChange={handleChange}
      />

      <br /><br />

      <select
        name="status"
        value={driver.status}
        onChange={handleChange}
      >
        <option>Available</option>
        <option>On Duty</option>
        <option>Off Duty</option>
      </select>

      <br /><br />

      <button type="submit">Add Driver</button>
    </form>
  );
}

export default DriverForm;