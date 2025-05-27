import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export default function AddItemScreen({ navigation, route }: any) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [gpsLocation, setGpsLocation] = useState('Fetching location...');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const token = route?.params?.token;

  useEffect(() => {
    async function requestLocation() {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setGpsLocation('Permission denied');
          return;
        }
      }
      Geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          setGpsLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
        },
        err => setGpsLocation('Location unavailable'),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
    requestLocation();
  }, []);

  const handleSave = async () => {
  if (!name || !desc) {
    Alert.alert('Missing data', 'Please fill all fields.');
    return;
  }
  // coords can be null if location is not available or permission denied
  let latitude = null;
  let longitude = null;
  if (coords) {
    latitude = coords.latitude;
    longitude = coords.longitude;
  }
  try {
    const response = await fetch('http://10.0.2.2:3000/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description: desc,
        latitude,
        longitude,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      Alert.alert('Success', 'Item saved!');
      navigation.goBack();
    } else {
      Alert.alert('Error', data.error || 'Failed to save item');
    }
  } catch (e) {
    Alert.alert('Error', 'Network or server error');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.screenCenter}>
      <Text style={styles.header}>New item</Text>
      <Text style={styles.gps}>{gpsLocation}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.descInput}
          value={desc}
          onChangeText={setDesc}
          placeholder="Enter description"
          multiline
        />
      </View>

      <View style={styles.buttonRow}>
        <Button title="Save" onPress={handleSave} />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Return" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  gps: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    width: 90,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  descInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  buttonRow: {
    marginVertical: 6,
  },
});