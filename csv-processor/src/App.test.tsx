import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { CSVProvider } from "./context/CSVContext";

test("renders CSV processor app", () => {
  render(
    <CSVProvider>
      <App />
    </CSVProvider>
  );
  // Look for file upload text instead of "learn react"
  const uploadElement = screen.getByText(/drag and drop a csv file here/i);
  expect(uploadElement).toBeInTheDocument();
});
