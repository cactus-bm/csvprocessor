import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Download from "../index";
import { CSVProvider } from "../../../context/CSVContext";
import * as csvService from "../../../services/csvService";

// Mock the generateCSV function
jest.mock("../../../services/csvService", () => ({
  generateCSV: jest.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

// Mock document.createElement and related DOM methods
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;

describe("Download Component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("mock-url");

    // Mock createElement to return an object with our mock click function
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === "a") {
        return {
          setAttribute: jest.fn(),
          click: mockClick,
        };
      }
      return document.createElement(tag);
    });
  });

  it("renders download button in disabled state when no data", () => {
    const onDownloadComplete = jest.fn();

    render(
      <CSVProvider>
        <Download onDownloadComplete={onDownloadComplete} />
      </CSVProvider>
    );

    const downloadButton = screen.getByRole("button", {
      name: /download processed csv/i,
    });
    expect(downloadButton).toBeDisabled();
  });

  it("triggers download when button is clicked", async () => {
    const onDownloadComplete = jest.fn();
    const mockGenerateCSV = csvService.generateCSV as jest.Mock;
    mockGenerateCSV.mockReturnValue("mock,csv,content");

    // Create a mock context with processed data
    const mockUseCSV = {
      csvData: { rawText: "mock,csv", rows: [["mock"], ["csv"]] },
      configuration: {
        headerRowIndex: 0,
        columnMappings: {},
        dateFormat: "auto",
        invertAmounts: false,
      },
      processedData: [{ col1: "value1", CLEAN_AMOUNT: 100 }],
      currentStep: 4,
      setCurrentStep: jest.fn(),
      error: null,
      setError: jest.fn(),
      isProcessing: false,
      uploadCSV: jest.fn(),
      updateConfiguration: jest.fn(),
      processCSVData: jest.fn(),
      resetState: jest.fn(),
      setCsvData: jest.fn(),
      setConfiguration: jest.fn(),
      setProcessedData: jest.fn(),
    };

    // Mock the useCSV hook
    jest
      .spyOn(require("../../../context/CSVContext"), "useCSV")
      .mockReturnValue(mockUseCSV);

    render(<Download onDownloadComplete={onDownloadComplete} />);

    const downloadButton = screen.getByRole("button", {
      name: /download processed csv/i,
    });
    expect(downloadButton).not.toBeDisabled();

    // Click the download button
    fireEvent.click(downloadButton);

    // Verify that the CSV was generated
    expect(mockGenerateCSV).toHaveBeenCalledWith(mockUseCSV.processedData);

    // Verify that the download link was created and clicked
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();

    // Verify that the onDownloadComplete callback was called
    expect(onDownloadComplete).toHaveBeenCalled();
  });

  it("shows download info text", () => {
    render(
      <CSVProvider>
        <Download onDownloadComplete={jest.fn()} />
      </CSVProvider>
    );

    expect(
      screen.getByText(/Download will include all original columns/i)
    ).toBeInTheDocument();
  });
});
