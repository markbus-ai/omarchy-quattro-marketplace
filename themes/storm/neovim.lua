return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#030303",
        dark_bg    = "#020202",
        darker_bg  = "#020202",
        lighter_bg = "#1c1c1c",

        fg         = "#d7d7d7",
        dark_fg    = "#a1a1a1",
        light_fg   = "#dddddd",
        bright_fg  = "#e1e1e1",
        muted      = "#64625c",

        red        = "#939393",
        yellow     = "#eeeeee",
        orange     = "#a3a3a3",
        green      = "#bfbfbf",
        cyan       = "#d7d7d7",
        blue       = "#7d7d7d",
        purple     = "#a9a9a9",
        brown      = "#626262",

        bright_red    = "#a5a5a5",
        bright_yellow = "#f5f5f5",
        bright_green  = "#d3d3d3",
        bright_cyan   = "#eaeaea",
        bright_blue   = "#8f8f8f",
        bright_purple = "#bcbcbc",

        accent               = "#7d7d7d",
        cursor               = "#d7d7d7",
        foreground           = "#d7d7d7",
        background           = "#030303",
        selection             = "#1c1c1c",
        selection_foreground = "#d7d7d7",
        selection_background = "#1c1c1c",
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
