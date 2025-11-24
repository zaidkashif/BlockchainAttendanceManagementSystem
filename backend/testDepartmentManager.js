// backend/testDepartmentManager.js

const DepartmentManager = require("./blockchain/DepartmentManager");

function main() {
  console.log("✅ Testing DepartmentManager...");

  const manager = new DepartmentManager();

  console.log("\n🔹 Creating departments...");
  try {
    manager.createDepartment("CS", "School of Computing");
    manager.createDepartment("SE", "School of Software Engineering");
  } catch (err) {
    console.log("Some departments already exist, continuing...");
  }

  console.log("\n📌 All departments (active only):");
  console.log(manager.listDepartments());

  console.log("\n🔹 Updating CS name...");
  manager.updateDepartment("CS", {
    departmentName: "School of Computing & AI",
  });

  console.log("\n📌 CS latest state:");
  console.log(manager.getDepartmentState("CS"));

  console.log("\n🔹 Soft deleting SE department...");
  manager.deleteDepartment("SE");

  console.log("\n📌 All departments (active only):");
  console.log(manager.listDepartments({ includeDeleted: false }));

  console.log("\n📌 All departments (including deleted):");
  console.log(manager.listDepartments({ includeDeleted: true }));

  console.log("\n✅ Validation results for all department chains:");
  console.log(manager.validateAllDepartmentChains());
}

main();
