const express = require("express");
const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

const router = express.Router();

// Get all maintenance records
router.get("/", async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate("vehicle")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve maintenance records",
      error: error.message,
    });
  }
});

// Create maintenance record
router.post("/", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicle);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message:
          "Only an Available vehicle can be sent for maintenance",
      });
    }

    const existingRecord = await Maintenance.findOne({
      vehicle: vehicle._id,
      status: "Active",
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message:
          "This vehicle already has an active maintenance record",
      });
    }

    const record = await Maintenance.create({
      ...req.body,
      status: "Active",
    });

    vehicle.status = "In Shop";
    await vehicle.save();

    const populatedRecord = await Maintenance.findById(record._id)
      .populate("vehicle");

    return res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      data: populatedRecord,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to create maintenance record",
    });
  }
});

// Complete maintenance
router.put("/:id/complete", async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    if (record.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Only Active maintenance can be completed",
      });
    }

    record.status = "Completed";
    record.completionDate = new Date();

    if (req.body.cost !== undefined) {
      record.cost = Number(req.body.cost);
    }

    await record.save();

    const vehicle = await Vehicle.findById(record.vehicle);

    if (vehicle && vehicle.status !== "Retired") {
      vehicle.status = "Available";
      await vehicle.save();
    }

    return res.status(200).json({
      success: true,
      message: "Maintenance completed successfully",
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to complete maintenance",
    });
  }
});

// Cancel maintenance
router.put("/:id/cancel", async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    if (record.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Only Active maintenance can be cancelled",
      });
    }

    record.status = "Cancelled";
    await record.save();

    const vehicle = await Vehicle.findById(record.vehicle);

    if (vehicle && vehicle.status !== "Retired") {
      vehicle.status = "Available";
      await vehicle.save();
    }

    return res.status(200).json({
      success: true,
      message: "Maintenance cancelled successfully",
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to cancel maintenance",
    });
  }
});

module.exports = router;