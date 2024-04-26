/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BlurView} from '@react-native-community/blur';
import MIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from '../screens/Home';
import History from '../screens/History';
import Schedule from '../screens/Schedule';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarBackground: () => (
          <BlurView
            overlayColor=""
            blurAmount={30}
            style={styles.BlurViewStyles}
          />
        ),
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <MIcons name="home-outline" size={size} color={
              focused ? '#D1F4FF' : '#4D4D4D'
            }
            />
          ),
        }}
        />
        <Tab.Screen
        name="Schedule"
        component={Schedule}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <MIcons name="calendar-clock" size={size} color={
              focused ? '#D1F4FF' : '#4D4D4D'
            }
            />
          ),
        }}
        />

         <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <MIcons name="history" size={size} color={
              focused ? '#D1F4FF' : '#4D4D4D'
            }
            />
          ),
        }}
        />
       
     
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 60,
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    borderTopColor: 'transparent',
    marginTop: 10,
    borderRadius: 20,
  },
  BlurViewStyles: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default TabNavigator;