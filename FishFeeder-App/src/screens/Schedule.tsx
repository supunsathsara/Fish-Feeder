import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Text,
  Switch,
  Button,
  useTheme,
  FAB,
  IconButton,
  MD3Colors,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Schedule = ({navigation}: any) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const sampleSchedules = [
    {
      id: 1,
      time: 'At 2.30 P.M.',
      qty: 50,
      activeDays: ['Mon', 'Wed', 'Fri'],
      enabled: true,
    },
    {
      id: 2,
      time: 'At 4.00 P.M.',
      qty: 10,
      activeDays: ['Tue', 'Thu', 'Sat'],
      enabled: true,
    },
    // Add more sample schedules as needed
  ];

  const [schedules, setSchedules] = useState(sampleSchedules);

  const toggleSwitch = (id: any) => {
    setSchedules(
      schedules.map(schedule => {
        if (schedule.id === id) {
          return {...schedule, enabled: !schedule.enabled};
        }
        return schedule;
      }),
    );
  };

  const deleteSchedule = (id: any) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const toggleDay = (day: any, scheduleId: any) => {
    setSchedules(
      schedules.map(schedule => {
        if (schedule.id === scheduleId) {
          if (schedule.activeDays.includes(day)) {
            return {
              ...schedule,
              activeDays: schedule.activeDays.filter(d => d !== day),
            };
          } else {
            return {...schedule, activeDays: [...schedule.activeDays, day]};
          }
        }
        return schedule;
      }),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {schedules.map(schedule => (
        <Card
          key={schedule.id}
          style={[styles.card, {opacity: schedule.enabled ? 1 : 0.5}]}>
          <Card.Title
            title={schedule.time + ' - ' + schedule.qty + ' QTY'}
            left={props => (
              <Icon {...props} name="schedule" size={24} color="#fff" />
            )}
            right={() => (
              <>
                <Switch
                  value={schedule.enabled}
                  onValueChange={() => toggleSwitch(schedule.id)}
                  color="#6200ee"
                />
                <IconButton
                  icon="trash-can-outline"
                  iconColor={MD3Colors.error50}
                  size={30}
                  style={{alignSelf: 'flex-end'}}
                  onPress={() => deleteSchedule(schedule.id)}
                />
              </>
            )}
          />
          <Card.Content>
            <View style={styles.daysContainer}>
              {days.map(day => (
                <Button
                  key={day}
                  onPress={() => toggleDay(day, schedule.id)}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: schedule.activeDays.includes(day)
                        ? '#6200ee'
                        : '#333',
                    },
                  ]}>
                  <Text style={styles.dayText}>{day}</Text>
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>
      ))}

      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={() => navigation.navigate('newSchedule')}
      />
    </SafeAreaView>
  );
};

export default Schedule;

// ... rest of the code

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
    paddingTop: 20,
  },
  card: {
    width: '90%',
    marginTop: 20,
    backgroundColor: '#1e1e1e',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayButton: {
    borderRadius: 18,
    width: 70,
    height: 59,
    justifyContent: 'center',
    marginHorizontal: 4, // Added for spacing between buttons
    //add a white border line around the button
    borderWidth: 1,
    borderColor: '#fff',
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16, // Adjust line height to vertically center the text inside the button
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 55,
    backgroundColor: '#6200ee',
  },
});
