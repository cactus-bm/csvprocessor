/**
 * Date Standardization Utility
 *
 * This utility provides functions to convert between different date formats:
 * - DD/MM/YYYY (UK format)
 * - MM/DD/YYYY (US format)
 * - DD MMM YYYY (Day Month format, e.g., "15 Jan 2023")
 * - YYYY-MM-DD (ISO format)
 */

/**
 * Parses a date string based on the specified format
 * @param dateStr The date string to parse
 * @param format The format of the date string
 * @returns An object with day, month, and year, or null if parsing fails
 */
export function parseDate(
  dateStr: string,
  format: "DD/MM" | "MM/DD" | "DD MMM" | "auto"
): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;

  // Clean the input string
  const cleanDateStr = dateStr.trim();

  // Handle DD MMM format (e.g., "15 Jan 2023")
  if (
    format === "DD MMM" ||
    (format === "auto" && /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(cleanDateStr))
  ) {
    const match = cleanDateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2].toLowerCase();
      const year = parseInt(match[3], 10);

      // Convert month name to number
      const months: { [key: string]: number } = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
      };

      const month = months[monthStr];

      if (day && month && year) {
        return { day, month, year };
      }
    }
    return null;
  }

  // Handle DD/MM and MM/DD formats
  const separator = cleanDateStr.includes("/")
    ? "/"
    : cleanDateStr.includes("-")
    ? "-"
    : cleanDateStr.includes(".")
    ? "."
    : null;

  if (!separator) return null;

  const parts = cleanDateStr.split(separator);
  if (parts.length !== 3) return null;

  let day: number, month: number, year: number;

  if (
    format === "DD/MM" ||
    (format === "auto" && parseInt(parts[0], 10) > 12)
  ) {
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } else {
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
  }

  year = parseInt(parts[2], 10);

  // Handle 2-digit years
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }

  // Validate the date
  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { day, month, year };
}

/**
 * Formats a date object into the specified format
 * @param date The date object to format
 * @param format The desired output format
 * @returns The formatted date string
 */
export function formatDate(
  date: { day: number; month: number; year: number },
  format: "US_DATE" | "UK_DATE" | "ISO_DATE"
): string {
  if (!date) return "";

  const { day, month, year } = date;

  // Pad day and month with leading zeros if needed
  const dayStr = day.toString().padStart(2, "0");
  const monthStr = month.toString().padStart(2, "0");

  switch (format) {
    case "US_DATE":
      return `${monthStr}/${dayStr}/${year}`;
    case "UK_DATE":
      return `${dayStr}/${monthStr}/${year}`;
    case "ISO_DATE":
      return `${year}-${monthStr}-${dayStr}`;
    default:
      return "";
  }
}

/**
 * Converts a date string from one format to another
 * @param dateStr The date string to convert
 * @param sourceFormat The format of the input date string
 * @param targetFormat The desired output format
 * @returns The converted date string, or empty string if conversion fails
 */
export function convertDate(
  dateStr: string,
  sourceFormat: "DD/MM" | "MM/DD" | "DD MMM" | "auto",
  targetFormat: "US_DATE" | "UK_DATE" | "ISO_DATE"
): string {
  const parsedDate = parseDate(dateStr, sourceFormat);
  if (!parsedDate) return "";

  return formatDate(parsedDate, targetFormat);
}

/**
 * Standardizes a date string into all required formats
 * @param dateStr The date string to standardize
 * @param sourceFormat The format of the input date string
 * @returns An object containing the date in all standard formats
 */
export function standardizeDateFormats(
  dateStr: string,
  sourceFormat: "DD/MM" | "MM/DD" | "DD MMM" | "auto"
): { US_DATE: string; UK_DATE: string; ISO_DATE: string } {
  const parsedDate = parseDate(dateStr, sourceFormat);

  if (!parsedDate) {
    return {
      US_DATE: "",
      UK_DATE: "",
      ISO_DATE: "",
    };
  }

  return {
    US_DATE: formatDate(parsedDate, "US_DATE"),
    UK_DATE: formatDate(parsedDate, "UK_DATE"),
    ISO_DATE: formatDate(parsedDate, "ISO_DATE"),
  };
}

/**
 * Detects the most likely date format from a sample of date values
 * @param dateValues Array of date strings to analyze
 * @returns The detected format or "auto" if unable to determine
 */
export function detectDateFormat(
  dateValues: string[]
): "DD/MM" | "MM/DD" | "DD MMM" | "auto" {
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
  const dateRegex = /^(\d{1,2})([./-](\d{1,2}))[./-](\d{2,4})$/;
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
}
