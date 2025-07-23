import React, { useState, useEffect } from "react";
import styled from "styled-components";
import GlobalStyles from "./GlobalStyles";
import FileUpload from "./components/FileUpload";
import CSVConfiguration from "./components/CSVConfiguration";
import CSVPreview from "./components/CSVPreview";
import Download from "./components/Download";
import { useCSV, CSVProcessingStep } from "./context/CSVContext";

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: var(--primary-color);
`;

const Main = styled.main`
  background-color: var(--background-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Step = styled.div<{ active: boolean; available: boolean }>`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  background-color: ${(props) =>
    props.active ? "var(--primary-color)" : "var(--border-color)"};
  color: ${(props) => (props.active ? "white" : "var(--text-color)")};
  cursor: ${(props) => (props.available ? "pointer" : "not-allowed")};
  opacity: ${(props) => (props.available ? 1 : 0.6)};
`;

const ErrorMessage = styled.div`
  background-color: var(--error-color);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: var(--success-color);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

function App() {
  const {
    csvData,
    processedData,
    currentStep,
    setCurrentStep,
    error,
    isProcessing,
  } = useCSV();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set up success message handler
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Listen for changes in error state from context
  useEffect(() => {
    if (error) {
      // Clear error message after 5 seconds
      const timer = setTimeout(() => {
        // We don't call setError directly to avoid circular dependencies
        // The error will be cleared by the component that set it
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle step navigation
  const handleStepClick = (step: CSVProcessingStep) => {
    // Check if the step is available based on current progress
    const isStepAvailable = isStepAccessible(step);

    if (isStepAvailable) {
      setCurrentStep(step);
    }
  };

  // Determine if a step is accessible based on current application state
  const isStepAccessible = (step: CSVProcessingStep): boolean => {
    // Upload is always accessible
    if (step === CSVProcessingStep.UPLOAD) {
      return true;
    }

    // Configuration requires CSV data
    if (step === CSVProcessingStep.CONFIGURE_HEADERS) {
      return !!csvData;
    }

    // Preview requires CSV data
    if (step === CSVProcessingStep.PREVIEW) {
      return !!csvData && step <= currentStep;
    }

    // Download requires processed data
    if (step === CSVProcessingStep.DOWNLOAD) {
      return (
        !!csvData &&
        !!processedData &&
        processedData.length > 0 &&
        step <= currentStep
      );
    }

    return false;
  };

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header>
          <Title>CSV Convertor</Title>
          <p>Upload, configure, and transform your CSV files</p>
        </Header>
        <Main>
          <StepIndicator>
            <Step
              active={currentStep === CSVProcessingStep.UPLOAD}
              available={isStepAccessible(CSVProcessingStep.UPLOAD)}
              onClick={() => handleStepClick(CSVProcessingStep.UPLOAD)}
            >
              Upload
            </Step>
            <Step
              active={
                currentStep === CSVProcessingStep.CONFIGURE_HEADERS ||
                currentStep === CSVProcessingStep.CONFIGURE_COLUMNS ||
                currentStep === CSVProcessingStep.CONFIGURE_DATES
              }
              available={isStepAccessible(CSVProcessingStep.CONFIGURE_HEADERS)}
              onClick={() =>
                handleStepClick(CSVProcessingStep.CONFIGURE_HEADERS)
              }
            >
              Configure
            </Step>
            <Step
              active={currentStep === CSVProcessingStep.PREVIEW}
              available={isStepAccessible(CSVProcessingStep.PREVIEW)}
              onClick={() => handleStepClick(CSVProcessingStep.PREVIEW)}
            >
              Preview
            </Step>
            <Step
              active={currentStep === CSVProcessingStep.DOWNLOAD}
              available={isStepAccessible(CSVProcessingStep.DOWNLOAD)}
              onClick={() => handleStepClick(CSVProcessingStep.DOWNLOAD)}
            >
              Download
            </Step>
          </StepIndicator>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
          {isProcessing && (
            <SuccessMessage>Processing data, please wait...</SuccessMessage>
          )}

          {currentStep === CSVProcessingStep.UPLOAD && (
            <FileUpload
              onSuccess={() =>
                showSuccessMessage("CSV file loaded successfully!")
              }
            />
          )}

          {currentStep >= CSVProcessingStep.CONFIGURE_HEADERS &&
            currentStep <= CSVProcessingStep.CONFIGURE_DATES &&
            csvData && (
              <CSVConfiguration
                onSuccess={() =>
                  showSuccessMessage("Configuration applied successfully!")
                }
              />
            )}

          {currentStep >= CSVProcessingStep.PREVIEW && csvData && (
            <CSVPreview />
          )}

          {currentStep >= CSVProcessingStep.PREVIEW &&
            csvData &&
            processedData.length > 0 && (
              <Download
                onDownloadComplete={() =>
                  showSuccessMessage("File downloaded successfully!")
                }
              />
            )}
        </Main>
      </AppContainer>
    </>
  );
}

export default App;
