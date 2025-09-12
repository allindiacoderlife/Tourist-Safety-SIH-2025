const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*", // Configure this properly for production
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
    console.log('Socket.IO server initialized');
    return this.io;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle dashboard connection
      socket.on('dashboard:join', (data) => {
        socket.join('dashboard');
        this.connectedClients.set(socket.id, {
          type: 'dashboard',
          joinedAt: new Date(),
          ...data
        });
        console.log(`Dashboard client joined: ${socket.id}`);
        
        // Send current stats to the newly connected dashboard
        this.sendDashboardStats(socket);
      });

      // Handle mobile app connection
      socket.on('mobile:join', (data) => {
        const { userId } = data;
        socket.join(`user:${userId}`);
        this.connectedClients.set(socket.id, {
          type: 'mobile',
          userId,
          joinedAt: new Date(),
          ...data
        });
        console.log(`Mobile client joined: ${socket.id}, userId: ${userId}`);
      });

      // Handle SOS acknowledgment from dashboard
      socket.on('sos:acknowledge', (data) => {
        const { alertId, acknowledgedBy } = data;
        console.log(`SOS alert ${alertId} acknowledged by ${acknowledgedBy}`);
        
        // Emit acknowledgment to all dashboard clients
        socket.to('dashboard').emit('sos:acknowledged', {
          alertId,
          acknowledgedBy,
          acknowledgedAt: new Date()
        });
      });

      // Handle location updates from mobile
      socket.on('location:update', (data) => {
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo && clientInfo.type === 'mobile') {
          // Broadcast location update to dashboard
          this.io.to('dashboard').emit('location:updated', {
            userId: clientInfo.userId,
            location: data.location,
            timestamp: new Date()
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const clientInfo = this.connectedClients.get(socket.id);
        console.log(`Client disconnected: ${socket.id}`, clientInfo?.type || 'unknown');
        this.connectedClients.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error from ${socket.id}:`, error);
      });
    });
  }

  // Emit new SOS alert to dashboard
  emitSOSAlert(sosAlert) {
    if (!this.io) return;

    console.log(`Emitting SOS alert to dashboard: ${sosAlert.id}`);
    
    this.io.to('dashboard').emit('sos:new_alert', {
      alert: sosAlert,
      timestamp: new Date()
    });

    // Also emit to the specific user if they're connected
    if (sosAlert.userId) {
      this.io.to(`user:${sosAlert.userId}`).emit('sos:alert_created', {
        alert: sosAlert,
        message: 'Your SOS alert has been created and sent to emergency responders',
        timestamp: new Date()
      });
    }
  }

  // Emit SOS alert update to relevant clients
  emitSOSUpdate(sosAlert, updateType = 'updated') {
    if (!this.io) return;

    console.log(`Emitting SOS ${updateType} to dashboard: ${sosAlert.id}`);
    
    this.io.to('dashboard').emit('sos:alert_updated', {
      alert: sosAlert,
      updateType,
      timestamp: new Date()
    });

    // Notify the user about the status change
    if (sosAlert.userId) {
      let userMessage = '';
      switch (sosAlert.status) {
        case 'resolved':
          userMessage = 'Your SOS alert has been resolved by emergency responders';
          break;
        case 'cancelled':
          userMessage = 'Your SOS alert has been cancelled';
          break;
        default:
          userMessage = 'Your SOS alert has been updated';
      }

      this.io.to(`user:${sosAlert.userId}`).emit('sos:alert_updated', {
        alert: sosAlert,
        message: userMessage,
        updateType,
        timestamp: new Date()
      });
    }
  }

  // Send current dashboard statistics
  async sendDashboardStats(socket = null) {
    if (!this.io) return;

    try {
      const { SOS } = require('../models');
      
      const stats = {
        activeAlerts: await SOS.countDocuments({ status: 'active' }),
        resolvedToday: await SOS.countDocuments({
          status: 'resolved',
          resolvedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }),
        totalAlertsToday: await SOS.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }),
        connectedClients: this.getConnectedClientsStats()
      };

      const eventData = {
        stats,
        timestamp: new Date()
      };

      if (socket) {
        socket.emit('dashboard:stats', eventData);
      } else {
        this.io.to('dashboard').emit('dashboard:stats', eventData);
      }
    } catch (error) {
      console.error('Error sending dashboard stats:', error);
    }
  }

  // Get connected clients statistics
  getConnectedClientsStats() {
    const stats = {
      total: this.connectedClients.size,
      dashboard: 0,
      mobile: 0
    };

    this.connectedClients.forEach((client) => {
      if (client.type === 'dashboard') {
        stats.dashboard++;
      } else if (client.type === 'mobile') {
        stats.mobile++;
      }
    });

    return stats;
  }

  // Send notification to specific user
  emitToUser(userId, event, data) {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  // Send broadcast to all dashboard clients
  emitToDashboard(event, data) {
    if (!this.io) return;
    
    this.io.to('dashboard').emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  // Send emergency broadcast to all clients
  emitEmergencyBroadcast(data) {
    if (!this.io) return;
    
    this.io.emit('emergency:broadcast', {
      ...data,
      priority: 'critical',
      timestamp: new Date()
    });
  }

  // Get IO instance
  getIO() {
    return this.io;
  }

  // Check if service is initialized
  isInitialized() {
    return this.io !== null;
  }
}

// Create singleton instance
const socketService = new SocketService();

module.exports = socketService;
