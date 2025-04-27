import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRecordIds, getRecordsByIds, Record } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<Record[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecords();

    // Add listener for when we return to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecords();
    });

    return unsubscribe;
  }, [navigation]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      // Get all record IDs
      const ids = await getRecordIds();
      
      if (ids.length > 0) {
        // Get details for all records
        const recordsData = await getRecordsByIds(ids);
        setRecords(recordsData);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('Error', 'Failed to load records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const handleRecordPress = (record: Record) => {
    navigation.navigate('RecordDetail' as never, { record } as never);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderRecord = ({ item }: { item: Record }) => (
    <TouchableOpacity 
      style={styles.recordItem} 
      onPress={() => handleRecordPress(item)}
    >
      <View style={styles.recordHeader}>
        <Text style={styles.recordId}>Record #{item.ID}</Text>
        <Text style={styles.recordDate}>{formatDate(item.CreateTS)}</Text>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="restaurant-outline" size={16} color="#555" style={styles.icon} />
          <Text style={styles.detailText}>Carbs: {parseFloat(item.Carbohydrates).toFixed(1)}g</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="medkit-outline" size={16} color="#555" style={styles.icon} />
          <Text style={styles.detailText}>Insulin: {parseFloat(item.Insulin).toFixed(1)}u</Text>
        </View>
      </View>
      
      <View style={styles.coefficients}>
        <Text style={styles.coeffText}>
          TC: {parseFloat(item.TimeCoefficient).toFixed(1)}
        </Text>
        <Text style={styles.coeffText}>
          SC: {parseFloat(item.SportCoefficient).toFixed(1)}
        </Text>
        <Text style={styles.coeffText}>
          PC: {parseFloat(item.PersonalCoefficient).toFixed(1)}
        </Text>
      </View>
      
      <View style={styles.recordFooter}>
        <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loaderText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record History</Text>
      
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list" size={50} color="#bbb" />
          <Text style={styles.emptyText}>No records found</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('FoodRecognition' as never)}
          >
            <Text style={styles.addButtonText}>Add New Record</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.ID}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  recordItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordDate: {
    fontSize: 14,
    color: '#888',
  },
  recordDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
  },
  coefficients: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  coeffText: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  recordFooter: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
});

export default HistoryScreen;