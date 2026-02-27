const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// CONFIGURATION
const SECRET = 'gten@12456@secrete_key'; // Make this a strong password
const PORT = 5000;

app.post('/webhook', (req, res) => {
    // 1. Security Check (Verify it's really GitHub calling)
    const signature = req.headers['x-hub-signature-256'];
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== `sha256=${digest}`) {
        return res.status(401).send('Security error: Secret mismatch');
    }

    // 2. The Auto-Pull & Restart Logic
    if (req.body.ref === 'refs/heads/main') {
        console.log('Push detected! Pulling code...');
        
        // This command pulls code, installs new packages, and restarts your app
        const command = 'git pull origin main && npm install && pm2 restart my-app';
        
        exec(command, (err, stdout) => {
            if (err) return console.error(err);
            console.log('Update Success:', stdout);
        });
    }
    res.send('OK');
});

app.listen(PORT, () => console.log(`Listener running on port ${PORT}`));