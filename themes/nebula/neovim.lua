return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#06080C",
        dark_bg    = "#050609",
        darker_bg  = "#030406",
        lighter_bg = "#1f2124",

        fg         = "#D2A7B4",
        dark_fg    = "#9e7d87",
        light_fg   = "#d9b4bf",
        bright_fg  = "#ddbdc7",
        muted      = "#5c5f64",

        red        = "#a28ea6",
        yellow     = "#ffe2fe",
        orange     = "#b09fb3",
        green      = "#aec5e5",
        cyan       = "#cad9ff",
        blue       = "#7f7c9b",
        purple     = "#b4a4ca",
        brown      = "#6a5f6b",

        bright_red    = "#bba1c0",
        bright_yellow = "#ffdeff",
        bright_green  = "#bedcff",
        bright_cyan   = "#ddefff",
        bright_blue   = "#9490b7",
        bright_purple = "#ccb7e8",

        accent               = "#7f7c9b",
        cursor               = "#D2A7B4",
        foreground           = "#D2A7B4",
        background           = "#06080C",
        selection             = "#1f2124",
        selection_foreground = "#D2A7B4",
        selection_background = "#1f2124",
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
