import React from 'react';
import styled from 'styled-components';

const PreviewContainer = styled.div`
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const PreviewTitle = styled.h2`
  margin-bottom: 1rem;
`;

// Table styling will be used in task 5 implementation
// const PreviewTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   
//   th, td {
//     border: 1px solid var(--border-color);
//     padding: 0.5rem;
//     text-align: left;
//   }
//   
//   th {
//     background-color: var(--hover-color);
//   }
//   
//   tr:nth-child(even) {
//     background-color: var(--hover-color);
//   }
// `;

interface CSVPreviewProps {
  csvData: any;
  configuration: any;
}

const CSVPreview: React.FC<CSVPreviewProps> = ({ csvData, configuration }) => {
  // Implementation will be added in task 5
  
  return (
    <PreviewContainer>
      <PreviewTitle>CSV Preview</PreviewTitle>
      <p>Preview will be implemented in task 5</p>
    </PreviewContainer>
  );
};

export default CSVPreview;