import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Touchable,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  FAB,
  Snackbar,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';

const NewSchedule = ({navigation, route}: any) => {
  const [time, setTime] = useState(new Date(new Date().setHours(12, 0, 0, 0)));
  const [qty, setQty] = useState('');
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [loading, setLoading] = useState(false);

  const handleTimeChange = (event: any, selectedTime: any) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const showTimepicker = () => {
    setShowPicker(true);
  };

  const toggleDay = (day: any) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // validate input
      if (!qty || !activeDays.length) {
        //show a message
        Alert.alert('Please fill in all fields');
        return;
      }

      console.log('New schedule:', {
        time: time.toTimeString(),
        qty,
        activeDays,
      });

      // Send data to the backend
      await axios.post('http://10.0.2.2:3000/schedules', {
        time: time.toTimeString(),
        qty,
        activeDays,
      });

      setVisibleSnackbar(true);
      route.params.refreshSchedules();

      // Wait for 3 seconds before navigating to 'Schedule'
      setTimeout(() => {
        navigation.navigate('Schedule');
      }, 3000);
    } catch (error) {
      console.error('Error creating new schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDismissSnackBar = () => setVisibleSnackbar(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            onPress={() => navigation.goBack()} // Use navigation.goBack() instead of navigation.navigate('Schedule')
            style={styles.backButton}
          />

          <Text style={styles.title}>Create New Schedule</Text>
        </View>
        <Button
          icon="clock"
          mode="outlined"
          onPress={showTimepicker}
          disabled={loading}
          style={styles.button}>
          Pick Time: {time.getHours()}:
          {time.getMinutes().toString().padStart(2, '0')}
        </Button>
        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
            minuteInterval={15}
          />
        )}
        <TextInput
          label="QTY"
          value={qty}
          onChangeText={setQty}
          style={styles.input}
          keyboardType="numeric"
        />
        <View style={styles.dayContainer}>
          {daysOfWeek.map(day => (
            <Button
              key={day}
              mode={activeDays.includes(day) ? 'contained' : 'outlined'}
              onPress={() => toggleDay(day)}
              style={styles.dayButton}>
              {day}
            </Button>
          ))}
        </View>
        <FAB
          style={styles.fab}
          icon="check"
          loading={loading}
          onPress={handleSubmit}
        />
        <Snackbar
          visible={visibleSnackbar}
          onDismiss={onDismissSnackBar}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => {
              navigation.navigate('Schedule');
            },
          }}>
          Schedule created successfully!
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scrollView: {
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 100, // add padding to ensure FAB does not overlap content
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    flex: 1,
  },
  input: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#1e1e1e',
  },
  button: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap', // ensure wrapping of items if not enough space
    marginTop: 20,
    marginBottom: 20,
  },
  dayButton: {
    marginHorizontal: 4,
    marginTop: 10,
    minWidth: 100, // ensure minimum width for better touch targets
    maxWidth: '30%', // limit width to 30% of the screen
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0, // adjusted position to avoid overlap
    backgroundColor: '#6200ee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 5,
  },
});

export default NewSchedule;
