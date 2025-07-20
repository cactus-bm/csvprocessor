import React, { useState } from "react";
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

const Step = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  background-color: ${(props) =>
    props.active ? "var(--primary-color)" : "var(--border-color)"};
  color: ${(props) => (props.active ? "white" : "var(--text-color)")};
  cursor: ${(props) => (props.active ? "default" : "pointer")};
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
    setCsvData,
    setConfiguration,
    processedData,
    currentStep,
    setCurrentStep,
    error,
    setError,
    processCSVData,
  } = useCSV();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileLoaded = (data: any) => {
    setCsvData(data);
    setCurrentStep(CSVProcessingStep.CONFIGURE_HEADERS);
    setError(null);
    setSuccessMessage("CSV file loaded successfully!");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);

    // Clear error message after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const handleConfigurationComplete = (config: any) => {
    setConfiguration(config);
    setCurrentStep(CSVProcessingStep.PREVIEW);

    // Trigger data processing with new configuration
    processCSVData();

    setSuccessMessage("Configuration applied successfully!");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleDownloadComplete = () => {
    setSuccessMessage("File downloaded successfully!");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle step navigation
  const handleStepClick = (step: CSVProcessingStep) => {
    // Only allow navigation to steps that are available based on current progress
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header>
          <Title>CSV Processor</Title>
          <p>Upload, configure, and transform your CSV files</p>
        </Header>
        <Main>
          <StepIndicator>
            <Step
              active={currentStep === CSVProcessingStep.UPLOAD}
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
              onClick={() =>
                csvData && handleStepClick(CSVProcessingStep.CONFIGURE_HEADERS)
              }
            >
              Configure
            </Step>
            <Step
              active={currentStep === CSVProcessingStep.PREVIEW}
              onClick={() =>
                csvData && handleStepClick(CSVProcessingStep.PREVIEW)
              }
            >
              Preview
            </Step>
            <Step
              active={currentStep === CSVProcessingStep.DOWNLOAD}
              onClick={() =>
                csvData &&
                processedData.length > 0 &&
                handleStepClick(CSVProcessingStep.DOWNLOAD)
              }
            >
              Download
            </Step>
          </StepIndicator>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

          {currentStep === CSVProcessingStep.UPLOAD && (
            <FileUpload onFileLoaded={handleFileLoaded} onError={handleError} />
          )}

          {currentStep >= CSVProcessingStep.CONFIGURE_HEADERS &&
            currentStep <= CSVProcessingStep.CONFIGURE_DATES &&
            csvData && (
              <CSVConfiguration
                csvData={csvData}
                onConfigurationComplete={handleConfigurationComplete}
              />
            )}

          {currentStep >= CSVProcessingStep.PREVIEW && csvData && (
            <CSVPreview />
          )}

          {currentStep >= CSVProcessingStep.PREVIEW &&
            csvData &&
            processedData.length > 0 && (
              <Download onDownloadComplete={handleDownloadComplete} />
            )}
        </Main>
      </AppContainer>
    </>
  );
}

export default App;
