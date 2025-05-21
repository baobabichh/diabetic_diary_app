import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const API_URL = 'http://157.180.95.211:5050';

export const addRecord = async (
  timeCoefficient: string,
  sportCoefficient: string,
  personalCoefficient: string,
  insulin: string,
  carbohydrates: string,
  requestId?: string
): Promise<boolean> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');

    // Create URL-encoded form data
    const params = new URLSearchParams();
    params.append('uuid', uuid || '');

    // Only add non-empty parameters - the backend will use defaults otherwise
    if (timeCoefficient.trim() !== '') {
      params.append('time_coefficient', timeCoefficient);
    }

    if (sportCoefficient.trim() !== '') {
      params.append('sport_coefficient', sportCoefficient);
    }

    if (personalCoefficient.trim() !== '') {
      params.append('personal_coefficient', personalCoefficient);
    }

    if (insulin.trim() !== '') {
      params.append('insulin', insulin);
    }

    // Carbohydrates is required
    params.append('carbohydrates', carbohydrates);

    if (requestId) {
      params.append('request_id', requestId);
    }

    console.log("Adding record with params:", params.toString());

    const response = await fetch(`${API_URL}/add_record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log("Add record response status:", response.status);

    const data = await response.json();
    console.log("Add record response data:", data);

    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to add record');
    }

    return true;
  } catch (error) {
    console.error('Add record error:', error);
    throw error;
  }
};

export const getRecordIds = async (): Promise<string[]> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');

    const response = await fetch(`${API_URL}/get_record_ids?uuid=${uuid}`, {
      method: 'GET',
    });

    console.log("Get record IDs response status:", response.status);

    const data = await response.json();
    console.log("Get record IDs response data:", data);

    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to get record IDs');
    }

    return data as string[];
  } catch (error) {
    console.error('Get record IDs error:', error);
    throw error;
  }
};

export const getRecordsByIds = async (ids: string[]): Promise<Record[]> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');
    const idsParam = ids.join(',');

    const response = await fetch(`${API_URL}/get_records_by_ids?uuid=${uuid}&ids=${idsParam}`, {
      method: 'GET',
    });

    console.log("Get records by IDs response status:", response.status);

    const data = await response.json();
    console.log("Get records by IDs response data:", data);

    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to get records');
    }

    return data as Record[];
  } catch (error) {
    console.error('Get records by IDs error:', error);
    throw error;
  }
};

export const editFoodRecognitionResult = async (requestId: string, newData: FoodRecognitionResult): Promise<boolean> => {
  try {
    const uuid = await AsyncStorage.getItem('userToken');

    // Create URL-encoded form data
    const params = new URLSearchParams();
    params.append('uuid', uuid || '');
    params.append('request_id', requestId);
    params.append('new_json', JSON.stringify(newData));
    
    console.log("params2:", params);
    console.log("Editing food recognition result:", params.toString());

    const response = await fetch(`${API_URL}/edit_result?` + params.toString(), {
      method: 'GET',
    });

    console.log("Edit result response status:", response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to edit result');
    }

    return true;
  } catch (error) {
    console.error('Edit result error:', error);
    throw error;
  }
};

// Interface for food recognition result
export interface FoodItem {
  name: string;
  carbs: number;
  grams: number;
  ratio: number;
}

export interface FoodRecognitionResult {
  products: FoodItem[];
}

export interface Record {
  ID: string;
  UserID: string;
  FoodRecognitionID: string;
  Insulin: string;
  Carbohydrates: string;
  TimeCoefficient: string;
  SportCoefficient: string;
  PersonalCoefficient: string;
  CreateTS: string;
}

// Authentication API calls
export const registerUser = async (email: string, password: string): Promise<string> => {
  try {
    // Create URL-encoded form data
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    console.log("Sending params:", params.toString());

    const response = await fetch(`${API_URL}/register_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.Msg || 'Registration failed');
    }

    return data.UUID;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    // Create URL-encoded form data - the way Drogon expects parameters
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

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.Msg || 'Login failed');
    }

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

    // Create URL-encoded form data
    const params = new URLSearchParams();
    params.append('uuid', uuid || '');
    params.append('base64_string', base64Image);
    params.append('mime_type', mimeType);

    console.log( "params.toString().length(): ", params.toString().length);

    const response = await fetch(`${API_URL}/recognize_food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
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

    console.log(`Checking status for request ${requestId} with uuid ${uuid}`);

    // For GET requests, parameters should be in the URL
    const response = await fetch(`${API_URL}/get_status?uuid=${uuid}&request_id=${requestId}`, {
      method: 'GET',
    });

    console.log("Status response:", response.status);

    const data = await response.json();
    console.log("Status data:", data);

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

    console.log(`Getting results for request ${requestId} with uuid ${uuid}`);

    // For GET requests, parameters should be in the URL
    const response = await fetch(`${API_URL}/get_result?uuid=${uuid}&request_id=${requestId}`, {
      method: 'GET',
    });

    console.log("Result response:", response.status);

    const data = await response.json();
    console.log("Result data:", data);

    if (!response.ok) {
      throw new Error(data.Msg || 'Failed to get recognition result');
    }

    return data as FoodRecognitionResult;
  } catch (error) {
    console.error('Get result error:', error);
    throw error;
  }
};