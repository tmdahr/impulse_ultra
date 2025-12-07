const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: 'svc.sel3.cloudtype.app', // MySQL 서버 주소
    port: '31945',
    user: 'root',
    password: 'tmdahr0324@',
    database: 'impulse_ultra'
};

async function initDB() {
    // 1. Connect without specifying the database to create it if it doesn't exist
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
    });

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // 2. Connect to the created database using a pool for table creation and data insertion
    const pool = mysql.createPool(dbConfig); // ✨ .promise() 제거

    try {
        // Create tables (MySQL syntax)
        // AUTOINCREMENT 대신 AUTO_INCREMENT 사용, INTEGER 대신 INT 사용, TIMESTAMP는 CURRENT_TIMESTAMP 기본값
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                best_score INT DEFAULT 0
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS scores (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                score INT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Insert sample users
        const users = [
            { username: 'admin', password: 'admin123' },
            { username: 'user1', password: 'pass1' },
            { username: 'player1', password: 'player' },
            { username: 'player2', password: 'player' },
            { username: 'player3', password: 'player' },
            { username: 'player4', password: 'player' }
        ];

        let promises = users.map(user => {
            return new Promise(async (resolve, reject) => {
                try {
                    const hash = await bcrypt.hash(user.password, 10);
                    // INSERT IGNORE INTO for MySQL
                    await pool.execute('INSERT IGNORE INTO users (username, password_hash) VALUES (?, ?)', [user.username, hash]);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        await Promise.all(promises);

        // Insert sample scores
        // SELECT 서브쿼리를 사용하여 user_id를 가져옴
        await pool.execute(`
            INSERT INTO scores (user_id, score)
            SELECT id, 198 FROM users WHERE username = 'player1' ON DUPLICATE KEY UPDATE user_id=user_id
        `); // Simplified score from 1980000000 to 198 for consistency

        await pool.execute(`
            INSERT INTO scores (user_id, score)
            SELECT id, 195 FROM users WHERE username = 'player2' ON DUPLICATE KEY UPDATE user_id=user_id
        `);
        
        await pool.execute(`
            INSERT INTO scores (user_id, score)
            SELECT id, 187 FROM users WHERE username = 'player3' ON DUPLICATE KEY UPDATE user_id=user_id
        `);
        
        await pool.execute(`
            INSERT INTO scores (user_id, score)
            SELECT id, 175 FROM users WHERE username = 'player4' ON DUPLICATE KEY UPDATE user_id=user_id
        `);


        // Update best scores - MySQL's MAX/GREATEST works fine
        await pool.execute(`
            UPDATE users SET best_score = (
                SELECT MAX(score) FROM scores WHERE user_id = users.id
            ) WHERE id IN (SELECT user_id FROM scores)
        `);

        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization error:', err);
    } finally {
        await pool.end();
    }
}

initDB();