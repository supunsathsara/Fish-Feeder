import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import MonthlyChart from '../components/MonthlyChart';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedButtons } from 'react-native-paper';
import WeeklyChart from '../components/WeeklyChart';
import axios from 'axios';
import { HistoryResponse, WeeklyData, MonthlyData } from '../types';

type ValueType = 'week' | 'month';

const History: React.FC = () => {
  const [value, setValue] = useState<'week' | 'month'>('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<HistoryResponse>(`https://fishfeeder-1-a4359990.deta.app/history`);
        setWeeklyData(response.data.weekly);
        setMonthlyData(response.data.monthly);
      } catch (error) {
        console.error('Error fetching history data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SegmentedButtons
        style={{ width: '80%', marginTop: 30 }}
        value={value}
        onValueChange={(val: string) => setValue(val as ValueType)}
        buttons={[
          {
            value: 'week',
            label: 'Weekly',
          },
          {
            value: 'month',
            label: 'Monthly',
          },
        ]}
      />

      <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>
        {value === 'week' ? 'Weekly' : 'Monthly'} Chart
      </Text>

      <View style={styles.barchart}>
        {value === 'week' && weeklyData && <WeeklyChart data={weeklyData} />}
        {value === 'month' && monthlyData && <MonthlyChart data={monthlyData} />}
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  barchart: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '90%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
