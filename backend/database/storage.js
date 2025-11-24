// backend/database/storage.js

const fs = require("fs");
const path = require("path");

/**
 * Safely read a JSON file. If file does not exist, return defaultValue.
 *
 * @param {string} relativePath - path relative to backend root, e.g. 'database/departments.json'
 * @param {any} defaultValue
 * @returns {any}
 */
function readJSON(relativePath, defaultValue) {
  try {
    const fullPath = path.join(__dirname, "..", relativePath);
    if (!fs.existsSync(fullPath)) {
      return defaultValue;
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading JSON file ${relativePath}`, err);
    return defaultValue;
  }
}

/**
 * Write data as pretty JSON to file.
 *
 * @param {string} relativePath
 * @param {any} data
 */
function writeJSON(relativePath, data) {
  try {
    const fullPath = path.join(__dirname, "..", relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing JSON file ${relativePath}`, err);
  }
}

module.exports = {
  readJSON,
  writeJSON,
};
