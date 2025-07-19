import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #4a90e2;
    --secondary-color: #50e3c2;
    --error-color: #e74c3c;
    --success-color: #2ecc71;
    --text-color: #333333;
    --background-color: #ffffff;
    --border-color: #dddddd;
    --hover-color: #f5f5f5;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--text-color);
    background-color: var(--background-color);
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
  }

  button, input, select {
    font-family: inherit;
    font-size: 1rem;
  }

  button {
    cursor: pointer;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: darken(var(--primary-color), 10%);
    }

    &:disabled {
      background-color: var(--border-color);
      cursor: not-allowed;
    }
  }
`;

export default GlobalStyles;