import React, { createContext, useContext, useState, ReactNode } from "react";

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

interface CSVContextType {
  csvData: CSVData | null;
  setCsvData: (data: CSVData | null) => void;
  configuration: Configuration;
  setConfiguration: (config: Configuration) => void;
  processedData: ProcessedRow[];
  setProcessedData: (data: ProcessedRow[]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  error: string | null;
  setError: (error: string | null) => void;
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
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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
