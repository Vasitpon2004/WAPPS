// หน้าเข้าสู่ระบบ
// สีทั้งหมดในไฟล์นี้ใช้รหัสสีจากหน้าออกแบบ Class Scheduling UI (StdLogin)
// ผู้ใช้กรอกอีเมลกับรหัสผ่าน แล้วส่งไปให้ backend ตรวจที่ POST /api/auth/login

import { useState } from 'react'; // ใช้สร้างตัวแปรที่เก็บค่าในหน้า
import axios from 'axios'; // ใช้ส่งข้อมูลไปหา backend
import { Link } from 'react-router-dom'; // ใช้ทำลิงก์ไปหน้าอื่น

function LoginPage() {
  const [email, setEmail] = useState(''); // เก็บอีเมลที่ผู้ใช้พิมพ์
  const [password, setPassword] = useState(''); // เก็บรหัสผ่านที่ผู้ใช้พิมพ์
  const [showPassword, setShowPassword] = useState(false); // เก็บว่าติ๊ก "แสดงรหัสผ่าน" อยู่หรือไม่
  const [errorMessage, setErrorMessage] = useState(''); // เก็บข้อความแจ้งเตือนสีแดง
  const [successMessage, setSuccessMessage] = useState(''); // เก็บข้อความแจ้งเตือนสีเขียว
  const [loading, setLoading] = useState(false); // เก็บว่ากำลังรอ backend ตอบอยู่หรือไม่

  // ฟังก์ชันนี้ทำงานเมื่อกดปุ่ม "เข้าสู่ระบบ"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ไม่ให้หน้าเว็บโหลดใหม่ตอนกดส่งฟอร์ม
    setErrorMessage(''); // ล้างข้อความแจ้งเตือนเก่าออกก่อน
    setSuccessMessage(''); // ล้างข้อความสำเร็จเก่าออกก่อน

    // ตรวจว่ากรอกอีเมลหรือยัง
    if (email === '') {
      setErrorMessage('กรุณากรอกอีเมล'); // แสดงข้อความ
      return; // หยุดทำงาน ไม่ส่งข้อมูลไป backend
    }

    // ตรวจว่าเป็นอีเมล @ku.th หรือไม่
    if (!email.endsWith('@ku.th')) {
      setErrorMessage('ใช้อีเมล @ku.th เท่านั้น'); // แสดงข้อความ
      return; // หยุดทำงาน
    }

    // ตรวจว่ากรอกรหัสผ่านหรือยัง
    if (password === '') {
      setErrorMessage('กรุณากรอกรหัสผ่าน'); // แสดงข้อความ
      return; // หยุดทำงาน
    }

    setLoading(true); // เริ่มรอ backend (ปุ่มจะกดไม่ได้)

    try {
      // ส่งอีเมลกับรหัสผ่านไปที่ backend แล้วรอคำตอบ
      const response = await axios.post('/api/auth/login', {
        email: email, // อีเมลที่ผู้ใช้กรอก
        password: password, // รหัสผ่านที่ผู้ใช้กรอก
      });

      // ถ้ามาถึงบรรทัดนี้ได้ แปลว่าเข้าสู่ระบบสำเร็จ
      localStorage.setItem('token', response.data.access_token); // เก็บ token ไว้ในเบราว์เซอร์ เอาไว้ใช้ยืนยันตัวตนตอนเรียก API ครั้งต่อไป
      setSuccessMessage('เข้าสู่ระบบสำเร็จ'); // แสดงข้อความสีเขียว

      // TODO: พาไปหน้าหลักตามบทบาท (response.data.user.role) เมื่อทำหน้าหลักเสร็จแล้ว
    } catch (error) {
      // ถ้าส่งไม่สำเร็จ จะมาทำงานที่นี่
      if (axios.isAxiosError(error) && error.response) {
        // backend ตอบกลับมา แต่ไม่ผ่าน เช่น รหัสผ่านผิด
        setErrorMessage(error.response.data.message); // แสดงข้อความที่ backend ส่งมา
      } else {
        // ส่งไปไม่ถึง backend เลย เช่น ยังไม่ได้เปิด backend
        setErrorMessage('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); // แสดงข้อความ
      }
    }

    setLoading(false); // เลิกรอ backend (ปุ่มกลับมากดได้)
  };

  return (
    // พื้นหลังเทาเต็มจอ และจัดทุกอย่างไว้ตรงกลาง
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
      {/* ชื่อระบบด้านบน */}
      <p className="text-[22px] font-semibold text-[#2347D6]">WAPPS</p>

      {/* กล่องสีขาวตรงกลาง */}
      <div className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px]">
        {/* หัวข้อ */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">Login</h1>
          <p className="text-sm text-[#71717A]">Welcome back!</p>
        </div>

        {/* ฟอร์ม: เมื่อกดปุ่ม submit จะเรียก handleLogin */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          {/* ช่องอีเมล */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm">อีเมล</label>
            <input
              id="email" // ชื่อช่อง ใช้คู่กับ htmlFor ของ label ด้านบน
              type="email" // ชนิดช่องเป็นอีเมล
              placeholder="example@ku.th" // ข้อความจาง ๆ ตอนช่องยังว่าง
              value={email} // ค่าในช่องมาจากตัวแปร email
              onChange={(e) => setEmail(e.target.value)} // พิมพ์แล้วเก็บค่าลงตัวแปร email
              className="min-h-11 rounded-lg border border-[#27272A] bg-white px-3 text-base placeholder:text-[#8A8F98]"
            />
          </div>

          {/* ช่องรหัสผ่าน */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm">รหัสผ่าน</label>
            <input
              id="password" // ชื่อช่อง
              type={showPassword ? 'text' : 'password'} // ถ้าติ๊กแสดงรหัสผ่าน ให้เห็นตัวอักษร ถ้าไม่ติ๊ก ให้เป็นจุด
              placeholder="••••••••" // ข้อความจาง ๆ
              value={password} // ค่าในช่องมาจากตัวแปร password
              onChange={(e) => setPassword(e.target.value)} // พิมพ์แล้วเก็บค่าลงตัวแปร password
              className="min-h-11 rounded-lg border border-[#27272A] bg-white px-3 text-base placeholder:text-[#8A8F98]"
            />
          </div>

          {/* แถวของช่องติ๊กกับลิงก์ลืมรหัสผ่าน */}
          <div className="flex items-center justify-between">
            <label className="flex min-h-8 items-center gap-2 text-sm">
              <input
                type="checkbox" // ช่องติ๊ก
                checked={showPassword} // ติ๊กอยู่หรือไม่ ดูจากตัวแปร showPassword
                className="size-4 accent-[#17181B]" // ขนาด 16px และสีดำตามหน้าออกแบบ
                onChange={() => setShowPassword(!showPassword)} // กดแล้วสลับค่า true/false
              />
              แสดงรหัสผ่าน
            </label>
            <Link to="/forgot-password" className="text-sm text-[#2347D6] hover:text-[#1A37A8]">ลืมรหัสผ่าน?</Link>
          </div>

          {/* กล่องสีแดง แสดงเมื่อมีข้อความ error */}
          {errorMessage !== '' && (
            <div className="rounded-lg bg-[#FDECEA] px-3 py-2.5 text-sm text-[#9F1D14]">{errorMessage}</div>
          )}

          {/* กล่องสีเขียว แสดงเมื่อเข้าสู่ระบบสำเร็จ */}
          {successMessage !== '' && (
            <div className="rounded-lg bg-[#E8F5EC] px-3 py-2.5 text-sm text-[#166534]">{successMessage}</div>
          )}

          {/* ปุ่มเข้าสู่ระบบ: ระหว่างรอ backend จะกดไม่ได้ */}
          <button
            type="submit" // กดแล้วส่งฟอร์ม
            disabled={loading} // ถ้ากำลังโหลด ปุ่มกดไม่ได้
            className="mt-1 min-h-11 rounded-lg bg-[#17181B] text-[15px] font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* ลิงก์ไปหน้าสมัครสมาชิก */}
        <p className="text-center text-[13px]">
          ยังไม่มีบัญชีใช่ไหม? <Link to="/register" className="text-[#2347D6] hover:text-[#1A37A8]">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage; // ส่งออกหน้านี้ให้ App.tsx นำไปใช้