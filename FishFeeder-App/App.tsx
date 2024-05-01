import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './src/navigators/TabNavigator';
import { StyleSheet } from 'react-native';
import NewSchedule from './src/screens/NewSchedule';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer >
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Tab"
          component={TabNavigator}
          options={{animation: 'slide_from_bottom'}}></Stack.Screen>
          <Stack.Screen
          name='newSchedule'
          component={NewSchedule}
          options={{animation: 'slide_from_bottom'}}></Stack.Screen>
       
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default App;