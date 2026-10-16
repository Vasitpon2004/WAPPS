// หน้ายืนยันอีเมลด้วยรหัส OTP 6 หลัก (มาหลังจากกดสมัครสมาชิก)
// หน้าสมัครฝากอีเมลมาให้ผ่าน navigate('/verify-otp', { state: { email, role } })
// กดยืนยัน → ส่งไปที่ POST /api/auth/verify-otp
// กดส่งรหัสใหม่ → ส่งไปที่ POST /api/auth/resend-otp (ต้องรอ 60 วินาทีก่อนกดได้)
// สีทั้งหมดในไฟล์นี้ใช้รหัสสีจากหน้าออกแบบ Class Scheduling UI (StdOtp / ProfOtp)

import { useEffect, useState } from 'react'; // useState ใช้เก็บค่า, useEffect ใช้ทำตัวนับถอยหลัง
import axios from 'axios'; // ใช้ส่งข้อมูลไปหา backend
import { Link, useLocation } from 'react-router-dom'; // Link ทำลิงก์, useLocation ใช้อ่านข้อมูลที่หน้าก่อนฝากมา

function VerifyOtpPage() {
  // ---------- อ่านข้อมูลที่หน้าสมัครฝากมา ----------
  const location = useLocation(); // ข้อมูลของหน้าปัจจุบัน รวมถึง state ที่หน้าก่อนส่งมา
  // ถ้าผู้ใช้พิมพ์ URL เข้ามาเองโดยไม่ผ่านหน้าสมัคร state จะเป็น null จึงต้องเช็คก่อน
  const email = location.state ? location.state.email : ''; // อีเมลที่ต้องยืนยัน
  const role = location.state ? location.state.role : ''; // บทบาท ('student' หรือ 'professor')

  // ---------- ตัวแปรของหน้า ----------
  const [code, setCode] = useState(''); // รหัส OTP ที่ผู้ใช้พิมพ์
  const [focused, setFocused] = useState(false); // ผู้ใช้กำลังกดอยู่ที่ช่องกรอกรหัสหรือไม่ (ใช้ทำกรอบดำที่ช่องปัจจุบัน)
  const [errorMessage, setErrorMessage] = useState(''); // ข้อความแจ้งเตือนสีแดง
  const [resentMessage, setResentMessage] = useState(''); // ข้อความสีเขียวหลังส่งรหัสใหม่
  const [loading, setLoading] = useState(false); // กำลังรอ backend ตอบอยู่หรือไม่
  const [secondsLeft, setSecondsLeft] = useState(60); // เหลืออีกกี่วินาทีถึงจะกด "ส่งรหัสใหม่" ได้
  const [verified, setVerified] = useState(false); // ยืนยันอีเมลสำเร็จแล้วหรือยัง

  // ---------- ตัวนับถอยหลัง ----------
  // ทุกครั้งที่ secondsLeft เปลี่ยน จะตั้งเวลา 1 วินาที แล้วลดค่าลง 1 ไปเรื่อย ๆ จนถึง 0
  useEffect(() => {
    if (secondsLeft === 0) {
      return; // ถึง 0 แล้ว หยุดนับ
    }
    const timer = setTimeout(() => {
      setSecondsLeft(secondsLeft - 1); // ผ่านไป 1 วินาที ลดค่าลง 1
    }, 1000); // 1000 มิลลิวินาที = 1 วินาที
    return () => clearTimeout(timer); // ยกเลิกตัวตั้งเวลาเดิม ถ้าออกจากหน้าก่อนครบ 1 วินาที
  }, [secondsLeft]); // ทำใหม่ทุกครั้งที่ secondsLeft เปลี่ยน

  // ---------- ปุ่ม "ยืนยัน" ----------
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); // ไม่ให้หน้าเว็บโหลดใหม่
    setErrorMessage(''); // ล้างข้อความเก่า
    setResentMessage(''); // ล้างข้อความเก่า

    if (code.length !== 6) {
      setErrorMessage('กรุณากรอกรหัสให้ครบ 6 หลัก');
      return; // หยุด ไม่ส่งไป backend
    }

    setLoading(true); // เริ่มรอ backend

    try {
      // ส่งอีเมลกับรหัส OTP ไปให้ backend ตรวจ
      await axios.post('/api/auth/verify-otp', {
        email: email, // อีเมลที่ต้องยืนยัน
        otp_code: code, // รหัส 6 หลักที่ผู้ใช้กรอก
      });
      setVerified(true); // ยืนยันสำเร็จ → หน้าจะเปลี่ยนเป็นหน้าสำเร็จ
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // backend ตอบกลับมาแต่ไม่ผ่าน เช่น รหัสผิด หรือรหัสหมดอายุ
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
      }
      setCode(''); // ล้างช่องให้กรอกใหม่
    }

    setLoading(false); // เลิกรอ backend
  };

  // ---------- ปุ่ม "ส่งรหัสใหม่" ----------
  const handleResend = async () => {
    setErrorMessage(''); // ล้างข้อความเก่า
    setResentMessage(''); // ล้างข้อความเก่า

    try {
      await axios.post('/api/auth/resend-otp', { email: email }); // ขอให้ backend ส่งรหัสใหม่ไปที่อีเมลนี้
      setResentMessage('ส่งรหัสใหม่แล้ว รหัสเดิมใช้ไม่ได้'); // แสดงข้อความสีเขียว
      setCode(''); // ล้างรหัสเดิมในช่อง
      setSecondsLeft(60); // เริ่มนับถอยหลัง 60 วินาทีใหม่
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
      }
    }
  };

  // ---------- คลาสของกล่องตัวเลขแต่ละช่อง ----------
  // รับลำดับช่อง (0 ถึง 5) แล้วคืนคลาสตามสถานะของช่องนั้น
  const getBoxClass = (index: number) => {
    const base = 'flex h-[52px] items-center justify-center rounded-[10px] bg-white text-[22px] font-semibold';
    if (errorMessage !== '') {
      return base + ' border-[1.5px] border-[#B42318]'; // มี error → ขอบแดงทุกช่อง
    }
    if (focused && index === Math.min(code.length, 5)) {
      return base + ' border-2 border-[#17181B]'; // ช่องที่กำลังจะพิมพ์ → ขอบดำหนา
    }
    if (index < code.length) {
      return base + ' border border-[#71717A]'; // ช่องที่กรอกแล้ว → ขอบเทาเข้ม
    }
    return base + ' border border-[#D4D4D8]'; // ช่องว่าง → ขอบเทาอ่อน
  };

  // ---------- กรณีไม่มีอีเมล (เข้ามาหน้านี้ตรง ๆ) ----------
  if (email === '') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
        <p className="text-[22px] font-semibold text-[#2347D6]">Class scheduling system</p>
        <div className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px] text-center">
          <h1 className="text-xl font-semibold">ไม่พบอีเมลที่ต้องยืนยัน</h1>
          <p className="text-sm text-[#71717A]">กรุณาสมัครสมาชิกหรือเข้าสู่ระบบอีกครั้ง</p>
          <Link to="/login" className="flex min-h-11 items-center justify-center rounded-lg bg-[#17181B] text-[15px] font-semibold text-white">
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  // ---------- กรณียืนยันสำเร็จ ----------
  if (verified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
        <p className="text-[22px] font-semibold text-[#2347D6]">Class scheduling system</p>
        <div className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px]">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* วงกลมสีเขียวพร้อมเครื่องหมายถูก */}
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E8F5EC]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <h1 className="text-xl font-semibold">ยืนยันอีเมลแล้ว</h1>
            {/* ข้อความต่างกันตามบทบาท */}
            <p className="text-sm text-[#71717A]">
              {role === 'student' ? 'เข้าสู่ระบบ แล้วอัปโหลดตารางเรียนเพื่อเข้าร่วมรายวิชา' : 'เข้าสู่ระบบเพื่อเริ่มใช้งานได้เลย'}
            </p>
          </div>
          {/* TODO: เมื่อมีหน้าอัปโหลดตารางเรียนแล้ว อาจพานิสิตไปหน้านั้นแทน */}
          <Link to="/login" className="flex min-h-11 items-center justify-center rounded-lg bg-[#17181B] text-[15px] font-semibold text-white">
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  // ---------- หน้าปกติ: กรอกรหัส OTP ----------
  return (
    // พื้นหลังเทาเต็มจอ และจัดทุกอย่างไว้ตรงกลาง
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
      {/* ชื่อระบบด้านบน */}
      <p className="text-[22px] font-semibold text-[#2347D6]">Class scheduling system</p>

      {/* กล่องสีขาวตรงกลาง */}
      <div className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-7 pb-[22px]">
        {/* หัวข้อ พร้อมบอกว่าส่งรหัสไปที่อีเมลไหน */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">ยืนยันอีเมล</h1>
          <p className="text-sm leading-relaxed text-[#71717A]">
            กรอกรหัส 6 หลักที่ส่งไปที่
            <br />
            <strong className="font-semibold text-[#17181B]">{email}</strong>
          </p>
        </div>

        {/* ฟอร์ม: เมื่อกดปุ่ม submit จะเรียก handleVerify */}
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="otp" className="text-sm">รหัส OTP</label>

            {/* กล่อง 6 ช่องที่เห็น เป็นแค่ส่วนแสดงผล
                ช่องกรอกจริงมีช่องเดียว วางทับอยู่ข้างบนแบบล่องหน (opacity-0)
                ผู้ใช้จึงพิมพ์หรือวางรหัส 6 ตัวจากอีเมลได้ในครั้งเดียว */}
            <div className="relative">
              <div className="grid grid-cols-6 gap-2">
                <span className={getBoxClass(0)}>{code[0]}</span> {/* ตัวที่ 1 */}
                <span className={getBoxClass(1)}>{code[1]}</span> {/* ตัวที่ 2 */}
                <span className={getBoxClass(2)}>{code[2]}</span> {/* ตัวที่ 3 */}
                <span className={getBoxClass(3)}>{code[3]}</span> {/* ตัวที่ 4 */}
                <span className={getBoxClass(4)}>{code[4]}</span> {/* ตัวที่ 5 */}
                <span className={getBoxClass(5)}>{code[5]}</span> {/* ตัวที่ 6 */}
              </div>
              <input
                id="otp"
                inputMode="numeric" // มือถือเปิดแป้นตัวเลข
                autoComplete="one-time-code" // มือถือเติมรหัสจาก SMS/อีเมลให้อัตโนมัติได้
                maxLength={6} // พิมพ์ได้ไม่เกิน 6 ตัว
                value={code} // ค่าในช่องมาจากตัวแปร code
                onChange={(e) => {
                  // replace(/[^0-9]/g, '') = ลบทุกตัวที่ไม่ใช่ตัวเลขออก
                  setCode(e.target.value.replace(/[^0-9]/g, ''));
                  setErrorMessage(''); // เริ่มพิมพ์ใหม่ ล้างข้อความ error
                }}
                onFocus={() => setFocused(true)} // กดเข้าช่อง
                onBlur={() => setFocused(false)} // กดออกจากช่อง
                className="absolute inset-0 h-full w-full cursor-text opacity-0" // วางทับกล่อง 6 ช่องพอดี และมองไม่เห็น
              />
            </div>

            {/* ข้อความ error ใต้กล่อง */}
            {errorMessage !== '' && <p className="text-[13px] text-[#B42318]">{errorMessage}</p>}
          </div>

          {/* ปุ่มยืนยัน: กดได้เมื่อกรอกครบ 6 ตัว และไม่ได้กำลังรอ backend */}
          <button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="min-h-11 rounded-lg bg-[#17181B] text-[15px] font-semibold text-white disabled:bg-[#E4E4E7] disabled:text-[#71717A]"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
          </button>
        </form>

        {/* แถวส่งรหัสใหม่ */}
        <div className="flex items-center justify-center gap-1 text-[13px]">
          <span>ไม่ได้รับรหัส?</span>
          {secondsLeft > 0 ? (
            // ยังนับถอยหลังอยู่ → แสดงเวลาที่เหลือ
            <span className="text-[#71717A]">ส่งรหัสใหม่ได้ใน {secondsLeft} วินาที</span>
          ) : (
            // นับครบแล้ว → แสดงปุ่มส่งรหัสใหม่
            <button type="button" onClick={handleResend} className="font-semibold text-[#2347D6] hover:text-[#1A37A8]">
              ส่งรหัสใหม่
            </button>
          )}
        </div>

        {/* ข้อความสีเขียวหลังส่งรหัสใหม่ */}
        {resentMessage !== '' && <p className="text-center text-[13px] text-[#166534]">{resentMessage}</p>}

        {/* ลิงก์กลับไปหน้าเข้าสู่ระบบ */}
        <p className="text-center text-[13px]">
          <Link to="/login" className="text-[#2347D6] hover:text-[#1A37A8]">‹ กลับไปเข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtpPage; // ส่งออกหน้านี้ให้ App.tsx นำไปใช้