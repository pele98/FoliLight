import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Map from './Map.js';
import Main from './Main.js';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function Navigator() {
    return (

        <Tab.Navigator initialRouteName='Main'
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Main') {
                        iconName = focused
                            ? 'bus-sharp'
                            : 'bus-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'earth-sharp' : 'earth-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'teal',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Main" component={Main} options={{ title: 'Bus stops' }} />
            <Tab.Screen name="Map" component={Map} options={{ title: 'Map' }} />
        </Tab.Navigator>

    );
}