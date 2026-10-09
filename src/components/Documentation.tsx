import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Cpu, Server, FileCode, Settings, Rocket, Copy, Check } from 'lucide-react';

type DocSection = 'database' | 'firmware' | 'backend' | 'frontend' | 'config' | 'deploy';

const sections: { id: DocSection; label: string; icon: typeof Database }[] = [
  { id: 'database', label: 'Database Schema', icon: Database },
  { id: 'firmware', label: 'ESP32 Firmware', icon: Cpu },
  { id: 'backend', label: 'Backend API', icon: Server },
  { id: 'frontend', label: 'Frontend Alert', icon: FileCode },
  { id: 'config', label: 'Configuration', icon: Settings },
  { id: 'deploy', label: 'Deployment', icon: Rocket },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState<DocSection>('database');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<DocSection, { language: string; filename: string; code: string }> = {
    database: {
      language: 'sql',
      filename: 'database/schema.sql',
      code: `-- FloodGuard Database Schema (PostgreSQL)
-- Complete schema for IoT flood monitoring system

-- Sensors table
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    max_water_level DECIMAL(6, 2) NOT NULL, -- cm
    alert_threshold_watch DECIMAL(4, 2) DEFAULT 45.0,
    alert_threshold_warning DECIMAL(4, 2) DEFAULT 65.0,
    alert_threshold_emergency DECIMAL(4, 2) DEFAULT 85.0,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    firmware_version VARCHAR(20),
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings (time-series data)
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    water_level DECIMAL(6, 2) NOT NULL, -- cm
    temperature DECIMAL(5, 2), -- °C
    humidity DECIMAL(5, 2), -- %
    rainfall DECIMAL(6, 2), -- mm/hr
    battery_level DECIMAL(5, 2), -- %
    signal_strength INTEGER, -- dBm
    alert_tier VARCHAR(20) DEFAULT 'normal',
    raw_payload JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert events
CREATE TABLE alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('watch', 'warning', 'emergency')),
    message TEXT NOT NULL,
    water_level DECIMAL(6, 2) NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    sms_sent BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users / Residents
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20),
    zone VARCHAR(100), -- flood zone assignment
    role VARCHAR(20) DEFAULT 'resident' CHECK (role IN ('admin', 'operator', 'resident')),
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_readings_sensor_time ON sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX idx_alerts_created ON alert_events(created_at DESC);
CREATE INDEX idx_alerts_tier ON alert_events(tier) WHERE acknowledged = FALSE;
CREATE INDEX idx_users_zone ON users(zone);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sensors_updated_at
    BEFORE UPDATE ON sensors
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();`,
    },
    firmware: {
      language: 'cpp',
      filename: 'firmware/flood_sensor.ino',
      code: `/*
 * FloodGuard ESP32 IoT Sensor Firmware
 * Reads water level, temperature, humidity, and rainfall
 * Sends data to backend API via WiFi
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>

// === Configuration ===
const char* WIFI_SSID = "FloodGuard_Network";
const char* WIFI_PASS = "secure_password_123";
const char* API_URL = "http://192.168.1.100:3000/api/readings";
const char* SENSOR_ID = "sensor-001";
const int READ_INTERVAL = 30000; // 30 seconds

// === Pin Definitions ===
#define ULTRASONIC_TRIG 5
#define ULTRASONIC_ECHO 18
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define RAIN_PIN 34
#define BATTERY_PIN 35
#define LED_STATUS 2

// === Objects ===
DHT dht(DHT_PIN, DHT_TYPE);

// === Globals ===
float maxWaterLevel = 300.0; // cm - sensor max range
unsigned long lastReadTime = 0;
int wifiRetryCount = 0;

void setup() {
    Serial.begin(115200);
    pinMode(ULTRASONIC_TRIG, OUTPUT);
    pinMode(ULTRASONIC_ECHO, INPUT);
    pinMode(LED_STATUS, OUTPUT);
    pinMode(RAIN_PIN, INPUT);
    pinMode(BATTERY_PIN, INPUT);
    
    dht.begin();
    connectWiFi();
    blinkLED(3); // Ready indicator
}

void loop() {
    if (millis() - lastReadTime >= READ_INTERVAL) {
        lastReadTime = millis();
        
        // Read all sensors
        float waterLevel = readWaterLevel();
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();
        float rainfall = readRainfall();
        int battery = readBattery();
        int signal = WiFi.RSSI();
        
        // Determine alert tier
        String tier = getAlertTier(waterLevel);
        
        // Send to API
        if (WiFi.status() == WL_CONNECTED) {
            sendToServer(waterLevel, temperature, humidity, 
                        rainfall, battery, signal, tier);
        } else {
            connectWiFi();
        }
        
        // Local LED indication
        if (tier == "emergency") {
            blinkLEDFast();
        } else if (tier == "warning") {
            blinkLED(2);
        }
    }
}

float readWaterLevel() {
    digitalWrite(ULTRASONIC_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(ULTRASONIC_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(ULTRASONIC_TRIG, LOW);
    
    long duration = pulseIn(ULTRASONIC_ECHO, HIGH);
    float distance = duration * 0.034 / 2; // cm
    
    // Convert distance to water level
    float waterLevel = maxWaterLevel - distance;
    return constrain(waterLevel, 0, maxWaterLevel);
}

float readRainfall() {
    int raw = analogRead(RAIN_PIN);
    return map(raw, 0, 4095, 0, 50); // 0-50 mm/hr
}

int readBattery() {
    int raw = analogRead(BATTERY_PIN);
    return map(raw, 0, 4095, 0, 100);
}

String getAlertTier(float level) {
    float pct = (level / maxWaterLevel) * 100;
    if (pct >= 85) return "emergency";
    if (pct >= 65) return "warning";
    if (pct >= 45) return "watch";
    return "normal";
}

void sendToServer(float water, float temp, float hum,
                  float rain, int batt, int sig, String tier) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Sensor-ID", SENSOR_ID);
    
    StaticJsonDocument<512> doc;
    doc["sensor_id"] = SENSOR_ID;
    doc["water_level"] = water;
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["rainfall"] = rain;
    doc["battery"] = batt;
    doc["signal"] = sig;
    doc["alert_tier"] = tier;
    doc["timestamp"] = millis();
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    if (httpCode == 200) {
        Serial.println("✓ Data sent successfully");
    } else {
        Serial.printf("✗ HTTP Error: %d\\n", httpCode);
    }
    http.end();
}

void connectWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\\nWiFi Connected: " + WiFi.localIP().toString());
        wifiRetryCount = 0;
    }
}

void blinkLED(int times) {
    for (int i = 0; i < times; i++) {
        digitalWrite(LED_STATUS, HIGH);
        delay(200);
        digitalWrite(LED_STATUS, LOW);
        delay(200);
    }
}

void blinkLEDFast() {
    digitalWrite(LED_STATUS, !digitalRead(LED_STATUS));
}`,
    },
    backend: {
      language: 'javascript',
      filename: 'backend/server.js',
      code: `// FloodGuard Backend API - Node.js + Express
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// === IoT Sensor Data Ingestion ===
app.post('/api/readings', async (req, res) => {
    const { sensor_id, water_level, temperature, humidity,
            rainfall, battery, signal, alert_tier } = req.body;
    
    try {
        // Store reading
        await pool.query(
            \`INSERT INTO sensor_readings 
             (sensor_id, water_level, temperature, humidity, 
              rainfall, battery_level, signal_strength, alert_tier)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)\`,
            [sensor_id, water_level, temperature, humidity,
             rainfall, battery, signal, alert_tier]
        );
        
        // Update sensor last heartbeat
        await pool.query(
            \`UPDATE sensors SET last_heartbeat = NOW(),
             status = 'online' WHERE id = $1\`,
            [sensor_id]
        );
        
        // Check alert thresholds
        if (alert_tier !== 'normal') {
            const sensor = await pool.query(
                'SELECT * FROM sensors WHERE id = $1', [sensor_id]
            );
            
            // Create alert event
            const alert = await pool.query(
                \`INSERT INTO alert_events 
                 (sensor_id, tier, message, water_level)
                 VALUES ($1, $2, $3, $4) RETURNING *\`,
                [sensor_id, alert_tier,
                 generateAlertMessage(alert_tier, water_level),
                 water_level]
            );
            
            // Broadcast to all connected dashboards
            io.emit('new-alert', alert.rows[0]);
            
            // Trigger SMS/Email for emergency
            if (alert_tier === 'emergency') {
                await sendEmergencyNotifications(sensor.rows[0]);
            }
        }
        
        // Broadcast real-time update
        io.emit('sensor-update', {
            sensor_id, water_level, temperature,
            humidity, rainfall, battery, alert_tier,
            timestamp: new Date()
        });
        
        res.json({ status: 'ok', alert_tier });
    } catch (err) {
        console.error('Ingestion error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// === Dashboard API Endpoints ===
app.get('/api/sensors', async (req, res) => {
    const result = await pool.query(
        \`SELECT s.*, 
         (SELECT water_level FROM sensor_readings 
          WHERE sensor_id = s.id 
          ORDER BY recorded_at DESC LIMIT 1) as current_level
         FROM sensors s ORDER BY s.name\`
    );
    res.json(result.rows);
});

app.get('/api/alerts', async (req, res) => {
    const { tier, acknowledged, limit = 50 } = req.query;
    let query = 'SELECT * FROM alert_events WHERE 1=1';
    const params = [];
    
    if (tier) { params.push(tier); query += \` AND tier = $\${params.length}\`; }
    if (acknowledged !== undefined) { 
        params.push(acknowledged === 'true'); 
        query += \` AND acknowledged = $\${params.length}\`; 
    }
    
    query += \` ORDER BY created_at DESC LIMIT $\${params.length + 1}\`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
});

app.post('/api/alerts/:id/acknowledge', async (req, res) => {
    const { id } = req.params;
    const { user } = req.body;
    await pool.query(
        \`UPDATE alert_events SET acknowledged = TRUE,
         acknowledged_by = $1, acknowledged_at = NOW()
         WHERE id = $2\`,
        [user, id]
    );
    res.json({ status: 'acknowledged' });
});

app.get('/api/history/:sensorId', async (req, res) => {
    const { sensorId } = req.params;
    const { hours = 24 } = req.query;
    const result = await pool.query(
        \`SELECT * FROM sensor_readings 
         WHERE sensor_id = $1 
         AND recorded_at > NOW() - INTERVAL '$2 hours'
         ORDER BY recorded_at ASC\`,
        [sensorId, hours]
    );
    res.json(result.rows);
});

// === WebSocket for Real-time Updates ===
io.on('connection', (socket) => {
    console.log('Dashboard connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Dashboard disconnected:', socket.id);
    });
});

// === Helper Functions ===
function generateAlertMessage(tier, level) {
    const pct = Math.round((level / 300) * 100);
    switch(tier) {
        case 'watch': return \`Water level at \${pct}% - monitoring\`;
        case 'warning': return \`Water level at \${pct}% - danger approaching\`;
        case 'emergency': return \`CRITICAL: Water at \${pct}% - evacuate!\`;
    }
}

async function sendEmergencyNotifications(sensor) {
    // Send SMS via Twilio
    // Send email via SendGrid
    // Trigger public alert sirens
    console.log('EMERGENCY notifications sent for', sensor.name);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(\`FloodGuard API running on port \${PORT}\`);
});`,
    },
    frontend: {
      language: 'jsx',
      filename: 'frontend/src/components/AlertBanner.jsx',
      code: `// FloodGuard 4-Tier Alert Banner Component
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, X } from 'lucide-react';

const tierConfig = {
  normal: {
    icon: Info,
    bg: 'bg-emerald-50 border-emerald-300',
    text: 'text-emerald-800',
    border: '#10b981',
    label: 'Normal',
  },
  watch: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-300',
    text: 'text-amber-800',
    border: '#f59e0b',
    label: 'Watch',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-orange-50 border-orange-300',
    text: 'text-orange-800',
    border: '#f97316',
    label: 'Warning',
    pulse: true,
  },
  emergency: {
    icon: ShieldAlert,
    bg: 'bg-red-50 border-red-300',
    text: 'text-red-800',
    border: '#ef4444',
    label: 'Emergency',
    pulse: true,
    actionRequired: true,
  },
};

export default function AlertBanner({ tier, message, visible, onDismiss }) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className={\`border-l-4 \${config.bg} \${config.pulse ? 'animate-pulse' : ''} rounded-r-lg shadow-lg\`}
          style={{ borderLeftColor: config.border }}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" 
                   style={{ backgroundColor: \`\${config.border}30\` }}>
                <Icon className={\`w-5 h-5 \${config.text}\`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={\`font-bold text-sm uppercase \${config.text}\`}>
                    {config.label} Alert
                  </span>
                  {config.actionRequired && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                      ACTION REQUIRED
                    </span>
                  )}
                </div>
                <p className={\`text-sm mt-0.5 \${config.text} opacity-80\`}>
                  {message}
                </p>
              </div>
            </div>
            <button onClick={onDismiss} 
                    className={\`p-1 rounded-full hover:bg-black/10 \${config.text}\`}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {tier === 'emergency' && (
            <motion.div
              className="h-1 bg-red-500"
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}`,
    },
    config: {
      language: 'env',
      filename: 'backend/.env',
      code: `# FloodGuard Environment Configuration
# ================================

# Server
PORT=3000
NODE_ENV=production
API_VERSION=v1

# Database (PostgreSQL)
DATABASE_URL=postgresql://floodguard:secure_pass@localhost:5432/floodguard_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=floodguard_db
DB_USER=floodguard
DB_PASSWORD=secure_pass
DB_POOL_SIZE=20

# Redis (Cache & OTP)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis_secure_pass

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@floodguard.io

# WebSocket
WS_PORT=3001
WS_CORS_ORIGIN=http://localhost:5173

# IoT Sensor Config
SENSOR_READ_INTERVAL=30000
SENSOR_HEARTBEAT_TIMEOUT=120000
MAX_READINGS_PER_SENSOR=10000

# Alert Thresholds (percentage of max level)
THRESHOLD_WATCH=45
THRESHOLD_WARNING=65
THRESHOLD_EMERGENCY=85

# File Storage (S3 or local)
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# SSL / HTTPS
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/floodguard.io/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/floodguard.io/privkey.pem`,
    },
    deploy: {
      language: 'bash',
      filename: 'DEPLOY.md',
      code: `# 🚀 FloodGuard Deployment Guide
# ================================

# Step 1: Database Setup
# ----------------------
# Install PostgreSQL and create the database
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb floodguard_db
sudo -u postgres createuser floodguard -P
psql -U floodguard -d floodguard_db -f database/schema.sql

# Verify connection
psql -U floodguard -d floodguard_db -c "SELECT version();"

# Step 2: Redis Setup
# -------------------
sudo apt install redis-server
sudo systemctl enable redis-server
redis-cli ping  # Should return PONG

# Step 3: Backend Setup
# ---------------------
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate  # Run database migrations
npm start        # Start API server

# Verify API is running
curl http://localhost:3000/api/health

# Step 4: Frontend Setup
# ----------------------
cd frontend
npm install
npm run build    # Build for production
# Serve with nginx or deploy to Vercel/Netlify

# Step 5: Flash ESP32 Sensors
# ----------------------------
# 1. Open firmware/flood_sensor.ino in Arduino IDE
# 2. Install required libraries:
#    - WiFi (built-in)
#    - ArduinoJson
#    - OneWire
#    - DallasTemperature
#    - DHT sensor library
# 3. Update WiFi credentials and server URL
# 4. Select board: ESP32 Dev Module
# 5. Upload to each sensor node

# Step 6: Docker Deployment (Optional)
# -------------------------------------
docker-compose up -d

# docker-compose.yml includes:
# - PostgreSQL with volume persistence
# - Redis with AOF persistence
# - Node.js API server
# - Nginx reverse proxy
# - Let's Encrypt SSL

# Step 7: Monitoring & Maintenance
# ---------------------------------
# Check sensor connectivity
curl http://localhost:3000/api/sensors | jq '.[].status'

# View recent alerts
curl http://localhost:3000/api/alerts?limit=10

# Database backup
pg_dump floodguard_db > backup_$(date +%Y%m%d).sql

# Log monitoring
tail -f /var/log/floodguard/api.log
tail -f /var/log/floodguard/sensor-ingestion.log

# 💡 Production Checklist:
# [ ] SSL certificates installed
# [ ] Firewall rules configured
# [ ] Database backups automated (cron)
# [ ] Monitoring alerts set up (Prometheus/Grafana)
# [ ] Rate limiting enabled
# [ ] CORS properly configured
# [ ] Environment variables secured
# [ ] Health check endpoints verified
# [ ] Sensor heartbeat monitoring active
# [ ] Emergency notification channels tested`,
    },
  };

  const activeContent = codeSnippets[activeSection];

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-2">
        <div className="flex flex-wrap gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Display */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
      >
        {/* Code Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-gray-400 text-xs font-mono">{activeContent.filename}</span>
            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-[10px] rounded font-mono uppercase">
              {activeContent.language}
            </span>
          </div>
          <button
            onClick={() => handleCopy(activeContent.code)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <pre className="text-sm leading-relaxed">
            <code className="text-gray-300 font-mono whitespace-pre">
              {activeContent.code.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0 text-xs leading-relaxed">
                    {i + 1}
                  </span>
                  <span className={getLineColor(line, activeContent.language)}>{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </motion.div>
    </div>
  );
}

function getLineColor(line: string, language: string): string {
  const trimmed = line.trim();
  
  // Comments
  if (trimmed.startsWith('//') || trimmed.startsWith('--') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return 'text-gray-500 italic';
  }
  
  // SQL keywords
  if (language === 'sql') {
    const sqlKeywords = ['CREATE', 'TABLE', 'INSERT', 'SELECT', 'FROM', 'WHERE', 'UPDATE', 'SET', 'DELETE', 'INDEX', 'TRIGGER', 'FUNCTION', 'RETURNS', 'BEGIN', 'END', 'DEFAULT', 'NOT', 'NULL', 'PRIMARY', 'KEY', 'REFERENCES', 'CHECK', 'IN', 'CASCADE', 'CONSTRAINT', 'VARCHAR', 'UUID', 'DECIMAL', 'INTEGER', 'BOOLEAN', 'TEXT', 'BIGSERIAL', 'TIMESTAMP', 'JSONB', 'OR', 'REPLACE', 'AS', 'AND'];
    const firstWord = trimmed.split(/\s+/)[0]?.toUpperCase();
    if (sqlKeywords.includes(firstWord)) return 'text-blue-400';
    if (trimmed.includes("'")) return 'text-emerald-400';
  }
  
  // JS/JSX keywords
  if (language === 'javascript' || language === 'jsx') {
    const jsKeywords = ['const', 'let', 'var', 'function', 'async', 'await', 'return', 'import', 'export', 'from', 'if', 'else', 'try', 'catch', 'throw', 'new', 'class', 'extends'];
    const firstWord = trimmed.split(/[\s(]/)[0];
    if (jsKeywords.includes(firstWord)) return 'text-purple-400';
    if (trimmed.includes("'") || trimmed.includes('"') || trimmed.includes('`')) return 'text-emerald-400';
  }
  
  // C++ keywords
  if (language === 'cpp') {
    const cppKeywords = ['#include', 'void', 'int', 'float', 'long', 'char', 'const', 'return', 'if', 'else', 'while', 'for', 'true', 'false', 'String', 'bool'];
    const firstWord = trimmed.split(/[\s(]/)[0];
    if (cppKeywords.includes(firstWord)) return 'text-purple-400';
    if (trimmed.startsWith('#')) return 'text-cyan-400';
    if (trimmed.includes('"')) return 'text-emerald-400';
  }
  
  // ENV
  if (language === 'env') {
    if (trimmed.includes('=')) {
      return 'text-gray-300';
    }
  }
  
  return 'text-gray-300';
}
