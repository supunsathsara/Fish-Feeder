import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Text, Provider as PaperProvider, FAB, Card, Title, Snackbar, TextInput } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  const onDismissSnackBar = () => setVisible(false);

  const [nextFeedTime, setNextFeedTime] = useState('12:00 PM');
  const [qty, setQty] = useState('50');

  const handleFeedNow = () => {
    console.log('Feed now');
    //! Add logic to feed the fish

    setVisible(true);

  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} variant="titleLarge">Fish Feeder</Text>
      <LottieView style={{ width: width * 0.8, height: height * 0.3 }} source={require('../assets/animations/fish.json')} autoPlay loop />
      <View style={styles.section}>

      <Card style={styles.card}>
          <Card.Content>
            <Icon name="clock" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.subtitle}>Next Feeding Time:</Text>
            <Text style={styles.info}>{nextFeedTime}</Text>
          </Card.Content>
        </Card>
        <TextInput
          label="QTY"
          value={qty}
          onChangeText={setQty}
          style={styles.input}
          keyboardType="numeric"
        />
        <FAB
          variant='primary'
          icon='fishbowl-outline'
          style={styles.button}
          color='#fff'
          label='Feed Now'
          onPress={
            handleFeedNow
          } />
        <FAB
          variant='secondary'
          icon='calendar-clock'
          style={styles.button}
          color='#fff'
          label='schedule'
          onPress={() => console.log('Schedule feed')} />
           <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'Okay',
          onPress: () => {
            setVisible(false);
          },
        }}>
        Fish fed successfully!
      </Snackbar>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    width: '80%',
    padding: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#6B4FA9',
  },
  card: {
    width: '80%',
    marginBottom: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1A1A1A',
    width: '40%',
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default HomeScreen;
