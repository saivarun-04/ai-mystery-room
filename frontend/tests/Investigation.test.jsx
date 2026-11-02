import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Investigation from "../src/pages/Investigation";
import * as api from "../src/utils/api";

vi.mock("../src/utils/api", () => ({
  getCase: vi.fn(),
  discoverClue: vi.fn(),
  getHint: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderInvestigation = (caseId = "case123") => {
  return render(
    <MemoryRouter initialEntries={[`/investigate/${caseId}`]}>
      <Routes>
        <Route path="/investigate/:caseId" element={<Investigation />} />
      </Routes>
    </MemoryRouter>
  );
};

const mockCaseData = {
  _id: "case123",
  difficulty: "easy",
  story: "A murder in the study.",
  setup: "Lord Harrington found dead.",
  suspects: [
    { id: "s1", name: "Lady Harrington", motive: "inheritance", alibi: "was in kitchen", seenWith: "none" },
    { id: "s2", name: "Butler", motive: "revenge", alibi: "was cleaning hall", seenWith: "none" },
    { id: "s3", name: "Guest", motive: "robbery", alibi: "was in bedroom", seenWith: "none" },
  ],
  clues: [
    { id: "c1", title: "Blood on sword", description: "red", suspectIds: ["s1"], location: "study" },
    { id: "c2", title: "Missing will", description: "red", suspectIds: ["s2"], location: "library" },
    { id: "c3", title: "Footprints", description: "red", suspectIds: ["s3"], location: "hall" },
    { id: "c4", title: "Poison bottle", description: "red", suspectIds: ["s1"], location: "kitchen" },
    { id: "c5", title: "Broken window", description: "red", suspectIds: ["s3"], location: "hall" },
  ],
  stats: {
    cluesDiscovered: 0,
    hintsUsed: 0,
    attempts: 0,
  },
};

describe("Investigation page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    api.getCase.mockReturnValue(new Promise(() => {}));
    renderInvestigation();
    expect(screen.getByText(/investigation loading/i)).toBeInTheDocument();
  });

  it("renders case data after loading", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /investigation room/i })).toBeInTheDocument();
      expect(screen.getByText("A murder in the study.")).toBeInTheDocument();
      expect(screen.getByText("Lord Harrington found dead.")).toBeInTheDocument();
    });
  });

  it("displays all suspects", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByText("Lady Harrington")).toBeInTheDocument();
      expect(screen.getByText("Butler")).toBeInTheDocument();
      expect(screen.getByText("Guest")).toBeInTheDocument();
    });
  });

  it("displays all clues with discovery count", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByText("Blood on sword")).toBeInTheDocument();
      expect(screen.getByText("Missing will")).toBeInTheDocument();
      expect(screen.getByText("Footprints")).toBeInTheDocument();
      expect(screen.getByText("Poison bottle")).toBeInTheDocument();
      expect(screen.getByText("Broken window")).toBeInTheDocument();
    });
  });

  it("marks clue as discovered when clicked", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    api.discoverClue.mockResolvedValue({ scoreDelta: 5, discoveredAt: new Date() });
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByText("Blood on sword")).toBeInTheDocument();
    });

    const clueElement = screen.getByText("Blood on sword").closest("[class*='border']");
    if (clueElement) {
      fireEvent.click(clueElement);
    }

    await waitFor(() => {
      expect(api.discoverClue).toHaveBeenCalledWith("case123", "c1");
    });
  });

  it("shows hint button", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /get hint/i })).toBeInTheDocument();
    });
  });

  it("shows accuse button", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /accuse suspect/i })).toBeInTheDocument();
    });
  });

  it("navigates to accuse page when button clicked", async () => {
    api.getCase.mockResolvedValue(mockCaseData);
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /accuse suspect/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /accuse suspect/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/accuse/case123");
    });
  });

  it("shows error state on API failure", async () => {
    api.getCase.mockRejectedValue(new Error("Server error"));
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByText("Error Loading Case")).toBeInTheDocument();
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows retry button on error", async () => {
    api.getCase.mockRejectedValue(new Error("Server error"));
    renderInvestigation();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });
});
