import { generateCSV } from "../csvService";
import { ProcessedRow } from "../../context/CSVContext";

describe("generateCSV", () => {
  it("should generate empty string for empty data", () => {
    expect(generateCSV([])).toBe("");
  });

  it("should generate CSV with headers and data", () => {
    const processedData: ProcessedRow[] = [
      {
        Date: "01/02/2023",
        Amount: "100",
        Description: "Test",
        US_DATE: "01/02/2023",
        UK_DATE: "02/01/2023",
        ISO_DATE: "2023-01-02",
        CLEAN_AMOUNT: 100,
      },
      {
        Date: "03/04/2023",
        Amount: "200",
        Description: "Test 2",
        US_DATE: "03/04/2023",
        UK_DATE: "04/03/2023",
        ISO_DATE: "2023-03-04",
        CLEAN_AMOUNT: 200,
      },
    ];

    const expected =
      "Date,Amount,Description,US_DATE,UK_DATE,ISO_DATE,CLEAN_AMOUNT\n" +
      "01/02/2023,100,Test,01/02/2023,02/01/2023,2023-01-02,100\n" +
      "03/04/2023,200,Test 2,03/04/2023,04/03/2023,2023-03-04,200";

    expect(generateCSV(processedData)).toBe(expected);
  });

  it("should handle values with commas by quoting them", () => {
    const processedData: ProcessedRow[] = [
      {
        Description: "Test, with comma",
        Amount: "100",
        US_DATE: "01/02/2023",
        UK_DATE: "02/01/2023",
        ISO_DATE: "2023-01-02",
        CLEAN_AMOUNT: 100,
      },
    ];

    const expected =
      "Description,Amount,US_DATE,UK_DATE,ISO_DATE,CLEAN_AMOUNT\n" +
      '"Test, with comma",100,01/02/2023,02/01/2023,2023-01-02,100';

    expect(generateCSV(processedData)).toBe(expected);
  });

  it("should handle values with quotes by escaping them", () => {
    const processedData: ProcessedRow[] = [
      {
        Description: 'Test with "quotes"',
        Amount: "100",
        US_DATE: "01/02/2023",
        UK_DATE: "02/01/2023",
        ISO_DATE: "2023-01-02",
        CLEAN_AMOUNT: 100,
      },
    ];

    const expected =
      "Description,Amount,US_DATE,UK_DATE,ISO_DATE,CLEAN_AMOUNT\n" +
      '"Test with ""quotes""",100,01/02/2023,02/01/2023,2023-01-02,100';

    expect(generateCSV(processedData)).toBe(expected);
  });

  it("should handle missing values", () => {
    const processedData: ProcessedRow[] = [
      {
        Date: "01/02/2023",
        // Amount is missing
        Description: "Test",
        US_DATE: "01/02/2023",
        UK_DATE: "02/01/2023",
        ISO_DATE: "2023-01-02",
        CLEAN_AMOUNT: 100,
      },
    ];

    const expected =
      "Date,Description,US_DATE,UK_DATE,ISO_DATE,CLEAN_AMOUNT\n" +
      "01/02/2023,Test,01/02/2023,02/01/2023,2023-01-02,100";

    expect(generateCSV(processedData)).toBe(expected);
  });

  it("should handle different data types", () => {
    const processedData: ProcessedRow[] = [
      {
        Date: "01/02/2023",
        Amount: 100, // Number instead of string
        Description: "Test",
        US_DATE: "01/02/2023",
        UK_DATE: "02/01/2023",
        ISO_DATE: "2023-01-02",
        CLEAN_AMOUNT: 100,
      },
    ];

    const expected =
      "Date,Amount,Description,US_DATE,UK_DATE,ISO_DATE,CLEAN_AMOUNT\n" +
      "01/02/2023,100,Test,01/02/2023,02/01/2023,2023-01-02,100";

    expect(generateCSV(processedData)).toBe(expected);
  });
});
