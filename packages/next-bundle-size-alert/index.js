const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const formatBytes = require('./format-bytes');

const DEFAULT_ERROR = 204800;
const DEFAULT_WARNING = 163840;

const ALERT_ERROR_SIZE = parseInt(process.env.ALERT_ERROR_SIZE || DEFAULT_ERROR);
const ALERT_WARNING_SIZE = parseInt(process.env.ALERT_WARNING_SIZE || DEFAULT_WARNING);

const pathToNextPackage = path.join(process.cwd(), '.next');
const buildManifestPath = path.join(pathToNextPackage, 'build-manifest.json');
const bundle = JSON.parse(fs.readFileSync(buildManifestPath));

const pageSizes = Object.keys(bundle.pages).map(p => {
  const files = bundle.pages[p];
  const size = files
    .map(filename => {
      const fn = path.join(pathToNextPackage, filename);
      const bytes = fs.readFileSync(fn);
      const gzipped = zlib.gzipSync(bytes);

      return gzipped.byteLength;
    })
    .reduce((s, b) => s + b, 0);

  return { path: p, size: size };
});

const warnings = [];
const errors = [];
pageSizes.forEach(({ path, size }) => {
  if (size >= ALERT_ERROR_SIZE) {
    errors.push(`Error: Page ${path} has bundle size ${formatBytes(size)} more than ${formatBytes(ALERT_ERROR_SIZE)}`);
  }

  if (size >= ALERT_WARNING_SIZE) {
    warnings.push(`Warning: Page ${path} has bundle size ${formatBytes(size)} more than ${formatBytes(ALERT_WARNING_SIZE)}`)
  }
});

console.log('ALERT_ERROR_SIZE', formatBytes(ALERT_ERROR_SIZE))
console.log('ALERT_WARNING_SIZE', formatBytes(ALERT_WARNING_SIZE))

warnings.forEach((msg) => {
  console.warn(msg);
});

errors.forEach((msg) => {
  console.error(msg);
});

if (errors.length) {
  throw new Error('Bundle size error');
}