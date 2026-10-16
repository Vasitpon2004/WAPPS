// หน้าเลือกประเภทผู้ใช้ (ก่อนสมัครสมาชิก)
// กด "นิสิต"   → ไปหน้า /register/student
// กด "อาจารย์" → ไปหน้า /register/professor
// ทั้งสองเส้นทางใช้หน้า RegisterPage ตัวเดียวกัน (App.tsx เป็นคนส่ง role ให้)
// หน้านี้ไม่ต้องมีตัวแปรเก็บค่า เพราะบทบาทที่เลือกจะติดไปกับ URL ของหน้าถัดไปเลย
// สีทั้งหมดในไฟล์นี้ใช้รหัสสีจากหน้าออกแบบ Class Scheduling UI (StdRole)

import { Link } from 'react-router-dom'; // ใช้ทำลิงก์ไปหน้าอื่น

function RoleSelectionPage() {
  return (
    // พื้นหลังเทาเต็มจอ และจัดทุกอย่างไว้ตรงกลาง
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
      {/* ชื่อระบบด้านบน */}
      <p className="text-[22px] font-semibold text-[#2347D6]">WAPPS</p>

      {/* กล่องสีขาวตรงกลาง */}
      <div className="flex w-full max-w-[400px] flex-col gap-5 rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px]">
        {/* หัวข้อ */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">สมัครสมาชิก</h1>
          <p className="text-sm text-[#71717A]">เลือกประเภทผู้ใช้งานของคุณ</p>
        </div>

        {/* การ์ด 2 ใบ วางเรียงกัน 2 คอลัมน์ */}
        <div className="grid grid-cols-2 gap-3">
          {/* การ์ดนิสิต: กดแล้วไปหน้าสมัครของนิสิต */}
          <Link
            to="/register/student" // ไปหน้าสมัครสมาชิก แบบนิสิต
            className="flex min-h-[84px] flex-col items-center justify-center gap-2.5 rounded-[10px] border border-[#27272A] bg-white px-3 py-[18px] hover:border-[#2347D6] hover:bg-[#F3F5FC]"
          >
            {/* ไอคอนหมวกรับปริญญา */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2347D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9l10-5 10 5-10 5-10-5z" />
              <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
              <path d="M22 9v6" />
            </svg>
            <span className="text-[15px] font-semibold">นิสิต</span>
          </Link>

          {/* การ์ดอาจารย์: กดแล้วไปหน้าสมัครของอาจารย์ */}
          <Link
            to="/register/professor" // ไปหน้าสมัครสมาชิก แบบอาจารย์
            className="flex min-h-[84px] flex-col items-center justify-center gap-2.5 rounded-[10px] border border-[#27272A] bg-white px-3 py-[18px] hover:border-[#2347D6] hover:bg-[#F3F5FC]"
          >
            {/* ไอคอนกระดาน */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2347D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="13" rx="2" />
              <path d="M8 21h8M12 17v4" />
              <path d="M7 13h4" />
            </svg>
            <span className="text-[15px] font-semibold">อาจารย์</span>
          </Link>
        </div>

        {/* ลิงก์กลับไปหน้าเข้าสู่ระบบ */}
        <p className="text-center text-[13px]">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-[#2347D6] hover:text-[#1A37A8]">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}

export default RoleSelectionPage; // ส่งออกหน้านี้ให้ App.tsx นำไปใช้