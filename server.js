const express = require('express');
const mysql = require('mysql2'); 
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
// mDNS for automatic server discovery
const mdns = require('multicast-dns');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from data directory
app.use(express.static(path.join(__dirname, 'data')));

// Database connection config for MySQL ✨
const dbConfig = {
    host: 'svc.sel3.cloudtype.app', // MySQL 서버 주소
    port: '31945',
    user: 'root', // MySQL 사용자 이름
    password: 'tmdahr0324@', // MySQL 비밀번호
    database: 'impulse_ultra' // 사용할 데이터베이스 이름
};

// Create a connection pool (권장)
const pool = mysql.createPool(dbConfig).promise(); // ✨ Promise-based connection pool

// In-memory scoring for current session
let currentScore = 0;
let measuring = false;
let baseline = 0; // Baseline acceleration when measurement starts
let baselineSet = false; // Flag to check if baseline is set

// Routes

// Register
app.post('/register', async (req, res) => { // ✨ async 추가
  const { username, password } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.json({ success: false, message: '아이디는 3자 이상, 비밀번호는 6자 이상이어야 합니다.' });
  }

  try { // ✨ Try/Catch 블록으로 Promise 처리
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    
    res.json({ success: true, message: '회원가입 성공! 로그인해주세요.' });
  } catch (err) {
    // MySQL duplicate entry error code is typically 1062
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: '이미 존재하는 아이디입니다.' });
    }
    console.error('Database or Hash error:', err);
    return res.status(500).json({ error: 'Database or Hash error' });
  }
});

// Login
app.post('/login', async (req, res) => { // ✨ async 추가
  const { username, password } = req.body;
  
  try { // ✨ Try/Catch 블록으로 Promise 처리
    const [rows] = await pool.execute('SELECT id, password_hash FROM users WHERE username = ?', [username]);
    const row = rows[0];

    if (!row) return res.json({ success: false, message: '아이디나 비밀번호가 잘못되었습니다.' });

    const match = await bcrypt.compare(password, row.password_hash);
    
    if (!match) return res.json({ success: false, message: '아이디나 비밀번호가 잘못되었습니다.' });
    
    res.json({ success: true, user_id: row.id, username });
  } catch (err) {
    console.error('Database or Hash error:', err);
    return res.status(500).json({ error: 'Database or Hash error' });
  }
});

// Reset score (start measurement)
app.get('/reset', (req, res) => {
  currentScore = 0;
  measuring = true;
  baseline = 0; // Reset baseline
  baselineSet = false; // Reset baseline flag
  res.json({ message: 'Score reset' });
});

// Get current score
app.get('/score', (req, res) => {
  res.json({ score: currentScore });
});

//// Receive sensor data from ESP32
app.post('/sensor', (req, res) => {
  if (!measuring) return res.json({ message: 'Not measuring' });

  const { accel_x, accel_y, accel_z } = req.body;
  // Compute impulse - simple: max magnitude
  const magnitude = Math.sqrt(accel_x**2 + accel_y**2 + accel_z**2);
  // Subtract gravity (assuming 9.81 m/s2 down z)
  const magnitude_adjusted = Math.abs(magnitude - 9.81);

  // Set baseline on first data, then calculate relative impact
  if (baseline === 0) {
    // First data - set as baseline (current position when measurement starts)
    baseline = magnitude_adjusted;
    console.log('Baseline set to:', baseline);
    currentScore = 0; // Score starts from 0
  } else {
    // Subsequent data - calculate relative impact from baseline
    const relativeImpact = Math.max(0, magnitude_adjusted - baseline);
    // Update currentScore based on impact difference - only if significant
    if (relativeImpact > 1.5) {
      currentScore = Math.max(currentScore, Math.floor(relativeImpact * 100)); // scale to points
    }
  }

  res.json({ message: 'Data received', score: currentScore });
});

// Get rankings
app.get('/rankings', async (req, res) => { // ✨ async 추가
  try {
    // SQLite의 `best_score > 0` 대신 MySQL에서 `WHERE` 절 사용
    const [rows] = await pool.execute(
      `SELECT username, best_score FROM users WHERE best_score > 0 ORDER BY best_score DESC LIMIT 10`
    );
    res.json({ rankings: rows });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Save score for user
app.post('/save-score', async (req, res) => { // ✨ async 추가
  const { user_id, score } = req.body;
  try {
    // Insert score
    await pool.execute('INSERT INTO scores (user_id, score) VALUES (?, ?)', [user_id, score]);

    // Update best score - MySQL's MAX function works similarly
    await pool.execute('UPDATE users SET best_score = GREATEST(best_score, ?) WHERE id = ?', [score, user_id]); // ✨ GREATEST 사용

    res.json({ message: 'Score saved' });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ error: 'Save error' });
  }
});

// Get user best score
app.get('/user-score/:user_id', async (req, res) => { // ✨ async 추가
  const user_id = req.params.user_id;
  try {
    const [rows] = await pool.execute('SELECT best_score FROM users WHERE id = ?', [user_id]);
    const row = rows[0];
    res.json({ score: row ? row.best_score : 0 });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get all scores for a user
app.get('/user-scores/:user_id', async (req, res) => { // ✨ async 추가
  const user_id = req.params.user_id;
  try {
    const [rows] = await pool.execute('SELECT score FROM scores WHERE user_id = ? ORDER BY timestamp', [user_id]);
    const scores = rows.map(row => row.score);
    res.json({ scores: scores });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get global statistics (all users' best scores, not individual measurements)
app.get('/global-stats', async (req, res) => { // ✨ async 추가
  try {
    const [rows] = await pool.execute('SELECT best_score FROM users WHERE best_score > 0 ORDER BY best_score DESC');
    
    if (rows.length === 0) {
      return res.json({ best_score: 0, average: 0 });
    }
    const bestScores = rows.map(row => row.best_score);
    const globalBestScore = bestScores[0]; // First item is highest since ordered DESC
    const globalAverage = Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length);
    res.json({ best_score: globalBestScore, average: globalAverage });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Server available at: http://impulse-server.local:${port}`);
});

// Advertise server via mDNS
// ... (mDNS 및 WebSocket 부분은 변경 없음)

// WebSocket server for real-time sensor data
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('ESP32 connected via WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'sensor' && measuring) {
        const { accel_x, accel_y, accel_z } = data;
        const magnitude = Math.sqrt(accel_x**2 + accel_y**2 + accel_z**2);
        const magnitude_adjusted = Math.abs(magnitude - 9.81);

        // Calculate relative impact using baseline
        if (!baselineSet) {
          // First WebSocket data - set as baseline
          baseline = magnitude_adjusted;
          baselineSet = true;
          console.log('WebSocket baseline set to:', baseline);
          currentScore = 0;
        } else {
          // Calculate relative impact from baseline
          const relativeImpact = magnitude_adjusted - baseline;
          // Optional: Uncomment for detailed debugging
          // console.log(`WS data: ${magnitude_adjusted}, baseline: ${baseline}, relative: ${relativeImpact}`);

          // Accumulate maximum impact during measurement (측정 시간 중 최대 충격량 추적)
          if (relativeImpact > 1.5) { // Only if there's significant impact beyond noise
            const impactScore = Math.floor(relativeImpact * 100);
            currentScore = Math.max(currentScore, impactScore);
            console.log('WS Updated max score:', currentScore, 'from impact:', relativeImpact);
          }
        }
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    console.log('ESP32 disconnected');
  });
});