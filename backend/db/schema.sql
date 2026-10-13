CREATE TABLE faculties(
	id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name       VARCHAR(50) NOT NULL UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE majors(
	id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	-- ใช้ RESTRICT เพื่อกันลบคณะออก
	faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE RESTRICT,
	name       VARCHAR(80) NOT NULL,
	
	CONSTRAINT uq_majors_faculty_name UNIQUE (faculty_id, name)
);

CREATE TABLE users(
	id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	email          VARCHAR(255)  NOT NULL UNIQUE
	               CONSTRAINT chk_users_email_domain CHECK (email ~* '^[^@\s]+@ku\.th$'),
	password_hash  VARCHAR(255) NOT NULL,
	full_name      VARCHAR(150) NOT NULL,
	role           VARCHAR(20)  NOT NULL
	               CONSTRAINT chk_users_role
				   CHECK (role IN ('student','professor','admin')),
	student_code   VARCHAR(15) UNIQUE,
	professor_code VARCHAR(6) UNIQUE,
	--ใข้เพื่อไม่ให้ลบข้อมูลสาขาออกหากยังมีนิสิตอยู่ในสาขานั้น
	major_id       INTEGER REFERENCES majors(id) ON DELETE RESTRICT,
	is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
	--ถ้าถูกปิดจะทำให้ข้อมูลผู้ใช้นั้นสร้างไว้ เช่น นัดหมาย บันทึกกิจกรรม จะหายไปด้วย
	is_active      BOOLEAN NOT NULL DEFAULT TRUE,
	discord_id     VARCHAR(32) UNIQUE, 
	created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	--เช็คว่าถ้าเป็นนิสิต student_code, major_id ต้องไม่ว่าง แต่ professor_code ต้องว่าง
	CONSTRAINT chk_users_student_fields CHECK(
		role <> 'student' OR (
			student_code       IS NOT NULL
			AND major_id       IS NOT NULL
			AND professor_code IS NULL
		)
	),
	--เช็คว่าถ้าเป็นอาจารย์ professor_code, major_id ต้องไม่ว่าง แต่ student_code ต้องว่าง
	CONSTRAINT chk_users_professor_fields CHECK(
		role <> 'professor' OR (
			professor_code   IS NOT NULL
			AND major_id     IS NOT NULL
			AND student_code IS NULL
		)
	),
	--เช็คว่าถ้าเป็นแอดมิน student_code และprofessor_code ต้องว่าง
	CONSTRAINT chk_users_admin_fields CHECK(
		role <> 'admin' OR (
			student_code       IS NULL
			AND professor_code IS NULL
		)
	)
);


-- สร้างดัชนีข้อมูลผู้ใช้ในแต่ละ role เพื่อง่ายต่อการดึงข้อมูลมา
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE otp_verify(
	id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	--ถ้าผู้ใช้งานโดนลบข้อมูล user_id ใน otp_verify จะหายไปด้วย
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	code_hash  VARCHAR(255) NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	is_used    BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	--ใช้เช็คว่าเวลาหมดอายุต้องมากกว่าเวลาสร้าง
	CONSTRAINT chk_otp_expires CHECK (expires_at > created_at)
);
--สร้างดัชนีข้อมูลผู้ใช้ที่ขอรหัส otp ไล่จากเวลาล่าสุด
CREATE INDEX idx_otp_user_created ON otp_verify (user_id, is_used, created_at DESC);