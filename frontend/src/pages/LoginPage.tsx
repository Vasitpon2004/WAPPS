import React, { useState } from 'react';
// ใช้สำหรับส่ง HTTP Request ไปยัง Backend
import axios from 'axios';
import { Link } from 'react-router-dom';

export const LoginPage = () => { 
  // ใช้สำหรับเก็บค่าอีเมล
  const [email, setEmail] = useState('');
  // ใช้สำหรับเก็บค่ารหัสผ่าน
  const [password, setPassword] = useState('');
  // ใช้สำหรับตรวจสอบสถานะกำลังโหลด
  const [loading, setLoading] = useState<boolean>(false);
  //ใช้เก็บข้อความแจ้งเตือนข้อผิดพลาด
  const [error, setError] = useState<string>('');

// ฟังก์ชันทำงานเมื่อกดปุ่มส่งฟอร์มล็อกอิน
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันไม่ให้เว็บรีโหลดหน้าใหม่เอง
    setLoading(true); // เปลี่ยนสถานะเป็นกำลังโหลด
    setError(''); // ล้างข้อความ error เก่า

    // ใช้ try เช็คข้อผิดพลาด
    try {
      // ส่งข้อมูลอีเมลและรหัสผ่านไปที่ API
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      // ดึง Token จากข้อมูลที่เซิร์ฟเวอร์ตอบกลับมา
      const token = response.data.access_token;
      // บันทึก Token ลงใน LocalStorage หรือหน่วยความจำชั่วคราวของเว็บเบราว์เซอร์ของผู้ใช้คนนั้นจริงๆ
      localStorage.setItem('token', token);
      
      alert('เข้าสู่ระบบสำเร็จ!'); 
      // TODO: พาผู้ใช้งานเปลี่ยนหน้าไปยังหน้าหลัก
      // ใช้ catch ข้อผิดพลาดที่อาจจะเกิดขึ้น
    } catch (error: any) {
      console.error('Login Error:', error);
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาตรวจสอบอีเมลและรหัสผ่านอีกครั้ง');
      // ส่วนนี้จะทำงานเสมอไม่ว่าจะสำเร็จหรือไม่
    } finally {
      setLoading(false); // set ค่า loading ให้กลับเป็น false 
    }
  };

  return ( // จัดเนื้อหาทั้งหมดของหน้าจอให้อยู่ตรงกลางในแนวตั้ง
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> 

      <div className="mb-6 text-center">
        {/*ใช้จัดข้อความ tracking-wider: จัดระยะห่างตัวอักษร*/}
        <h1 className="text-6xl font-extrabold text-blue-600 tracking-wider">
          WAPPS
        </h1>
      </div>
      {/*กล่องสีขาวตรงกลาง*/}
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-200"> 
        
        {/* หัวข้อและคำอธิบายภายในกล่องการ์ด */}
        <div className="text-center"> 
          <h2 className="text-2xl font-bold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            ระบบจัดการตารางเรียนและนัดหมาย
          </p>
        </div>

        {/* แสดงข้อความแจ้งเตือนเมื่อเกิด Error */}
        {error && ( 
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ฟอร์มล็อกอิน */}
        <form className="space-y-4" onSubmit={handleLogin}> 
          <div> {/* ช่องกรอกอีเมล */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล (@ku.th)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              placeholder="example@ku.th"
            />
          </div>

          <div> {/* ช่องกรอกรหัสผ่าน */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2"> {/* ปุ่มกดส่งฟอร์มเข้าสู่ระบบ */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#4f46e5] hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
            >
              {loading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}
            </button>
          </div>

          {/* ลิงก์ไปยังหน้าสมัครสมาชิก */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชีผู้ใช้?{' '}
              <Link to 
                ="/RoleSelection"
                className="font-medium text-indigo-600 hover:text-indigo-500 underline"
                >
                สมัครสมาชิกที่นี่
                </Link>
            </p>
          </div>
        </form>
      </div>

    </div>
  );
};

export default LoginPage;