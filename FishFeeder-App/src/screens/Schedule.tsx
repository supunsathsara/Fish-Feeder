import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Switch, Button, useTheme, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const Schedule = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeDays, setActiveDays] = useState(['Mon', 'Wed', 'Fri']); // Example active days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const toggleDay = (day:any) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter(d => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Current Schedule"
          left={(props) => <Icon {...props} name="schedule" size={24} color="#fff" />}
          right={() => <Switch value={isEnabled} onValueChange={toggleSwitch} color="#6200ee" />}
        />
        <Card.Content style={{ opacity: isEnabled ? 1 : 0.5 }}>
          <View style={styles.daysContainer}>
            {days.slice(0, 4).map((day) => (
              <Button
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayButton,
                  { backgroundColor: activeDays.includes(day) ? '#6200ee' : '#333' }
                ]}
              >
                <Text style={styles.dayText}>{day}</Text>
              </Button>
            ))}
          </View>
          <View style={styles.daysContainer}>
            {days.slice(4).map((day) => (
              <Button
                key={day}
                mode="contained"
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayButton,
                  { backgroundColor: activeDays.includes(day) ? '#6200ee' : '#333' }
                ]}
              >
                <Text style={styles.dayText}>{day}</Text>
              </Button>
            ))}
          </View>
          <Text style={styles.text}>At 2.30 P.M.</Text>
        </Card.Content>
      </Card>

      <FAB
        style={styles.fab}   
        icon="pencil"
        color="#fff"
        onPress={() => console.log('Add new schedule')}
        />
    </SafeAreaView>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
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
