# 🚀 ECOM Dashboard - Real-time Support Dashboard

Real-time Support Dashboard ที่ดึงข้อมูลจาก Zoho Desk โดยอัตโนมัติทุก 5 วินาที

## ✨ Features

✅ **Real-time Updates** - ดึงข้อมูลอัตโนมัติทุก 5 วินาที
✅ **No Data Limits** - แสดงข้อมูล Tickets ทั้งหมด (Open + Closed)
✅ **Live Statistics** - สถิติแบบ Live (Total, Open, Closed, Urgent, etc.)
✅ **WebSocket Support** - อัพเดทแบบ Real-time บน page เดียว
✅ **Dashboard UI** - Dashboard สวยงาม พร้อม Charts
✅ **Filter & Search** - ค้นหา Filter by Status, Priority, Channel
✅ **Export Data** - Export เป็น CSV

## 🛠️ Tech Stack

- **Backend:** Node.js + Express.js
- **Real-time:** WebSocket (ws)
- **API Integration:** Zoho Desk
- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla)
- **HTTP Client:** Axios

## 📦 Installation

```bash
# Clone Repository
git clone https://github.com/mint-jpg/ecom-dashboard-realtime.git
cd ecom-dashboard-realtime

# Install Dependencies
npm install

# Run Server
npm start
```

จากนั้นเปิด Browser ไปที่: **http://localhost:3000**

## 🔧 Environment Variables

สร้างไฟล์ `.env` โดยใส่:

```
PORT=3000
ZOHO_API_KEY=your_api_key
ZOHO_AUTH_TOKEN=your_auth_token
ZOHO_ORG_ID=your_org_id
ZOHO_API_URL=https://desk.zoho.com/api/v1
REFRESH_INTERVAL=5000
```

## 📊 Dashboard Features

### Statistics Display
- **TOTAL** - จำนวน Tickets ทั้งหมด
- **CLOSED** - จำนวน Tickets ที่ปิดแล้ว
- **OPEN** - จำนวน Tickets ที่เปิดอยู่
- **P1 URGENT** - Tickets ด่วนที่สุด
- **AVG RESOLUTION** - เวลาเฉลี่ยในการแก้ไข
- **ACTIVE TIME** - เวลาทำงานจริง
- **WORKLOAD** - โหลดการทำงาน %

### Data Tables
- **Ticket List** - รายการ Tickets ทั้งหมดพร้อมรายละเอียด
- **Daily Summary** - สรุปรายวัน
- **Channel Distribution** - การกระจายตัวตามช่องทาง
- **Priority Distribution** - การกระจายตัวตามลำดับความสำคัญ

## 🔄 Real-time Updates

Server ดึงข้อมูล Zoho Desk ทุก 5 วินาที:

```
1. ดึงข้อมูล Tickets ทั้งหมด
2. ประมวลผล & คำนวณสถิติ
3. ส่งข้อมูลไป Browser ผ่าน WebSocket
4. Dashboard Update อัตโนมัติแบบ Real-time
```

## 📁 Project Structure

```
ecom-dashboard-realtime/
├── server.js              # Main Server (Node.js + Express)
├── package.json           # Dependencies
├── .env                   # Environment Variables
├── .gitignore             # Git Ignore
├── README.md              # Documentation
└── public/
    └── index.html         # Frontend Dashboard
```

## 🚀 Usage

1. **Install & Start Server:**
   ```bash
   npm install
   npm start
   ```

2. **Open Browser:**
   - ไปที่ http://localhost:3000

3. **Monitor Dashboard:**
   - ดูข้อมูลอัตโนมัติแบบ Real-time
   - ข้อมูลจะอัพเดททุก 5 วินาที

## 🔐 Security Notes

⚠️ **Important:**
- API Credentials ใน `.env` ต้องเก็บให้ปลอดภัย
- ไม่ควร commit `.env` ไปที่ GitHub
- Regenerate API Keys ใน Zoho Desk เมื่อมีการ expose

## 📈 Performance

- ✅ ไม่มีขีดจำกัดในการแสดงข้อมูล
- ✅ WebSocket สำหรับการส่งข้อมูลแบบ Real-time
- ✅ Caching ข้อมูลในหน่วยความจำ
- ✅ Optimized API Calls ทุก 5 วินาที

## 📱 Responsive Design

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🐛 Troubleshooting

### Port Already in Use
```bash
# เปลี่ยน PORT ใน .env
PORT=3001
```

### API Credentials Invalid
- ตรวจสอบ `.env` file
- Regenerate API Keys ใน Zoho Desk

### WebSocket Connection Failed
- ตรวจสอบว่า Server กำลังทำงาน
- ลองรีเฟรช Browser

## 📞 Support

ถ้ามีปัญหา:
1. ตรวจสอบ Server logs
2. ตรวจสอบ Browser Console (F12)
3. ตรวจสอบ Network tab

## 📄 License

MIT License

---

**Created with ❤️ by Copilot**
