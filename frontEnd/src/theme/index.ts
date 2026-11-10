import { createTheme } from "@mui/material/styles";

import lightPalette from "./lightPalette";
import darkPalette from "./darkPalette";
import typography from "./typography";
import components from "./components";

const getTheme = (mode: string) => {
  return createTheme({
    palette: mode === "Dark" ? darkPalette : lightPalette,

    typography,

    components,

    spacing: 8,

    shape: {
      borderRadius: 12,
    },
  });
};

export default getTheme;
