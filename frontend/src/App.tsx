// BrowserRouter: ตัวคุมการเปลี่ยนหน้าทั้งเว็บ ต้องครอบทุกอย่างไว้ชั้นนอกสุด
// Routes: ดู URL ปัจจุบันแล้วเลือก Route ที่ตรงที่สุดมาแสดง 1 ตัว
// Route: จับคู่ path หนึ่งเส้น กับหน้าที่จะแสดง
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/Verifyotppage';
import ForgotPasswordPage from './pages/Forgotpasswordpage';
import ResetPasswordPage from './pages/Resetpasswordpage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* เปิดเว็บที่ / ครั้งแรก ให้พาไปหน้าเข้าสู่ระบบ
            replace = แทนที่ประวัติ ไม่ให้กด Back แล้ววนกลับมาที่ / อีก */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        {/* สมัครสมาชิก: /register = เลือกประเภทผู้ใช้ แล้วไปต่อตามบทบาท */}
        <Route path="/register" element={<RoleSelectionPage />} />
        {/* key ต่างกันสำคัญ: ทั้งสองเส้นใช้คอมโพเนนต์ RegisterPage ตัวเดียวกัน
            ถ้าไม่ใส่ key แล้วผู้ใช้สลับบทบาท React อาจใช้คอมโพเนนต์เดิมต่อ และข้อมูลที่กรอกค้างอยู่
            key ที่ต่างกันบอก React ว่า "นี่คือคนละตัว ให้เริ่ม state ใหม่"
            (https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) */}
        <Route path="/register/student" element={<RegisterPage key="student" role="student" />} />
        <Route path="/register/professor" element={<RegisterPage key="professor" role="professor" />} />

        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> 

        {/* path="*" = URL อื่นที่ไม่ตรงกับเส้นไหนเลย ให้กลับไปหน้าเข้าสู่ระบบ */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;