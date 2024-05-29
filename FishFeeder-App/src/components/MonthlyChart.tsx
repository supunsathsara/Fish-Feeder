import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MonthlyData } from '../types';

interface MonthlyChartProps {
  data: MonthlyData;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  const barData = Object.keys(data).map(month => ({
    value: data[month],
    label: month.split('-')[1],
    frontColor: '#4ABFF4',
  }));

  return (
    <View>
      <BarChart
        horizontal
        showYAxisIndices
        xAxisLabelTextStyle={{ color: 'white', marginRight: 20 }}
        yAxisTextStyle={{ color: 'white' }}
        noOfSections={4}
        maxValue={200}
        data={barData}
        isAnimated
        shiftX={40}
      />
    </View>
  );
};

export default MonthlyChart;

const styles = StyleSheet.create({});
