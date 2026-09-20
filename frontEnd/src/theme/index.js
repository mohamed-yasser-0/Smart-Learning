import { createTheme } from "@mui/material/styles";

import lightPalette from "./lightPalette";
import darkPalette from "./darkPalette";
import typography from "./typography";
import components from "./components";


const getTheme = (mode) => {
  return createTheme({

    palette: mode === "light"
      ? lightPalette
      : darkPalette,

    typography,

    components,

    spacing: 8,

    shape: {
      borderRadius: 12,
    },

  });
};


export default getTheme;