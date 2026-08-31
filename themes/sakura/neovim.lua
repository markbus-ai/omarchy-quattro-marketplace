return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#140202",
        dark_bg    = "#0f0202",
        darker_bg  = "#0a0101",
        lighter_bg = "#2c1b1b",

        fg         = "#FADAA3",
        dark_fg    = "#bca47a",
        light_fg   = "#fbe0b1",
        bright_fg  = "#fbe3ba",
        muted      = "#635c5b",

        red        = "#c37f6c",
        yellow     = "#ffd896",
        orange     = "#cc9282",
        green      = "#f2b072",
        cyan       = "#ffcb62",
        blue       = "#af6376",
        purple     = "#eb898a",
        brown      = "#7a584e",

        bright_red    = "#e48f78",
        bright_yellow = "#ffd480",
        bright_green  = "#ffc16d",
        bright_cyan   = "#ffde54",
        bright_blue   = "#ce7189",
        bright_purple = "#ff9497",

        accent               = "#af6376",
        cursor               = "#FADAA3",
        foreground           = "#FADAA3",
        background           = "#140202",
        selection             = "#2c1b1b",
        selection_foreground = "#FADAA3",
        selection_background = "#2c1b1b",
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
