const k = 1024;
const dm = 2;
const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

function formatBytes(bytes, signed = false) {
  const sign = signed ? (bytes < 0 ? "-" : "+") : "";
  if (bytes === 0) {
    return `${sign}0B`;
  }

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${sign}${parseFloat(Math.abs(bytes / Math.pow(k, i)).toFixed(dm))}${
    sizes[i]
  }`;
}

module.exports = formatBytes;