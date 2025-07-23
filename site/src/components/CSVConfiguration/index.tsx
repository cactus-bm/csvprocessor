import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useCSV, CSVProcessingStep } from "../../context/CSVContext";
import DateColumnConfiguration from "./DateColumnConfiguration";
import ColumnMappingConfiguration from "./ColumnMappingConfiguration";

const ConfigurationContainer = styled.div`
  margin-bottom: 2rem;
`;

const ConfigurationTitle = styled.h2`
  margin-bottom: 1rem;
`;

const HeaderSelectionSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const HeaderRowSelector = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
  display: block;
`;

const TableHeader = styled.thead`
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
`;

const TableBody = styled.tbody`
  display: block;
  max-height: 300px;
  overflow-y: auto;
`;

const TableRow = styled.tr<{ isHeaderRow?: boolean; isSelected?: boolean }>`
  display: table;
  width: 100%;
  table-layout: fixed;
  background-color: ${(props) =>
    props.isSelected ? "#e3f2fd" : props.isHeaderRow ? "#fff3e0" : "white"};
  border-bottom: 1px solid #eee;
  cursor: ${(props) => (props.isHeaderRow ? "pointer" : "default")};

  &:hover {
    background-color: ${(props) => (props.isHeaderRow ? "#ffecb3" : "#f9f9f9")};
  }
`;

const TableCell = styled.td`
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TableHeaderCell = styled.th`
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
  background-color: #f5f5f5;
  font-weight: 600;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowIndicator = styled.span`
  font-size: 0.8rem;
  color: #666;
  margin-right: 0.5rem;
`;

const ConfigurationButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark-color);
  }

  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

interface CSVConfigurationProps {
  onSuccess: () => void;
}

const CSVConfiguration: React.FC<CSVConfigurationProps> = ({ onSuccess }) => {
  const {
    csvData,
    configuration,
    updateConfiguration,
    setCurrentStep,
    isProcessing,
  } = useCSV();

  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const updatePreviewData = useCallback(() => {
    if (!csvData || !csvData.rows) return;

    const rows = csvData.rows;
    const headerRow = rows[configuration.headerRowIndex] || [];

    // Set headers from selected row
    setHeaders(
      headerRow.map(
        (header: string, index: number) => header || `Column ${index + 1}`
      )
    );

    // Set preview data (show first 10 rows for performance)
    const dataRows = rows.slice(
      configuration.headerRowIndex + 1,
      configuration.headerRowIndex + 11
    );
    setPreviewData(dataRows);
  }, [csvData, configuration.headerRowIndex]);

  // Update preview data when component mounts or dependencies change
  useEffect(() => {
    updatePreviewData();
  }, [updatePreviewData]);

  const handleHeaderRowChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newHeaderRowIndex = parseInt(event.target.value, 10);
    updateConfiguration({ headerRowIndex: newHeaderRowIndex });
  };

  const handleRowClick = (rowIndex: number) => {
    updateConfiguration({ headerRowIndex: rowIndex });
  };

  const handleConfigurationComplete = () => {
    // Move to the preview step
    setCurrentStep(CSVProcessingStep.PREVIEW);

    // Call the success callback
    onSuccess();
  };

  if (!csvData || !csvData.rows || csvData.rows.length === 0) {
    return (
      <ConfigurationContainer>
        <ConfigurationTitle>Configure CSV</ConfigurationTitle>
        <p>No CSV data available for configuration.</p>
      </ConfigurationContainer>
    );
  }

  const maxColumns = Math.max(
    ...csvData.rows.map((row: string[]) => row.length)
  );

  return (
    <ConfigurationContainer>
      <ConfigurationTitle>Configure CSV</ConfigurationTitle>

      <HeaderSelectionSection>
        <SectionTitle>Step 1: Select Header Row</SectionTitle>

        <HeaderRowSelector>
          <Label htmlFor="header-row-select">
            Choose which row contains the column headers:
          </Label>
          <Select
            id="header-row-select"
            value={configuration.headerRowIndex}
            onChange={handleHeaderRowChange}
            disabled={isProcessing}
          >
            {csvData.rows.map((row: string[], index: number) => (
              <option key={index} value={index}>
                Row {index + 1}: {row.slice(0, 3).join(", ")}
                {row.length > 3 ? "..." : ""}
              </option>
            ))}
          </Select>
        </HeaderRowSelector>

        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHeaderCell style={{ width: "60px" }}>Row</TableHeaderCell>
              {Array.from({ length: maxColumns }, (_, index) => (
                <TableHeaderCell key={index}>
                  {headers[index] || `Column ${index + 1}`}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {csvData.rows
              .slice(0, 15)
              .map((row: string[], rowIndex: number) => (
                <TableRow
                  key={rowIndex}
                  isHeaderRow={true}
                  isSelected={rowIndex === configuration.headerRowIndex}
                  onClick={() => !isProcessing && handleRowClick(rowIndex)}
                >
                  <TableCell style={{ width: "60px" }}>
                    <RowIndicator>
                      {rowIndex === configuration.headerRowIndex ? "→ " : ""}
                      {rowIndex + 1}
                    </RowIndicator>
                  </TableCell>
                  {Array.from({ length: maxColumns }, (_, colIndex) => (
                    <TableCell key={colIndex}>{row[colIndex] || ""}</TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </DataTable>

        {previewData.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Data Preview (with selected headers):</h4>
            <DataTable>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHeaderCell key={index}>{header}</TableHeaderCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row: string[], rowIndex: number) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: maxColumns }, (_, colIndex) => (
                      <TableCell key={colIndex}>
                        {row[colIndex] || ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </div>
        )}
      </HeaderSelectionSection>

      {/* Add Column Mapping Configuration */}
      <ColumnMappingConfiguration />

      {/* Add Date Column Configuration */}
      <DateColumnConfiguration />

      {/* Add Apply Configuration button */}
      <ConfigurationButton
        onClick={handleConfigurationComplete}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Apply Configuration"}
      </ConfigurationButton>
    </ConfigurationContainer>
  );
};

export default CSVConfiguration;
