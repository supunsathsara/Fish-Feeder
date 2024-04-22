const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const admin = require('firebase-admin');
const moment = require('moment-timezone');

// Initialize Firebase Admin SDK
const serviceAccount = require('./nibm-iot-led-firebase-adminsdk-twm2g-1d6dac58db.json');
const { sendFeedCommand } = require('./util/sendNodeMCU');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    db.ref('.info/connected').once('value', snapshot => {
        const isConnected = snapshot.val();
        if (isConnected) {
            res.json({ success: true, message: 'Firebase connected successfully' });
        } else {
            res.json({ success: false, message: 'Failed to connect to Firebase' });
        }
    });
});

app.get('/test-connection', (req, res) => {
    db.ref('test/connection').once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          res.status(200).json({ success: true, message: snapshot.val() });
        } else {
          res.status(404).json({ success: false, message: 'No data found at the test location.' });
        }
      })
      .catch(error => {
        res.status(500).json({ success: false, message: 'Failed to connect to Firebase: ' + error.message });
      });
  });

app.post('/test-connection', (req, res) => {
    const { testData } = req.body;
    try {
        if (!testData) {
            return res.status(400).json({ success: false, message: "No testData provided." });
        }

        db.ref('test/connection').set(testData)
            .then(() => {
                res.status(200).json({ success: true, message: 'Data successfully saved to Firebase.', data: testData });
            })
            .catch(error => {
                res.status(500).json({ success: false, message: 'Failed to write to Firebase: ' + error.message });
            });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to write to Firebase: ' + error.message });
    }
});


// Endpoints
app.post('/feed', (req, res) => {
    const { quantity } = req.body;

    const feedingLog = {
        timestamp: new Date().toISOString(),
        event_type: 'Feeding',
        details: `Feeding started with quantity ${quantity}`,
    };

    db.ref('/logs').push(feedingLog, error => {
        if (error) {
            res.status(500).send('Error logging feeding event: ' + error.message);
        } else {
            db.ref('/status').update({
                last_feeding: { timestamp: new Date().toISOString(), quantity }
            });
            res.send('Feeding started and logged');
        }
    });
});

app.get('/status', (req, res) => {
    db.ref('/status').once('value', snapshot => {
        const status = snapshot.val();
        const utcTime = status.last_feeding.timestamp;

        // Convert UTC to Sri Lanka time
        const sriLankaTime = moment(utcTime).tz('Asia/Colombo');

        // Prepare different formatted time strings
        const formattedTimeStandard = sriLankaTime.format('YYYY-MM-DD HH:mm:ss'); // "2024-04-23 23:42:07"
        const formattedTime12Hour = sriLankaTime.format('YYYY-MM-DD hh:mm:ss A'); // "2024-04-23 11:42:07 PM"

        // Include these formatted times in the response
        res.json({
            last_feeding: {
                quantity: status.last_feeding.quantity,
                timestamp: utcTime,
                formattedTimeStandard: formattedTimeStandard,
                formattedTime12Hour: formattedTime12Hour
            }
        });
    });
});

app.post('/schedules', (req, res) => {
    const { time, quantity } = req.body;

    // Convert local time (Sri Lanka Time) to UTC
    const localTime = moment.tz({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate(),
        hour: time.hour,
        minute: time.minute
    }, 'Asia/Colombo'); // Sri Lanka timezone

    const utcTime = localTime.utc();

    const timeToSave = {
        hour: utcTime.hour(),
        minute: utcTime.minute(),
        dayOfWeek: time.dayOfWeek
    };

    const newScheduleRef = db.ref('/schedules').push();
    newScheduleRef.set({ time: timeToSave, quantity }, error => {
        if (error) {
            res.status(500).send('Error setting schedule: ' + error.message);
        } else {
            res.send(`Schedule created with ID: ${newScheduleRef.key}`);
        }
    });
});

app.put('/schedules/:id', (req, res) => {
    const { time, quantity } = req.body;
    db.ref(`/schedules/${req.params.id}`).update({ time, quantity }, error => {
        if (error) {
            res.status(500).send('Error updating schedule: ' + error.message);
        } else {
            res.send('Schedule updated');
        }
    });
});

app.delete('/schedules/:id', (req, res) => {
    db.ref(`/schedules/${req.params.id}`).remove(error => {
        if (error) {
            res.status(500).send('Error removing schedule: ' + error.message);
        } else {
            res.send('Schedule removed');
        }
    });
});

app.get('/check-schedule', (req, res) => {
    const currentUtcTime = new Date(); // This time is in UTC
    const currentHour = currentUtcTime.getUTCHours();
    const currentMinute = currentUtcTime.getUTCMinutes();
    const dayOfWeek = currentUtcTime.getUTCDay();

    db.ref('/schedules').once('value', snapshot => {
        const schedules = snapshot.val();
        let isScheduled = false;

        Object.keys(schedules).forEach(key => {
            const schedule = schedules[key];
            if (schedule.time.dayOfWeek.includes(dayOfWeek)) {
                const scheduleHour = parseInt(schedule.time.hour, 10);
                const scheduleMinute = parseInt(schedule.time.minute, 10);

                // Check if current time is within 15 minutes of scheduled time
                if (scheduleHour === currentHour && Math.abs(scheduleMinute - currentMinute) <= 15) {
                    isScheduled = true;
                    // Potentially send message to NodeMCU here
                    //! TODO: Send message to NodeMCU
                    sendFeedCommand();

                    // Log the event
                    const feedingLog = {
                        timestamp: new Date().toISOString(),
                        event_type: 'Feeding',
                        details: `Feeding started with quantity ${schedule.quantity}`,
                    };

                    db.ref('/logs').push(feedingLog, error => {
                        if (error) {
                            console.error('Error logging feeding event: ' + error.message);
                        } else {
                            db.ref('/status').update({
                                last_feeding: { timestamp: new Date().toISOString(), quantity: schedule.quantity }
                            });
                        }
                    });

                }
            }
        });

        if (isScheduled) {
            res.send('Feeding time!');
            // Additional logic to handle feeding
        } else {
            res.send('No feeding scheduled for now.');
        }
    });
});


app.get('/logs', (req, res) => {
    db.ref('/logs').once('value', snapshot => {
        res.json(snapshot.val());
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

