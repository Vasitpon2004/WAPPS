// หน้าสมัครสมาชิก (ใช้ไฟล์เดียวทั้งนิสิตและอาจารย์)
// App.tsx ส่ง role เข้ามาว่าเป็น 'student' (นิสิต) หรือ 'professor' (อาจารย์)
// หน้านี้แบ่งเป็น 2 หน้าย่อย
//   หน้า 1: ข้อมูลบัญชี  = ชื่อ นามสกุล รหัส อีเมล รหัสผ่าน
//   หน้า 2: ข้อมูลการเรียน = คณะ สาขา (นิสิตมีชั้นปีกับแผนการเรียนเพิ่ม)
// กดสมัครแล้วส่งข้อมูลไปที่ POST /api/users จากนั้นไปหน้ากรอก OTP
// สีทั้งหมดในไฟล์นี้ใช้รหัสสีจากหน้าออกแบบ Class Scheduling UI (StdRegister / ProfRegister)

import { useEffect, useState } from 'react'; // useState ใช้เก็บค่า, useEffect ใช้สั่งงานตอนเปิดหน้า
import axios from 'axios'; // ใช้ส่งข้อมูลไปหา backend
import { Link, useNavigate } from 'react-router-dom'; // Link ทำลิงก์, useNavigate ใช้สั่งเปลี่ยนหน้าในโค้ด

// รูปแบบข้อมูลคณะที่ backend ส่งมาจาก GET /api/faculties
// แต่ละคณะมี id, ชื่อคณะ และรายชื่อสาขาข้างใน
type Faculty = {
  id: number;
  faculty_name: string;
  majors: { id: number; major_name: string }[];
};

// รูปแบบของ props ที่หน้านี้รับเข้ามา
type RegisterPageProps = {
  role: 'student' | 'professor'; // บทบาทที่ผู้ใช้เลือกมาจากหน้าก่อน
};

