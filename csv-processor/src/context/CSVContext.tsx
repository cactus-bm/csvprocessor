import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { parseCSV, processCSV } from "../services/csvService";

// Define types based on our design document
export interface CSVData {
  rawText: string;
  rows: string[][];
}

export interface Configuration {
  headerRowIndex: number;
  columnMappings: {
    date?: string;
    amount?: string;
    amountType?: string;
    income?: string;
    expense?: string;
    description?: string;
    reference?: string;
  };
  dateFormat: "DD/MM" | "MM/DD" | "auto";
  invertAmounts: boolean;
}

export interface ProcessedRow {
  [key: string]: string | number | undefined;
  US_DATE?: string;
  UK_DATE?: string;
  ISO_DATE?: string;
  CLEAN_AMOUNT?: number;
}

export enum CSVProcessingStep {
  UPLOAD = 0,
  CONFIGURE_HEADERS = 1,
  CONFIGURE_COLUMNS = 2,
  CONFIGURE_DATES = 3,
  PREVIEW = 4,
  DOWNLOAD = 5,
}

interface CSVContextType {
  csvData: CSVData | null;
  setCsvData: (data: CSVData | null) => void;
  configuration: Configuration;
  setConfiguration: (config: Configuration) => void;
  processedData: ProcessedRow[];
  setProcessedData: (data: ProcessedRow[]) => void;
  currentStep: CSVProcessingStep;
  setCurrentStep: (step: CSVProcessingStep) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isProcessing: boolean;
  uploadCSV: (file: File) => Promise<void>;
  updateConfiguration: (updates: Partial<Configuration>) => void;
  processCSVData: () => void;
  resetState: () => void;
}

const defaultConfiguration: Configuration = {
  headerRowIndex: 0,
  columnMappings: {},
  dateFormat: "auto",
  invertAmounts: false,
};

const CSVContext = createContext<CSVContextType | undefined>(undefined);

export const CSVProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [configuration, setConfiguration] =
    useState<Configuration>(defaultConfiguration);
  const [processedData, setProcessedData] = useState<ProcessedRow[]>([]);
  const [currentStep, setCurrentStep] = useState<CSVProcessingStep>(
    CSVProcessingStep.UPLOAD
  );
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Upload and parse CSV file
  const uploadCSV = useCallback(async (file: File): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      setCsvData(parsedData);
      setCurrentStep(CSVProcessingStep.CONFIGURE_HEADERS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV file");
      console.error("CSV parsing error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Update configuration with partial updates
  const updateConfiguration = useCallback((updates: Partial<Configuration>) => {
    setConfiguration((prev) => ({ ...prev, ...updates }));
  }, []);

  // Process CSV data based on current configuration
  const processCSVData = useCallback(() => {
    if (!csvData) {
      setError("No CSV data available to process");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const processed = processCSV(csvData, configuration);
      setProcessedData(processed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process CSV data"
      );
      console.error("CSV processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [csvData, configuration]);

  // Reset the state to initial values
  const resetState = useCallback(() => {
    setCsvData(null);
    setConfiguration(defaultConfiguration);
    setProcessedData([]);
    setCurrentStep(CSVProcessingStep.UPLOAD);
    setError(null);
  }, []);

  // Process data whenever configuration changes
  useEffect(() => {
    if (csvData && currentStep >= CSVProcessingStep.CONFIGURE_HEADERS) {
      processCSVData();
    }
  }, [csvData, configuration, currentStep, processCSVData]);

  return (
    <CSVContext.Provider
      value={{
        csvData,
        setCsvData,
        configuration,
        setConfiguration,
        processedData,
        setProcessedData,
        currentStep,
        setCurrentStep,
        error,
        setError,
        isProcessing,
        uploadCSV,
        updateConfiguration,
        processCSVData,
        resetState,
      }}
    >
      {children}
    </CSVContext.Provider>
  );
};

export const useCSV = (): CSVContextType => {
  const context = useContext(CSVContext);
  if (context === undefined) {
    throw new Error("useCSV must be used within a CSVProvider");
  }
  return context;
};
