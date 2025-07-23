import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import styled from "styled-components";
import { useCSV } from "../../context/CSVContext";

const FileUploadContainer = styled.div<{ isDragging: boolean }>`
  border: 2px dashed
    ${(props) =>
      props.isDragging ? "var(--primary-color)" : "var(--border-color)"};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.isDragging ? "rgba(0, 123, 255, 0.05)" : "transparent"};
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const FileUploadMessage = styled.p`
  margin-bottom: 1rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(220, 53, 69, 0.1);
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark-color);
  }
`;

interface FileUploadProps {
  onSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
  const { uploadCSV, error, setError, isProcessing } = useCSV();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check if file is CSV
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      const errorMsg = "Please upload a valid CSV file";
      setLocalError(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Clear any previous errors
    setLocalError(null);
    setError(null);
    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      // Use the context's uploadCSV function
      await uploadCSV(file);

      // Call onSuccess callback when file is successfully loaded
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process CSV file";
      setLocalError(errorMessage);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Display either the context error or the local error
  const displayError = error || localError;

  return (
    <>
      <FileUploadContainer
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <FileUploadMessage>
          {isDragging
            ? "Drop your CSV file here"
            : "Drag and drop a CSV file here, or click to select a file"}
        </FileUploadMessage>
        <p>Only CSV files are accepted</p>
        <UploadButton
          type="button"
          disabled={isProcessing}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {isProcessing ? "Processing..." : "Select File"}
        </UploadButton>
        <HiddenInput
          type="file"
          ref={fileInputRef}
          accept=".csv,text/csv"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />
      </FileUploadContainer>
      {displayError && <ErrorMessage>{displayError}</ErrorMessage>}
    </>
  );
};

export default FileUpload;
