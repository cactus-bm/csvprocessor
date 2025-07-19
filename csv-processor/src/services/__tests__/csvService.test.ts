import { parseCSV, detectDelimiter } from '../csvService';

describe('CSV Service', () => {
  describe('detectDelimiter', () => {
    it('should detect comma as delimiter', () => {
      const csvString = 'header1,header2,header3\nvalue1,value2,value3';
      expect(detectDelimiter(csvString)).toBe(',');
    });

    it('should detect semicolon as delimiter', () => {
      const csvString = 'header1;header2;header3\nvalue1;value2;value3';
      expect(detectDelimiter(csvString)).toBe(';');
    });

    it('should detect tab as delimiter', () => {
      const csvString = 'header1\theader2\theader3\nvalue1\tvalue2\tvalue3';
      expect(detectDelimiter(csvString)).toBe('\t');
    });

    it('should detect pipe as delimiter', () => {
      const csvString = 'header1|header2|header3\nvalue1|value2|value3';
      expect(detectDelimiter(csvString)).toBe('|');
    });

    it('should default to comma when no delimiter is found', () => {
      const csvString = 'header1header2header3\nvalue1value2value3';
      expect(detectDelimiter(csvString)).toBe(',');
    });

    it('should default to comma when input is empty', () => {
      expect(detectDelimiter('')).toBe(',');
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV string with comma delimiter', () => {
      const csvString = 'header1,header2,header3\nvalue1,value2,value3';
      const result = parseCSV(csvString);
      expect(result.rawText).toBe(csvString);
      expect(result.rows).toEqual([
        ['header1', 'header2', 'header3'],
        ['value1', 'value2', 'value3']
      ]);
    });

    it('should parse CSV string with custom delimiter', () => {
      const csvString = 'header1;header2;header3\nvalue1;value2;value3';
      const result = parseCSV(csvString, { delimiter: ';' });
      expect(result.rows).toEqual([
        ['header1', 'header2', 'header3'],
        ['value1', 'value2', 'value3']
      ]);
    });

    it('should handle quoted values', () => {
      const csvString = 'header1,header2,header3\n"value, with comma",value2,value3';
      const result = parseCSV(csvString);
      expect(result.rows).toEqual([
        ['header1', 'header2', 'header3'],
        ['value, with comma', 'value2', 'value3']
      ]);
    });

    it('should handle empty lines', () => {
      const csvString = 'header1,header2,header3\n\nvalue1,value2,value3\n\n';
      const result = parseCSV(csvString);
      expect(result.rows).toEqual([
        ['header1', 'header2', 'header3'],
        ['value1', 'value2', 'value3']
      ]);
    });

    it('should throw error for empty input', () => {
      expect(() => parseCSV('')).toThrow('CSV string is empty');
    });

    it('should throw error when no valid data is found', () => {
      expect(() => parseCSV(',,,')).toThrow('No valid data found in CSV');
    });

    it('should auto-detect delimiter when not specified', () => {
      const csvString = 'header1;header2;header3\nvalue1;value2;value3';
      const result = parseCSV(csvString);
      expect(result.rows).toEqual([
        ['header1', 'header2', 'header3'],
        ['value1', 'value2', 'value3']
      ]);
    });

    it('should handle different quote characters', () => {
      const csvString = "header1,header2,header3\n'value, with comma',value2,value3";
      const result = parseCSV(csvString, { quoteChar: "'" });
      expect(result.rows).toEqual([
        ['header1', 'header2', 'header3'],
        ['value, with comma', 'value2', 'value3']
      ]);
    });
  });
});