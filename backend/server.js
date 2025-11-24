// backend/server.js

const express = require("express");
const cors = require("cors");

// Managers (our "services")
const DepartmentManager = require("./blockchain/DepartmentManager");
const ClassManager = require("./blockchain/ClassManager");
const StudentManager = require("./blockchain/StudentManager");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Instantiate managers (singletons for app)
const deptManager = new DepartmentManager();
const classManager = new ClassManager(deptManager);
const studentManager = new StudentManager(classManager);

// ---------------------- Department Routes ----------------------

// GET /api/departments?includeDeleted=true/false&q=...
app.get("/api/departments", (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === "true";
    const q = (req.query.q || "").toLowerCase();

    let list = deptManager.listDepartments({ includeDeleted });

    // simple search by id or name
    if (q) {
      list = list.filter(
        (d) =>
          d.departmentId.toLowerCase().includes(q) ||
          (d.departmentName && d.departmentName.toLowerCase().includes(q))
      );
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// GET /api/departments/:id
app.get("/api/departments/:id", (req, res) => {
  try {
    const deptId = req.params.id;
    const state = deptManager.getDepartmentState(deptId);
    if (!state) return res.status(404).json({ error: "Department not found" });
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

// POST /api/departments
// { departmentId, departmentName }
app.post("/api/departments", (req, res) => {
  try {
    const { departmentId, departmentName } = req.body;
    if (!departmentId || !departmentName) {
      return res
        .status(400)
        .json({ error: "departmentId and departmentName required" });
    }

    const chain = deptManager.createDepartment(departmentId, departmentName);
    res.status(201).json(deptManager.getDepartmentState(departmentId));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/departments/:id
// { departmentName?, meta? ... }
app.put("/api/departments/:id", (req, res) => {
  try {
    const deptId = req.params.id;
    const updates = req.body;

    deptManager.updateDepartment(deptId, updates);
    res.json(deptManager.getDepartmentState(deptId));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/departments/:id  (soft delete)
app.delete("/api/departments/:id", (req, res) => {
  try {
    const deptId = req.params.id;

    deptManager.deleteDepartment(deptId);
    res.json({
      message: "Department soft-deleted",
      state: deptManager.getDepartmentState(deptId),
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Validate all dept chains
// GET /api/departments/validate
app.get("/api/departments-validate", (req, res) => {
  try {
    const result = deptManager.validateAllDepartmentChains();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate departments" });
  }
});

// ---------------------- Class Routes ----------------------

// GET /api/classes?departmentId=CS&includeDeleted=true/false&q=...
app.get("/api/classes", (req, res) => {
  try {
    const departmentId = req.query.departmentId || null;
    const includeDeleted = req.query.includeDeleted === "true";
    const q = (req.query.q || "").toLowerCase();

    let list = classManager.listClasses({ departmentId, includeDeleted });

    if (q) {
      list = list.filter(
        (c) =>
          c.classId.toLowerCase().includes(q) ||
          (c.className && c.className.toLowerCase().includes(q))
      );
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// GET /api/classes/:id
app.get("/api/classes/:id", (req, res) => {
  try {
    const classId = req.params.id;
    const state = classManager.getClassState(classId);
    if (!state) return res.status(404).json({ error: "Class not found" });
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

// POST /api/classes
// { classId, className, departmentId }
app.post("/api/classes", (req, res) => {
  try {
    const { classId, className, departmentId } = req.body;
    if (!classId || !className || !departmentId) {
      return res
        .status(400)
        .json({ error: "classId, className, departmentId required" });
    }

    classManager.createClass(classId, className, departmentId);
    res.status(201).json(classManager.getClassState(classId));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/classes/:id
app.put("/api/classes/:id", (req, res) => {
  try {
    const classId = req.params.id;
    const updates = req.body;

    classManager.updateClass(classId, updates);
    res.json(classManager.getClassState(classId));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/classes/:id (soft delete)
app.delete("/api/classes/:id", (req, res) => {
  try {
    const classId = req.params.id;

    classManager.deleteClass(classId);
    res.json({
      message: "Class soft-deleted",
      state: classManager.getClassState(classId),
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Validate all class chains
app.get("/api/classes-validate", (req, res) => {
  try {
    const result = classManager.validateAllClassChains();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate classes" });
  }
});

// ---------------------- Student Routes ----------------------

// GET /api/students?classId=CS-7A&departmentId=CS&includeDeleted=true/false&q=...
app.get("/api/students", (req, res) => {
  try {
    const classId = req.query.classId || null;
    const departmentId = req.query.departmentId || null;
    const includeDeleted = req.query.includeDeleted === "true";
    const q = (req.query.q || "").toLowerCase();

    let list = studentManager.listStudents({
      classId,
      departmentId,
      includeDeleted,
    });

    if (q) {
      list = list.filter(
        (s) =>
          s.studentId.toLowerCase().includes(q) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
          (s.studentName && s.studentName.toLowerCase().includes(q))
      );
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET /api/students/:id
app.get("/api/students/:id", (req, res) => {
  try {
    const studentId = req.params.id;
    const state = studentManager.getStudentState(studentId);
    if (!state) return res.status(404).json({ error: "Student not found" });
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// POST /api/students
// { studentId, studentName, rollNo, classId }
app.post("/api/students", (req, res) => {
  try {
    const { studentId, studentName, rollNo, classId } = req.body;
    if (!studentId || !studentName || !rollNo || !classId) {
      return res
        .status(400)
        .json({ error: "studentId, studentName, rollNo, classId required" });
    }

    studentManager.createStudent(studentId, studentName, rollNo, classId);
    res.status(201).json(studentManager.getStudentState(studentId));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/students/:id
app.put("/api/students/:id", (req, res) => {
  try {
    const studentId = req.params.id;
    const updates = req.body;

    studentManager.updateStudent(studentId, updates);
    res.json(studentManager.getStudentState(studentId));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/students/:id (soft delete)
app.delete("/api/students/:id", (req, res) => {
  try {
    const studentId = req.params.id;

    studentManager.deleteStudent(studentId);
    res.json({
      message: "Student soft-deleted",
      state: studentManager.getStudentState(studentId),
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// ---------------------- Attendance + Ledger ----------------------

// POST /api/attendance
// { studentId, status }   status in ["Present", "Absent", "Leave"]
app.post("/api/attendance", (req, res) => {
  try {
    const { studentId, status } = req.body;
    if (!studentId || !status) {
      return res.status(400).json({ error: "studentId and status required" });
    }

    if (!["Present", "Absent", "Leave"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const chain = studentManager.markAttendance(studentId, status);
    res.status(201).json({
      message: "Attendance marked",
      latestBlock: chain.getLatestBlock(),
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/students/:id/ledger
app.get("/api/students/:id/ledger", (req, res) => {
  try {
    const studentId = req.params.id;
    const ledger = studentManager.getStudentLedger(studentId);
    if (!ledger) return res.status(404).json({ error: "Student not found" });
    res.json(ledger);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch student ledger" });
  }
});

// ---------------------- Global Validation (Explorer Support) ----------------------

// GET /api/validate-all
app.get("/api/validate-all", (req, res) => {
  try {
    const departments = deptManager.validateAllDepartmentChains();
    const classes = classManager.validateAllClassChains();
    const students = studentManager.validateAllStudentChains();

    res.json({
      departments,
      classes,
      students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Validation failed" });
  }
});

// ----------------------------------------------------

app.get("/", (req, res) => {
  res.send("BAMS Blockchain Backend is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
