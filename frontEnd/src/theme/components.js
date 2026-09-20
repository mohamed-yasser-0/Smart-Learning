const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: "10px 20px",
        boxShadow: "none",
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: "outlined",
      fullWidth: true,
    },
  },
};

export default components;