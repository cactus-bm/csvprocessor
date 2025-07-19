import React from 'react';
import styled from 'styled-components';

const DownloadContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const DownloadButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
`;

interface DownloadProps {
  csvData: any;
  configuration: any;
  onDownloadComplete: () => void;
}

const Download: React.FC<DownloadProps> = ({ csvData, configuration, onDownloadComplete }) => {
  // Implementation will be added in task 6
  
  return (
    <DownloadContainer>
      <DownloadButton disabled>
        Download Processed CSV
      </DownloadButton>
      <p>Download functionality will be implemented in task 6</p>
    </DownloadContainer>
  );
};

export default Download;