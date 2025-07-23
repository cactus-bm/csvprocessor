import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useCSV } from "../../context/CSVContext";

const DateConfigContainer = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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
  margin-right: 1rem;
`;

const RadioGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

interface RadioLabelProps {
  checked?: boolean;
}

const RadioLabel = styled.label<RadioLabelProps>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${(props) => (props.checked ? "#e3f2fd" : "white")};

  &:hover {
    background-color: ${(props) => (props.checked ? "#e3f2fd" : "#f5f5f5")};
  }
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
`;

const DetectedFormat = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-left: 4px solid #4caf50;
  border-radius: 4px;
`;

const FormatExample = styled.span`
  font-family: monospace;
  background-color: #eee;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  margin: 0 0.3rem;
`;

/**
 * Attempts to detect the date format from a sample of date values
 * @param dateValues Array of date strings to analyze
 * @returns The detected format or "auto" if unable to determine
 */
const detectDateFormat = (
  dateValues: string[]
): "DD/MM" | "MM/DD" | "DD MMM" | "auto" => {
  // Filter out empty values and take a sample
  const sampleValues = dateValues.filter(Boolean).slice(0, 20);

  if (sampleValues.length === 0) return "auto";

  // Check for DD MMM format (e.g., "15 Jan 2023")
  const ddMmmRegex = /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/;
  const hasDdMmmFormat = sampleValues.some((value) =>
    ddMmmRegex.test(value.trim())
  );

  if (hasDdMmmFormat) return "DD MMM";

  // Check for DD/MM vs MM/DD format
  const dateRegex = /^(\d{1,2})([./\-](\d{1,2}))[./\-](\d{2,4})$/;
  const dateMatches = sampleValues
    .map((value) => value.trim().match(dateRegex))
    .filter(Boolean) as RegExpMatchArray[];

  if (dateMatches.length === 0) return "auto";

  // Check if any first number exceeds 12 (must be day, not month)
  const hasFirstNumberOver12 = dateMatches.some((match) => {
    const firstNum = parseInt(match[1], 10);
    return firstNum > 12;
  });

  // Check if any second number exceeds 12 (must be day, not month)
  const hasSecondNumberOver12 = dateMatches.some((match) => {
    const secondNum = parseInt(match[2], 10);
    return secondNum > 12;
  });

  if (hasFirstNumberOver12) return "DD/MM"; // First number > 12, must be DD/MM
  if (hasSecondNumberOver12) return "MM/DD"; // Second number > 12, must be MM/DD

  // If we can't determine, default to MM/DD (US format)
  return "MM/DD";
};

const DateColumnConfiguration: React.FC = () => {
  const { csvData, configuration, updateConfiguration, isProcessing } =
    useCSV();
  const [detectedFormat, setDetectedFormat] = useState<
    "DD/MM" | "MM/DD" | "DD MMM" | "auto"
  >("auto");
  const [dateColumnValues, setDateColumnValues] = useState<string[]>([]);

  // Get headers from the selected header row using useMemo to avoid unnecessary recalculations
  const headers = React.useMemo(() => {
    if (!csvData || !csvData.rows) return [];
    return csvData.rows[configuration.headerRowIndex] || [];
  }, [csvData, configuration.headerRowIndex]);

  // Update date column values when date column changes
  useEffect(() => {
    if (
      csvData &&
      csvData.rows &&
      configuration.columnMappings.date &&
      csvData.rows.length > configuration.headerRowIndex + 1
    ) {
      const dateColumnIndex = headers.findIndex(
        (header) => header === configuration.columnMappings.date
      );

      if (dateColumnIndex >= 0) {
        // Get values from the date column
        const values = csvData.rows
          .slice(configuration.headerRowIndex + 1)
          .map((row) => row[dateColumnIndex] || "")
          .filter(Boolean);

        setDateColumnValues(values);

        // Detect date format from values
        const format = detectDateFormat(values);
        setDetectedFormat(format);

        // Update configuration if set to auto
        if (configuration.dateFormat === "auto") {
          updateConfiguration({ dateFormat: format });
        }
      }
    }
  }, [
    configuration.columnMappings.date,
    configuration.headerRowIndex,
    configuration.dateFormat,
    csvData,
    headers,
    updateConfiguration,
  ]);

  // Handle date column selection
  const handleDateColumnChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const dateColumn = e.target.value;
      updateConfiguration({
        columnMappings: {
          ...configuration.columnMappings,
          date: dateColumn === "" ? undefined : dateColumn,
        },
      });
    },
    [configuration.columnMappings, updateConfiguration]
  );

  // Handle date format selection
  const handleDateFormatChange = useCallback(
    (format: "DD/MM" | "MM/DD" | "DD MMM" | "auto") => {
      updateConfiguration({ dateFormat: format });
    },
    [updateConfiguration]
  );

  // Early return after all hooks
  if (!csvData || !csvData.rows || csvData.rows.length === 0) {
    return null;
  }

  // Get example date based on format
  const getDateExample = (
    format: "DD/MM" | "MM/DD" | "DD MMM" | "auto"
  ): string => {
    switch (format) {
      case "DD/MM":
        return "31/12/2023";
      case "MM/DD":
        return "12/31/2023";
      case "DD MMM":
        return "31 Dec 2023";
      default:
        return "Auto-detect";
    }
  };

  return (
    <DateConfigContainer>
      <SectionTitle>Step 3: Configure Date Column</SectionTitle>

      <FormGroup>
        <Label htmlFor="date-column-select">
          Select the column containing dates:
        </Label>
        <Select
          id="date-column-select"
          value={configuration.columnMappings.date || ""}
          onChange={handleDateColumnChange}
          disabled={isProcessing}
        >
          <option value="">-- Select Date Column --</option>
          {headers.map((header, index) => (
            <option key={index} value={header}>
              {header}
            </option>
          ))}
        </Select>
      </FormGroup>

      {configuration.columnMappings.date && (
        <>
          {detectedFormat !== "auto" && (
            <DetectedFormat>
              <strong>Detected Format:</strong> {detectedFormat} (example:{" "}
              <FormatExample>{getDateExample(detectedFormat)}</FormatExample>)
            </DetectedFormat>
          )}

          <FormGroup>
            <Label>Select date format:</Label>
            <RadioGroup>
              <RadioLabel checked={configuration.dateFormat === "auto"}>
                <RadioInput
                  type="radio"
                  name="dateFormat"
                  checked={configuration.dateFormat === "auto"}
                  onChange={() => handleDateFormatChange("auto")}
                />
                Auto-detect
              </RadioLabel>

              <RadioLabel checked={configuration.dateFormat === "DD/MM"}>
                <RadioInput
                  type="radio"
                  name="dateFormat"
                  checked={configuration.dateFormat === "DD/MM"}
                  onChange={() => handleDateFormatChange("DD/MM")}
                />
                DD/MM (Day/Month){" "}
                <FormatExample>{getDateExample("DD/MM")}</FormatExample>
              </RadioLabel>

              <RadioLabel checked={configuration.dateFormat === "MM/DD"}>
                <RadioInput
                  type="radio"
                  name="dateFormat"
                  checked={configuration.dateFormat === "MM/DD"}
                  onChange={() => handleDateFormatChange("MM/DD")}
                />
                MM/DD (Month/Day){" "}
                <FormatExample>{getDateExample("MM/DD")}</FormatExample>
              </RadioLabel>

              <RadioLabel checked={configuration.dateFormat === "DD MMM"}>
                <RadioInput
                  type="radio"
                  name="dateFormat"
                  checked={configuration.dateFormat === "DD MMM"}
                  onChange={() => handleDateFormatChange("DD MMM")}
                />
                DD MMM (Day Month){" "}
                <FormatExample>{getDateExample("DD MMM")}</FormatExample>
              </RadioLabel>
            </RadioGroup>
          </FormGroup>

          {dateColumnValues.length > 0 && (
            <FormGroup>
              <Label>Sample values from selected date column:</Label>
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  padding: "0.5rem",
                  borderRadius: "4px",
                }}
              >
                {dateColumnValues.slice(0, 10).map((value, index) => (
                  <div key={index} style={{ padding: "0.25rem 0" }}>
                    {value || <em style={{ color: "#999" }}>Empty</em>}
                  </div>
                ))}
                {dateColumnValues.length > 10 && (
                  <div style={{ color: "#666", fontStyle: "italic" }}>
                    ...and {dateColumnValues.length - 10} more
                  </div>
                )}
              </div>
            </FormGroup>
          )}
        </>
      )}
    </DateConfigContainer>
  );
};

export default DateColumnConfiguration;
