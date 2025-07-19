import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CSVConfiguration from "../index";
import { CSVProvider } from "../../../context/CSVContext";

// Mock the DateColumnConfiguration component
jest.mock("../DateColumnConfiguration", () => {
  return {
    __esModule: true,
    default: () => (
      <div data-testid="date-column-config">Date Column Configuration Mock</div>
    ),
  };
});

describe("CSVConfiguration", () => {
  const mockCsvData = {
    rawText:
      "header1,header2,header3\nvalue1,value2,value3\nvalue4,value5,value6",
    rows: [
      ["header1", "header2", "header3"],
      ["value1", "value2", "value3"],
      ["value4", "value5", "value6"],
    ],
  };

  const mockOnConfigurationComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <CSVProvider>
        <CSVConfiguration
          csvData={mockCsvData}
          onConfigurationComplete={mockOnConfigurationComplete}
        />
      </CSVProvider>
    );

    expect(screen.getByText("Configure CSV")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Select Header Row")).toBeInTheDocument();
  });

  it("displays the header row selection dropdown", () => {
    render(
      <CSVProvider>
        <CSVConfiguration
          csvData={mockCsvData}
          onConfigurationComplete={mockOnConfigurationComplete}
        />
      </CSVProvider>
    );

    const selectElement = screen.getByLabelText(
      "Choose which row contains the column headers:"
    );
    expect(selectElement).toBeInTheDocument();

    // Check that the options include all rows
    expect(selectElement).toHaveTextContent("Row 1: header1, header2, header3");
    expect(selectElement).toHaveTextContent("Row 2: value1, value2, value3");
    expect(selectElement).toHaveTextContent("Row 3: value4, value5, value6");
  });

  it("updates the preview when header row changes", async () => {
    render(
      <CSVProvider>
        <CSVConfiguration
          csvData={mockCsvData}
          onConfigurationComplete={mockOnConfigurationComplete}
        />
      </CSVProvider>
    );

    // Initially, the headers should be from the first row
    expect(screen.getAllByRole("columnheader")[1]).toHaveTextContent("header1");
    expect(screen.getAllByRole("columnheader")[2]).toHaveTextContent("header2");
    expect(screen.getAllByRole("columnheader")[3]).toHaveTextContent("header3");

    // Change the header row to the second row
    const selectElement = screen.getByLabelText(
      "Choose which row contains the column headers:"
    );
    fireEvent.change(selectElement, { target: { value: "1" } });

    // Wait for the preview to update
    await waitFor(() => {
      // Now the headers should be from the second row
      const headerCells = screen.getAllByRole("columnheader");
      expect(headerCells.length).toBeGreaterThan(1);
      expect(headerCells[1]).toHaveTextContent("value1");
      expect(headerCells[2]).toHaveTextContent("value2");
      expect(headerCells[3]).toHaveTextContent("value3");
    });
  });

  it("includes the DateColumnConfiguration component", () => {
    render(
      <CSVProvider>
        <CSVConfiguration
          csvData={mockCsvData}
          onConfigurationComplete={mockOnConfigurationComplete}
        />
      </CSVProvider>
    );

    // Check that the DateColumnConfiguration component is included
    expect(screen.getByTestId("date-column-config")).toBeInTheDocument();
  });

  it("handles empty CSV data gracefully", () => {
    const emptyCsvData = {
      rawText: "",
      rows: [],
    };

    render(
      <CSVProvider>
        <CSVConfiguration
          csvData={emptyCsvData}
          onConfigurationComplete={mockOnConfigurationComplete}
        />
      </CSVProvider>
    );

    expect(
      screen.getByText("No CSV data available for configuration.")
    ).toBeInTheDocument();
  });
});
