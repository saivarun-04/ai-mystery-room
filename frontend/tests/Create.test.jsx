import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Create from "../src/pages/Create";
import * as api from "../src/utils/api";

vi.mock("../src/utils/api", () => ({
  createCase: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderCreate = () => {
  return render(
    <MemoryRouter>
      <Create />
    </MemoryRouter>
  );
};

describe("Create page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default difficulty easy", () => {
    renderCreate();
    expect(screen.getByRole("heading", { name: /create mystery/i })).toBeInTheDocument();
    expect(screen.getByText(/easy/i)).toBeInTheDocument();
  });

  it("validates empty premise", async () => {
    renderCreate();
    // Button is disabled when premise is empty, so check that
    const button = screen.getByRole("button", { name: /create mystery/i });
    expect(button).toBeDisabled();
  });

  it("allows selecting difficulty", () => {
    renderCreate();
    const mediumButton = screen.getByRole("button", { name: /medium/i });
    fireEvent.click(mediumButton);
    expect(screen.getByText(/4 suspects/i)).toBeInTheDocument();
    expect(screen.getByText(/7 clues/i)).toBeInTheDocument();
  });

  it("calls createCase on submit with valid premise", async () => {
    api.createCase.mockResolvedValue({ id: "case123", difficulty: "easy" });
    renderCreate();
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "A murder in the study" } });
    const button = screen.getByRole("button", { name: /create mystery/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(api.createCase).toHaveBeenCalledWith("easy", "noir");
      expect(mockNavigate).toHaveBeenCalledWith("/investigate/case123");
    });
  });

  it("shows error on API failure", async () => {
    api.createCase.mockRejectedValue({ response: { data: { error: "Server error" } } });
    renderCreate();
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "A murder" } });
    const button = screen.getByRole("button", { name: /create mystery/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it("allows selecting mystery theme", () => {
    renderCreate();
    const spyButton = screen.getByRole("button", { name: /spy/i });
    fireEvent.click(spyButton);
    expect(screen.getByRole("button", { name: /spy/i })).toHaveClass("text-antique-gold");
  });
});
