import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ItemDetailScreen({ route, navigation }: any) {
  const { item } = route.params;
  return (
    <View style={styles.screenCenter}>
      <Text style={styles.header}>Item Details</Text>
      <View style={styles.itemDetailBox}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
        <Text style={styles.itemGps}>
          Lat: {item.latitude ?? 'N/A'}, Lon: {item.longitude ?? 'N/A'}
        </Text>
      </View>
      <Button title="Return" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  itemDetailBox: {
    width: 300,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemDesc: {
    fontSize: 16,
    marginBottom: 12,
  },
  itemGps: {
    fontSize: 14,
    color: '#555',
  },
});