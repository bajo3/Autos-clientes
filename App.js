// App.js
import * as React from 'react'
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import {
  KeyboardAvoidingView,
  Platform,
  Image,
  View,
} from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { COLORS } from './components/theme'

// Screens principales
import SearchListScreen from './app/screens/SearchListScreen'
import NewSearchScreen from './app/screens/NewSearchScreen'
import VehicleListScreen from './app/screens/VehicleListScreen'
import NewVehicleScreen from './app/screens/NewVehicleScreen'
import SearchDetailScreen from './app/screens/SearchDetailScreen'
import VehicleDetailScreen from './app/screens/VehicleDetailScreen'
import DashboardScreen from './app/screens/DashboardScreen'
import EditSearchScreen from './app/screens/EditSearchScreen'
import EditVehicleScreen from './app/screens/EditVehicleScreen'
import BulkWhatsappScreen from './app/screens/BulkWhatsappScreen'

const Stack = createNativeStackNavigator()

// Tema custom para que React Navigation NO pinte de blanco
const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
}

function HeaderLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('./assets/logo-header.png')}
        style={{
          width: 130,
          height: 26,
          resizeMode: 'contain',
          marginRight: 8,
        }}
      />
    </View>
  )
}

export default function App() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* Fondo negro global */}
      <View style={{ flex: 1, backgroundColor: '#05060A' }}>
        {/* NavigationContainer con tema que NO pinta blanco */}
        <NavigationContainer theme={NavTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="SearchList"
            screenOptions={({ navigation }) => ({
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: COLORS.headerText,
              headerTitleStyle: {
                fontWeight: '600',
              },
              headerShadowVisible: false,
              headerBackground: () => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.headerBackground,
                  }}
                />
              ),
              // flecha + logo
              headerLeft: ({ canGoBack, tintColor }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {canGoBack && (
                    <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      style={{
                        paddingHorizontal: 4,
                        paddingVertical: 8,
                        marginRight: 4,
                      }}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={22}
                        color={tintColor || COLORS.headerText}
                      />
                    </TouchableOpacity>
                  )}
                  <HeaderLogo />
                </View>
              ),
              contentStyle: {
                backgroundColor: 'transparent',
              },
            })}
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
      </View>
    </KeyboardAvoidingView>
  )
}
