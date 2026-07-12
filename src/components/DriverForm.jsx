import { useState } from "react";

function DriverForm({ onAdd }) {
  const [driver, setDriver] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "LMV",
    licenseExpiry: "",
    contactNumber: "",
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
      licenseCategory: "LMV",
      licenseExpiry: "",
      contactNumber: "",
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

      <br />
      <br />

      <input
        type="text"
        name="licenseNumber"
        placeholder="License Number"
        value={driver.licenseNumber}
        onChange={handleChange}
        required
      />

      <br />
      <br />

      <select
        name="licenseCategory"
        value={driver.licenseCategory}
        onChange={handleChange}
      >
        <option value="LMV">LMV</option>
        <option value="HMV">HMV</option>
        <option value="MCWG">MCWG</option>
        <option value="Transport">Transport</option>
      </select>

      <br />
      <br />

      <input
        type="date"
        name="licenseExpiry"
        value={driver.licenseExpiry}
        onChange={handleChange}
        required
      />

      <br />
      <br />

      <input
        type="text"
        name="contactNumber"
        placeholder="Contact Number"
        value={driver.contactNumber}
        onChange={handleChange}
        required
      />

      <br />
      <br />

      <select
        name="status"
        value={driver.status}
        onChange={handleChange}
      >
        <option value="Available">Available</option>
        <option value="On Trip">On Trip</option>
        <option value="Off Duty">Off Duty</option>
        <option value="Suspended">Suspended</option>
      </select>

      <br />
      <br />

      <button type="submit">Add Driver</button>
    </form>
  );
}

export default DriverForm;