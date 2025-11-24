// src/App.jsx

import React, { useState } from "react";
import AppLayout from "./layout/AppLayout";
import DepartmentsPage from "./pages/DepartmentsPage";
import ClassesPage from "./pages/ClassesPage";
import StudentsPage from "./pages/StudentsPage";
import AttendancePage from "./pages/AttendancePage";
import ExplorerPage from "./pages/ExplorerPage";

function App() {
  const [activePage, setActivePage] = useState("departments");

  const renderPage = () => {
    switch (activePage) {
      case "departments":
        return <DepartmentsPage />;
      case "classes":
        return <ClassesPage />;
      case "students":
        return <StudentsPage />;
      case "attendance":
        return <AttendancePage />;
      case "explorer":
        return <ExplorerPage />;
      default:
        return <DepartmentsPage />;
    }
  };

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </AppLayout>
  );
}

export default App;
