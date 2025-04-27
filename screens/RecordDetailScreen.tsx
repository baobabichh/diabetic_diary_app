import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getFoodRecognitionResult, FoodRecognitionResult, Record } from '../services/api';

type RecordDetailRouteProp = RouteProp<{
  RecordDetail: {
    record: Record;
  };
}, 'RecordDetail'>;

const RecordDetailScreen = () => {
  const route = useRoute<RecordDetailRouteProp>();
  const { record } = route.params;
  
  const [foodData, setFoodData] = useState<FoodRecognitionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record.FoodRecognitionID && record.FoodRecognitionID !== "NULL") {
      loadFoodData();
    }
  }, [record]);

  const loadFoodData = async () => {
    setLoading(true);
    try {
      const result = await getFoodRecognitionResult(record.FoodRecognitionID);
      setFoodData(result);
    } catch (error) {
      console.error('Error loading food data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Record Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Record ID:</Text>
          <Text style={styles.value}>{record.ID}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(record.CreateTS)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Values</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Insulin:</Text>
          <Text style={styles.value}>{parseFloat(record.Insulin).toFixed(1)} units</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Carbohydrates:</Text>
          <Text style={styles.value}>{parseFloat(record.Carbohydrates).toFixed(1)} g</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Coefficients</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Time Coefficient:</Text>
          <Text style={styles.value}>{parseFloat(record.TimeCoefficient).toFixed(1)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Sport Coefficient:</Text>
          <Text style={styles.value}>{parseFloat(record.SportCoefficient).toFixed(1)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Personal Coefficient:</Text>
          <Text style={styles.value}>{parseFloat(record.PersonalCoefficient).toFixed(1)}</Text>
        </View>
      </View>
      
      {record.FoodRecognitionID && record.FoodRecognitionID !== "NULL" && (
        <View style={styles.card}>
          <Text style={styles.title}>Food Recognition</Text>
          <Text style={styles.subtitle}>Recognition ID: {record.FoodRecognitionID}</Text>
          
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loaderText}>Loading food data...</Text>
            </View>
          ) : foodData && foodData.products ? (
            <View style={styles.foodList}>
              {foodData.products.map((item, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <View style={styles.foodDetails}>
                    <Text style={styles.detailText}>Weight: {item.grams} g</Text>
                    <Text style={styles.detailText}>Carbs: {item.carbs} g</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Carbs:</Text>
                <Text style={styles.totalValue}>
                  {foodData.products.reduce((sum, item) => sum + item.carbs, 0).toFixed(1)} g
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>No food recognition data available</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#555',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 120,
    fontSize: 15,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
  },
  foodList: {
    marginTop: 10,
  },
  foodItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  noDataText: {
    padding: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888',
  },
});

export default RecordDetailScreen;