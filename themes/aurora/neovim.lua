return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#030318",
        dark_bg    = "#020212",
        darker_bg  = "#02020c",
        lighter_bg = "#1c1c2f",

        fg         = "#FAD800",
        dark_fg    = "#bca200",
        light_fg   = "#fbde26",
        bright_fg  = "#fbe240",
        muted      = "#67686e",

        red        = "#d25548",
        yellow     = "#bc9a00",
        orange     = "#d96f63",
        green      = "#f7cb00",
        cyan       = "#6573ec",
        blue       = "#5f74e2",
        purple     = "#af53b4",
        brown      = "#82433b",

        bright_red    = "#ff7563",
        bright_yellow = "#e5c100",
        bright_green  = "#ffd700",
        bright_cyan   = "#8891ff",
        bright_blue   = "#8293ff",
        bright_purple = "#dd6ee9",

        accent               = "#5f74e2",
        cursor               = "#FAD800",
        foreground           = "#FAD800",
        background           = "#030318",
        selection             = "#1c1c2f",
        selection_foreground = "#FAD800",
        selection_background = "#1c1c2f",
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
