const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
    },

    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver is required"],
    },

    cargoWeight: {
      type: Number,
      required: [true, "Cargo weight is required"],
      min: [1, "Cargo weight must be greater than zero"],
    },

    plannedDistance: {
      type: Number,
      required: [true, "Planned distance is required"],
      min: [1, "Planned distance must be greater than zero"],
    },

    actualDistance: {
      type: Number,
      default: 0,
      min: 0,
    },

    revenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalOdometer: {
      type: Number,
      default: 0,
      min: 0,
    },

    fuelConsumed: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Dispatched", "Completed", "Cancelled"],
      default: "Draft",
    },

    dispatchedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Trip", tripSchema);