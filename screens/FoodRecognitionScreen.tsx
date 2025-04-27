import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import RecordForm from '../components/RecordForm';
import { 
  recognizeFood, 
  getFoodRecognitionStatus, 
  getFoodRecognitionResult, 
  editFoodRecognitionResult,
  addRecord,
  FoodRecognitionResult, 
  FoodItem 
} from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const FoodRecognitionScreen = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<FoodRecognitionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
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
      setShowForm(false);
    }
  };

  const startRecognition = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Convert image URI to base64
      const response = await fetch(image);
      const blob = await response.blob();
      
      const reader = new FileReader();
      
      const readPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(blob);
      
      const base64data = await readPromise;
      const mimeType = blob.type;
      
      // Send to API
      const id = await recognizeFood(base64data, mimeType);
      setRequestId(id);
      setStatus('Waiting');
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
      setShowForm(true);
    } catch (error: any) {
      console.error('Error getting result:', error);
      Alert.alert('Error', 'Failed to get recognition results');
    }
  };

  const handleUpdateFoodItem = async (index: number, updatedItem: FoodItem) => {
    if (!result || !requestId) return;
    
    const updatedProducts = [...result.products];
    updatedProducts[index] = updatedItem;
    
    const updatedResult = {
      ...result,
      products: updatedProducts
    };
    
    setResult(updatedResult);
    
    try {
      // Send updated results to backend
      await editFoodRecognitionResult(requestId, updatedResult);
    } catch (error: any) {
      console.error('Error updating food item:', error);
      Alert.alert('Error', 'Failed to update food item');
    }
  };

  const handleSaveRecord = async (data: {
    insulin: string;
    carbohydrates: string;
    timeCoefficient: string;
    sportCoefficient: string;
    personalCoefficient: string;
    foodRecognitionId?: string;
  }) => {
    setSavingRecord(true);
    try {
      await addRecord(
        data.timeCoefficient,
        data.sportCoefficient,
        data.personalCoefficient,
        data.insulin,
        data.carbohydrates,
        data.foodRecognitionId || undefined
      );
      
      Alert.alert('Success', 'Record saved successfully',
        [{ text: 'OK', onPress: resetForm }]
      );
    } catch (error: any) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'Failed to save record');
    } finally {
      setSavingRecord(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setRequestId(null);
    setStatus(null);
    setResult(null);
    setShowForm(false);
  };

  const handleManualEntry = () => {
    setShowForm(true);
    setResult(null);
    setRequestId(null);
    setStatus(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Food Recognition</Text>
      
      {!showForm ? (
        <>
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
          
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>
          
          <Button 
            title="Manual Entry" 
            onPress={handleManualEntry} 
            style={styles.manualButton} 
          />
          
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
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.backButton} onPress={resetForm}>
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <RecordForm
            foodRecognitionResult={result}
            foodRecognitionId={requestId || undefined}
            onUpdateFoodItem={handleUpdateFoodItem}
            onSubmit={handleSaveRecord}
            submitButtonText="Save Record"
            isLoading={savingRecord}
          />
        </>
      )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 5,
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
    marginBottom: 20,
  },
  manualButton: {
    backgroundColor: '#2196F3',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#888',
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
  }
});

export default FoodRecognitionScreen;