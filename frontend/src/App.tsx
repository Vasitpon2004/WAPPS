//Router : ตัวกรองใหญ่สุด, Routes : ตัวรวบรวมและคัดเลือกเส้นทาง, Route: เส้นทางรายตัว
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/*กำหนดไว้เมื่อเกิดหน้าเว็บครั้งแรกจะไปที่หน้า Login อัตโนมิติ*/}
        <Route path='/' element={<Navigate to="/Login" replace /> }/>
        {/*ทางไปหน้า Login*/}
        <Route path="/Login" element={<LoginPage />} />
        {/*ทางไปหน้า RoleSelection*/}
        <Route path="/RoleSelection" element={<RoleSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App
