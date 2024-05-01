import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';

const MonthlyChart = () => {
  const barData = [
    {value: 230, label: 'Jan', frontColor: '#4ABFF4'},
    {value: 180, label: 'Feb', frontColor: '#79C3DB'},
    {value: 195, label: 'Mar', frontColor: '#28B2B3'},
    {value: 250, label: 'Apr', frontColor: '#4ADDBA'},
    {value: 320, label: 'May', frontColor: '#91E3E3'},
    {value: 320, label: 'Jun', frontColor: '#91E3E3'},
    {value: 120, label: 'Jul', frontColor: '#79C3DB'},
  ];
  return (
    <View>
      <BarChart
        horizontal
        showYAxisIndices
        xAxisLabelTextStyle={{color: 'white', marginRight: 20}}
        yAxisTextStyle={{color: 'white'}}
        noOfSections={4}
        maxValue={400}
        data={barData}
        isAnimated
        shiftX={40}
      />
    </View>
  );
};

export default MonthlyChart;

const styles = StyleSheet.create({});
