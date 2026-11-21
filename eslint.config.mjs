import next from "eslint-config-next/core-web-vitals"

const config = [
  ...next,
  { ignores: [".next/**", ".contentlayer/**", "out/**", "coverage/**", "next-env.d.ts"] },
]

export default config
