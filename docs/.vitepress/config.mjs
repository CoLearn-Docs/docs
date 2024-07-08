import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  outDir: "./dist",
  title: "CoLearn Docs",
  description: "CoLearn Docs",
  cleanUrls: true,
  markdown: {
    lineNumbers: true,
  },
  /* prettier-ignore */
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: { src: "/vitepress-logo-mini.svg", width: 24, height: 24 },
    nav: [
      { text: "Guide", link: "/guide/essentials/" },
      { text: "Changelog", link: "/changelog/" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/essentials/" },
            // { text: "Quickstart", link: "/guide/essentials/quickstart" },
          ],
        },
        {
          text: "Essentials",
          items: [
            {
              text: "Protocol: RSSP",
              link: "/guide/essentials/protocol-rssp",
            },
            {
              text: "API (Service)",
              link: "/guide/essentials/api-service",
            },
            {
              text: "API (Admin)",
              link: "/guide/essentials/api-administrator",
            },
            {
              text: "Conclusions",
              link: "/guide/essentials/conclusion",
            },
          ],
        },
        {
          text: "Examples",
          items: [
            {
              text: "Protocol",
              link: "/guide/examples/protocol",
            },
            {
              text: "Broadcast",
              link: "/guide/examples/broadcast",
            },
            {
              text: "Control",
              link: "/guide/examples/control",
            }
          ],
        },
      ],
      "/changelog": [
        {
          items: [
            { text: "✨ 최근 업데이트 내역", link: "/changelog" },
            { text: "2024-07-08", link: "/changelog/2024-07-08" },
            { text: "2024-07-01", link: "/changelog/2024-07-01" },
          ],
        },
      ]
    },

    socialLinks: [{ icon: "github", link: "https://github.com/CoLearn-Docs" }],

    search: {
      provider: "local",
    },
    editLink: false,
  },
});
