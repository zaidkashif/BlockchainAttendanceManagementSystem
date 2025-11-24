// backend/blockchain/DepartmentManager.js

const DepartmentChain = require("./DepartmentChain");
const Block = require("./Block");
const { readJSON, writeJSON } = require("../database/storage");

const DB_PATH = "database/departments.json";

class DepartmentManager {
  constructor() {
    // Map: departmentId -> DepartmentChain instance
    this.departments = new Map();

    this.loadFromDisk();
  }

  /**
   * Load department chains from JSON file.
   */
  loadFromDisk() {
    const data = readJSON(DB_PATH, {});

    Object.keys(data).forEach((deptId) => {
      const saved = data[deptId];

      const chain = new DepartmentChain(
        saved.departmentId,
        saved.departmentName
      );

      // Rebuild Block instances from plain objects
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
      this.departments.set(deptId, chain);
    });
  }

  /**
   * Persist all department chains to disk.
   */
  saveToDisk() {
    const obj = {};

    this.departments.forEach((chain, deptId) => {
      obj[deptId] = {
        departmentId: chain.departmentId,
        departmentName: chain.departmentName,
        difficulty: chain.difficulty,
        chain: chain.chain,
      };
    });

    writeJSON(DB_PATH, obj);
  }

  createDepartment(departmentId, departmentName) {
    if (this.departments.has(departmentId)) {
      throw new Error(`Department ${departmentId} already exists`);
    }

    const chain = new DepartmentChain(departmentId, departmentName);
    this.departments.set(departmentId, chain);
    this.saveToDisk();

    return chain;
  }

  updateDepartment(departmentId, updates) {
    const chain = this.departments.get(departmentId);
    if (!chain) {
      throw new Error(`Department ${departmentId} not found`);
    }

    const tx = {
      type: "DEPARTMENT_UPDATE",
      departmentId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    chain.addBlock(tx);
    this.saveToDisk();

    return chain;
  }

  deleteDepartment(departmentId) {
    const chain = this.departments.get(departmentId);
    if (!chain) {
      throw new Error(`Department ${departmentId} not found`);
    }

    const tx = {
      type: "DEPARTMENT_DELETE",
      departmentId,
      status: "deleted",
      deletedAt: new Date().toISOString(),
    };

    chain.addBlock(tx);
    this.saveToDisk();

    return chain;
  }

  getDepartmentState(departmentId) {
    const chain = this.departments.get(departmentId);
    if (!chain) {
      return null;
    }

    const latestBlock = chain.getLatestBlock();
    const tx = latestBlock.transactions;

    const state = {
      departmentId,
      departmentName: tx.departmentName || chain.departmentName,
      status: tx.status || "active",
      lastUpdatedAt: tx.updatedAt || tx.deletedAt || latestBlock.timestamp,
    };

    return state;
  }

  listDepartments({ includeDeleted = false } = {}) {
    const result = [];

    this.departments.forEach((chain, deptId) => {
      const state = this.getDepartmentState(deptId);
      if (!includeDeleted && state.status === "deleted") {
        return;
      }
      result.push(state);
    });

    return result;
  }

  validateAllDepartmentChains() {
    const results = [];

    this.departments.forEach((chain, deptId) => {
      const isValid = chain.isChainValid();
      results.push({ departmentId: deptId, isValid });
    });

    return results;
  }
}

module.exports = DepartmentManager;
