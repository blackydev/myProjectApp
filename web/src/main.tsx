import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import App from './App'
import { createTheme, ThemeProvider, CssBaseline, Paper } from "@mui/material";
import { grey, purple } from '@mui/material/colors';
import "./styles/main.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
    main: purple[500],
    },
    secondary: {
      main: grey[900],
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={App} />
    </ThemeProvider>
  </React.StrictMode>,
)
