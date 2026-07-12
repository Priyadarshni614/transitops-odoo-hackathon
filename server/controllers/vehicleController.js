const Vehicle = require("../models/Vehicle");

function normalizeRegistration(value) {
  return value?.trim().toUpperCase();
}

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve vehicles",
      error: error.message,
    });
  }
};

// Add vehicle
exports.addVehicle = async (req, res) => {
  try {
    const registrationNumber = normalizeRegistration(
      req.body.registrationNumber,
    );

    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    const duplicate = await Vehicle.findOne({
      registrationNumber,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      registrationNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to add vehicle",
    });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (updateData.registrationNumber) {
      updateData.registrationNumber = normalizeRegistration(
        updateData.registrationNumber,
      );

      const duplicate = await Vehicle.findOne({
        registrationNumber: updateData.registrationNumber,
        _id: {
          $ne: req.params.id,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Registration number already exists",
        });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update vehicle",
    });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (
      vehicle.status === "On Trip" ||
      vehicle.status === "In Shop"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "An On Trip or In Shop vehicle cannot be deleted",
      });
    }

    await vehicle.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to delete vehicle",
    });
  }
};