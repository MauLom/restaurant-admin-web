import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
        margin: 0,
        padding: 0,
        backgroundColor: "#1c1c1c",
        color: "#fff",
        fontFamily: "'Arial', sans-serif",
      },
      ".logo": {
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#fff",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _focus: {
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
