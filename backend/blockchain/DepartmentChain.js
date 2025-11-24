// backend/blockchain/DepartmentChain.js

const Blockchain = require("./Blockchain");

/**
 * One DepartmentChain instance represents the blockchain
 * for a single department (e.g., "School of Computing").
 *
 * Later, we will have a DepartmentManager that keeps a map:
 *   departmentId -> DepartmentChain instance
 */
class DepartmentChain extends Blockchain {
  /**
   * @param {string} departmentId
   * @param {string} departmentName
   */
  constructor(departmentId, departmentName) {
    const name = `Department-${departmentId}`;

    const genesisTx = {
      type: "DEPARTMENT_GENESIS",
      departmentId,
      departmentName,
      status: "active",
      note: "Genesis block for department chain",
    };

    // parentLastHash = null (independent chain)
    super(name, 4, null, genesisTx);

    this.departmentId = departmentId;
    this.departmentName = departmentName;
  }
}

module.exports = DepartmentChain;
