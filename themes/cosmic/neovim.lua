return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#010025",
        dark_bg    = "#01001c",
        darker_bg  = "#010013",
        lighter_bg = "#1a1a3b",

        fg         = "#E1E5FC",
        dark_fg    = "#a9acbd",
        light_fg   = "#e6e9fc",
        bright_fg  = "#e9ecfd",
        muted      = "#595b61",

        red        = "#af80b1",
        yellow     = "#ffcbff",
        orange     = "#bb93bd",
        green      = "#97c0ff",
        cyan       = "#bdcfff",
        blue       = "#8071b3",
        purple     = "#bf93e2",
        brown      = "#705871",

        bright_red    = "#cc90cf",
        bright_yellow = "#ffc4ff",
        bright_green  = "#a1d6ff",
        bright_cyan   = "#cee3ff",
        bright_blue   = "#9683d4",
        bright_purple = "#dba3ff",

        accent               = "#8071b3",
        cursor               = "#E1E5FC",
        foreground           = "#E1E5FC",
        background           = "#010025",
        selection             = "#1a1a3b",
        selection_foreground = "#E1E5FC",
        selection_background = "#1a1a3b",
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
