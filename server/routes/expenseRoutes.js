const express = require("express");
const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");

const router = express.Router();

// Get all fuel logs
router.get("/fuel", async (req, res) => {
  try {
    const logs = await FuelLog.find()
      .populate("vehicle")
      .populate("trip")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve fuel logs",
      error: error.message,
    });
  }
});

// Create fuel log
router.post("/fuel", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicle);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (req.body.trip) {
      const trip = await Trip.findById(req.body.trip);

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }
    }

    const log = await FuelLog.create(req.body);

    const populatedLog = await FuelLog.findById(log._id)
      .populate("vehicle")
      .populate("trip");

    return res.status(201).json({
      success: true,
      message: "Fuel log created successfully",
      data: populatedLog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create fuel log",
    });
  }
});

// Get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("vehicle")
      .populate("trip")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve expenses",
      error: error.message,
    });
  }
});

// Create expense
router.post("/", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicle);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const expense = await Expense.create(req.body);

    const populatedExpense = await Expense.findById(expense._id)
      .populate("vehicle")
      .populate("trip");

    return res.status(201).json({
      success: true,
      message: "Expense recorded successfully",
      data: populatedExpense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to record expense",
    });
  }
});

module.exports = router;