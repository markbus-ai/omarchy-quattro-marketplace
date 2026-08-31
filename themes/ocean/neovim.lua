return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#0c0113",
        dark_bg    = "#09010e",
        darker_bg  = "#06010a",
        lighter_bg = "#241a2b",

        fg         = "#D2E3E9",
        dark_fg    = "#9eaaaf",
        light_fg   = "#d9e7ec",
        bright_fg  = "#ddeaef",
        muted      = "#6b676d",

        red        = "#c05f3c",
        yellow     = "#8e861d",
        orange     = "#c97759",
        green      = "#7cc481",
        cyan       = "#7de0a2",
        blue       = "#5979c3",
        purple     = "#af59bf",
        brown      = "#794735",

        bright_red    = "#ef8052",
        bright_yellow = "#b3ad05",
        bright_green  = "#93e88e",
        bright_cyan   = "#65f596",
        bright_blue   = "#7a9bf9",
        bright_purple = "#dc75f6",

        accent               = "#5979c3",
        cursor               = "#D2E3E9",
        foreground           = "#D2E3E9",
        background           = "#0c0113",
        selection             = "#241a2b",
        selection_foreground = "#D2E3E9",
        selection_background = "#241a2b",
      },
    },
  },
  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = "aether",
    },
  },
}
