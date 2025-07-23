import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useCSV, ProcessedRow } from "../../context/CSVContext";

const PreviewContainer = styled.div`
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const PreviewTitle = styled.h2`
  margin-bottom: 1rem;
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background-color: var(--hover-color);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tr:nth-child(even) {
    background-color: var(--hover-color);
  }
`;

const TransformedCell = styled.td`
  background-color: rgba(74, 144, 226, 0.1);
  border-left: 2px solid var(--primary-color);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: var(--hover-color);
  border-radius: 4px;
`;

const PageInfo = styled.div`
  font-size: 0.9rem;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.5rem;
  margin: 0 0.25rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: var(--hover-color);
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
`;

const NoDataMessage = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: var(--hover-color);
  border-radius: 4px;
`;

interface CSVPreviewProps {
  csvData?: any;
  configuration?: any;
}

const CSVPreview: React.FC<CSVPreviewProps> = () => {
  const { processedData, isProcessing, error } = useCSV();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Current page data
  const [currentPageData, setCurrentPageData] = useState<ProcessedRow[]>([]);

  // Headers from processed data
  const [headers, setHeaders] = useState<string[]>([]);

  // Set of transformed columns to highlight
  const transformedColumns = new Set([
    "US Date",
    "UK Date",
    "ISO Date",
    "Clean Amount",
  ]);

  // Update pagination when processed data changes
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      // Calculate total pages
      const total = Math.ceil(processedData.length / pageSize);
      setTotalPages(total);

      // Reset to first page if current page is out of bounds
      if (currentPage > total) {
        setCurrentPage(1);
      }

      // Extract all unique headers from the data
      const allHeaders = Array.from(
        new Set(processedData.flatMap((row) => Object.keys(row)))
      );

      // Filter out columns that are completely empty
      const nonEmptyHeaders = allHeaders.filter((header) => {
        return processedData.some((row) => {
          const value = row[header];
          return value !== undefined && value !== null && value !== "";
        });
      });

      // Move transformed columns to the end
      const standardColumns = [
        "US Date",
        "UK Date",
        "ISO Date",
        "Clean Amount",
      ];
      const regularHeaders = nonEmptyHeaders.filter(
        (header) => !standardColumns.includes(header)
      );

      // Only include standard columns that have data
      const availableStandardColumns = standardColumns.filter((header) =>
        nonEmptyHeaders.includes(header)
      );

      setHeaders([...regularHeaders, ...availableStandardColumns]);
    } else {
      setTotalPages(1);
      setCurrentPage(1);
      setHeaders([]);
    }
  }, [processedData, pageSize, currentPage]);

  // Update current page data when page or data changes
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, processedData.length);
      setCurrentPageData(processedData.slice(startIndex, endIndex));
    } else {
      setCurrentPageData([]);
    }
  }, [processedData, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Render loading state
  if (isProcessing) {
    return (
      <PreviewContainer>
        <PreviewTitle>CSV Preview</PreviewTitle>
        <LoadingOverlay>
          <p>Processing data...</p>
        </LoadingOverlay>
      </PreviewContainer>
    );
  }

  // Render error state
  if (error) {
    return (
      <PreviewContainer>
        <PreviewTitle>CSV Preview</PreviewTitle>
        <NoDataMessage>
          <p>Error processing data: {error}</p>
        </NoDataMessage>
      </PreviewContainer>
    );
  }

  // Render empty state
  if (!processedData || processedData.length === 0) {
    return (
      <PreviewContainer>
        <PreviewTitle>CSV Preview</PreviewTitle>
        <NoDataMessage>
          <p>
            No data available for preview. Please upload and configure a CSV
            file.
          </p>
        </NoDataMessage>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer>
      <PreviewTitle>CSV Preview</PreviewTitle>

      <PreviewTable>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>
                {header}
                {transformedColumns.has(header) && " *"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => {
                const cellValue = row[header] !== undefined ? row[header] : "";

                // Use styled component for transformed columns
                if (transformedColumns.has(header)) {
                  return (
                    <TransformedCell key={`${rowIndex}-${header}`}>
                      {cellValue}
                    </TransformedCell>
                  );
                }

                return <td key={`${rowIndex}-${header}`}>{cellValue}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </PreviewTable>

      <PaginationContainer>
        <PageInfo>
          Showing{" "}
          {Math.min(processedData.length, (currentPage - 1) * pageSize + 1)} to{" "}
          {Math.min(processedData.length, currentPage * pageSize)} of{" "}
          {processedData.length} entries
        </PageInfo>

        <div>
          <PaginationButton
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </PaginationButton>
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>
          <span style={{ margin: "0 0.5rem" }}>
            Page {currentPage} of {totalPages}
          </span>
          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </PaginationButton>
          <PaginationButton
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </PaginationButton>
        </div>

        <PageSizeSelector>
          <label htmlFor="page-size">Rows per page:</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </PageSizeSelector>
      </PaginationContainer>

      {transformedColumns.size > 0 && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
          * Transformed columns
        </div>
      )}
    </PreviewContainer>
  );
};

export default CSVPreview;
