CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Roles & Users ----------
CREATE TABLE roles (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) UNIQUE NOT NULL, -- admin, doctor, nurse, receptionist, lab_staff, pharmacist, accountant
    description   TEXT
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role_id         INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    action       VARCHAR(100) NOT NULL,
    entity       VARCHAR(100),
    entity_id    VARCHAR(100),
    details      JSONB,
    ip_address   VARCHAR(50),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ---------- Departments & Doctors ----------
CREATE TABLE departments (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) UNIQUE NOT NULL,
    description  TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctors (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id    INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    specialization   VARCHAR(150),
    qualification    VARCHAR(150),
    consultation_fee NUMERIC(10,2) DEFAULT 0,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctor_schedules (
    id           SERIAL PRIMARY KEY,
    doctor_id    UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week  SMALLINT NOT NULL, -- 0=Sun .. 6=Sat
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    slot_minutes INTEGER DEFAULT 15
);

-- ---------- Patients ----------
CREATE TABLE patients (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_code     VARCHAR(30) UNIQUE NOT NULL,
    full_name        VARCHAR(150) NOT NULL,
    date_of_birth    DATE,
    gender           VARCHAR(20),
    phone            VARCHAR(30),
    email            VARCHAR(150),
    address          TEXT,
    blood_group      VARCHAR(10),
    emergency_contact VARCHAR(150),
    created_by       UUID REFERENCES users(id),
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patient_documents (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id   UUID REFERENCES patients(id) ON DELETE CASCADE,
    file_name    VARCHAR(255) NOT NULL,
    file_path    VARCHAR(500) NOT NULL,
    file_type    VARCHAR(100),
    uploaded_by  UUID REFERENCES users(id),
    uploaded_at  TIMESTAMP DEFAULT NOW()
);

-- ---------- Appointments ----------
CREATE TABLE appointments (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id     UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id      UUID REFERENCES doctors(id) ON DELETE CASCADE,
    scheduled_at   TIMESTAMP NOT NULL,
    status         VARCHAR(30) DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled, no_show
    reason         TEXT,
    created_by     UUID REFERENCES users(id),
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

-- ---------- Admissions (Inpatient/Outpatient) ----------
CREATE TABLE wards (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    capacity    INTEGER DEFAULT 0
);

CREATE TABLE beds (
    id          SERIAL PRIMARY KEY,
    ward_id     INTEGER REFERENCES wards(id) ON DELETE CASCADE,
    bed_number  VARCHAR(20) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE
);

CREATE TABLE admissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id       UUID REFERENCES doctors(id),
    bed_id          INTEGER REFERENCES beds(id),
    admission_type  VARCHAR(20) NOT NULL, -- inpatient, outpatient
    admitted_at     TIMESTAMP DEFAULT NOW(),
    discharged_at   TIMESTAMP,
    status          VARCHAR(30) DEFAULT 'admitted', -- admitted, discharged
    notes           TEXT
);

-- ---------- Medical Records ----------
CREATE TABLE medical_records (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id    UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id     UUID REFERENCES doctors(id),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis     TEXT,
    treatment     TEXT,
    notes         TEXT,
    record_date   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescriptions (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id  UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id         UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id          UUID REFERENCES doctors(id),
    status             VARCHAR(30) DEFAULT 'pending', -- pending, processed, dispensed
    created_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id  UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id      UUID,
    dosage           VARCHAR(100),
    frequency        VARCHAR(100),
    duration         VARCHAR(100),
    instructions     TEXT
);

-- ---------- Laboratory ----------
CREATE TABLE lab_tests_catalog (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    price       NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE lab_test_requests (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id     UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id      UUID REFERENCES doctors(id),
    test_id        INTEGER REFERENCES lab_tests_catalog(id),
    status         VARCHAR(30) DEFAULT 'requested', -- requested, sample_collected, result_entered, report_ready
    sample_collected_at TIMESTAMP,
    result_entered_at   TIMESTAMP,
    result             TEXT,
    report_path        VARCHAR(500),
    requested_by        UUID REFERENCES users(id),
    processed_by         UUID REFERENCES users(id),
    created_at     TIMESTAMP DEFAULT NOW()
);

-- ---------- Pharmacy ----------
CREATE TABLE medicines (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    manufacturer    VARCHAR(150),
    unit_price      NUMERIC(10,2) DEFAULT 0,
    stock_quantity  INTEGER DEFAULT 0,
    reorder_level   INTEGER DEFAULT 10,
    expiry_date     DATE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stock_transactions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id  UUID REFERENCES medicines(id) ON DELETE CASCADE,
    change_qty   INTEGER NOT NULL, -- positive = restock, negative = dispensed
    reason       VARCHAR(150),
    performed_by UUID REFERENCES users(id),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ---------- Billing & Payments ----------
CREATE TABLE invoices (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(40) UNIQUE NOT NULL,
    patient_id     UUID REFERENCES patients(id) ON DELETE CASCADE,
    total_amount   NUMERIC(12,2) DEFAULT 0,
    paid_amount    NUMERIC(12,2) DEFAULT 0,
    status         VARCHAR(30) DEFAULT 'unpaid', -- unpaid, partial, paid
    created_by     UUID REFERENCES users(id),
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID REFERENCES invoices(id) ON DELETE CASCADE,
    category     VARCHAR(30) NOT NULL, -- consultation, laboratory, pharmacy, admission
    description  VARCHAR(255),
    amount       NUMERIC(12,2) NOT NULL,
    reference_id UUID
);

CREATE TABLE payments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount       NUMERIC(12,2) NOT NULL,
    method       VARCHAR(30) DEFAULT 'cash', -- cash, card, insurance
    received_by  UUID REFERENCES users(id),
    paid_at      TIMESTAMP DEFAULT NOW()
);

-- ---------- Staff / Employees ----------
CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id   INTEGER REFERENCES departments(id),
    designation     VARCHAR(100),
    date_joined     DATE,
    salary          NUMERIC(10,2),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id   UUID REFERENCES employees(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    status        VARCHAR(20) DEFAULT 'present', -- present, absent, half_day, leave
    check_in      TIME,
    check_out     TIME,
    UNIQUE(employee_id, date)
);

CREATE TABLE leave_records (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id  UUID REFERENCES employees(id) ON DELETE CASCADE,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    reason       TEXT,
    status       VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ---------- Seed roles ----------
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator'),
  ('doctor', 'Medical doctor'),
  ('nurse', 'Nursing staff'),
  ('receptionist', 'Front desk / registration'),
  ('lab_staff', 'Laboratory technician'),
  ('pharmacist', 'Pharmacy staff'),
  ('accountant', 'Billing / finance staff')
ON CONFLICT DO NOTHING;

-- ---------- Indexes ----------
CREATE INDEX idx_patients_name ON patients (full_name);
CREATE INDEX idx_appointments_doctor_date ON appointments (doctor_id, scheduled_at);
CREATE INDEX idx_invoices_patient ON invoices (patient_id);
CREATE INDEX idx_lab_requests_patient ON lab_test_requests (patient_id);