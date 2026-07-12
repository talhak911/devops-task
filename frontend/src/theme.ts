import { createTheme } from "@mui/material/styles";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { 
        main: mode === "dark" ? "#F5F5F5" : "#282828", 
        contrastText: mode === "dark" ? "#121212" : "#FFFFFF" 
      },
      secondary: { 
        main: mode === "dark" ? "#E5D85C" : "#C3B212",
        contrastText: "#000000"
      },
      error: { main: "#D32F2F" },
      warning: { main: "#ED6C02" },
      info: { main: "#0288D1" },
      success: { main: "#2E7D32" },
      background: {
        default: mode === "dark" ? "#121212" : "#FEFEFE",
        paper: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#F5F5F5" : "#282828",
        secondary: mode === "dark" ? "#CCCCCC" : "#4A4A4A",
      },
      divider: mode === "dark" ? "#333333" : "#E0E0E0",
    },
    typography: {
      fontFamily: "'Montserrat', sans-serif",
      h1: { fontFamily: "'Prosto One', sans-serif", fontWeight: 400 },
      h2: { fontFamily: "'Prosto One', sans-serif", fontWeight: 400 },
      h3: { fontFamily: "'Prosto One', sans-serif", fontWeight: 400 },
      h4: { fontFamily: "'Prosto One', sans-serif", fontWeight: 400 },
      h5: { fontFamily: "'Prosto One', sans-serif", fontWeight: 400 },
      h6: { fontFamily: "'Prosto One', sans-serif", fontWeight: 400 },
      button: { fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1px" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            boxShadow: "none",
            fontFamily: "'Montserrat', sans-serif",
            "&:hover": { 
              boxShadow: "none",
            },
          },
          contained: {
            "&:hover": {
              backgroundColor: mode === "dark" ? "#FFFFFF" : "#404040", // Subtle change or same
              color: mode === "dark" ? "#121212" : "#FFFFFF",
            }
          },
          outlined: {
            "&:hover": {
              backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(40,40,40,0.05)",
            }
          }
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: "16px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: "16px" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: "50px" },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 600 },
        },
      },
    },
  });

export default getTheme;
