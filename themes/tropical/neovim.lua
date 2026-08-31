return {
  {
    "omacom-io/aether.nvim",
    branch = "v3",
    name = "aether",
    priority = 1000,
    opts = {
      colors = {
        bg         = "#060217",
        dark_bg    = "#050211",
        darker_bg  = "#03010c",
        lighter_bg = "#1f1b2e",

        fg         = "#63E3B5",
        dark_fg    = "#4aaa88",
        light_fg   = "#7ae7c0",
        bright_fg  = "#8aeac8",
        muted      = "#68686e",

        red        = "#d45146",
        yellow     = "#ff954b",
        orange     = "#da6b62",
        green      = "#dd6b2f",
        cyan       = "#76b4ff",
        blue       = "#447edf",
        purple     = "#aa57b2",
        brown      = "#83403b",

        bright_red    = "#ff7161",
        bright_yellow = "#ffaf4a",
        bright_green  = "#ff8d3e",
        bright_cyan   = "#90d1ff",
        bright_blue   = "#659fff",
        bright_purple = "#d773e6",

        accent               = "#447edf",
        cursor               = "#63E3B5",
        foreground           = "#63E3B5",
        background           = "#060217",
        selection             = "#1f1b2e",
        selection_foreground = "#63E3B5",
        selection_background = "#1f1b2e",
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
