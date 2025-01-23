# ระบบสร้างแบบทดสอบ (Quiz Form Creation System)

## ภาพรวมของโปรเจค
นี่คือโปรเจคแบบ Full-stack สำหรับการสร้างและจัดการแบบทดสอบ โดยโปรเจคแบ่งออกเป็น 2 ส่วนหลัก:

1. **Backend**: จัดการตรรกะฝั่งเซิร์ฟเวอร์และ API endpoints
2. **Frontend**: ให้ผู้ใช้สามารถสร้างและโต้ตอบกับแบบทดสอบผ่านหน้าจอ UI

---

## ข้อกำหนดเบื้องต้น
ก่อนที่จะรันโปรเจค โปรดตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งสิ่งเหล่านี้บนเครื่องของคุณ:

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 16 หรือใหม่กว่า)
- [npm](https://www.npmjs.com/) (มาพร้อมกับ Node.js)

---

## วิธีการรันโปรเจค

### ฝั่ง Backend
1. ไปที่โฟลเดอร์ Backend:
   ```bash
   cd Backend_QuizCreation
   ```
2. ติดตั้ง dependencies:
   ```bash
   npm install
   ```
3. รันเซิร์ฟเวอร์ Backend โดยใช้ `nodemon`:
   ```bash
   nodemon index.js
   ```
4. เซิร์ฟเวอร์ Backend จะเริ่มทำงาน โดยค่าเริ่มต้นจะฟังที่พอร์ต `3000` (หรือพอร์ตที่กำหนดไว้ใน config)

### ฝั่ง Frontend
1. ไปที่โฟลเดอร์ Frontend:
   ```bash
   cd frontend-createquiz
   ```
2. ติดตั้ง dependencies:
   ```bash
   npm install
   ```
3. รันเซิร์ฟเวอร์ Frontend:
   ```bash
   npm run dev
   ```
4. ระบบ Frontend จะเริ่มทำงาน โดยค่าเริ่มต้นสามารถเข้าถึงได้ที่ `http://localhost:5173` (หรือพอร์ตที่กำหนดไว้ใน config)

---

## โครงสร้างโฟลเดอร์
```
Quiz-Form_Creation_System
├── Backend_QuizCreation   # โฟลเดอร์ Backend พร้อมโค้ดฝั่งเซิร์ฟเวอร์
├── frontend-createquiz    # โฟลเดอร์ Frontend พร้อมโค้ดฝั่งผู้ใช้
└── README.md              # เอกสารอธิบายโปรเจค
```

---

## หมายเหตุ
- โปรดแน่ใจว่าได้รัน Backend ก่อนที่จะเข้าถึง Frontend เพื่อให้ API endpoints ทำงานได้อย่างถูกต้อง
- หากคุณพบปัญหากับ `nodemon` สามารถติดตั้งแบบ global ได้ด้วยคำสั่ง:
  ```bash
  npm install -g nodemon
  ```

คุณสามารถปรับแต่งโปรเจคนี้ตามต้องการ ขอให้สนุกกับการพัฒนา!

