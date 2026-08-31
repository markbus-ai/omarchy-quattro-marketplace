return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#060709",
        dark_bg    = "#050507",
        darker_bg  = "#030405",
        lighter_bg = "#1f2022",

        fg         = "#DCD6C4",
        dark_fg    = "#a5a193",
        light_fg   = "#e1dccd",
        bright_fg  = "#e5e0d3",
        muted      = "#5a5d63",

        red        = "#a39070",
        yellow     = "#f9f1b8",
        orange     = "#b1a185",
        green      = "#c3c395",
        cyan       = "#cde0a6",
        blue       = "#6b8666",
        purple     = "#c7a07d",
        brown      = "#6a6150",

        bright_red    = "#bda57c",
        bright_yellow = "#fef4ae",
        bright_green  = "#dadb9e",
        bright_cyan   = "#e2f9b1",
        bright_blue   = "#7c9d76",
        bright_purple = "#e6b486",

        accent               = "#6b8666",
        cursor               = "#DCD6C4",
        foreground           = "#DCD6C4",
        background           = "#060709",
        selection             = "#1f2022",
        selection_foreground = "#DCD6C4",
        selection_background = "#1f2022",
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
