import React from 'react';
import styled from 'styled-components';
import GlobalStyles from './GlobalStyles';
import FileUpload from './components/FileUpload';
import CSVConfiguration from './components/CSVConfiguration';
import CSVPreview from './components/CSVPreview';
import Download from './components/Download';
import { useCSV } from './context/CSVContext';

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
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
`;

const ErrorMessage = styled.div`
  background-color: var(--error-color);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

function App() {
  const { 
    csvData, 
    setCsvData, 
    configuration, 
    setConfiguration, 
    // processedData, // Commented out until needed
    // setProcessedData, // Commented out until needed
    currentStep,
    setCurrentStep,
    error,
    setError
  } = useCSV();

  const handleFileLoaded = (data: any) => {
    setCsvData(data);
    setCurrentStep(1);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleConfigurationComplete = (config: any) => {
    setConfiguration(config);
    setCurrentStep(2);
  };

  const handleDownloadComplete = () => {
    // Reset or show success message
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
            <Step active={currentStep === 0}>Upload</Step>
            <Step active={currentStep === 1}>Configure</Step>
            <Step active={currentStep === 2}>Preview</Step>
            <Step active={currentStep === 3}>Download</Step>
          </StepIndicator>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {currentStep === 0 && (
            <FileUpload 
              onFileLoaded={handleFileLoaded} 
              onError={handleError} 
            />
          )}

          {currentStep >= 1 && csvData && (
            <CSVConfiguration 
              csvData={csvData} 
              onConfigurationComplete={handleConfigurationComplete} 
            />
          )}

          {currentStep >= 2 && csvData && (
            <CSVPreview 
              csvData={csvData} 
              configuration={configuration} 
            />
          )}

          {currentStep >= 2 && csvData && (
            <Download 
              csvData={csvData} 
              configuration={configuration} 
              onDownloadComplete={handleDownloadComplete} 
            />
          )}
        </Main>
      </AppContainer>
    </>
  );
}

export default App;
