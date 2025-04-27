import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const API_URL = 'http://172.26.132.77:5050';

// Interface for food recognition result
export interface FoodItem {
  name: string;
  carbs: number;
  grams: number;
}

export interface FoodRecognitionResult {
  products: FoodItem[];
}

// Authentication API calls
export const registerUser = async (email: string, password: string): Promise<string> => {
  try {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    console.log("Sending params:", params.toString());

    const response = await fetch(`${API_URL}/login_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.Msg || 'Registration failed');
    }
    const res = await AsyncStorage.setItem('userToken', data.UUID);

    return data.UUID;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    console.log("Sending params:", params.toString());

    const response = await fetch(`${API_URL}/login_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log("response ", response);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.Msg || 'Login failed');
    }

    console.log("data ", data);
    const res = await AsyncStorage.setItem('userToken', data.UUID);

    return data.UUID;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Food recognition API calls
export const recognizeFood = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');

    console.log("uuid ", uuid);

    const formData = new URLSearchParams();
    formData.append('uuid', uuid || '');
    formData.append('base64_string', base64Image);
    formData.append('mime_type', mimeType);

    const response = await fetch(`${API_URL}/recognize_food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.Msg || 'Food recognition failed');
    }

    return data.FoodRecognitionID;
  } catch (error) {
    console.error('Food recognition error:', error);
    throw error;
  }
};

export const getFoodRecognitionStatus = async (requestId: string): Promise<string> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');

    const response = await fetch(`${API_URL}/get_status?uuid=${uuid}&request_id=${requestId}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to get recognition status');
    }

    return data.Status;
  } catch (error) {
    console.error('Get status error:', error);
    throw error;
  }
};

export const getFoodRecognitionResult = async (requestId: string): Promise<FoodRecognitionResult> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');

    const response = await fetch(`${API_URL}/get_result?uuid=${uuid}&request_id=${requestId}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to get recognition result');
    }

    return data as FoodRecognitionResult;
  } catch (error) {
    console.error('Get result error:', error);
    throw error;
  }
};