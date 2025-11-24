// backend/blockchain/StudentChain.js

const Blockchain = require("./Blockchain");

/**
 * One StudentChain instance represents the personal blockchain
 * for a single student.
 *
 * Genesis prev_hash = latest hash of the ClassChain.
 */
class StudentChain extends Blockchain {
  /**
   * @param {string} studentId
   * @param {string} studentName
   * @param {string} rollNo
   * @param {string} classId
   * @param {string} departmentId
   * @param {string} parentClassLastHash - latest hash from the class chain
   */
  constructor(
    studentId,
    studentName,
    rollNo,
    classId,
    departmentId,
    parentClassLastHash
  ) {
    const name = `Student-${studentId}`;

    const genesisTx = {
      type: "STUDENT_GENESIS",
      studentId,
      studentName,
      rollNo,
      classId,
      departmentId,
      status: "active",
      note: "Genesis block for student chain",
    };

    super(name, 4, parentClassLastHash, genesisTx);

    this.studentId = studentId;
    this.studentName = studentName;
    this.rollNo = rollNo;
    this.classId = classId;
    this.departmentId = departmentId;
  }

  /**
   * Convenience method: add an attendance record block
   *   Present / Absent / Leave
   */
  addAttendance(status) {
    const tx = {
      type: "ATTENDANCE",
      studentId: this.studentId,
      studentName: this.studentName,
      rollNo: this.rollNo,
      classId: this.classId,
      departmentId: this.departmentId,
      status, // "Present" | "Absent" | "Leave"
      timestamp: new Date().toISOString(),
    };

    return this.addBlock(tx);
  }
}

module.exports = StudentChain;
