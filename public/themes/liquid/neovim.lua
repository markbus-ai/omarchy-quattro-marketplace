return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#11100C",
        dark_bg    = "#0d0c09",
        darker_bg  = "#090806",
        lighter_bg = "#292824",

        fg         = "#DEF1F4",
        dark_fg    = "#a7b5b7",
        light_fg   = "#e3f3f6",
        bright_fg  = "#e6f5f7",
        muted      = "#6b6a63",

        red        = "#b46f38",
        yellow     = "#c69647",
        orange     = "#bf8556",
        green      = "#b27731",
        cyan       = "#60bdee",
        blue       = "#667dcb",
        purple     = "#6f76c6",
        brown      = "#735034",

        bright_red    = "#e09249",
        bright_yellow = "#f1bc50",
        bright_green  = "#dd9b3c",
        bright_cyan   = "#77dcff",
        bright_blue   = "#889eff",
        bright_purple = "#9397fd",

        accent               = "#667dcb",
        cursor               = "#DEF1F4",
        foreground           = "#DEF1F4",
        background           = "#11100C",
        selection             = "#292824",
        selection_foreground = "#DEF1F4",
        selection_background = "#292824",
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
