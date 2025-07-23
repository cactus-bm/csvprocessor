import { parseCSV, detectDelimiter, processCSV } from "../csvService";
import { Configuration } from "../../context/CSVContext";

describe("csvService", () => {
  describe("detectDelimiter", () => {
    it("should detect comma delimiter", () => {
      const csvString = "a,b,c\n1,2,3\n4,5,6";
      expect(detectDelimiter(csvString)).toBe(",");
    });

    it("should detect semicolon delimiter", () => {
      const csvString = "a;b;c\n1;2;3\n4;5;6";
      expect(detectDelimiter(csvString)).toBe(";");
    });

    it("should detect tab delimiter", () => {
      const csvString = "a\tb\tc\n1\t2\t3\n4\t5\t6";
      expect(detectDelimiter(csvString)).toBe("\t");
    });

    it("should detect pipe delimiter", () => {
      const csvString = "a|b|c\n1|2|3\n4|5|6";
      expect(detectDelimiter(csvString)).toBe("|");
    });

    it("should default to comma for empty string", () => {
      expect(detectDelimiter("")).toBe(",");
    });
  });

  describe("parseCSV", () => {
    it("should parse CSV with comma delimiter", () => {
      const csvString = "a,b,c\n1,2,3\n4,5,6";
      const result = parseCSV(csvString);
      expect(result.rows).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
      ]);
    });

    it("should parse CSV with semicolon delimiter", () => {
      const csvString = "a;b;c\n1;2;3\n4;5;6";
      const result = parseCSV(csvString);
      expect(result.rows).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
      ]);
    });

    it("should handle quoted values", () => {
      const csvString = 'a,b,c\n"1,2",3,4\n5,6,7';
      const result = parseCSV(csvString);
      expect(result.rows).toEqual([
        ["a", "b", "c"],
        ["1,2", "3", "4"],
        ["5", "6", "7"],
      ]);
    });

    it("should throw error for empty CSV", () => {
      expect(() => parseCSV("")).toThrow("CSV string is empty");
    });

    it("should throw error for invalid CSV", () => {
      expect(() => parseCSV(",,,", { delimiter: "," })).toThrow(
        "No valid data found in CSV"
      );
    });
  });

  describe("processCSV", () => {
    it("should process CSV data based on configuration", () => {
      const csvData = {
        rawText:
          "Date,Amount,Description\n01/02/2023,100,Test\n03/04/2023,200,Test 2",
        rows: [
          ["Date", "Amount", "Description"],
          ["01/02/2023", "100", "Test"],
          ["03/04/2023", "200", "Test 2"],
        ],
      };

      const config: Configuration = {
        headerRowIndex: 0,
        columnMappings: {
          date: "Date",
          amount: "Amount",
          description: "Description",
        },
        dateFormat: "auto",
        invertAmounts: false,
      };

      const result = processCSV(csvData, config);

      // Basic validation of the structure
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty("Date");
      expect(result[0]).toHaveProperty("Amount");
      expect(result[0]).toHaveProperty("Description");
      expect(result[0]).toHaveProperty("US_DATE");
      expect(result[0]).toHaveProperty("UK_DATE");
      expect(result[0]).toHaveProperty("ISO_DATE");
      expect(result[0]).toHaveProperty("CLEAN_AMOUNT");
    });

    it("should return empty array for empty CSV data", () => {
      const result = processCSV(
        { rawText: "", rows: [] },
        {
          headerRowIndex: 0,
          columnMappings: {},
          dateFormat: "auto",
          invertAmounts: false,
        }
      );

      expect(result).toEqual([]);
    });
  });
});
