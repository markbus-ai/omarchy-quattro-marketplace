return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#0b011b",
        dark_bg    = "#080114",
        darker_bg  = "#06010e",
        lighter_bg = "#231a32",

        fg         = "#ffb6ff",
        dark_fg    = "#bf89bf",
        light_fg   = "#ffc1ff",
        bright_fg  = "#ffc8ff",
        muted      = "#5e5c62",

        red        = "#aa81b7",
        yellow     = "#ffccff",
        orange     = "#b794c2",
        green      = "#8ec3ff",
        cyan       = "#b0d3ff",
        blue       = "#7974b6",
        purple     = "#b796e8",
        brown      = "#6e5974",

        bright_red    = "#c592d5",
        bright_yellow = "#ffc6ff",
        bright_green  = "#94daff",
        bright_cyan   = "#bee8ff",
        bright_blue   = "#8d86d8",
        bright_purple = "#d1a6ff",

        accent               = "#7974b6",
        cursor               = "#ffb6ff",
        foreground           = "#ffb6ff",
        background           = "#0b011b",
        selection             = "#231a32",
        selection_foreground = "#ffb6ff",
        selection_background = "#231a32",
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
