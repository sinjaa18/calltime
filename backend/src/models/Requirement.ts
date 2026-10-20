import { Schema, model, models, type InferSchemaType } from "mongoose";

const eventTypes = [
  "Concert",
  "Wedding",
  "Corporate Event",
  "Conference",
  "Festival",
  "Private Party",
  "Other",
] as const;

const categories = ["planner", "performer", "crew"] as const;

const eventBasicsSchema = new Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    eventType: {
      type: String,
      required: true,
      enum: eventTypes,
    },
    startDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    endDate: {
      type: String,
      default: "",
      match: [/^$|^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    venue: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false },
);

const requirementSchema = new Schema(
  {
    requirementCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
      required: true,
    },
    category: {
      type: String,
      enum: categories,
      required: true,
      index: true,
    },
    eventBasics: {
      type: eventBasicsSchema,
      required: true,
    },
    categoryDetails: {
      type: Schema.Types.Mixed,
      required: true,
    },
    additionalRequirements: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Requirement = InferSchemaType<typeof requirementSchema>;

const RequirementModel =
  models.Requirement || model("Requirement", requirementSchema);

export default RequirementModel;
