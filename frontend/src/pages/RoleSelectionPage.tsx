import React, { useState } from 'react'; // นำเข้า React และ useState hook สำหรับใช้งานตัวแปรเก็บสถานะ (State)

export const RoleSelectionPage: React.FC = () => { // ประกาศคอมโพเนนต์หลักชื่อ RoleSelection
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | null>(null); // สร้าง state เก็บค่า role ที่ผู้ใช้เลือก ('student' หรือ 'instructor')

  const handleSelectRole = (role: 'student' | 'instructor') => { // สร้างฟังก์ชันทำงานเมื่อผู้ใช้คลิกเลือกประเภทผู้ใช้งาน
    setSelectedRole(role); // อัปเดตค่า state ให้เก็บ role ที่ถูกเลือก
    // TODO: สามารถเพิ่มคำสั่งเชื่อมโยงเพื่อพาผู้ใช้ไปยังหน้า Register ถัดไปได้ที่นี่
  }; // สิ้นสุดฟังก์ชัน handleSelectRole

  return ( // เริ่มต้นส่วนการแสดงผลหน้าตาเว็บไซต์ (JSX)
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4"> 
      {/* กล่องใหญ่ที่สุดครอบทั้งหน้าจอ จัดเนื้อหาให้อยู่ตรงกลาง และมีพื้นหลังสีเทาอ่อน */}
      
      <h1 className="text-xl md:text-2xl font-bold text-indigo-900 mb-6"> 
        {/* หัวข้อชื่อระบบด้านบนสุด */}
        Class scheduling system
      </h1>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"> 
        {/* กล่องการ์ดสีขาวสำหรับใส่เนื้อหาเลือก Role ตรงกลาง */}
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-6"> 
          {/* สเต็ปย่อยจำลองด้านในกล่อง */}
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
          <span className="w-8 h-0.5 bg-emerald-500"></span>
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
          <span className="w-8 h-0.5 bg-gray-200"></span>
          <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">3</span>
        </div>

        <div className="mb-8"> 
          {/* หัวข้อหลักและคำอธิบายภายในกล่อง */}
          <h2 className="text-2xl font-bold text-gray-800">สมัครสมาชิก</h2>
          <p className="text-sm text-gray-500 mt-1">เลือกประเภทผู้ใช้งานของคุณ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"> 
          {/* กล่องตัวเลือกประเภทผู้ใช้งาน (แบ่งเป็น 2 คอลัมน์สำหรับ นิสิต และ อาจารย์) */}
          
          {/* ตัวเลือกที่ 1: นิสิต */}
          <div
            onClick={() => handleSelectRole('student')} // เมื่อคลิกจะเลือกบทบาทเป็นนิสิต
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
              selectedRole === 'student' 
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md' // หากถูกเลือก จะเปลี่ยนขอบเป็นสีม่วงและมีพื้นหลังจางๆ
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50' // สภาพปกติและตอนเอาเมาส์ชี้
            }`}
          >
            <div className="text-indigo-600 mb-3">
              {/* ไอคอนรูปหมวกรับปริญญา (SVG) */}
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 11.475A12.086 12.086 0 0112 21.5a12.086 12.086 0 01-6.16-2.427.083.083 0 01.665-11.475L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10v6M2 10v6" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">นิสิต</span>
          </div>

          {/* ตัวเลือกที่ 2: อาจารย์ */}
          <div
            onClick={() => handleSelectRole('instructor')} // เมื่อคลิกจะเลือกบทบาทเป็นอาจารย์
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
              selectedRole === 'instructor' 
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md' // หากถูกเลือก จะเปลี่ยนขอบเป็นสีม่วงและมีพื้นหลังจางๆ
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50' // สภาพปกติและตอนเอาเมาส์ชี้
            }`}
          >
            <div className="text-indigo-600 mb-3">
              {/* ไอคอนรูปกระดาน/บอร์ดสอนหนังสือ (SVG) */}
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M3 11h18" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">อาจารย์</span>
          </div>

        </div>

        <div className="text-sm text-gray-500"> 
          {/* ข้อความและลิงก์สำหรับผู้ที่มีบัญชีอยู่แล้ว */}
          มีบัญชีอยู่แล้ว?{' '}
          <a href="/login" className="text-indigo-600 font-medium hover:underline">
            เข้าสู่ระบบ
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;