// backend/blockchain/StudentManager.js

const StudentChain = require("./StudentChain");
const Block = require("./Block");
const { readJSON, writeJSON } = require("../database/storage");

const DB_PATH = "database/students.json";

class StudentManager {
  /**
   * @param {ClassManager} classManager
   */
  constructor(classManager) {
    this.classManager = classManager;
    this.students = new Map();

    this.loadFromDisk();
  }

  loadFromDisk() {
    const data = readJSON(DB_PATH, {});

    Object.keys(data).forEach((stuId) => {
      const saved = data[stuId];

      const chain = new StudentChain(
        saved.studentId,
        saved.studentName,
        saved.rollNo,
        saved.classId,
        saved.departmentId,
        "0".repeat(64) // dummy
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
      this.students.set(stuId, chain);
    });
  }

  saveToDisk() {
    const obj = {};

    this.students.forEach((chain, stuId) => {
      obj[stuId] = {
        studentId: chain.studentId,
        studentName: chain.studentName,
        rollNo: chain.rollNo,
        classId: chain.classId,
        departmentId: chain.departmentId,
        difficulty: chain.difficulty,
        chain: chain.chain,
      };
    });

    writeJSON(DB_PATH, obj);
  }

  createStudent(studentId, studentName, rollNo, classId) {
    if (this.students.has(studentId)) {
      throw new Error(`Student ${studentId} already exists`);
    }

    const classChain = this.classManager.classes.get(classId);
    if (!classChain) {
      throw new Error(`Class ${classId} not found for student ${studentId}`);
    }

    const departmentId = classChain.departmentId;
    const parentClassLastHash = classChain.getLatestBlock().hash;

    const chain = new StudentChain(
      studentId,
      studentName,
      rollNo,
      classId,
      departmentId,
      parentClassLastHash
    );

    this.students.set(studentId, chain);
    this.saveToDisk();

    return chain;
  }

  updateStudent(studentId, updates) {
    const chain = this.students.get(studentId);
    if (!chain) throw new Error(`Student ${studentId} not found`);

    const tx = {
      type: "STUDENT_UPDATE",
      studentId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    chain.addBlock(tx);
    this.saveToDisk();

    return chain;
  }

  deleteStudent(studentId) {
    const chain = this.students.get(studentId);
    if (!chain) throw new Error(`Student ${studentId} not found`);

    const tx = {
      type: "STUDENT_DELETE",
      studentId,
      status: "deleted",
      deletedAt: new Date().toISOString(),
    };

    chain.addBlock(tx);
    this.saveToDisk();

    return chain;
  }

  getStudentState(studentId) {
    const chain = this.students.get(studentId);
    if (!chain) return null;

    const latestBlock = chain.getLatestBlock();
    const tx = latestBlock.transactions;

    const state = {
      studentId,
      studentName: tx.studentName || chain.studentName,
      rollNo: tx.rollNo || chain.rollNo,
      classId: tx.classId || chain.classId,
      departmentId: chain.departmentId,
      status: tx.status || "active",
      lastUpdatedAt: tx.updatedAt || tx.deletedAt || latestBlock.timestamp,
    };

    return state;
  }

  listStudents({
    classId = null,
    departmentId = null,
    includeDeleted = false,
  } = {}) {
    const result = [];

    this.students.forEach((chain, stuId) => {
      const state = this.getStudentState(stuId);

      if (classId && state.classId !== classId) return;
      if (departmentId && state.departmentId !== departmentId) return;
      if (!includeDeleted && state.status === "deleted") return;

      result.push(state);
    });

    return result;
  }

  markAttendance(studentId, status) {
    const chain = this.students.get(studentId);
    if (!chain) throw new Error(`Student ${studentId} not found`);

    chain.addAttendance(status);
    this.saveToDisk();

    return chain;
  }

  getStudentLedger(studentId) {
    const chain = this.students.get(studentId);
    if (!chain) return null;
    return chain.chain;
  }

  validateAllStudentChains() {
    const results = [];

    this.students.forEach((chain, studentId) => {
      let isValid = true;

      // 1) internal validation of the student chain
      if (!chain.isChainValid()) {
        isValid = false;
      } else {
        // 2) parent class must exist
        const classId = chain.classId;
        const classChain = this.classManager.classes.get(classId);

        if (!classChain) {
          isValid = false;
        } else {
          // 3) internal validation of the class chain
          if (!classChain.isChainValid()) {
            isValid = false;
          } else {
            // 4) parent department must exist and be valid
            const deptManager = this.classManager.departmentManager;
            const deptChain = deptManager.departments.get(
              classChain.departmentId
            );

            if (!deptChain || !deptChain.isChainValid()) {
              isValid = false;
            } else {
              // 5) class genesis must point to latest department hash
              const classGenesis = classChain.chain[0];
              const deptLatestHash = deptChain.getLatestBlock().hash;

              if (classGenesis.prev_hash !== deptLatestHash) {
                isValid = false;
              } else {
                // 6) student genesis must point to latest class hash
                const studentGenesis = chain.chain[0];
                const classLatestHash = classChain.getLatestBlock().hash;

                if (studentGenesis.prev_hash !== classLatestHash) {
                  isValid = false;
                }
              }
            }
          }
        }
      }

      results.push({ studentId, isValid });
    });

    return results;
  }
}

module.exports = StudentManager;
