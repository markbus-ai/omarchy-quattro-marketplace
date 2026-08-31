return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#070707",
        dark_bg    = "#050505",
        darker_bg  = "#040404",
        lighter_bg = "#202020",

        fg         = "#B4B3B3",
        dark_fg    = "#878686",
        light_fg   = "#bfbebe",
        bright_fg  = "#c7c6c6",
        muted      = "#5f5d57",

        red        = "#c7807a",
        yellow     = "#ffd6a7",
        orange     = "#cf938e",
        green      = "#fcaf7f",
        cyan       = "#ffc76e",
        blue       = "#ae6685",
        purple     = "#ec8b9d",
        brown      = "#7c5855",

        bright_red    = "#e98f89",
        bright_yellow = "#ffce93",
        bright_green  = "#ffbe7f",
        bright_cyan   = "#ffd865",
        bright_blue   = "#cd759c",
        bright_purple = "#ff96af",

        accent               = "#ae6685",
        cursor               = "#B4B3B3",
        foreground           = "#B4B3B3",
        background           = "#070707",
        selection             = "#202020",
        selection_foreground = "#B4B3B3",
        selection_background = "#202020",
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
