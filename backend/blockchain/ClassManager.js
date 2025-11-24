// backend/blockchain/ClassManager.js

const ClassChain = require("./ClassChain");
const Block = require("./Block");
const { readJSON, writeJSON } = require("../database/storage");

const DB_PATH = "database/classes.json";

class ClassManager {
  /**
   * @param {DepartmentManager} departmentManager
   */
  constructor(departmentManager) {
    this.departmentManager = departmentManager;
    this.classes = new Map();

    this.loadFromDisk();
  }

  loadFromDisk() {
    const data = readJSON(DB_PATH, {});

    Object.keys(data).forEach((classId) => {
      const saved = data[classId];

      const chain = new ClassChain(
        saved.classId,
        saved.className,
        saved.departmentId,
        "0".repeat(64) // dummy, overridden
      );

      const rebuiltChain = saved.chain.map((b) => {
        const blk = new Block(
          b.index,
          b.timestamp,
          b.transactions,
          b.prev_hash
        );
        blk.nonce = b.nonce;
        blk.hash = b.hash;
        return blk;
      });

      chain.chain = rebuiltChain;
      this.classes.set(classId, chain);
    });
  }

  saveToDisk() {
    const obj = {};

    this.classes.forEach((chain, classId) => {
      obj[classId] = {
        classId: chain.classId,
        className: chain.className,
        departmentId: chain.departmentId,
        difficulty: chain.difficulty,
        chain: chain.chain,
      };
    });

    writeJSON(DB_PATH, obj);
  }

  createClass(classId, className, departmentId) {
    if (this.classes.has(classId)) {
      throw new Error(`Class ${classId} already exists`);
    }

    const deptChain = this.departmentManager.departments.get(departmentId);
    if (!deptChain) {
      throw new Error(
        `Department ${departmentId} not found for class ${classId}`
      );
    }

    const parentDeptLastHash = deptChain.getLatestBlock().hash;

    const chain = new ClassChain(
      classId,
      className,
      departmentId,
      parentDeptLastHash
    );
    this.classes.set(classId, chain);
    this.saveToDisk();

    return chain;
  }

  updateClass(classId, updates) {
    const chain = this.classes.get(classId);
    if (!chain) {
      throw new Error(`Class ${classId} not found`);
    }

    const tx = {
      type: "CLASS_UPDATE",
      classId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    chain.addBlock(tx);
    this.saveToDisk();

    return chain;
  }

  deleteClass(classId) {
    const chain = this.classes.get(classId);
    if (!chain) {
      throw new Error(`Class ${classId} not found`);
    }

    const tx = {
      type: "CLASS_DELETE",
      classId,
      status: "deleted",
      deletedAt: new Date().toISOString(),
    };

    chain.addBlock(tx);
    this.saveToDisk();

    return chain;
  }

  getClassState(classId) {
    const chain = this.classes.get(classId);
    if (!chain) return null;

    const latestBlock = chain.getLatestBlock();
    const tx = latestBlock.transactions;

    const state = {
      classId,
      className: tx.className || chain.className,
      departmentId: chain.departmentId,
      status: tx.status || "active",
      lastUpdatedAt: tx.updatedAt || tx.deletedAt || latestBlock.timestamp,
    };

    return state;
  }

  listClasses({ departmentId = null, includeDeleted = false } = {}) {
    const result = [];

    this.classes.forEach((chain, classId) => {
      const state = this.getClassState(classId);
      if (departmentId && state.departmentId !== departmentId) return;
      if (!includeDeleted && state.status === "deleted") return;
      result.push(state);
    });

    return result;
  }

  validateAllClassChains() {
    const results = [];

    this.classes.forEach((chain, classId) => {
      let isValid = true;

      // 1) Internal validation of the class chain
      if (!chain.isChainValid()) {
        isValid = false;
      } else {
        // 2) Parent department linkage validation
        const deptId = chain.departmentId;
        const deptChain = this.departmentManager.departments.get(deptId);

        // department must exist
        if (!deptChain) {
          isValid = false;
        } else {
          // department chain itself must be valid
          if (!deptChain.isChainValid()) {
            isValid = false;
          } else {
            // class genesis.prev_hash must match latest department hash
            const classGenesis = chain.chain[0];
            const deptLatestHash = deptChain.getLatestBlock().hash;

            if (classGenesis.prev_hash !== deptLatestHash) {
              isValid = false;
            }
          }
        }
      }

      results.push({ classId, isValid });
    });

    return results;
  }
}

module.exports = ClassManager;
