import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
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
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

interface Schedule {
  id: string;
  time: {
    dayOfWeek: number[];
    hour: number;
    minute: number;
  };
  quantity: string;
  active: boolean;
}

const Schedule = ({navigation}: any) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
  type Day = (typeof days)[number];

  const isoWeekdays: {[key in Day]: number} = {
    Sun: 7,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state as true

  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`https://fishfeeder-1-a4359990.deta.app/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (id: string) => {
    try {
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule => {
          if (schedule.id === id) {
            return {...schedule, active: !schedule.active};
          }
          return schedule;
        }),
      );

      // Send PUT request to update schedule status
      await axios.put(`https://fishfeeder-1-a4359990.deta.app/schedules/${id}/status`, {
        active: !schedules.find(schedule => schedule.id === id)?.active,
      });
    } catch (error) {
      console.error('Error toggling switch:', error);
      //if error, revert the changes
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule => {
          if (schedule.id === id) {
            return {...schedule, active: !schedule.active};
          }
          return schedule;
        }),
      );
    }
  };

  const deleteSchedule = async (id: any) => {
    let backupSchedules: Schedule[] = [];
    try {
      // Backup current schedules in case of rollback
      backupSchedules = [...schedules];

      // Delete schedule locally first
      setSchedules(schedules.filter(schedule => schedule.id !== id));

      // Then, send a request to delete schedule from backend
      await axios.delete(`https://fishfeeder-1-a4359990.deta.app/schedules/${id}`);

      // Handle success response if needed
      console.log(`Schedule deleted successfully for ID: ${id}`);
    } catch (error) {
      // Check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        // Handle AxiosError
        console.error('Axios error:', error.message);
      } else {
        // Handle other types of errors
        console.error('Error:', error);
      }

      // Revert the changes by restoring backup schedules
      setSchedules(backupSchedules);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      
      {loading ? ( // Show loading indicator if loading state is true
        <ActivityIndicator
          size="large"
          color="#6200ee"
          style={{flex: 1, justifyContent: 'center'}}
        />
      ) : (
        <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
          {schedules.map(schedule => (
            <Card
              key={schedule.id}
              style={[styles.card, {opacity: schedule.active ? 1 : 0.5}]}>
              <Card.Title
                title={
                  'At ' +
                  schedule.time.hour +
                  ':' +
                  schedule.time.minute +
                  ' - ' +
                  schedule.quantity +
                  ' QTY'
                }
                left={props => (
                  <Icon {...props} name="schedule" size={24} color="#fff" />
                )}
                right={() => (
                  <>
                    <Switch
                      value={schedule.active}
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
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: schedule.time.dayOfWeek.includes(
                            isoWeekdays[day],
                          )
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
         </ScrollView>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={() =>
          navigation.navigate('newSchedule', {refreshSchedules: fetchSchedules})
        }
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
  scrollViewContent: {
    paddingBottom: 100, // Add sufficient padding to scroll above the navigator
},
});
