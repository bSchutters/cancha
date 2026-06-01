import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

// eslint-config-next 16 ships native flat configs (no more FlatCompat needed).
const eslintConfig = [...coreWebVitals, ...typescript]

export default eslintConfig
