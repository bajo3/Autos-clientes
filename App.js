// App.js
import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'

import SearchListScreen from './app/screens/SearchListScreen'
import NewSearchScreen from './app/screens/NewSearchScreen'
import VehicleListScreen from './app/screens/VehicleListScreen'
import NewVehicleScreen from './app/screens/NewVehicleScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen
          name="SearchList"
          component={SearchListScreen}
          options={{ title: 'Búsquedas activas' }}
        />
        <Stack.Screen
          name="NewSearch"
          component={NewSearchScreen}
          options={{ title: 'Nueva búsqueda' }}
        />
        <Stack.Screen
          name="VehicleList"
          component={VehicleListScreen}
          options={{ title: 'Autos' }}
        />
        <Stack.Screen
          name="NewVehicle"
          component={NewVehicleScreen}
          options={{ title: 'Nuevo auto' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
