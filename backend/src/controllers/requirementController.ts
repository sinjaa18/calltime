import { randomBytes } from "node:crypto";
import { isValidObjectId } from "mongoose";
import type { Request, Response } from "express";
import RequirementModel from "../models/Requirement";
import { createRequirementSchema } from "../validators/requirementValidator";

export async function createRequirement(req: Request, res: Response) {
  const result = createRequirementSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Please correct the invalid requirement fields.",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const input = result.data;
    const year = new Date().getFullYear();
    const requirementCode = `REQ-${year}-${randomBytes(3).toString("hex").toUpperCase()}`;

    const requirement = await RequirementModel.create({
      ...input,
      requirementCode,
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Requirement submitted successfully.",
      data: {
        id: requirement._id.toString(),
        requirementCode: requirement.requirementCode,
        category: requirement.category,
        createdAt: requirement.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Failed to save requirement:",
      error instanceof Error ? error.message : error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save your requirement. Please try again.",
    });
  }
}

export async function getRequirements(req: Request, res: Response) {
  const rawIds = req.query.ids;

  // Never return every database record when no IDs are provided.
  if (typeof rawIds !== "string" || !rawIds.trim()) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  const ids = [
    ...new Set(
      rawIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];

  if (ids.length > 50) {
    return res.status(400).json({
      success: false,
      message: "You can request at most 50 requirements at a time.",
    });
  }

  if (ids.some((id) => !isValidObjectId(id))) {
    return res.status(400).json({
      success: false,
      message: "One or more requirement IDs are invalid.",
    });
  }

  try {
    const requirements = await RequirementModel.find({
      _id: { $in: ids },
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = requirements.map((requirement) => ({
      id: requirement._id.toString(),
      requirementCode: requirement.requirementCode,
      status: requirement.status,
      category: requirement.category,
      eventBasics: requirement.eventBasics,
      categoryDetails: requirement.categoryDetails,
      additionalRequirements: requirement.additionalRequirements,
      createdAt: requirement.createdAt.toISOString(),
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Failed to load requirements:",
      error instanceof Error ? error.message : error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load requirements. Please try again.",
    });
  }
}
