import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'lib/render-engine.cjs.js'
    },
    {
      format: 'es',
      file: 'lib/render-engine.esm.js'
    }
  ],
  plugins: [typescript()]
}
