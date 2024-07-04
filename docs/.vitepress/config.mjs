import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
      { text: "Guide", link: "/guide/" },
      { text: "Changelog", link: "/changelog/" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/" },
            // { text: "Quickstart", link: "/guide/quickstart" },
          ],
        },
        {
          text: "Essentials",
          items: [
            {
              text: "Protocol",
              link: "/guide/protocol-rssp",
            },
            {
              text: "API (Service)",
              link: "/guide/api-service",
            },
            {
              text: "API (Admin)",
              link: "/guide/api-administrator",
            },
            {
              text: "Conclusions",
              link: "/guide/conclusion",
            },
          ],
        },
      ],
      "/changelog": [
        {
          items: [
            { text: "✨ 최근 업데이트 내역", link: "/changelog" },
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
