import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { useCSV } from "../../context/CSVContext";

const MappingContainer = styled.div`
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

const MappingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MappingItem = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
`;

const CheckboxContainer = styled.div`
  margin-top: 1.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const InfoText = styled.p`
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
`;

// Column types that can be mapped
const columnTypes = [
  { value: "amount", label: "Amount", description: "The transaction amount" },
  {
    value: "amountType",
    label: "Amount Type",
    description: "Indicates if the amount is a debit (D) or credit (C)",
  },
  { value: "income", label: "Income", description: "Income or credit amount" },
  {
    value: "expense",
    label: "Expense",
    description: "Expense or debit amount",
  },
];

const ColumnMappingConfiguration: React.FC = () => {
  const { csvData, configuration, updateConfiguration, isProcessing } =
    useCSV();

  // Get headers from the selected header row
  const headers = useMemo(() => {
    if (!csvData || !csvData.rows) return [];
    return csvData.rows[configuration.headerRowIndex] || [];
  }, [csvData, configuration.headerRowIndex]);

  // Handle column mapping change
  const handleColumnMappingChange = useCallback(
    (columnType: string, value: string) => {
      updateConfiguration({
        columnMappings: {
          ...configuration.columnMappings,
          [columnType]: value === "" ? undefined : value,
        },
      });
    },
    [configuration.columnMappings, updateConfiguration]
  );

  // Handle invert amounts checkbox change
  const handleInvertAmountsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateConfiguration({
        invertAmounts: e.target.checked,
      });
    },
    [updateConfiguration]
  );

  // Check if income and expense columns are both mapped
  const hasIncomeAndExpense = useMemo(() => {
    return (
      configuration.columnMappings.income !== undefined &&
      configuration.columnMappings.expense !== undefined
    );
  }, [
    configuration.columnMappings.income,
    configuration.columnMappings.expense,
  ]);

  // Check if amount and amount type columns are both mapped
  const hasAmountAndType = useMemo(() => {
    return (
      configuration.columnMappings.amount !== undefined &&
      configuration.columnMappings.amountType !== undefined
    );
  }, [
    configuration.columnMappings.amount,
    configuration.columnMappings.amountType,
  ]);

  if (!csvData || !csvData.rows || csvData.rows.length === 0) {
    return null;
  }

  return (
    <MappingContainer>
      <SectionTitle>Step 2: Map Columns</SectionTitle>

      <InfoText>
        Map your CSV columns to specific data types to enable proper processing.
        You can either map income and expense columns separately, or map a
        single amount column with an optional amount type column.
      </InfoText>

      <MappingGrid>
        {columnTypes.map((columnType) => (
          <MappingItem key={columnType.value}>
            <FormGroup>
              <Label htmlFor={`column-${columnType.value}`}>
                {columnType.label}:
              </Label>
              <Select
                id={`column-${columnType.value}`}
                value={
                  configuration.columnMappings[
                    columnType.value as keyof typeof configuration.columnMappings
                  ] || ""
                }
                onChange={(e) =>
                  handleColumnMappingChange(columnType.value, e.target.value)
                }
                disabled={isProcessing}
              >
                <option value="">-- Select Column --</option>
                {headers.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </Select>
              <InfoText>{columnType.description}</InfoText>
            </FormGroup>
          </MappingItem>
        ))}
      </MappingGrid>

      {(hasIncomeAndExpense || hasAmountAndType) && (
        <CheckboxContainer>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={configuration.invertAmounts}
              onChange={handleInvertAmountsChange}
              disabled={isProcessing}
            />
            Invert Amounts
          </CheckboxLabel>
          <InfoText>
            Check this box if you want to invert the sign of all amount values
            (multiply by -1). This is useful if your CSV file has debits as
            positive and credits as negative, but you want the opposite.
          </InfoText>
        </CheckboxContainer>
      )}

      {hasIncomeAndExpense && (
        <InfoText>
          <strong>Note:</strong> Income and expense columns are both mapped. The
          system will calculate the net amount as (income - expense).
        </InfoText>
      )}

      {hasAmountAndType && (
        <InfoText>
          <strong>Note:</strong> Amount and amount type columns are both mapped.
          The system will interpret values in the amount type column containing
          'D', 'DR', or 'DEBIT' as debits (negative amounts).
        </InfoText>
      )}
    </MappingContainer>
  );
};

export default ColumnMappingConfiguration;
