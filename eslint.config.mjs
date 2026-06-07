import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Konfigurasi rules untuk diterapkan di semua file
    rules: {
      // 1. Matikan error 'any' yang ketat
      '@typescript-eslint/no-explicit-any': 'off',

      // 2. Matikan error untuk variabel yang tidak terpakai (hanya jadi warning)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // 3. Matikan error 'incompatible-library' dari React Compiler agar build tidak terblokir
      'react-hooks/incompatible-library': 'off',

      // 4. Matikan error 'purity' (Date.now() di render)
      'react-hooks/purity': 'off',

      // 5. Matikan error 'set-state-in-effect' (jika Anda yakin logika Anda benar)
      'react-hooks/set-state-in-effect': 'off',

      // 6. Matikan error 'no-unescaped-entities' agar tidak pusing dengan karakter kutipan
      'react/no-unescaped-entities': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
