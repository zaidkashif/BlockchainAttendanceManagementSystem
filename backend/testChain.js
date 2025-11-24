// backend/testChain.js

const Blockchain = require("./blockchain/Blockchain");

function main() {
  console.log("✅ Starting chain test...");

  // Example: Department chain (independent)
  const deptChain = new Blockchain("DepartmentChain", 4);

  console.log("🔹 Genesis block (DepartmentChain):");
  console.log(deptChain.getLatestBlock());

  // Add a few department metadata blocks
  console.log("\n⛏️  Adding Department blocks...");

  deptChain.addBlock({
    type: "DEPARTMENT_CREATE",
    departmentId: "CS",
    departmentName: "School of Computing",
    status: "active",
  });

  deptChain.addBlock({
    type: "DEPARTMENT_UPDATE",
    departmentId: "CS",
    departmentName: "School of Computing & AI",
    status: "active",
  });

  console.log("\n📌 Full DepartmentChain:");
  console.log(JSON.stringify(deptChain.toJSON(), null, 2));

  console.log("\n✅ Is DepartmentChain valid?", deptChain.isChainValid());

  // Tampering test (simulate attacker)
  console.log("\n⚠️  Tampering with a block...");
  deptChain.chain[1].transactions.departmentName = "Hacked Name";

  console.log(
    "✅ Is DepartmentChain valid after tampering?",
    deptChain.isChainValid()
  );
}

main();
