// หน้าลืมรหัสผ่าน
// ผู้ใช้กรอกอีเมล → ส่งไปที่ POST /api/auth/forgot-password → backend ส่งลิงก์ตั้งรหัสผ่านใหม่ไปทางอีเมล
// ⚠️ endpoint นี้ยังไม่มีใน backend ต้องสร้างฝั่ง backend ให้ชื่อตรงกัน
// หน้านี้มี 2 หน้าตา: ฟอร์มกรอกอีเมล และหน้าจอ "ตรวจสอบอีเมลของคุณ" หลังส่งแล้ว
// สีทั้งหมดในไฟล์นี้ใช้รหัสสีจากหน้าออกแบบ Class Scheduling UI (StdForgot)

import { useState } from 'react'; // ใช้สร้างตัวแปรที่เก็บค่าในหน้า
import axios from 'axios'; // ใช้ส่งข้อมูลไปหา backend
import { Link } from 'react-router-dom'; // ใช้ทำลิงก์ไปหน้าอื่น

function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); // อีเมลที่ผู้ใช้พิมพ์
  const [sent, setSent] = useState(false); // ส่งลิงก์ไปแล้วหรือยัง (true = แสดงหน้าจอ "ตรวจสอบอีเมล")
  const [resent, setResent] = useState(false); // กด "ส่งอีกครั้ง" ไปแล้วหรือยัง
  const [errorMessage, setErrorMessage] = useState(''); // ข้อความแจ้งเตือนสีแดง
  const [loading, setLoading] = useState(false); // กำลังรอ backend ตอบอยู่หรือไม่

  // ฟังก์ชันส่งคำขอไป backend ใช้ทั้งตอนกด "ส่งลิงก์" และตอนกด "ส่งอีกครั้ง"
  // คืนค่า true ถ้าส่งสำเร็จ, false ถ้าไม่สำเร็จ
  const sendLink = async () => {
    setErrorMessage(''); // ล้างข้อความเก่า
    setLoading(true); // เริ่มรอ backend

    try {
      await axios.post('/api/auth/forgot-password', { email: email }); // ขอให้ backend ส่งลิงก์ไปที่อีเมลนี้
      setLoading(false); // เลิกรอ
      return true; // ส่งสำเร็จ
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.message); // แสดงข้อความที่ backend ส่งมา
      } else {
        setErrorMessage('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
      }
      setLoading(false); // เลิกรอ
      return false; // ส่งไม่สำเร็จ
    }
  };

  // ---------- ปุ่ม "ส่งลิงก์" ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ไม่ให้หน้าเว็บโหลดใหม่
    setErrorMessage(''); // ล้างข้อความเก่า

    if (email === '') {
      setErrorMessage('กรุณากรอกอีเมล');
      return;
    }
    if (!email.endsWith('@ku.th')) {
      setErrorMessage('ใช้อีเมล @ku.th เท่านั้น');
      return;
    }

    const success = await sendLink(); // ส่งคำขอแล้วรอผล
    if (success) {
      setSent(true); // สำเร็จ → เปลี่ยนเป็นหน้าจอ "ตรวจสอบอีเมล"
    }
  };

  // ---------- ปุ่ม "ส่งอีกครั้ง" ----------
  const handleResend = async () => {
    const success = await sendLink(); // ส่งคำขอซ้ำด้วยอีเมลเดิม
    if (success) {
      setResent(true); // แสดงข้อความ "ส่งอีกครั้งแล้ว"
    }
  };

  // ---------- ปุ่ม "เปลี่ยนอีเมล" ----------
  const handleChangeEmail = () => {
    setSent(false); // กลับไปหน้าฟอร์ม
    setResent(false); // รีเซ็ตสถานะส่งอีกครั้ง
  };

  // ---------- หน้าจอหลังส่งลิงก์แล้ว ----------
  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
        <p className="text-[22px] font-semibold text-[#2347D6]">Class scheduling system</p>
        <div className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px]">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* วงกลมสีฟ้าพร้อมไอคอนซองจดหมาย */}
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#EEF2FD]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2347D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <h1 className="text-xl font-semibold">ตรวจสอบอีเมลของคุณ</h1>
            {/* เขียนว่า "ถ้ามีบัญชี" เพื่อไม่บอกคนนอกว่าอีเมลนี้มีบัญชีในระบบหรือไม่ */}
            <p className="text-sm leading-relaxed text-[#71717A]">
              ถ้ามีบัญชีของ <strong className="font-semibold text-[#17181B]">{email}</strong>
              <br />
              เราส่งลิงก์ไปแล้ว ลิงก์ใช้ได้ครั้งเดียวภายใน 15 นาที
            </p>
          </div>

          {/* กล่องสีแดง แสดงเมื่อส่งอีกครั้งไม่สำเร็จ */}
          {errorMessage !== '' && (
            <div className="rounded-lg bg-[#FDECEA] px-3 py-2.5 text-sm text-[#9F1D14]">{errorMessage}</div>
          )}

          <Link to="/login" className="flex min-h-11 items-center justify-center rounded-lg bg-[#17181B] text-[15px] font-semibold text-white">
            กลับไปเข้าสู่ระบบ
          </Link>

          {/* แถวส่งอีกครั้ง / เปลี่ยนอีเมล */}
          <div className="flex flex-wrap items-center justify-center gap-1 text-[13px]">
            <span>ไม่ได้รับอีเมล?</span>
            {resent ? (
              <span className="text-[#166534]">ส่งอีกครั้งแล้ว</span> // ส่งแล้ว แสดงข้อความแทนปุ่ม
            ) : (
              <button type="button" onClick={handleResend} disabled={loading} className="text-[#2347D6] hover:text-[#1A37A8]">
                ส่งอีกครั้ง
              </button>
            )}
            <span className="text-[#A1A1AA]">·</span>
            <button type="button" onClick={handleChangeEmail} className="text-[#2347D6] hover:text-[#1A37A8]">
              เปลี่ยนอีเมล
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- หน้าฟอร์มกรอกอีเมล ----------
  return (
    // พื้นหลังเทาเต็มจอ และจัดทุกอย่างไว้ตรงกลาง
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
      {/* ชื่อระบบด้านบน */}
      <p className="text-[22px] font-semibold text-[#2347D6]">Class scheduling system</p>

      {/* กล่องสีขาวตรงกลาง */}
      <div className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px]">
        {/* หัวข้อ */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">ลืมรหัสผ่าน</h1>
          <p className="text-sm text-[#71717A]">กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
        </div>

        {/* ฟอร์ม: noValidate = ปิดการตรวจของเบราว์เซอร์ ใช้ข้อความภาษาไทยของเราแทน */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {/* ช่องอีเมล */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm">อีเมล</label>
            <input
              id="email"
              type="email"
              placeholder="example@ku.th"
              value={email} // ค่าในช่องมาจากตัวแปร email
              onChange={(e) => setEmail(e.target.value)} // พิมพ์แล้วเก็บลงตัวแปร
              className="min-h-11 rounded-lg border border-[#27272A] bg-white px-3 text-base placeholder:text-[#8A8F98]"
            />
          </div>

          {/* กล่องสีแดง แสดงเมื่อมีข้อความ error */}
          {errorMessage !== '' && (
            <div className="rounded-lg bg-[#FDECEA] px-3 py-2.5 text-sm text-[#9F1D14]">{errorMessage}</div>
          )}

          {/* ปุ่มส่งลิงก์ */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 min-h-11 rounded-lg bg-[#17181B] text-[15px] font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'กำลังส่ง...' : 'ส่งลิงก์'}
          </button>
        </form>

        {/* ลิงก์กลับไปหน้าเข้าสู่ระบบ */}
        <p className="text-center text-[13px]">
          <Link to="/login" className="text-[#2347D6] hover:text-[#1A37A8]">‹ กลับไปเข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage; // ส่งออกหน้านี้ให้ App.tsx นำไปใช้