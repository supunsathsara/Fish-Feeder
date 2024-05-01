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

app.get('/feeding-info', (req, res) => {
    db.ref('/status').once('value', snapshot => {
        const status = snapshot.val();
        if (!status) {
            return res.status(404).json({ error: 'Status information not found.' });
        }

        let nextFeedingTime = null;
        let lastFeedingTime = null;

        if (status.next_feeding) {
            nextFeedingTime = moment(status.next_feeding).tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
        }
        if (status.last_feeding && status.last_feeding.timestamp) {
            lastFeedingTime = moment(status.last_feeding.timestamp).tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
        }

        res.status(200).json({ nextFeedingTime, lastFeedingTime });
    }).catch(error => {
        res.status(500).json({ error: 'Error fetching feeding information: ' + error.message });
    });
});

app.get('/schedules', (req, res) => {
    db.ref('/schedules').once('value', snapshot => {
        const schedules = [];
        snapshot.forEach(childSnapshot => {
            const schedule = childSnapshot.val();
            schedule.id = childSnapshot.key;

            // Convert UTC time to Sri Lanka time zone
            const { hour, minute, dayOfWeek } = schedule.time;
            const localTime = moment.tz({
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                day: new Date().getDate(),
                hour,
                minute
            }, 'UTC').tz('Asia/Colombo'); // Convert to Sri Lanka time zone
            schedule.time = {
                hour: localTime.hour(),
                minute: localTime.minute(),
                dayOfWeek
            };

            schedules.push(schedule);
        });
        res.status(200).json(schedules);
    }).catch(error => {
        res.status(500).json({ error: 'Error fetching schedules: ' + error.message });
    });
});


app.post('/schedules', (req, res) => {
    const { time, qty, activeDays } = req.body;

    // Extract hour and minute from the time string
    const [hours, minutes] = time.split(':').map(Number);

    // Convert local time (Sri Lanka Time) to UTC
    const localTime = moment.tz({
        hour: hours,
        minute: minutes
    }, 'Asia/Colombo'); // Sri Lanka timezone

    const utcTime = localTime.utc();
    console.log('UTC Time:', utcTime.format('YYYY-MM-DD HH:mm:ss'));

    // Mapping of days to ISO weekdays with correct adjustment for day shifts
    const isoWeekdays = {
        Sun: 7,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    // Adjust days based on UTC date
    const dayOfWeekAdjustments = activeDays.map(day => {
        const localDayISO = isoWeekdays[day];
        const dayDifference = utcTime.day() - localTime.day();
        let adjustedDayISO = localDayISO + dayDifference;

        // Adjust if crossing week boundaries
        if (adjustedDayISO < 1) {
            adjustedDayISO += 7;
        } else if (adjustedDayISO > 7) {
            adjustedDayISO -= 7;
        }

        return adjustedDayISO;
    });

    const timeToSave = {
        hour: utcTime.hour(),
        minute: utcTime.minute(),
        dayOfWeek: dayOfWeekAdjustments
    };

    const newScheduleRef = db.ref('/schedules').push();
    newScheduleRef.set({ time: timeToSave, quantity: qty, active: true }, error => {
        if (error) {
            res.status(500).json({ error: 'Error setting schedule: ' + error.message });
        } else {
            const scheduleData = {
                id: newScheduleRef.key,
                time: timeToSave,
                quantity: qty,
                active: true
            };
            res.status(200).json(scheduleData);
        }
    });
});


// Update schedule status
app.put('/schedules/:id/status', (req, res) => {
    const { id } = req.params;
    const { active } = req.body;

    console.log('ID:', id, 'Active:', active);

    const scheduleRef = db.ref(`/schedules/${id}`);
    scheduleRef.update({ active: active }, error => {
        if (error) {
            res.status(500).json({ error: 'Error updating schedule status: ' + error.message });
        } else {
            res.status(200).json({ message: `Schedule status updated successfully for ID: ${id}` });
        }
    });
});

// Delete schedule
app.delete('/schedules/:id', (req, res) => {
    const { id } = req.params;

    const scheduleRef = db.ref(`/schedules/${id}`);
    scheduleRef.remove(error => {
        if (error) {
            res.status(500).json({ error: 'Error deleting schedule: ' + error.message });
        } else {
            res.status(200).json({ message: `Schedule deleted successfully for ID: ${id}` });
        }
    });
});


app.get('/check-schedule', (req, res) => {
    const currentUtcTime = new Date(); // This time is in UTC
    const currentHour = currentUtcTime.getUTCHours();
    const currentMinute = currentUtcTime.getUTCMinutes();
    const dayOfWeekUTC = currentUtcTime.getUTCDay();
    

    // Convert UTC time to Sri Lanka time
const currentSriLankaTime = moment.tz(currentUtcTime, 'Asia/Colombo');

// Get the day of the week in Sri Lanka
const dayOfWeekSriLanka = currentSriLankaTime.day();
const dayOfWeek= currentSriLankaTime.day();


    console.log("day ", dayOfWeekUTC)
    console.log("daySl ", dayOfWeekSriLanka)

    db.ref('/schedules').once('value', snapshot => {
        const schedules = snapshot.val();
        let isScheduled = false;
        let closestNextFeedingTime = null;

        Object.keys(schedules).forEach(key => {
            const schedule = schedules[key];
            console.log(schedule.time.dayOfWeek)
            if (schedule.active && schedule.time.dayOfWeek.includes(dayOfWeek)) {
               
                const scheduleHour = schedule.time.hour;
                const scheduleMinute = schedule.time.minute;
                const scheduleDate = new Date(currentUtcTime);


                scheduleDate.setUTCHours(scheduleHour, scheduleMinute, 0, 0);
                //log the current UTC and scheduled time
                console.log(scheduleDate)

                // Check if current time is within 15 minutes of scheduled time
                if (scheduleHour === currentHour && Math.abs(scheduleMinute - currentMinute) <= 10) {
                    isScheduled = true;
                    sendFeedCommand(); // Command to initiate feeding

                    const feedingLog = {
                        timestamp: new Date().toISOString(),
                        event_type: 'Feeding',
                        details: `Feeding started with quantity ${schedule.quantity}`
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

                // Update the closest next feeding time
                console.log("scheduleDate ", scheduleDate, "currentUtcTime ", currentUtcTime)
                if (scheduleDate < currentUtcTime) {
                    // If scheduled time is in the past for today, set it for the next weekr
                    scheduleDate.setDate(scheduleDate.getDate() + 7);
                }
                
                // Check and update the closest next feeding time
                if (!closestNextFeedingTime || scheduleDate < closestNextFeedingTime) {
                    closestNextFeedingTime = scheduleDate;
                }
            }
        });

        if (isScheduled) {
            res.send('Feeding time!');
        } else {
            res.send('No feeding scheduled for now.');
        }

        // Save next feeding time to status record
        if (closestNextFeedingTime) {
            db.ref('/status').update({
                next_feeding: closestNextFeedingTime.toISOString()
            });
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

