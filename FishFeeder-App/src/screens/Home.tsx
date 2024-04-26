import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Text, Provider as PaperProvider } from 'react-native-paper';

const HomeScreen = () => {
  const [nextFeedTime, setNextFeedTime] = useState('12:00 PM');

  return (
    <PaperProvider >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Fish Feeder</Text>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Next Feeding Time:</Text>
          <Text style={styles.info}>{nextFeedTime}</Text>
          <Button mode="contained" onPress={() => console.log('Feed now')}>
            Feed Now
          </Button>
          <Button mode="contained" onPress={() => console.log('Set Schedule')}>
            Set Schedule
          </Button>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    width: '80%',
    padding: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  }
});

export default HomeScreen;
