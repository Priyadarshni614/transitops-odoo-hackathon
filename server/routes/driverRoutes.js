const express = require("express");
const Driver = require("../models/Driver");

const router = express.Router();

// Get all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve drivers",
      error: error.message,
    });
  }
});

// Get one driver
router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve driver",
      error: error.message,
    });
  }
});

// Add driver
router.post("/", async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contactNumber,
      status,
    } = req.body;

    const existingDriver = await Driver.findOne({
      licenseNumber: licenseNumber.trim().toUpperCase(),
    });

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: "License number already exists",
      });
    }

    const driver = await Driver.create({
      name,
      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseCategory,
      licenseExpiry,
      contactNumber,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      data: driver,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update driver
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.licenseNumber) {
      updateData.licenseNumber = updateData.licenseNumber
        .trim()
        .toUpperCase();
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: driver,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to update driver",
      error: error.message,
    });
  }
});

// Delete driver
router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (driver.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "A driver currently on a trip cannot be deleted",
      });
    }

    await driver.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete driver",
      error: error.message,
    });
  }
});

module.exports = router;