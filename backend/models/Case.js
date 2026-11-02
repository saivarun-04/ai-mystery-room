import { Schema, model } from "mongoose";

const suspectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    motive: { type: String, required: true },
    alibi: { type: String, required: true },
    seenWith: { type: String, required: true },
  },
  { _id: false }
);

const clueSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    suspectIds: [{ type: String }],
    location: { type: String, required: true },
    discoveredBy: [{ type: Schema.Types.ObjectId, ref: "PlayerProgress" }],
  },
  { _id: false }
);

const solutionSchema = new Schema(
  {
    culpritId: { type: String, required: true },
    reasoning: { type: String, required: true },
    hintIds: [{ type: String, required: true }],
    evidenceIds: [{ type: String, required: true }],
  },
  { _id: false }
);

const caseSchema = new Schema(
  {
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    story: { type: String, required: true },
    setup: { type: String, required: true },
    suspects: { type: [suspectSchema], required: true, validate: {
      validator: (arr) => arr.every((s) => s.id && s.name),
      message: "Each suspect must have id and name",
    }},
    clues: { type: [clueSchema], required: true, validate: {
      validator: (arr) => arr.every((c) => c.id && c.title),
      message: "Each clue must have id and title",
    }},
    culprit: { type: String, select: false, required: true },
    solution: { type: solutionSchema, select: false, required: true },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    stats: {
      cluesDiscovered: { type: Number, default: 0 },
      hintsUsed: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
    },
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

caseSchema.index({ createdAt: -1 });

export const publicFields = [
  "_id",
  "difficulty",
  "story",
  "setup",
  "suspects",
  "clues",
  "createdAt",
  "completedAt",
  "stats",
  "version",
];

export const Case = model("Case", caseSchema);