function RegisterPage({ role }: RegisterPageProps) {
  const navigate = useNavigate(); // ตัวสั่งเปลี่ยนหน้า (ใช้ตอนสมัครสำเร็จ)

  // ---------- ตัวแปรของหน้า ----------
  const [step, setStep] = useState(1); // ตอนนี้อยู่หน้าย่อยที่ 1 หรือ 2

  // หน้า 1
  const [firstName, setFirstName] = useState(''); // ชื่อ
  const [lastName, setLastName] = useState(''); // นามสกุล
  const [userCode, setUserCode] = useState(''); // รหัสนิสิต หรือ รหัสอาจารย์
  const [email, setEmail] = useState(''); // อีเมล
  const [password, setPassword] = useState(''); // รหัสผ่าน
  const [confirmPassword, setConfirmPassword] = useState(''); // ยืนยันรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false); // ติ๊ก "แสดงรหัสผ่าน" อยู่หรือไม่

  // หน้า 2
  const [facultyId, setFacultyId] = useState(''); // id ของคณะที่เลือก (dropdown เก็บค่าเป็นข้อความ)
  const [majorId, setMajorId] = useState(''); // id ของสาขาที่เลือก
  const [year, setYear] = useState(''); // ชั้นปี (เฉพาะนิสิต)
  const [studyPlan, setStudyPlan] = useState(''); // แผนการเรียน (เฉพาะนิสิต)

  const [faculties, setFaculties] = useState<Faculty[]>([]); // รายชื่อคณะที่ได้จาก backend เริ่มต้นเป็นรายการว่าง
  const [facultyError, setFacultyError] = useState(''); // ข้อความเมื่อโหลดรายชื่อคณะไม่สำเร็จ (แสดงในหน้า 2)
  const [errorMessage, setErrorMessage] = useState(''); // ข้อความแจ้งเตือนสีแดง
  const [loading, setLoading] = useState(false); // กำลังรอ backend ตอบอยู่หรือไม่

  // ---------- ดึงรายชื่อคณะจาก backend ตอนเปิดหน้า ----------
  // [] ท้ายสุด แปลว่าให้ทำแค่ครั้งเดียวตอนเปิดหน้านี้
  useEffect(() => {
    axios
      .get('/api/faculties') // ขอรายชื่อคณะพร้อมสาขา
      .then((response) => {
        // backend ต้องส่งกลับมาเป็นรายการ (array) เสมอ
        // ถ้าไม่ใช่ เช่นได้หน้าเว็บ HTML กลับมา แปลว่าคำขอไปไม่ถึง backend จริง
        if (Array.isArray(response.data)) {
          setFaculties(response.data); // ได้ข้อมูลแล้ว เก็บลงตัวแปร faculties
        } else {
          setFacultyError('โหลดรายชื่อคณะไม่สำเร็จ'); // ข้อมูลผิดรูปแบบ แสดงข้อความแทน
        }
      })
      .catch(() => {
        setFacultyError('โหลดรายชื่อคณะไม่สำเร็จ'); // ดึงไม่ได้ แสดงข้อความ
      });
  }, []);

  // หาคณะที่ผู้ใช้เลือกอยู่ เพื่อเอารายชื่อสาขาของคณะนั้นมาใส่ dropdown สาขา
  // find = หาตัวแรกที่ตรงเงื่อนไข ถ้าไม่เจอจะได้ undefined
  // ต้องแปลง f.id เป็นข้อความด้วย String() เพราะ facultyId เก็บเป็นข้อความ
  const selectedFaculty = faculties.find((f) => String(f.id) === facultyId);

  // ---------- ปุ่ม "ถัดไป" (ตรวจหน้า 1) ----------
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault(); // ไม่ให้หน้าเว็บโหลดใหม่
    setErrorMessage(''); // ล้างข้อความเก่า

    if (firstName === '') {
      setErrorMessage('กรุณากรอกชื่อ');
      return; // หยุด ไม่ไปหน้า 2
    }
    if (lastName === '') {
      setErrorMessage('กรุณากรอกนามสกุล');
      return;
    }

    // ตรวจรูปแบบรหัสด้วย regex (รูปแบบของข้อความ)
    // นิสิต:   ^[0-9]{10}$   = ตัวเลข 10 ตัวพอดี
    // อาจารย์: ^[A-Z][0-9]{4}$ = ตัวอักษรอังกฤษพิมพ์ใหญ่ 1 ตัว ตามด้วยตัวเลข 4 ตัว เช่น A1234
    if (role === 'student' && !/^[0-9]{10}$/.test(userCode)) {
      setErrorMessage('รหัสนิสิตต้องเป็นตัวเลข 10 หลัก');
      return;
    }
    if (role === 'professor' && !/^[A-Z][0-9]{4}$/.test(userCode)) {
      setErrorMessage('รหัสอาจารย์ต้องเป็นตัวอักษรอังกฤษ 1 ตัว + ตัวเลข 4 หลัก');
      return;
    }

    if (email === '') {
      setErrorMessage('กรุณากรอกอีเมล');
      return;
    }
    if (!email.endsWith('@ku.th')) {
      setErrorMessage('ใช้อีเมล @ku.th เท่านั้น');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setStep(2); // ผ่านทุกข้อ ไปหน้า 2
  };

  // ---------- ปุ่ม "สมัครสมาชิก" (ตรวจหน้า 2 แล้วส่งข้อมูล) ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ไม่ให้หน้าเว็บโหลดใหม่
    setErrorMessage(''); // ล้างข้อความเก่า

    if (facultyId === '') {
      setErrorMessage('กรุณาเลือกคณะ');
      return;
    }
    if (majorId === '') {
      setErrorMessage('กรุณาเลือกสาขา');
      return;
    }
    if (role === 'student' && year === '') {
      setErrorMessage('กรุณาเลือกชั้นปี');
      return;
    }
    if (role === 'student' && studyPlan === '') {
      setErrorMessage('กรุณาเลือกแผนการเรียน');
      return;
    }

    // รวมข้อมูลที่จะส่งไป backend ไว้ใน object เดียว
    // Record<string, string | number> = object ที่ชื่อช่องเป็นข้อความ และค่าเป็นข้อความหรือตัวเลขก็ได้
    const data: Record<string, string | number> = {
      role: role, // 'student' หรือ 'professor'
      first_name: firstName, // ชื่อ
      last_name: lastName, // นามสกุล
      user_code: userCode, // รหัสนิสิต/อาจารย์
      email: email, // อีเมล
      password: password, // รหัสผ่าน (backend จะ hash ก่อนเก็บ)
      major_id: Number(majorId), // id ของสาขา แปลงจากข้อความเป็นตัวเลข
    };

    // นิสิตต้องส่งชั้นปีกับแผนการเรียนเพิ่ม ส่วนอาจารย์ไม่ต้องส่ง
    if (role === 'student') {
      data.year = Number(year); // ชั้นปี แปลงเป็นตัวเลข
      data.study_plan = studyPlan; // แผนการเรียน
    }

    setLoading(true); // เริ่มรอ backend (ปุ่มจะกดไม่ได้)

    try {
      await axios.post('/api/users', data); // ส่งข้อมูลสมัครสมาชิกไปที่ backend

      // สมัครสำเร็จ ไปหน้ากรอก OTP
      // state คือข้อมูลที่ฝากไปให้หน้า OTP รู้ว่าต้องยืนยันอีเมลไหน
      navigate('/verify-otp', { state: { email: email, role: role } });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // backend ตอบกลับมาแต่ไม่ผ่าน เช่น อีเมลนี้มีบัญชีแล้ว
        setErrorMessage(error.response.data.message);
      } else {
        // ส่งไปไม่ถึง backend
        setErrorMessage('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
      }
    }

    setLoading(false); // เลิกรอ backend
  };

  // คลาสของช่องกรอกและ dropdown ใช้เหมือนกันทุกช่อง จึงเก็บไว้ในตัวแปรเดียว
  const inputClass =
    'min-h-11 w-full min-w-0 rounded-lg border border-[#D4D4D8] bg-white px-3 text-base placeholder:text-[#8A8F98] disabled:bg-[#F4F4F5] disabled:text-[#71717A]';

  return (
    // พื้นหลังเทาเต็มจอ และจัดทุกอย่างไว้ตรงกลาง
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F4F4F5] px-4 py-10 text-[#17181B]">
      {/* ชื่อระบบด้านบน */}
      <p className="text-[22px] font-semibold text-[#2347D6]">Class scheduling system</p>

      {/* กล่องสีขาวตรงกลาง (กว้างกว่าหน้า Login เพราะมีช่องกรอก 2 คอลัมน์) */}
      <div className="flex w-full max-w-[520px] flex-col gap-[18px] rounded-2xl border border-[#E4E4E7] bg-white px-6 pt-[26px] pb-[22px]">
        {/* หัวข้อ */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-semibold">สมัครสมาชิก</h1>

          {/* ป้ายบอกบทบาทที่เลือก พร้อมปุ่ม "เปลี่ยน" กลับไปหน้าเลือกประเภท */}
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FD] py-1 pr-1.5 pl-2.5 text-[13px] text-[#1A37A8]">
            {/* ไอคอน: นิสิตเป็นหมวกรับปริญญา อาจารย์เป็นกระดาน */}
            {role === 'student' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9l10-5 10 5-10 5-10-5z" />
                <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="13" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            )}
            <span className="font-semibold">{role === 'student' ? 'นิสิต' : 'อาจารย์'}</span>
            <Link to="/register" className="rounded-full bg-white px-2 py-0.5 text-xs text-[#2347D6] hover:text-[#1A37A8]">
              เปลี่ยน
            </Link>
          </span>

          {/* บอกว่าอยู่หน้าย่อยไหน */}
          <span className="text-sm text-[#71717A]">
            {step === 1 ? 'ข้อมูลบัญชี' : role === 'student' ? 'ข้อมูลการเรียน' : 'สังกัด'}
          </span>
        </div>

        {/* ================= หน้า 1: ข้อมูลบัญชี ================= */}
        {step === 1 && (
          // grid 1 คอลัมน์บนมือถือ และ 2 คอลัมน์เมื่อจอกว้างตั้งแต่ 640px (sm:)
          // noValidate = ปิดการตรวจของเบราว์เซอร์ ให้ใช้ข้อความภาษาไทยจาก handleNext แทน
          <form onSubmit={handleNext} noValidate className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
            {/* ชื่อ */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className="text-sm">ชื่อ (ภาษาไทย)</label>
              <input
                id="firstName"
                value={firstName} // ค่าในช่องมาจากตัวแปร firstName
                onChange={(e) => setFirstName(e.target.value)} // พิมพ์แล้วเก็บลงตัวแปร
                className={inputClass}
              />
            </div>

            {/* นามสกุล */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className="text-sm">นามสกุล (ภาษาไทย)</label>
              <input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* รหัสนิสิต / รหัสอาจารย์ */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="userCode" className="text-sm">{role === 'student' ? 'รหัสนิสิต' : 'รหัสอาจารย์'}</label>
              <input
                id="userCode"
                placeholder={role === 'student' ? '6621600xxx' : 'Q1234'} // ตัวอย่างรูปแบบรหัส
                maxLength={role === 'student' ? 10 : 5} // พิมพ์ได้ไม่เกินความยาวของรหัส
                value={userCode}
                // อาจารย์: แปลงเป็นตัวพิมพ์ใหญ่ให้เลย ผู้ใช้ไม่ต้องกด Shift
                onChange={(e) => setUserCode(role === 'professor' ? e.target.value.toUpperCase() : e.target.value)}
                className={inputClass}
              />
            </div>

            {/* อีเมล */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm">อีเมล</label>
              <input
                id="email"
                type="email"
                placeholder="example@ku.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* รหัสผ่าน */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm">รหัสผ่าน</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'} // ติ๊กแสดงรหัสผ่าน = เห็นตัวอักษร
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm">ยืนยันรหัสผ่าน</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* ช่องติ๊กแสดงรหัสผ่าน (col-span-full = กินเต็มแถว) */}
            <label className="col-span-full flex min-h-8 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)} // กดแล้วสลับ true/false
                className="size-4 accent-[#17181B]"
              />
              แสดงรหัสผ่าน
            </label>

            {/* กล่องสีแดง แสดงเมื่อมีข้อความ error */}
            {errorMessage !== '' && (
              <div className="col-span-full rounded-lg bg-[#FDECEA] px-3 py-2.5 text-sm text-[#9F1D14]">{errorMessage}</div>
            )}

            {/* ปุ่มถัดไป */}
            <button type="submit" className="col-span-full min-h-11 rounded-lg bg-[#17181B] text-[15px] font-semibold text-white">
              ถัดไป
            </button>
          </form>
        )}

        {/* ================= หน้า 2: ข้อมูลการเรียน / สังกัด ================= */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
            {/* แจ้งเตือนเมื่อโหลดรายชื่อคณะไม่สำเร็จ (dropdown คณะจะว่าง) */}
            {facultyError !== '' && (
              <div className="col-span-full rounded-lg bg-[#FDECEA] px-3 py-2.5 text-sm text-[#9F1D14]">{facultyError}</div>
            )}

            {/* คณะ */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="faculty" className="text-sm">คณะ</label>
              <select
                id="faculty"
                value={facultyId}
                onChange={(e) => {
                  setFacultyId(e.target.value); // เก็บคณะที่เลือก
                  setMajorId(''); // ล้างสาขาเดิม เพราะสาขาเดิมอาจไม่อยู่ในคณะใหม่
                }}
                className={inputClass}
              >
                <option value="">เลือกคณะ</option>
                {/* วนสร้างตัวเลือกจากรายชื่อคณะที่ได้จาก backend */}
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.faculty_name}
                  </option>
                ))}
              </select>
            </div>

            {/* สาขา (เลือกได้หลังจากเลือกคณะแล้ว) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="major" className="text-sm">{role === 'student' ? 'สาขา' : 'สาขาที่สังกัด'}</label>
              <select
                id="major"
                value={majorId}
                onChange={(e) => setMajorId(e.target.value)}
                disabled={facultyId === ''} // ยังไม่เลือกคณะ = กดไม่ได้
                className={inputClass}
              >
                <option value="">{facultyId === '' ? 'เลือกคณะก่อน' : 'เลือกสาขา'}</option>
                {/* ถ้าเลือกคณะแล้ว ให้วนสร้างตัวเลือกจากสาขาของคณะนั้น */}
                {selectedFaculty &&
                  selectedFaculty.majors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.major_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* ชั้นปีกับแผนการเรียน แสดงเฉพาะนิสิต */}
            {role === 'student' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="year" className="text-sm">ชั้นปี</label>
                <select id="year" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
                  <option value="">เลือกชั้นปี</option>
                  <option value="1">ปี 1</option>
                  <option value="2">ปี 2</option>
                  <option value="3">ปี 3</option>
                  <option value="4">ปี 4</option>
                  <option value="5">ปี 5</option>
                  <option value="6">ปี 6</option>
                  <option value="7">ปี 7</option>
                  <option value="8">ปี 8</option>
                </select>
              </div>
            )}

            {role === 'student' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="studyPlan" className="text-sm">แผนการเรียน</label>
                <select id="studyPlan" value={studyPlan} onChange={(e) => setStudyPlan(e.target.value)} className={inputClass}>
                  <option value="">เลือกแผน</option>
                  <option value="ภาคปกติ">ภาคปกติ</option>
                  <option value="ภาคพิเศษ">ภาคพิเศษ</option>
                </select>
              </div>
            )}

            {/* กล่องสีแดง แสดงเมื่อมีข้อความ error */}
            {errorMessage !== '' && (
              <div className="col-span-full rounded-lg bg-[#FDECEA] px-3 py-2.5 text-sm text-[#9F1D14]">{errorMessage}</div>
            )}

            {/* ปุ่มย้อนกลับ (กว้าง 1 ส่วน) กับปุ่มสมัคร (กว้าง 2 ส่วน) */}
            <div className="col-span-full mt-1 grid grid-cols-[1fr_2fr] gap-2.5">
              <button
                type="button" // type="button" = กดแล้วไม่ส่งฟอร์ม
                onClick={() => {
                  setStep(1); // กลับไปหน้า 1
                  setErrorMessage(''); // ล้างข้อความ error ของหน้า 2
                }}
                className="min-h-11 rounded-lg border border-[#D4D4D8] bg-white text-[15px]"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit" // กดแล้วส่งฟอร์ม → เรียก handleSubmit
                disabled={loading} // กำลังส่งข้อมูลอยู่ = กดไม่ได้
                className="min-h-11 rounded-lg bg-[#17181B] text-[15px] font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
              </button>
            </div>
          </form>
        )}

        {/* ลิงก์ไปหน้าเข้าสู่ระบบ */}
        <p className="text-center text-[13px]">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-[#2347D6] hover:text-[#1A37A8]">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage; // ส่งออกหน้านี้ให้ App.tsx นำไปใช้