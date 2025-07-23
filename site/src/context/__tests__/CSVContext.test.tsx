import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { CSVProvider, useCSV, CSVProcessingStep } from "../CSVContext";
import { parseCSV } from "../../services/csvService";

// Mock the csvService
jest.mock("../../services/csvService", () => ({
  parseCSV: jest.fn(),
  processCSV: jest
    .fn()
    .mockReturnValue([
      { US_DATE: "", UK_DATE: "", ISO_DATE: "", CLEAN_AMOUNT: 0 },
    ]),
}));

// Test component that uses the CSV context
const TestComponent: React.FC = () => {
  const {
    csvData,
    configuration,
    processedData,
    currentStep,
    error,
    isProcessing,
    updateConfiguration,
    resetState,
  } = useCSV();

  return (
    <div>
      <div data-testid="step">{currentStep}</div>
      <div data-testid="error">{error || "no-error"}</div>
      <div data-testid="processing">{isProcessing ? "processing" : "idle"}</div>
      <div data-testid="header-row">{configuration.headerRowIndex}</div>
      <div data-testid="csv-data">{csvData ? "has-data" : "no-data"}</div>
      <div data-testid="processed-data">{processedData.length}</div>
      <button
        data-testid="update-config"
        onClick={() => updateConfiguration({ headerRowIndex: 2 })}
      >
        Update Config
      </button>
      <button data-testid="reset" onClick={resetState}>
        Reset
      </button>
    </div>
  );
};

describe("CSVContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (parseCSV as jest.Mock).mockReturnValue({
      rawText: "a,b,c\n1,2,3\n4,5,6",
      rows: [
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
      ],
    });
  });

  it("provides default values", () => {
    render(
      <CSVProvider>
        <TestComponent />
      </CSVProvider>
    );

    expect(screen.getByTestId("step")).toHaveTextContent("0");
    expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    expect(screen.getByTestId("processing")).toHaveTextContent("idle");
    expect(screen.getByTestId("header-row")).toHaveTextContent("0");
    expect(screen.getByTestId("csv-data")).toHaveTextContent("no-data");
    expect(screen.getByTestId("processed-data")).toHaveTextContent("0");
  });

  it("updates configuration correctly", async () => {
    render(
      <CSVProvider>
        <TestComponent />
      </CSVProvider>
    );

    // Initial state
    expect(screen.getByTestId("header-row")).toHaveTextContent("0");

    // Update configuration
    act(() => {
      screen.getByTestId("update-config").click();
    });

    // Check updated state
    await waitFor(() => {
      expect(screen.getByTestId("header-row")).toHaveTextContent("2");
    });
  });

  it("resets state correctly", async () => {
    render(
      <CSVProvider>
        <TestComponent />
      </CSVProvider>
    );

    // Update configuration first
    act(() => {
      screen.getByTestId("update-config").click();
    });

    // Check updated state
    await waitFor(() => {
      expect(screen.getByTestId("header-row")).toHaveTextContent("2");
    });

    // Reset state
    act(() => {
      screen.getByTestId("reset").click();
    });

    // Check reset state
    await waitFor(() => {
      expect(screen.getByTestId("header-row")).toHaveTextContent("0");
    });
  });

  it("handles file upload correctly", async () => {
    const { rerender } = render(
      <CSVProvider>
        <TestComponent />
      </CSVProvider>
    );

    const testFile = new File(["a,b,c\n1,2,3"], "test.csv", {
      type: "text/csv",
    });

    // Get the context and call uploadCSV
    const TestUploader: React.FC = () => {
      const { uploadCSV } = useCSV();

      return (
        <button data-testid="upload" onClick={() => uploadCSV(testFile)}>
          Upload
        </button>
      );
    };

    rerender(
      <CSVProvider>
        <TestComponent />
        <TestUploader />
      </CSVProvider>
    );

    // Initial state
    expect(screen.getByTestId("csv-data")).toHaveTextContent("no-data");
    expect(screen.getByTestId("step")).toHaveTextContent("0");

    // Upload file
    await act(async () => {
      screen.getByTestId("upload").click();
    });

    // Check updated state
    await waitFor(() => {
      expect(screen.getByTestId("csv-data")).toHaveTextContent("has-data");
      expect(screen.getByTestId("step")).toHaveTextContent("1");
    });
  });

  it("handles errors correctly", async () => {
    // Mock parseCSV to throw an error
    (parseCSV as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });

    const { rerender } = render(
      <CSVProvider>
        <TestComponent />
      </CSVProvider>
    );

    const testFile = new File(["invalid"], "test.csv", { type: "text/csv" });

    // Get the context and call uploadCSV
    const TestUploader: React.FC = () => {
      const { uploadCSV } = useCSV();

      return (
        <button data-testid="upload" onClick={() => uploadCSV(testFile)}>
          Upload
        </button>
      );
    };

    rerender(
      <CSVProvider>
        <TestComponent />
        <TestUploader />
      </CSVProvider>
    );

    // Initial state
    expect(screen.getByTestId("error")).toHaveTextContent("no-error");

    // Upload file
    await act(async () => {
      screen.getByTestId("upload").click();
    });

    // Check error state
    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Test error");
    });
  });
});
