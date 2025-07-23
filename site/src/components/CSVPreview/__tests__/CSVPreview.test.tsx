import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CSVPreview from "../index";
import { CSVProvider, CSVProcessingStep } from "../../../context/CSVContext";

// Mock the context values
jest.mock("../../../context/CSVContext", () => {
  const originalModule = jest.requireActual("../../../context/CSVContext");

  return {
    ...originalModule,
    useCSV: jest.fn(),
  };
});

// Import the mocked useCSV
import { useCSV } from "../../../context/CSVContext";

describe("CSVPreview Component", () => {
  const mockUseCSV = useCSV as jest.MockedFunction<typeof useCSV>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state when processing", () => {
    mockUseCSV.mockReturnValue({
      processedData: [],
      isProcessing: true,
      error: null,
      csvData: { rawText: "", rows: [] },
      setCsvData: jest.fn(),
      configuration: {
        headerRowIndex: 0,
        columnMappings: {},
        dateFormat: "auto",
        invertAmounts: false,
      },
      setConfiguration: jest.fn(),
      setProcessedData: jest.fn(),
      currentStep: CSVProcessingStep.PREVIEW,
      setCurrentStep: jest.fn(),
      setError: jest.fn(),
      uploadCSV: jest.fn(),
      updateConfiguration: jest.fn(),
      processCSVData: jest.fn(),
      resetState: jest.fn(),
    });

    render(<CSVPreview />);

    expect(screen.getByText("Processing data...")).toBeInTheDocument();
  });

  test("renders error state when there is an error", () => {
    mockUseCSV.mockReturnValue({
      processedData: [],
      isProcessing: false,
      error: "Test error message",
      csvData: { rawText: "", rows: [] },
      setCsvData: jest.fn(),
      configuration: {
        headerRowIndex: 0,
        columnMappings: {},
        dateFormat: "auto",
        invertAmounts: false,
      },
      setConfiguration: jest.fn(),
      setProcessedData: jest.fn(),
      currentStep: CSVProcessingStep.PREVIEW,
      setCurrentStep: jest.fn(),
      setError: jest.fn(),
      uploadCSV: jest.fn(),
      updateConfiguration: jest.fn(),
      processCSVData: jest.fn(),
      resetState: jest.fn(),
    });

    render(<CSVPreview />);

    expect(
      screen.getByText("Error processing data: Test error message")
    ).toBeInTheDocument();
  });

  test("renders empty state when there is no data", () => {
    mockUseCSV.mockReturnValue({
      processedData: [],
      isProcessing: false,
      error: null,
      csvData: { rawText: "", rows: [] },
      setCsvData: jest.fn(),
      configuration: {
        headerRowIndex: 0,
        columnMappings: {},
        dateFormat: "auto",
        invertAmounts: false,
      },
      setConfiguration: jest.fn(),
      setProcessedData: jest.fn(),
      currentStep: CSVProcessingStep.PREVIEW,
      setCurrentStep: jest.fn(),
      setError: jest.fn(),
      uploadCSV: jest.fn(),
      updateConfiguration: jest.fn(),
      processCSVData: jest.fn(),
      resetState: jest.fn(),
    });

    render(<CSVPreview />);

    expect(
      screen.getByText(
        "No data available for preview. Please upload and configure a CSV file."
      )
    ).toBeInTheDocument();
  });

  test("renders data table when there is processed data", () => {
    const mockProcessedData = [
      {
        header1: "value1",
        header2: "value2",
        US_DATE: "01/15/2023",
        UK_DATE: "15/01/2023",
        ISO_DATE: "2023-01-15",
        CLEAN_AMOUNT: 100.5,
      },
      {
        header1: "value3",
        header2: "value4",
        US_DATE: "02/20/2023",
        UK_DATE: "20/02/2023",
        ISO_DATE: "2023-02-20",
        CLEAN_AMOUNT: -50.25,
      },
    ];

    mockUseCSV.mockReturnValue({
      processedData: mockProcessedData,
      isProcessing: false,
      error: null,
      csvData: { rawText: "", rows: [] },
      setCsvData: jest.fn(),
      configuration: {
        headerRowIndex: 0,
        columnMappings: {},
        dateFormat: "auto",
        invertAmounts: false,
      },
      setConfiguration: jest.fn(),
      setProcessedData: jest.fn(),
      currentStep: CSVProcessingStep.PREVIEW,
      setCurrentStep: jest.fn(),
      setError: jest.fn(),
      uploadCSV: jest.fn(),
      updateConfiguration: jest.fn(),
      processCSVData: jest.fn(),
      resetState: jest.fn(),
    });

    render(<CSVPreview />);

    // Check for table headers
    expect(screen.getByText("header1")).toBeInTheDocument();
    expect(screen.getByText("header2")).toBeInTheDocument();
    expect(screen.getByText("US_DATE *")).toBeInTheDocument();
    expect(screen.getByText("UK_DATE *")).toBeInTheDocument();
    expect(screen.getByText("ISO_DATE *")).toBeInTheDocument();
    expect(screen.getByText("CLEAN_AMOUNT *")).toBeInTheDocument();

    // Check for data values
    expect(screen.getByText("value1")).toBeInTheDocument();
    expect(screen.getByText("value2")).toBeInTheDocument();
    expect(screen.getByText("01/15/2023")).toBeInTheDocument();
    expect(screen.getByText("15/01/2023")).toBeInTheDocument();
    expect(screen.getByText("2023-01-15")).toBeInTheDocument();
    expect(screen.getByText("100.5")).toBeInTheDocument();

    // Check for pagination info
    expect(screen.getByText("Showing 1 to 2 of 2 entries")).toBeInTheDocument();

    // Check for transformed columns note
    expect(screen.getByText("* Transformed columns")).toBeInTheDocument();
  });
});
