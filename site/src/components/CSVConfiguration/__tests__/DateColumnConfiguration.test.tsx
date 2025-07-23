import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DateColumnConfiguration from "../DateColumnConfiguration";
import { CSVProvider } from "../../../context/CSVContext";

// Mock the detectDateFormat function to test it separately
const mockDetectDateFormat = jest.fn();

// Mock the component with the detectDateFormat function exposed for testing
jest.mock("../DateColumnConfiguration", () => {
  const originalModule = jest.requireActual("../DateColumnConfiguration");

  // Extract the detectDateFormat function from the original module
  const { detectDateFormat } = originalModule.default.type.render.toString()
    ? originalModule
    : { detectDateFormat: mockDetectDateFormat };

  return {
    __esModule: true,
    default: originalModule.default,
    detectDateFormat,
  };
});

describe("DateColumnConfiguration", () => {
  const mockCsvData = {
    rawText:
      "Date,Amount,Description\n01/02/2023,100,Test\n03/04/2023,200,Test 2",
    rows: [
      ["Date", "Amount", "Description"],
      ["01/02/2023", "100", "Test"],
      ["03/04/2023", "200", "Test 2"],
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <CSVProvider>
        <DateColumnConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    expect(
      screen.getByText("Step 3: Configure Date Column")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select the column containing dates:")
    ).toBeInTheDocument();
  });

  it("shows date column options from CSV headers", () => {
    render(
      <CSVProvider>
        <DateColumnConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    const selectElement = screen.getByLabelText(
      "Select the column containing dates:"
    );
    expect(selectElement).toBeInTheDocument();

    // Open the select dropdown
    fireEvent.click(selectElement);

    // Check that all header options are available
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("shows date format options when a date column is selected", async () => {
    render(
      <CSVProvider>
        <DateColumnConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    // Select the Date column
    const selectElement = screen.getByLabelText(
      "Select the column containing dates:"
    );
    fireEvent.change(selectElement, { target: { value: "Date" } });

    // Wait for the date format options to appear
    await waitFor(() => {
      expect(screen.getByText("Select date format:")).toBeInTheDocument();
    });

    // Check that all format options are available
    expect(screen.getByLabelText(/Auto-detect/)).toBeInTheDocument();
    expect(screen.getByLabelText(/DD\/MM \(Day\/Month\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/MM\/DD \(Month\/Day\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/DD MMM \(Day Month\)/)).toBeInTheDocument();
  });
});

// Direct tests for the detectDateFormat function
describe("detectDateFormat", () => {
  // Import the actual function for testing
  const { detectDateFormat } = require("../DateColumnConfiguration");

  it("detects DD/MM format when day > 12", () => {
    const dateValues = ["15/04/2023", "22/05/2023", "31/01/2023"];
    expect(detectDateFormat(dateValues)).toBe("DD/MM");
  });

  it("detects MM/DD format when month > 12", () => {
    const dateValues = ["04/15/2023", "05/22/2023", "01/31/2023"];
    expect(detectDateFormat(dateValues)).toBe("MM/DD");
  });

  it("defaults to MM/DD when ambiguous", () => {
    const dateValues = ["01/02/2023", "03/04/2023", "05/06/2023"];
    expect(detectDateFormat(dateValues)).toBe("MM/DD");
  });

  it("detects DD MMM format", () => {
    const dateValues = ["15 Jan 2023", "22 Feb 2023", "31 Mar 2023"];
    expect(detectDateFormat(dateValues)).toBe("DD MMM");
  });

  it("returns auto for empty array", () => {
    expect(detectDateFormat([])).toBe("auto");
  });

  it("handles mixed formats by prioritizing DD MMM", () => {
    const dateValues = ["15/04/2023", "22 Feb 2023", "31/01/2023"];
    expect(detectDateFormat(dateValues)).toBe("DD MMM");
  });
});
