const Vehicle = require("../models/Vehicle");

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add vehicle
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();

    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};