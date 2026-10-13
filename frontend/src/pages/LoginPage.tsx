//ใช้เก็บข้อมูลที่ผู้ใช้กรอกเข้ามา
import { useState } from "react";
//Link สำหรับเปลี่ยนหน้าโดยไม่ reload
import { Link } from "react-router-dom";

function LoginPage(){
    //ใช้เก็บค่าอีเมลที่พิมพ์ email = ค่าปัจจุบัน, setEmail = ค่าที่จะใช้เปลี่ยน
    const [email, setEmail] = useState('')
    //เก็บค่ารหัสผ่านที่พิมพ์
    const [password, setPassword] = useState('')

    //function ส่งฟอร์มข้อมูล
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault() // ป้องกันหน้า reload
        //ส่วนนี้จะเอาไว้เชื่อ API ทีหลัง
        console.log('Login',{ email, password })
    }

    return(
        //กรอบพื้นหลัง
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {/*กล่อง*/}
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                {/*ข้อความ*/}
                <h1 className="text-2xl font-bold text-center mb-6">
                    เข้าสู่ระบบ
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example.e@ku.th"
                            required
                            className="w-full px-3 py-2 border
                            border-gray-300 rounded-md
                            focus:outline-none focus:ring-2
                            focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="****************"
                            required
                            className="w-full px-3 py-2 border
                            border-gray-300 rounded-md
                            focus:outline-none focus:ring-2
                            focis:ring-blue-500"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 text-while
                        py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    ยังไม่มีบัญชี?{' '}
                    {/*Link ไปหน้าสมัครสมาชิก*/}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        สมัครสมาชิก
                    </Link>
                </p>
            </div>

        </div>
    )
}
export default LoginPage