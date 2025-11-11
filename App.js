// App.js
import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'


// Screens principales
import SearchListScreen from './app/screens/SearchListScreen'
import NewSearchScreen from './app/screens/NewSearchScreen'
import VehicleListScreen from './app/screens/VehicleListScreen'
import NewVehicleScreen from './app/screens/NewVehicleScreen'
import SearchDetailScreen from './app/screens/SearchDetailScreen'
import VehicleDetailScreen from './app/screens/VehicleDetailScreen'
import DashboardScreen from './app/screens/DashboardScreen'

// Editores nuevos
import EditSearchScreen from './app/screens/EditSearchScreen'
import EditVehicleScreen from './app/screens/EditVehicleScreen'

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
        <Stack.Screen
          name="SearchDetail"
          component={SearchDetailScreen}
          options={{ title: 'Detalle de búsqueda' }}
        />
        <Stack.Screen
          name="VehicleDetail"
          component={VehicleDetailScreen}
          options={{ title: 'Detalle de auto' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen
          name="EditSearch"
          component={EditSearchScreen}
          options={{ title: 'Editar búsqueda' }}
        />
        <Stack.Screen
          name="EditVehicle"
          component={EditVehicleScreen}
          options={{ title: 'Editar auto' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  )
}
