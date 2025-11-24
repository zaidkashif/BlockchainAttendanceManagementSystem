// backend/blockchain/Blockchain.js

const Block = require("./Block");

class Blockchain {
  /**
   * @param {string} name             - Logical name of the chain (e.g. "Department", "Class", "Student")
   * @param {number} difficulty       - PoW difficulty (# of leading zeros)
   * @param {string|null} parentLastHash - Hash from parent chain for genesis
   * @param {object|null} genesisTransactions - Custom payload for genesis block
   */
  constructor(
    name,
    difficulty = 4,
    parentLastHash = null,
    genesisTransactions = null
  ) {
    this.name = name;
    this.difficulty = difficulty;
    this.chain = [];

    const initialPrevHash = parentLastHash || "0".repeat(64); // default for independent chain

    const genesisBlock = this.createGenesisBlock(
      initialPrevHash,
      genesisTransactions
    );
    this.chain.push(genesisBlock);
  }

  /**
   * Create the genesis block.
   * For Department chain: parentLastHash is zeros + generic GENESIS tx.
   * For Class chain: parentLastHash = Department latest hash + class metadata.
   * For Student chain: parentLastHash = Class latest hash + student metadata.
   *
   * @param {string} parentLastHash
   * @param {object|null} customTx
   * @returns {Block}
   */
  createGenesisBlock(parentLastHash, customTx) {
    const defaultTx = {
      system: true,
      type: "GENESIS",
      chainName: this.name,
      note: `${this.name} chain genesis block`,
    };

    const genesisTx = customTx || defaultTx;

    const genesisBlock = new Block(
      0,
      new Date().toISOString(),
      genesisTx,
      parentLastHash
    );

    genesisBlock.mineBlock(this.difficulty);

    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new block with given transactions.
   *
   * @param {object|array} transactions
   * @returns {Block}
   */
  addBlock(transactions) {
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const prev_hash = this.getLatestBlock().hash;

    const newBlock = new Block(index, timestamp, transactions, prev_hash);
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);

    return newBlock;
  }

  /**
   * Validate integrity of this chain.
   */
  isChainValid() {
    const targetPrefix = "0".repeat(this.difficulty);

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        console.error(
          `[${this.name}] Invalid hash at index ${currentBlock.index}`
        );
        return false;
      }

      if (currentBlock.prev_hash !== previousBlock.hash) {
        console.error(
          `[${this.name}] Invalid prev_hash at index ${currentBlock.index}`
        );
        return false;
      }

      if (!currentBlock.hash.startsWith(targetPrefix)) {
        console.error(
          `[${this.name}] PoW violation at index ${currentBlock.index}`
        );
        return false;
      }
    }

    return true;
  }

  toJSON() {
    return {
      name: this.name,
      difficulty: this.difficulty,
      chain: this.chain,
    };
  }
}

module.exports = Blockchain;
