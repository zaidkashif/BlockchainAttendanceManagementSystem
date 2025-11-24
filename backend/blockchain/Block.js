// backend/blockchain/Block.js

const { sha256 } = require("./utils");

/**
 * Represents a single block in any of our chains
 * (Department, Class, Student, Attendance).
 */
class Block {
  /**
   * @param {number} index        - Position of the block in the chain
   * @param {string} timestamp    - ISO timestamp string
   * @param {object|array} transactions - Payload (attendance or metadata)
   * @param {string} prev_hash    - Hash of previous block
   */
  constructor(index, timestamp, transactions, prev_hash = "") {
    this.index = index;
    this.timestamp = timestamp || new Date().toISOString();
    this.transactions = transactions; // can be object or array
    this.prev_hash = prev_hash;

    this.nonce = 0; // will be changed during mining
    this.hash = this.calculateHash(); // initial hash before mining
  }

  /**
   * Recalculate SHA-256 hash of this block based on:
   * - timestamp
   * - transactions (stringified)
   * - prev_hash
   * - nonce
   */
  calculateHash() {
    const dataToHash =
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.prev_hash +
      this.nonce;

    return sha256(dataToHash);
  }

  /**
   * Proof of Work:
   * Keep changing `nonce` until hash starts with `difficulty` zeros.
   * difficulty = 4  => hash must start with "0000"
   *
   * @param {number} difficulty
   */
  mineBlock(difficulty) {
    const targetPrefix = "0".repeat(difficulty);

    // keep changing nonce until hash meets target
    while (!this.hash.startsWith(targetPrefix)) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }

    console.log(
      `Block mined: index=${this.index}, nonce=${this.nonce}, hash=${this.hash}`
    );
  }
}

module.exports = Block;
