import {
  parseDate,
  formatDate,
  convertDate,
  standardizeDateFormats,
  detectDateFormat,
} from "../dateUtils";

describe("dateUtils", () => {
  describe("parseDate", () => {
    it("should parse DD/MM format correctly", () => {
      const result = parseDate("31/12/2023", "DD/MM");
      expect(result).toEqual({ day: 31, month: 12, year: 2023 });
    });

    it("should parse MM/DD format correctly", () => {
      const result = parseDate("12/31/2023", "MM/DD");
      expect(result).toEqual({ day: 31, month: 12, year: 2023 });
    });

    it("should parse DD MMM format correctly", () => {
      const result = parseDate("31 Dec 2023", "DD MMM");
      expect(result).toEqual({ day: 31, month: 12, year: 2023 });
    });

    it("should handle different separators in date strings", () => {
      expect(parseDate("31-12-2023", "DD/MM")).toEqual({
        day: 31,
        month: 12,
        year: 2023,
      });
      expect(parseDate("31.12.2023", "DD/MM")).toEqual({
        day: 31,
        month: 12,
        year: 2023,
      });
    });

    it("should handle 2-digit years", () => {
      expect(parseDate("31/12/23", "DD/MM")).toEqual({
        day: 31,
        month: 12,
        year: 2023,
      });
      expect(parseDate("31/12/99", "DD/MM")).toEqual({
        day: 31,
        month: 12,
        year: 1999,
      });
    });

    it("should return null for invalid dates", () => {
      expect(parseDate("", "DD/MM")).toBeNull();
      expect(parseDate("invalid", "DD/MM")).toBeNull();
      expect(parseDate("32/12/2023", "DD/MM")).toBeNull(); // Invalid day
      expect(parseDate("31/13/2023", "DD/MM")).toBeNull(); // Invalid month
    });

    it("should auto-detect format when set to auto", () => {
      expect(parseDate("31/12/2023", "auto")).toEqual({
        day: 31,
        month: 12,
        year: 2023,
      }); // DD/MM
      expect(parseDate("12/31/2023", "auto")).toEqual({
        day: 31,
        month: 12,
        year: 2023,
      }); // MM/DD
      expect(parseDate("31 Dec 2023", "auto")).toEqual({
        day: 31,
        month: 12,
        year: 2023,
      }); // DD MMM
    });
  });

  describe("formatDate", () => {
    const testDate = { day: 31, month: 12, year: 2023 };

    it("should format date as US_DATE", () => {
      expect(formatDate(testDate, "US_DATE")).toBe("12/31/2023");
    });

    it("should format date as UK_DATE", () => {
      expect(formatDate(testDate, "UK_DATE")).toBe("31/12/2023");
    });

    it("should format date as ISO_DATE", () => {
      expect(formatDate(testDate, "ISO_DATE")).toBe("2023-12-31");
    });

    it("should pad day and month with leading zeros", () => {
      const date = { day: 1, month: 2, year: 2023 };
      expect(formatDate(date, "US_DATE")).toBe("02/01/2023");
      expect(formatDate(date, "UK_DATE")).toBe("01/02/2023");
      expect(formatDate(date, "ISO_DATE")).toBe("2023-02-01");
    });

    it("should return empty string for null date", () => {
      expect(formatDate(null as any, "US_DATE")).toBe("");
    });
  });

  describe("convertDate", () => {
    it("should convert from DD/MM to US_DATE", () => {
      expect(convertDate("31/12/2023", "DD/MM", "US_DATE")).toBe("12/31/2023");
    });

    it("should convert from MM/DD to UK_DATE", () => {
      expect(convertDate("12/31/2023", "MM/DD", "UK_DATE")).toBe("31/12/2023");
    });

    it("should convert from DD MMM to ISO_DATE", () => {
      expect(convertDate("31 Dec 2023", "DD MMM", "ISO_DATE")).toBe(
        "2023-12-31"
      );
    });

    it("should return empty string for invalid date", () => {
      expect(convertDate("invalid", "DD/MM", "US_DATE")).toBe("");
    });

    it("should handle auto-detection of source format", () => {
      expect(convertDate("31/12/2023", "auto", "US_DATE")).toBe("12/31/2023");
      expect(convertDate("12/31/2023", "auto", "UK_DATE")).toBe("31/12/2023");
      expect(convertDate("31 Dec 2023", "auto", "ISO_DATE")).toBe("2023-12-31");
    });
  });

  describe("standardizeDateFormats", () => {
    it("should standardize DD/MM format", () => {
      const result = standardizeDateFormats("31/12/2023", "DD/MM");
      expect(result).toEqual({
        US_DATE: "12/31/2023",
        UK_DATE: "31/12/2023",
        ISO_DATE: "2023-12-31",
      });
    });

    it("should standardize MM/DD format", () => {
      const result = standardizeDateFormats("12/31/2023", "MM/DD");
      expect(result).toEqual({
        US_DATE: "12/31/2023",
        UK_DATE: "31/12/2023",
        ISO_DATE: "2023-12-31",
      });
    });

    it("should standardize DD MMM format", () => {
      const result = standardizeDateFormats("31 Dec 2023", "DD MMM");
      expect(result).toEqual({
        US_DATE: "12/31/2023",
        UK_DATE: "31/12/2023",
        ISO_DATE: "2023-12-31",
      });
    });

    it("should return empty strings for invalid date", () => {
      const result = standardizeDateFormats("invalid", "DD/MM");
      expect(result).toEqual({
        US_DATE: "",
        UK_DATE: "",
        ISO_DATE: "",
      });
    });

    it("should handle auto-detection of format", () => {
      const result1 = standardizeDateFormats("31/12/2023", "auto");
      expect(result1).toEqual({
        US_DATE: "12/31/2023",
        UK_DATE: "31/12/2023",
        ISO_DATE: "2023-12-31",
      });

      const result2 = standardizeDateFormats("31 Dec 2023", "auto");
      expect(result2).toEqual({
        US_DATE: "12/31/2023",
        UK_DATE: "31/12/2023",
        ISO_DATE: "2023-12-31",
      });
    });
  });

  describe("detectDateFormat", () => {
    it("should detect DD/MM format when day > 12", () => {
      const result = detectDateFormat([
        "15/04/2023",
        "22/05/2023",
        "31/01/2023",
      ]);
      expect(result).toBe("DD/MM");
    });

    it("should detect MM/DD format when month > 12", () => {
      const result = detectDateFormat([
        "04/15/2023",
        "05/22/2023",
        "01/31/2023",
      ]);
      expect(result).toBe("MM/DD");
    });

    it("should detect DD MMM format", () => {
      const result = detectDateFormat([
        "15 Jan 2023",
        "22 Feb 2023",
        "31 Mar 2023",
      ]);
      expect(result).toBe("DD MMM");
    });

    it("should default to MM/DD when ambiguous", () => {
      const result = detectDateFormat([
        "01/02/2023",
        "03/04/2023",
        "05/06/2023",
      ]);
      expect(result).toBe("MM/DD");
    });

    it("should return auto for empty array", () => {
      const result = detectDateFormat([]);
      expect(result).toBe("auto");
    });

    it("should prioritize DD MMM format when mixed formats are present", () => {
      const result = detectDateFormat([
        "15/04/2023",
        "22 Feb 2023",
        "31/01/2023",
      ]);
      expect(result).toBe("DD MMM");
    });
  });
});
