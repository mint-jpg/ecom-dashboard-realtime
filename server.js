const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const REFRESH_INTERVAL = process.env.REFRESH_INTERVAL || 5000; // 5 seconds

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========================
// ZOHO DESK API Configuration
// ========================

const ZOHO_API_KEY = process.env.ZOHO_API_KEY;
const ZOHO_AUTH_TOKEN = process.env.ZOHO_AUTH_TOKEN;
const ZOHO_ORG_ID = process.env.ZOHO_ORG_ID;
const ZOHO_API_URL = process.env.ZOHO_API_URL;

const zohoAxios = axios.create({
  baseURL: ZOHO_API_URL,
  headers: {
    'Authorization': `Zoho-authtoken ${ZOHO_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// ========================
// Global State
// ========================

let dashboardData = {
  totalTickets: 0,
  closedTickets: 0,
  openTickets: 0,
  urgentTickets: 0,
  avgResolution: 0,
  activeTime: 0,
  workload: 0,
  tickets: [],
  dailyStats: [],
  channelDistribution: {},
  priorityDistribution: {},
  lastUpdated: new Date(),
  error: null
};

let allClients = [];

// ========================
// ZOHO DESK API Functions
// ========================

/**
 * ดึงข้อมูล Tickets ทั้งหมดจาก Zoho Desk (ไม่มีขีดจำกัด)
 */
async function fetchAllTickets() {
  try {
    let allTickets = [];
    let pageIndex = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await zohoAxios.get('/tickets', {
        params: {
          organizationId: ZOHO_ORG_ID,
          pageIndex: pageIndex,
          sortBy: 'createdTime',
          limit: 100
        }
      });

      if (response.data && response.data.data) {
        allTickets = allTickets.concat(response.data.data);
        hasMore = response.data.data.length === 100;
        pageIndex++;
      } else {
        hasMore = false;
      }

      // ป้องกัน rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return allTickets;
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    return [];
  }
}

/**
 * ประมวลผลและคำนวณสถิติจากข้อมูล Tickets
 */
function processTicketData(tickets) {
  const stats = {
    totalTickets: tickets.length,
    closedTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
    avgResolution: 0,
    activeTime: 0,
    workload: 0,
    tickets: [],
    dailyStats: {},
    channelDistribution: {},
    priorityDistribution: {}
  };

  let totalResolutionTime = 0;
  let totalActiveTime = 0;
  let resolutionCount = 0;

  tickets.forEach(ticket => {
    // Count by status
    if (ticket.status === 'Closed' || ticket.status === 'closed') {
      stats.closedTickets++;
    } else if (ticket.status === 'Open' || ticket.status === 'open') {
      stats.openTickets++;
    }

    // Count urgent tickets
    if (ticket.priority === 'High' || ticket.priority === 'Urgent') {
      stats.urgentTickets++;
    }

    // Channel distribution
    const channel = ticket.channel || 'Unknown';
    stats.channelDistribution[channel] = (stats.channelDistribution[channel] || 0) + 1;

    // Priority distribution
    const priority = ticket.priority || 'Normal';
    stats.priorityDistribution[priority] = (stats.priorityDistribution[priority] || 0) + 1;

    // Calculate resolution time
    if (ticket.resolutionTime) {
      totalResolutionTime += ticket.resolutionTime;
      resolutionCount++;
    }

    // Active time (mock calculation)
    if (ticket.customFields && ticket.customFields.activeTime) {
      totalActiveTime += parseInt(ticket.customFields.activeTime) || 0;
    }

    // Daily summary
    const createdDate = new Date(ticket.createdTime).toISOString().split('T')[0];
    if (!stats.dailyStats[createdDate]) {
      stats.dailyStats[createdDate] = { created: 0, closed: 0 };
    }
    stats.dailyStats[createdDate].created++;
    if (ticket.status === 'Closed' || ticket.status === 'closed') {
      stats.dailyStats[createdDate].closed++;
    }
  });

  // Calculate averages
  stats.avgResolution = resolutionCount > 0 ? Math.round(totalResolutionTime / resolutionCount) : 0;
  stats.activeTime = totalActiveTime;
  stats.workload = Math.round((totalActiveTime / (8 * 60)) * 100); // 8 hours in minutes

  // Keep last 100 tickets for display
  stats.tickets = tickets.slice(0, 100).map(ticket => ({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    channel: ticket.channel,
    department: ticket.department,
    assignee: ticket.assignee,
    createdTime: ticket.createdTime,
    modifiedTime: ticket.modifiedTime
  }));

  return stats;
}

/**
 * อัพเดตข้อมูล Dashboard แบบ Real-time
 */
async function updateDashboardData() {
  try {
    console.log(`[${new Date().toISOString()}] Fetching data from Zoho Desk...`);
    const tickets = await fetchAllTickets();
    const stats = processTicketData(tickets);

    dashboardData = {
      ...stats,
      lastUpdated: new Date(),
      error: null
    };

    console.log(`[${new Date().toISOString()}] ✅ Updated: ${dashboardData.totalTickets} tickets`);

    // Broadcast to all connected clients
    broadcastUpdate();
  } catch (error) {
    console.error('Error updating dashboard:', error.message);
    dashboardData.error = error.message;
    dashboardData.lastUpdated = new Date();
  }
}

/**
 * ส่งข้อมูลไปยัง WebSocket clients ทั้งหมด
 */
function broadcastUpdate() {
  const message = JSON.stringify(dashboardData);
  allClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ========================
// HTTP Endpoints
// ========================

/**
 * GET /api/data - ดึงข้อมูล Dashboard ปัจจุบัน
 */
app.get('/api/data', (req, res) => {
  res.json(dashboardData);
});

/**
 * GET /api/health - Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    connectedClients: allClients.length
  });
});

// ========================
// WebSocket Server
// ========================

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('✅ WebSocket client connected. Total clients:', allClients.length + 1);
  allClients.push(ws);

  // ส่งข้อมูลเดิมให้ client ใหม่
  ws.send(JSON.stringify(dashboardData));

  // Handle disconnect
  ws.on('close', () => {
    allClients = allClients.filter(client => client !== ws);
    console.log('❌ WebSocket client disconnected. Remaining clients:', allClients.length);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

// ========================
// Auto-Update Scheduler
// ========================

// ดึงข้อมูลครั้งแรกทันที
setTimeout(() => updateDashboardData(), 1000);

// ดึงข้อมูลอัตโนมัติทุก 5 วินาที
setInterval(updateDashboardData, REFRESH_INTERVAL);

console.log(`⏰ Auto-refresh interval: ${REFRESH_INTERVAL}ms`);

// ========================
// Start Server
// ========================

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗`);
  console.log(`║  🚀 ECOM Dashboard Server Started        ║`);
  console.log(`╚════════════════════════════════════════════╝
`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔄 Refresh Interval: ${REFRESH_INTERVAL}ms (${REFRESH_INTERVAL / 1000}s)`);
  console.log(`📊 API: ${ZOHO_API_URL}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}\n`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
