import React from 'react';
import styled from 'styled-components';

const FileUploadContainer = styled.div`
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
  }
`;

const FileUploadMessage = styled.p`
  margin-bottom: 1rem;
`;

interface FileUploadProps {
  onFileLoaded: (data: any) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, onError }) => {
  // Implementation will be added in task 2.1
  
  return (
    <FileUploadContainer>
      <FileUploadMessage>
        Drag and drop a CSV file here, or click to select a file
      </FileUploadMessage>
      <p>Only CSV files are accepted</p>
    </FileUploadContainer>
  );
};

export default FileUpload;