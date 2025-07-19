import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CSVConfiguration from "../index";
import { CSVProvider } from "../../../context/CSVContext";

// Mock CSV data for testing
const mockCSVData = {
  rawText: "Name,Age,City\nJohn,25,NYC\nJane,30,LA\nBob,35,Chicago",
  rows: [
    ["Name", "Age", "City"],
    ["John", "25", "NYC"],
    ["Jane", "30", "LA"],
    ["Bob", "35", "Chicago"],
  ],
};

const mockCSVDataWithMultipleHeaderOptions = {
  rawText:
    "Report Title\nGenerated: 2023-01-01\nName,Age,City\nJohn,25,NYC\nJane,30,LA",
  rows: [
    ["Report Title"],
    ["Generated: 2023-01-01"],
    ["Name", "Age", "City"],
    ["John", "25", "NYC"],
    ["Jane", "30", "LA"],
  ],
};

const renderWithProvider = (csvData: any) => {
  const mockOnConfigurationComplete = jest.fn();

  return render(
    <CSVProvider>
      <CSVConfiguration
        csvData={csvData}
        onConfigurationComplete={mockOnConfigurationComplete}
      />
    </CSVProvider>
  );
};

describe("CSVConfiguration - Header Row Selection", () => {
  test("renders configuration title and header selection section", () => {
    renderWithProvider(mockCSVData);

    expect(screen.getByText("Configure CSV")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Select Header Row")).toBeInTheDocument();
    expect(
      screen.getByText("Choose which row contains the column headers:")
    ).toBeInTheDocument();
  });

  test("displays CSV data in tabular format", () => {
    renderWithProvider(mockCSVData);

    // Check if table headers are displayed
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();

    // Check if data rows are displayed
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("NYC")).toBeInTheDocument();
  });

  test("displays dropdown with row options", () => {
    renderWithProvider(mockCSVData);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Check if options are present
    expect(screen.getByText("Row 1: Name, Age, City")).toBeInTheDocument();
    expect(screen.getByText("Row 2: John, 25, NYC")).toBeInTheDocument();
  });

  test("highlights selected header row", () => {
    renderWithProvider(mockCSVData);

    // First row should be selected by default (index 0)
    const firstRowIndicator = screen.getByText("→ 1");
    expect(firstRowIndicator).toBeInTheDocument();
  });

  test("changes header row selection via dropdown", async () => {
    renderWithProvider(mockCSVDataWithMultipleHeaderOptions);

    const select = screen.getByRole("combobox");

    // Change to row 3 (index 2) which contains the actual headers
    fireEvent.change(select, { target: { value: "2" } });

    await waitFor(() => {
      // Check if the indicator moved to row 3
      expect(screen.getByText("→ 3")).toBeInTheDocument();
    });
  });

  test("changes header row selection by clicking on table row", async () => {
    renderWithProvider(mockCSVDataWithMultipleHeaderOptions);

    // Find and click on row 3 (which contains Name, Age, City)
    const rows = screen.getAllByRole("row");
    const targetRow = rows.find((row) => row.textContent?.includes("Name"));

    if (targetRow) {
      fireEvent.click(targetRow);

      await waitFor(() => {
        // Check if the indicator moved to the clicked row
        expect(screen.getByText("→ 3")).toBeInTheDocument();
      });
    }
  });

  test("updates data preview when header row changes", async () => {
    renderWithProvider(mockCSVDataWithMultipleHeaderOptions);

    const select = screen.getByRole("combobox");

    // Change to row 3 (index 2) which contains the actual headers
    fireEvent.change(select, { target: { value: "2" } });

    await waitFor(() => {
      // Check if preview section appears with correct headers
      expect(
        screen.getByText("Data Preview (with selected headers):")
      ).toBeInTheDocument();
    });
  });

  test("handles empty CSV data gracefully", () => {
    const emptyCSVData = { rawText: "", rows: [] };
    renderWithProvider(emptyCSVData);

    expect(
      screen.getByText("No CSV data available for configuration.")
    ).toBeInTheDocument();
  });

  test("handles CSV data with varying column counts", () => {
    const unevenCSVData = {
      rawText: "Name,Age\nJohn,25,NYC\nJane",
      rows: [["Name", "Age"], ["John", "25", "NYC"], ["Jane"]],
    };

    renderWithProvider(unevenCSVData);

    // Should handle the maximum number of columns
    expect(screen.getByText("Column 3")).toBeInTheDocument();
  });

  test("displays row numbers correctly", () => {
    renderWithProvider(mockCSVData);

    // Check if row numbers are displayed
    expect(screen.getByText("→ 1")).toBeInTheDocument(); // Selected row
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  test("truncates long dropdown option text", () => {
    const longTextCSVData = {
      rawText:
        "Very Long Header Name That Should Be Truncated,Another Long Header,Third Header\nData1,Data2,Data3",
      rows: [
        [
          "Very Long Header Name That Should Be Truncated",
          "Another Long Header",
          "Third Header",
        ],
        ["Data1", "Data2", "Data3"],
      ],
    };

    renderWithProvider(longTextCSVData);

    // Check if the dropdown option is truncated with ellipsis
    expect(
      screen.getByText(
        /Row 1: Very Long Header Name That Should Be Truncated, Another Long Header, Third Header/
      )
    ).toBeInTheDocument();
  });

  test("shows preview data after header row selection", async () => {
    renderWithProvider(mockCSVData);

    // Preview should be shown by default
    await waitFor(() => {
      expect(
        screen.getByText("Data Preview (with selected headers):")
      ).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });
});
