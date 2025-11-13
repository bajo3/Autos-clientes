// App.js
import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { KeyboardAvoidingView, Platform } from 'react-native'
import BulkWhatsappScreen from './app/screens/BulkWhatsappScreen'

import { COLORS } from './components/theme'

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.headerBackground,
            },
            headerTintColor: COLORS.headerText,
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerShadowVisible: false,
          }}
        >
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
          <Stack.Screen
            name="BulkWhatsapp"
            component={BulkWhatsappScreen}
            options={{ title: 'WhatsApp masivo' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </KeyboardAvoidingView>
  )
}
