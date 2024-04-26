import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import MonthlyChart from '../components/MonthlyChart'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SegmentedButtons } from 'react-native-paper'
import WeeklyChart from '../components/WeeklyChart'


const History = () => {
    const [value, setValue] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <SegmentedButtons
                style={{ width: '80%', marginTop: 30 }}
                value={value}
                onValueChange={setValue}
                buttons={[
                    {
                        value: 'week',
                        label: 'Weekly',

                    },
                    {
                        value: 'month',
                        label: 'monthly',
                    },
                ]}
            />

            <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>
                {value === 'week' ? 'Weekly' : 'Monthly'} Chart
            </Text>

            <View style={styles.barchart}>
                {value === 'week' && <WeeklyChart />}
                {value === 'month' && <MonthlyChart />}
            </View>
        </SafeAreaView>
    )
}

export default History

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#000',
    },
    barchart: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        width: '90%',
    },
})