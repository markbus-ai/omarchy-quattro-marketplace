return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#020003",
        dark_bg    = "#020002",
        darker_bg  = "#010002",
        lighter_bg = "#1b1a1c",

        fg         = "#9BF5F8",
        dark_fg    = "#74b8ba",
        light_fg   = "#aaf7f9",
        bright_fg  = "#b4f8fa",
        muted      = "#69656a",

        red        = "#d44109",
        yellow     = "#ec773e",
        orange     = "#da5e2e",
        green      = "#ffac74",
        cyan       = "#86b9ff",
        blue       = "#6797ff",
        purple     = "#d400e6",
        brown      = "#83381c",

        bright_red    = "#ff6222",
        bright_yellow = "#ff994e",
        bright_green  = "#ffb152",
        bright_cyan   = "#9dd3ff",
        bright_blue   = "#89b9ff",
        bright_purple = "#fd4aff",

        accent               = "#6797ff",
        cursor               = "#9BF5F8",
        foreground           = "#9BF5F8",
        background           = "#020003",
        selection             = "#1b1a1c",
        selection_foreground = "#9BF5F8",
        selection_background = "#1b1a1c",
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
