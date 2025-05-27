import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import AddItemScreen from './views/AddItemScreen';
import ListItemsScreen from './views/ListItemsScreen';
import DeviceInfo from 'react-native-device-info';
import ItemDetailScreen from './views/ItemDetailScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation, route }: any) {
  const { token } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Where is</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Add Item"
            onPress={() => navigation.navigate('AddItem', { token })}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="List Items"
            onPress={() => navigation.navigate('ListItems', { token })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;

    async function registerOrLogin() {
      const id = await DeviceInfo.getUniqueId();
      try {
        const response = await fetch('http://10.0.2.2:3000/registerLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          // Retry after 3 seconds if token not found
          retryTimeout = setTimeout(registerOrLogin, 3000);
        }
      } catch (e) {
        // Retry after 3 seconds on error
        retryTimeout = setTimeout(registerOrLogin, 3000);
      }
    }

    registerOrLogin();

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  if (!token) {
    return (
      <View style={styles.screenCenter}>
        <ActivityIndicator size="large" />
        <Text>Registering device...</Text>
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDarkMode ? '#222' : '#fff',
          },
        }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} route={{ ...props.route, params: { token } }} />}
        </Stack.Screen>
        <Stack.Screen name="AddItem">
          {props => <AddItemScreen {...props} route={{ ...props.route, params: { token } }} />}
        </Stack.Screen>
        <Stack.Screen name="ListItems">
          {props => <ListItemsScreen {...props} route={{ ...props.route, params: { token } }} />}
        </Stack.Screen>
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '80%',
    marginVertical: 12,
  },
  screenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 24,
  },
});

export default App;