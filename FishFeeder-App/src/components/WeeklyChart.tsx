import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { BarChart } from 'react-native-gifted-charts';

const WeeklyChart = () => {
    const barData = [
        { value: 2, label: 'Mon', frontColor: '#4ABFF4' },
        { value: 1, label: 'Tue', frontColor: '#79C3DB' },
        { value: 5, label: 'Wed', frontColor: '#28B2B3' },
        { value: 0, label: 'Thu', frontColor: '#4ADDBA' },
        { value: 7, label: 'Fri', frontColor: '#91E3E3' },
        { value: 6, label: 'Sat', frontColor: '#79C3DB' },
        { value: 6, label: 'Sun', frontColor: '#4ABFF4' },

    ];
    return (
        <View>
            <BarChart
                showYAxisIndices
                horizontal
                xAxisLabelTextStyle={{ color: 'white',  marginRight: 20}}
                yAxisTextStyle={{ color: 'white' }}
                noOfSections={4}
                maxValue={15}
                data={barData}
                isAnimated
                shiftX={40}
            />
        </View>

    );
}

export default WeeklyChart

const styles = StyleSheet.create({})