import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useCSV, CSVData, Configuration } from "../../context/CSVContext";

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

interface CSVConfigurationProps {
  csvData: CSVData;
  onConfigurationComplete: (config: Configuration) => void;
}

const CSVConfiguration: React.FC<CSVConfigurationProps> = ({
  csvData,
  onConfigurationComplete,
}) => {
  const { configuration, setConfiguration } = useCSV();
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
    const newConfig = {
      ...configuration,
      headerRowIndex: newHeaderRowIndex,
    };
    setConfiguration(newConfig);
  };

  const handleRowClick = (rowIndex: number) => {
    const newConfig = {
      ...configuration,
      headerRowIndex: rowIndex,
    };
    setConfiguration(newConfig);
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
                  onClick={() => handleRowClick(rowIndex)}
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
    </ConfigurationContainer>
  );
};

export default CSVConfiguration;
