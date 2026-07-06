import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2563eb",
            dark: "#1d4ed8",
            light: "#60a5fa",
        },
        secondary: {
            main: "#64748b",
        },
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
        },
        text: {
            primary: "#0f172a",
            secondary: "#64748b",
        },
        error: {
            main: "#dc2626",
        },
        success: {
            main: "#16a34a",
        },
        warning: {
            main: "#f59e0b",
        },
    },

    shape: {
        borderRadius: 12,
    },

    typography: {
        fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 700,
        },
        button: {
            textTransform: "none",
            fontWeight: 600,
        },
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#f8fafc",
                },
                "*": {
                    boxSizing: "border-box",
                },
            },
        },

        MuiContainer: {
            defaultProps: {
                maxWidth: "lg",
            },
            styleOverrides: {
                root: {
                    paddingLeft: "16px",
                    paddingRight: "16px",
                },
            },
        },

        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                },
            },
        },

        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: "10px",
                    minHeight: "42px",
                    textTransform: "none",

                    "&.MuiButton-contained.MuiButton-colorPrimary": {
                        backgroundColor: "#2563eb",

                        "&:hover": {
                            backgroundColor: "#1d4ed8",
                        },
                    },
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                fullWidth: true,
                size: "small",
                margin: "dense",
                variant: "outlined",
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                },
            },
        },

        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#64748b",
                },
            },
        },

        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    marginLeft: 0,
                    minHeight: "20px",
                },
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: "12px",
                },
            },
        },

        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    borderBottom: "1px solid #e2e8f0",
                },
            },
        },
    },
});