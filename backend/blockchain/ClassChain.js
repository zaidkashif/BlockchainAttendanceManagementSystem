// backend/blockchain/ClassChain.js

const Blockchain = require("./Blockchain");

/**
 * One ClassChain instance represents the blockchain
 * for a single class inside a department.
 *
 * Genesis prev_hash = latest hash of the DepartmentChain.
 */
class ClassChain extends Blockchain {
  /**
   * @param {string} classId
   * @param {string} className
   * @param {string} departmentId
   * @param {string} parentDeptLastHash - latest hash from the department chain
   */
  constructor(classId, className, departmentId, parentDeptLastHash) {
    const name = `Class-${classId}`;

    const genesisTx = {
      type: "CLASS_GENESIS",
      classId,
      className,
      departmentId,
      status: "active",
      note: "Genesis block for class chain",
    };

    super(name, 4, parentDeptLastHash, genesisTx);

    this.classId = classId;
    this.className = className;
    this.departmentId = departmentId;
  }
}

module.exports = ClassChain;
