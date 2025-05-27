import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';

export default function ListItemsScreen({ navigation, route }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = route?.params?.token;

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('http://10.0.2.2:3000/items', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setItems(data);
        } else {
          Alert.alert('Error', data.error || 'Failed to fetch items');
        }
      } catch (e) {
        Alert.alert('Error', 'Network or server error');
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.screenCenter}>
        <ActivityIndicator size="large" />
        <Text>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenCenter}>
      <Text style={styles.screenText}>List Items</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemBox}
            onPress={() => navigation.navigate('ItemDetail', { item })}
          >
            <Text style={styles.itemTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No items found.</Text>}
        style={{ width: '100%' }}
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      />
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
  screenText: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  itemBox: {
    width: 300,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemGps: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});