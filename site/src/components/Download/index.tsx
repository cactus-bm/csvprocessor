import React, { useState } from "react";
import styled from "styled-components";
import { useCSV } from "../../context/CSVContext";
import { generateCSV } from "../../services/csvService";

const DownloadContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const DownloadButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark-color);
  }

  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

const DownloadInfo = styled.p`
  margin-top: 1rem;
  color: var(--text-secondary-color);
`;

interface DownloadProps {
  onDownloadComplete: () => void;
}

const Download: React.FC<DownloadProps> = ({ onDownloadComplete }) => {
  const { processedData } = useCSV();
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Generate a filename for the downloaded CSV
   * Format: original_filename_processed_YYYY-MM-DD.csv
   */
  const generateFilename = (): string => {
    // Get current date in YYYY-MM-DD format
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];

    // Use a generic filename since we don't store the original filename
    const originalFilename = "csv_data";

    return `${originalFilename}_processed_${dateStr}.csv`;
  };

  /**
   * Handle the download button click
   * Generates CSV content and triggers download
   */
  const handleDownload = () => {
    if (!processedData || processedData.length === 0) {
      return;
    }

    setIsDownloading(true);

    try {
      // Generate CSV content
      const csvContent = generateCSV(processedData);

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", generateFilename());

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      // Call the onDownloadComplete callback to show success message
      onDownloadComplete();
    } catch (error) {
      console.error("Error generating or downloading CSV:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const isDownloadDisabled =
    !processedData || processedData.length === 0 || isDownloading;

  return (
    <DownloadContainer>
      <DownloadButton onClick={handleDownload} disabled={isDownloadDisabled}>
        {isDownloading ? "Generating..." : "Download Processed CSV"}
      </DownloadButton>
      <DownloadInfo>
        Download will include all original columns plus US Date, UK Date, ISO
        Date, and Clean Amount
      </DownloadInfo>
    </DownloadContainer>
  );
};

export default Download;
