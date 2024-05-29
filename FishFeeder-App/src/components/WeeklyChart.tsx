import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { WeeklyData } from '../types';

interface WeeklyChartProps {
  data: WeeklyData;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const barData = Object.keys(data).map(day => ({
    value: data[day as keyof WeeklyData],
    label: day.slice(0, 3),
    frontColor: '#4ABFF4',
  }));

  return (
    <View>
      <BarChart
        showYAxisIndices
        horizontal
        xAxisLabelTextStyle={{ color: 'white', marginRight: 20 }}
        yAxisTextStyle={{ color: 'white' }}
        noOfSections={4}
        maxValue={30}
        data={barData}
        isAnimated
        shiftX={40}
      />
    </View>
  );
};

export default WeeklyChart;

const styles = StyleSheet.create({});
