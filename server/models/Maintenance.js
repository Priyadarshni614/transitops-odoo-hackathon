const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },

    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: [
        "Oil Change",
        "Engine Repair",
        "Tyre Service",
        "Inspection",
        "Brake Service",
        "Other",
      ],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    completionDate: Date,

    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "Maintenance",
  maintenanceSchema,
);