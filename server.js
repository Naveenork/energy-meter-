const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

const ratePerUnit = 5; // Rate per kWh (adjust this as needed)

// Create and connect to the SQLite database
let db = new sqlite3.Database('./sensor_data.db', (err) => {
    if (err) {
        return console.error('Failed to connect to the SQLite database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a table for storing readings if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voltage REAL,
    current REAL,
    power REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Endpoint to receive sensor data
app.post('/data', (req, res) => {
    const { voltage, current, power } = req.body;

    if (voltage && current && power) {
        // Insert the reading into the database
        db.run(`INSERT INTO readings (voltage, current, power) VALUES (?, ?, ?)`, 
            [voltage, current, power], 
            (err) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send('Error storing data.');
                }
                res.status(200).send('Data stored successfully.');
            }
        );
    } else {
        res.status(400).send('Invalid data.');
    }
});

// Endpoint to calculate the bill for a specific time range
app.get('/calculate-bill', (req, res) => {
    const { start, end } = req.query;

    db.all(`SELECT power, timestamp FROM readings WHERE timestamp BETWEEN ? AND ?`, [start, end], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error retrieving data.');
        }

        let totalEnergy = 0;

        for (let i = 0; i < rows.length - 1; i++) {
            const power = rows[i].power; // Power in watts
            const time1 = new Date(rows[i].timestamp);
            const time2 = new Date(rows[i + 1].timestamp);

            const timeDifference = (time2 - time1) / (1000 * 60 * 60); // Convert ms to hours
            const energyConsumed = (power * timeDifference) / 1000; // Convert W to kWh
            totalEnergy += energyConsumed;
        }

        const totalBill = totalEnergy * ratePerUnit;

        res.json({
            totalEnergy: totalEnergy.toFixed(2) + ' kWh',
            totalBill: totalBill.toFixed(2) + ' INR'
        });
    });
});

// Endpoint to get the latest reading
app.get('/latest-reading', (req, res) => {
    db.get('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1', (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error retrieving latest reading.');
        }
        res.json(row);
    });
});

// Twilio configuration
const accountSid = 'AC6792f62098668b54b54eac48dc3d5ca0'; // Replace with your Twilio Account SID
const authToken = '778b8804b7fa1354042f55e616a3d3fc'; // Replace with your Twilio Auth Token
const client = twilio(accountSid, authToken);

// Endpoint to send the bill via SMS
app.post('/send-bill', (req, res) => {
    const { totalEnergy, totalBill } = req.body;
    const phoneNumber = '+919345611558'; // Prebuilt phone number.

    const message = `Smart Energy Meter Bill:\nTotal Energy: ${totalEnergy} kWh\nTotal Bill: ${totalBill}`;

    client.messages.create({
        body: message,
        from: '+18644818562', // Your Twilio number
        to: phoneNumber // The predefined phone number
    })
    .then(message => {
        console.log('Message sent:', message.sid);
        res.status(200).send({ success: true });
    })
    .catch(error => {
        console.error('Error sending message:', error);
        res.status(500).send({ success: false, error: 'Failed to send the message.' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

