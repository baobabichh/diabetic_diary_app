import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import { recognizeFood, getFoodRecognitionStatus, getFoodRecognitionResult, FoodRecognitionResult, FoodItem } from '../services/api';

const FoodRecognitionScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<FoodRecognitionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Check status periodically if we have a request in progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (requestId && (status === 'Waiting' || status === 'Processing')) {
      interval = setInterval(checkStatus, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [requestId, status]);

  // Check result when status is Done
  useEffect(() => {
    if (status === 'Done' && requestId) {
      getResult();
    }
  }, [status]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to upload an image.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImage(result.assets[0].uri);
      setRequestId(null);
      setStatus(null);
      setResult(null);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera permissions to take a picture.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImage(result.assets[0].uri);
      setRequestId(null);
      setStatus(null);
      setResult(null);
    }
  };

  const startRecognition = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Convert image URI to base64
      const response = await fetch(image);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            const mimeType = blob.type;
            
            // Send to API
            const id = await recognizeFood(base64data, mimeType);
            setRequestId(id);
            setStatus('Waiting');
            resolve(id);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      Alert.alert('Recognition Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!requestId) return;
    
    try {
      const currentStatus = await getFoodRecognitionStatus(requestId);
      setStatus(currentStatus);
    } catch (error: any) {
      console.error('Error checking status:', error);
    }
  };

  const getResult = async () => {
    if (!requestId) return;
    
    try {
      const data = await getFoodRecognitionResult(requestId);
      setResult(data);
    } catch (error: any) {
      console.error('Error getting result:', error);
      Alert.alert('Error', 'Failed to get recognition results');
    }
  };

  const renderResult = () => {
    if (!result || !result.products || result.products.length === 0) {
      return <Text style={styles.noResultText}>No results available</Text>;
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Food Recognition Results:</Text>
        {result.products.map((item: FoodItem, index: number) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.nutritionInfo}>
              <Text style={styles.nutritionText}>Carbs: {item.carbs}g</Text>
              <Text style={styles.nutritionText}>Weight: {item.grams}g</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Food Recognition</Text>
      
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.foodImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonGroup}>
        <Button title="Choose from Gallery" onPress={pickImage} style={styles.button} />
        <Button title="Take Photo" onPress={takePicture} style={styles.button} />
      </View>
      
      {image && !requestId && (
        <Button 
          title="Recognize Food" 
          onPress={startRecognition} 
          loading={loading} 
          style={styles.recognizeButton} 
        />
      )}
      
      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: <Text style={styles.statusValue}>{status}</Text>
          </Text>
          {(status === 'Waiting' || status === 'Processing') && (
            <Text style={styles.processingText}>Processing your image...</Text>
          )}
          {status === 'Error' && (
            <Text style={styles.errorText}>An error occurred during processing.</Text>
          )}
        </View>
      )}
      
      {status === 'Done' && renderResult()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 0.48,
  },
  recognizeButton: {
    backgroundColor: '#FF9800',
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusValue: {
    fontWeight: 'bold',
  },
  processingText: {
    color: '#2196F3',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#F44336',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  foodItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutritionInfo: {
    flexDirection: 'row',
    marginTop: 5,
  },
  nutritionText: {
    marginRight: 15,
    color: '#666',
  },
  noResultText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  }
});

export default FoodRecognitionScreen;