import { execSync } from 'child_process';
import cjs from 'rollup-plugin-commonjs';

const icons = [
  'btc',
  'eth',
  'xrp',
  'bch',
  'ltc',
  'eos',
  'bnb',
  'usdt',
  'xlm',
  'ada',
  'trx',
  'xmr',
  'dash',
  'bsv',
  'xtz'
];

for (const icon of icons) {
  execSync(`cp node_modules/cryptocurrency-icons/svg/color/${icon}.svg www/assets/${icon}.svg`)
}

execSync(`cp node_modules/custom-svg-iconset/src/custom-svg-iconset.js www/iconset.js`)

execSync('rm -f www/chunk-*.js');

export default [{
  input: 'src/slots.js',
  output: {
    dir: 'www',
    format: 'es'
  },
  plugins: [
    cjs()
  ]
}]
