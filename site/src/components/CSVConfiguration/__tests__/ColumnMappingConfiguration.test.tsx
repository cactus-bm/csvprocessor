import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ColumnMappingConfiguration from "../ColumnMappingConfiguration";
import { CSVProvider } from "../../../context/CSVContext";

describe("ColumnMappingConfiguration", () => {
  const mockCsvData = {
    rawText:
      "Date,Amount,Type,Description\n01/02/2023,100,C,Test\n03/04/2023,200,D,Test 2",
    rows: [
      ["Date", "Amount", "Type", "Description"],
      ["01/02/2023", "100", "C", "Test"],
      ["03/04/2023", "200", "D", "Test 2"],
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <CSVProvider>
        <ColumnMappingConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    expect(screen.getByText("Step 2: Map Columns")).toBeInTheDocument();
  });

  it("shows column mapping options from CSV headers", () => {
    render(
      <CSVProvider>
        <ColumnMappingConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    // Check that all column types are displayed
    expect(screen.getByText("Amount:")).toBeInTheDocument();
    expect(screen.getByText("Amount Type:")).toBeInTheDocument();
    expect(screen.getByText("Income:")).toBeInTheDocument();
    expect(screen.getByText("Expense:")).toBeInTheDocument();
    expect(screen.getByText("Description:")).toBeInTheDocument();
    expect(screen.getByText("Reference:")).toBeInTheDocument();

    // Check that all header options are available in the dropdowns
    const amountSelect = screen.getByLabelText("Amount:");
    fireEvent.click(amountSelect);

    expect(screen.getAllByText("Date")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Amount")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Type")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Description")[0]).toBeInTheDocument();
  });

  it("allows mapping columns to specific types", async () => {
    render(
      <CSVProvider>
        <ColumnMappingConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    // Map Amount column
    const amountSelect = screen.getByLabelText("Amount:");
    fireEvent.change(amountSelect, { target: { value: "Amount" } });

    // Map Amount Type column
    const amountTypeSelect = screen.getByLabelText("Amount Type:");
    fireEvent.change(amountTypeSelect, { target: { value: "Type" } });

    // Map Description column
    const descriptionSelect = screen.getByLabelText("Description:");
    fireEvent.change(descriptionSelect, { target: { value: "Description" } });

    // Check that the note about amount and amount type appears
    await waitFor(() => {
      expect(
        screen.getByText(/Amount and amount type columns are both mapped/)
      ).toBeInTheDocument();
    });
  });

  it("shows invert amounts checkbox when appropriate columns are mapped", async () => {
    render(
      <CSVProvider>
        <ColumnMappingConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    // Initially, the invert amounts checkbox should not be visible
    expect(screen.queryByText("Invert Amounts")).not.toBeInTheDocument();

    // Map Amount column
    const amountSelect = screen.getByLabelText("Amount:");
    fireEvent.change(amountSelect, { target: { value: "Amount" } });

    // Map Amount Type column
    const amountTypeSelect = screen.getByLabelText("Amount Type:");
    fireEvent.change(amountTypeSelect, { target: { value: "Type" } });

    // Now the invert amounts checkbox should be visible
    await waitFor(() => {
      expect(screen.getByText("Invert Amounts")).toBeInTheDocument();
    });

    // Check the invert amounts checkbox
    const invertCheckbox = screen.getByLabelText("Invert Amounts");
    fireEvent.click(invertCheckbox);

    // Checkbox should now be checked
    expect(invertCheckbox).toBeChecked();
  });

  it("shows note about income and expense when both are mapped", async () => {
    render(
      <CSVProvider>
        <ColumnMappingConfiguration csvData={mockCsvData} />
      </CSVProvider>
    );

    // Map Income column
    const incomeSelect = screen.getByLabelText("Income:");
    fireEvent.change(incomeSelect, { target: { value: "Amount" } });

    // Map Expense column
    const expenseSelect = screen.getByLabelText("Expense:");
    fireEvent.change(expenseSelect, { target: { value: "Type" } });

    // Check that the note about income and expense appears
    await waitFor(() => {
      expect(
        screen.getByText(/Income and expense columns are both mapped/)
      ).toBeInTheDocument();
    });
  });
});
