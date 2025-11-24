// backend/blockchain/utils.js

const crypto = require("crypto");

/**
 * Compute SHA-256 hash of a given string.
 * @param {string} data
 * @returns {string} hex-encoded hash
 */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

module.exports = {
  sha256,
};
