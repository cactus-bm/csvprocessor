# Requirements Document

## Introduction

This document outlines the requirements for a browser-based CSV processing application built with React. The application will allow users to upload CSV files, configure how the data should be interpreted (including header row selection, date format detection, and column mapping), perform transformations on the data, and download the processed file with additional standardized columns.

## Requirements

### Requirement 1: File Upload

**User Story:** As a user, I want to upload a CSV file by dragging and dropping it onto the application, so that I can begin processing my data.

#### Acceptance Criteria

1. WHEN a user drags a CSV file onto the designated drop area THEN the system SHALL accept the file and display its contents in a tabular format.
2. WHEN a user attempts to upload a non-CSV file THEN the system SHALL display an error message.
3. WHEN a CSV file is successfully uploaded THEN the system SHALL display the raw data and enable configuration options.

### Requirement 2: Header Row Selection

**User Story:** As a user, I want to specify which row contains the column headers, so that the system correctly interprets my data structure.

#### Acceptance Criteria

1. WHEN a CSV file is loaded THEN the system SHALL provide an interface to select which row contains the headers.
2. WHEN a header row is selected THEN the system SHALL display the data with the selected headers.
3. WHEN the header row is changed THEN the system SHALL update the display to reflect the new header selection.

### Requirement 3: Date Column Configuration

**User Story:** As a user, I want to specify which column contains date information and have the system detect or allow me to select the date format, so that dates are correctly standardized.

#### Acceptance Criteria

1. WHEN header row is selected THEN the system SHALL allow the user to designate one column as the date column.
2. WHEN a date column is selected THEN the system SHALL attempt to auto-detect whether the format is DD/MM or MM/DD by checking if any values exceed 12.
3. WHEN the date format is detected THEN the system SHALL display the detected format and allow the user to override it if needed.
4. WHEN processing the file THEN the system SHALL generate three standardized date formats (US_DATE, UK_DATE, and ISO_DATE) for the output.

### Requirement 4: Column Mapping

**User Story:** As a user, I want to map columns to specific data types (amount, amount type, income, expense, description, reference), so that the system can process financial data correctly.

#### Acceptance Criteria

1. WHEN header row is selected THEN the system SHALL provide an interface to map columns to predefined types.
2. WHEN columns are mapped THEN the system SHALL validate that the mappings are compatible with the data.
3. IF the user selects both income and expense columns THEN the system SHALL calculate a net amount by subtracting expense from income.
4. IF the user selects an amount type column THEN the system SHALL multiply the amount by -1 when the amount type contains 'D'.

### Requirement 5: Amount Inversion

**User Story:** As a user, I want an option to invert all amount values, so that I can correct the sign convention if needed.

#### Acceptance Criteria

1. WHEN column mapping is complete THEN the system SHALL provide a checkbox labeled "Invert Amounts".
2. WHEN the "Invert Amounts" checkbox is checked THEN the system SHALL multiply all amount values by -1 in the processed output.
3. WHEN the "Invert Amounts" checkbox is toggled THEN the system SHALL update the preview to reflect the change.

### Requirement 6: File Download

**User Story:** As a user, I want to download the processed CSV file with standardized columns, so that I can use it in other applications.

#### Acceptance Criteria

1. WHEN all configurations are complete THEN the system SHALL enable a download button.
2. WHEN the download button is clicked THEN the system SHALL generate a CSV file starting from the selected header row.
3. WHEN generating the output file THEN the system SHALL include all original columns plus the additional columns: US_DATE, UK_DATE, ISO_DATE, and CLEAN_AMOUNT.
4. WHEN the file is downloaded THEN the system SHALL provide a success message.

### Requirement 7: User Interface

**User Story:** As a user, I want a clean, intuitive interface that guides me through the CSV processing steps, so that I can complete the task efficiently.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display clear instructions for uploading a file.
2. WHEN a file is uploaded THEN the system SHALL guide the user through each configuration step in a logical order.
3. WHEN processing is in progress THEN the system SHALL provide visual feedback.
4. WHEN errors occur THEN the system SHALL display clear error messages with suggestions for resolution.
5. WHEN the screen size changes THEN the system SHALL adapt responsively to maintain usability on different devices.
