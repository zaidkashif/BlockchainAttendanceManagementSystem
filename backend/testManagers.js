// backend/testManagers.js

const DepartmentManager = require("./blockchain/DepartmentManager");
const ClassManager = require("./blockchain/ClassManager");
const StudentManager = require("./blockchain/StudentManager");

function main() {
  console.log("✅ Testing Department + Class + Student Managers...");

  const deptManager = new DepartmentManager();
  const classManager = new ClassManager(deptManager);
  const studentManager = new StudentManager(classManager);

  // 1. Create Department
  console.log("\n🔹 Ensuring department CS exists...");
  try {
    deptManager.createDepartment("CS", "School of Computing");
  } catch {
    console.log("Department CS already exists, continuing...");
  }

  // 2. Create Class under CS
  console.log("\n🔹 Ensuring class CS-7A exists...");
  try {
    classManager.createClass("CS-7A", "BSCS-7A", "CS");
  } catch {
    console.log("Class CS-7A already exists, continuing...");
  }

  // 3. Create Student under CS-7A
  console.log("\n🔹 Creating student STU-001...");
  try {
    studentManager.createStudent("STU-001", "Ali Raza", "F23-3700", "CS-7A");
  } catch {
    console.log("Student STU-001 already exists, continuing...");
  }

  console.log("\n📌 Current class list for CS:");
  console.log(
    classManager.listClasses({ departmentId: "CS", includeDeleted: true })
  );

  console.log("\n📌 Current student list for CS-7A:");
  console.log(
    studentManager.listStudents({ classId: "CS-7A", includeDeleted: true })
  );

  // 4. Mark attendance
  console.log("\n⛏️  Marking attendance for STU-001...");
  studentManager.markAttendance("STU-001", "Present");
  studentManager.markAttendance("STU-001", "Absent");
  studentManager.markAttendance("STU-001", "Present");

  console.log("\n📌 STU-001 ledger (full blockchain):");
  console.log(studentManager.getStudentLedger("STU-001"));

  console.log("\n✅ Validation summary:");
  console.log("Departments:", deptManager.validateAllDepartmentChains());
  console.log("Classes:", classManager.validateAllClassChains());
  console.log("Students:", studentManager.validateAllStudentChains());
}

main();
