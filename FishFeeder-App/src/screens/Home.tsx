import React, { useState, useEffect, useCallback } from 'react';
import { Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Text, Provider as PaperProvider, FAB, Card, Title, Snackbar, TextInput, ActivityIndicator } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const HomeScreen = ({ navigation }: any) => {
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  const onDismissSnackBar = () => setVisible(false);

  const [lastFeedTime, setLastFeedTime] = useState<string>('');
  const [qty, setQty] = useState<string>('50');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLastFeedingTime();
  }, []);

  const fetchLastFeedingTime = async () => {
    try {
      const response = await axios.get('https://fishfeeder-1-a4359990.deta.app/status');
      setLastFeedTime(response.data.last_feeding.formattedTimeForApp);
    } catch (error) {
      console.error('Error fetching last feeding time:', error);
      Alert.alert('Error', 'Failed to fetch the last feeding time');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleFeedNow = async () => {
    console.log('Feed now');
    try {
      const response = await axios.post('https://fishfeeder-1-a4359990.deta.app/feed', {
        quantity: qty,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setVisible(true);
        // Refresh the last feeding time after feeding
        const statusResponse = await axios.get('https://fishfeeder-1-a4359990.deta.app/status');
        setLastFeedTime(statusResponse.data.last_feeding.formattedTimeForApp);
      }
    } catch (error) {
      console.error('Error feeding fish:', error);
      Alert.alert('Error', 'Failed to feed the fish');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLastFeedingTime();
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
       <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      <Text style={styles.title} variant="titleLarge">Fish Feeder</Text>
      <LottieView style={{ width: width * 0.8, height: height * 0.3 }} source={require('../assets/animations/fish.json')} autoPlay loop />
      <View style={styles.section}>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="clock" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.subtitle}>Last Feeding Time:</Text>
            <Text style={styles.info}>{lastFeedTime}</Text>
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
          variant="primary"
          icon="fishbowl-outline"
          style={styles.button}
          color="#fff"
          label="Feed Now"
          onPress={handleFeedNow}
        />
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Okay',
            onPress: () => {
              setVisible(false);
            },
          }}
        >
          Fish fed successfully!
        </Snackbar>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
   
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
    marginBottom: 15,
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
    width: '30%',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scrollViewContent: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
