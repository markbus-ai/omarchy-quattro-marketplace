return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#000000",
        dark_bg    = "#000000",
        darker_bg  = "#000000",
        lighter_bg = "#1a1a1a",

        fg         = "#f4f4f4",
        dark_fg    = "#b7b7b7",
        light_fg   = "#f6f6f6",
        bright_fg  = "#f7f7f7",
        muted      = "#686163",

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
        cursor               = "#f4f4f4",
        foreground           = "#f4f4f4",
        background           = "#000000",
        selection             = "#1a1a1a",
        selection_foreground = "#f4f4f4",
        selection_background = "#1a1a1a",
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
