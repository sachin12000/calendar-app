/**
 * creaes a custom theme for the app
 */
import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import {  PaletteOptions, TypeBackground, TypeText } from '@mui/material';
import { grey, green, red } from "@mui/material/colors";

declare module '@mui/material/styles' {
    interface CustomTheme extends Theme {
    }

    interface CustomTextTheme extends Partial<TypeText> {
      ok: string
      error: string
    }

    interface CustomBackgroundTheme extends Partial<TypeBackground> {
      light: string
    }

    interface CustomPalette extends PaletteOptions {
      text: CustomTextTheme,
      background: CustomBackgroundTheme
      border: {
        primary: string
        error: string
      },
      icon: {
        primary: string,
        ok: string,
        error: string
      },
      hover: {
        primary: string
      }
    }

    // allow configuration using `createTheme`
    interface CustomThemeOptions extends ThemeOptions {
      palette: CustomPalette
    }
    export function createTheme(options?: CustomThemeOptions): Theme;
  }

  export default createTheme({
    palette: {
      text: {
        ok: green[700],
        error: red[700] // error.main color
      },
      background: {
        light: grey[100]
      },
      border: {
        primary: grey[300],
        error: red[700] // error.main color
      },
      icon: {
        primary: "primary",
        ok: green[700],
        error: red[700]
      },
      hover: {
        primary: grey[200]
      }
    },
    components: {
      MuiToolbar: {
        styleOverrides: {
          root: {
            height: '2rem',
            '@media (min-width: 600px)': {
              minHeight: "3rem"
            }
          }
        }
      }
    }
  });