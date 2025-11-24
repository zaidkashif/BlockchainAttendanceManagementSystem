// backend/testHierarchy.js

const DepartmentChain = require("./blockchain/DepartmentChain");
const ClassChain = require("./blockchain/ClassChain");
const StudentChain = require("./blockchain/StudentChain");

function main() {
  console.log("✅ Testing hierarchical chains (Dept -> Class -> Student)...\n");

  // 1. Department chain
  const deptChain = new DepartmentChain("CS", "School of Computing");
  console.log("🔹 Department latest hash:");
  console.log(deptChain.getLatestBlock().hash);

  // 2. Class chain whose genesis prev_hash = department latest hash
  const deptLastHash = deptChain.getLatestBlock().hash;
  const classChain = new ClassChain("CS-7A", "BSCS-7A", "CS", deptLastHash);

  console.log("\n🔹 Class genesis prev_hash (should match dept last hash):");
  console.log(classChain.chain[0].prev_hash);

  // 3. Student chain whose genesis prev_hash = class latest hash
  const classLastHash = classChain.getLatestBlock().hash;
  const studentChain = new StudentChain(
    "STU-001",
    "Ali Raza",
    "F23-3700",
    "CS-7A",
    "CS",
    classLastHash
  );

  console.log("\n🔹 Student genesis prev_hash (should match class last hash):");
  console.log(studentChain.chain[0].prev_hash);

  // 4. Add some attendance entries
  console.log("\n⛏️  Adding attendance blocks to student chain...");
  studentChain.addAttendance("Present");
  studentChain.addAttendance("Absent");
  studentChain.addAttendance("Present");

  console.log("\n📌 Student chain:");
  console.log(JSON.stringify(studentChain.toJSON(), null, 2));

  // 5. Validate all three chains
  console.log("\n✅ Is DepartmentChain valid?", deptChain.isChainValid());
  console.log("✅ Is ClassChain valid?", classChain.isChainValid());
  console.log("✅ Is StudentChain valid?", studentChain.isChainValid());
}

main();
