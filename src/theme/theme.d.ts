import type {} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    chrome: {
      sidebar: string;
      sidebarText: string;
      sidebarMuted: string;
      sidebarHover: string;
      sidebarBorder: string;
      appbar: string;
      input: string;
      hover: string;
      borderStrong: string;
    };
  }

  interface PaletteOptions {
    chrome?: {
      sidebar: string;
      sidebarText: string;
      sidebarMuted: string;
      sidebarHover: string;
      sidebarBorder: string;
      appbar: string;
      input: string;
      hover: string;
      borderStrong: string;
      signoutBtnHover:string;
    };
  }
}
