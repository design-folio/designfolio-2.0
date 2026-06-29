import nextConfig from "eslint-config-next/core-web-vitals";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["src/hooks/use-toast.js", "src/components/ui/scroll-area.jsx"],
  },
  ...nextConfig,
  ...tanstackQuery.configs["flat/recommended"],
  prettierConfig,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];
