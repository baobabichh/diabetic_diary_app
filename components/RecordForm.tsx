import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import Button from './Button';
import { FoodItem, FoodRecognitionResult } from '../services/api';

interface RecordFormProps {
  initialCarbs?: string;
  initialInsulin?: string;
  initialTimeCoefficient?: string;
  initialSportCoefficient?: string;
  initialPersonalCoefficient?: string;
  foodRecognitionResult?: FoodRecognitionResult;
  foodRecognitionId?: string;
  onUpdateFoodItem?: (index: number, updatedItem: FoodItem) => void;
  onSubmit: (data: {
    insulin: string;
    carbohydrates: string;
    timeCoefficient: string;
    sportCoefficient: string;
    personalCoefficient: string;
    foodRecognitionId?: string;
  }) => void;
  submitButtonText?: string;
  isLoading?: boolean;
}

const RecordForm: React.FC<RecordFormProps> = ({
  initialCarbs = '',
  initialInsulin = '',
  initialTimeCoefficient = '1.0',
  initialSportCoefficient = '1.0',
  initialPersonalCoefficient = '1.0',
  foodRecognitionResult,
  foodRecognitionId,
  onUpdateFoodItem,
  onSubmit,
  submitButtonText = 'Save Record',
  isLoading = false,
}) => {
  const [insulin, setInsulin] = useState(initialInsulin);
  const [carbohydrates, setCarbohydrates] = useState(initialCarbs);
  const [timeCoefficient, setTimeCoefficient] = useState(initialTimeCoefficient);
  const [sportCoefficient, setSportCoefficient] = useState(initialSportCoefficient);
  const [personalCoefficient, setPersonalCoefficient] = useState(initialPersonalCoefficient);
  const [manualInsulin, setManualInsulin] = useState(false);
  const [errors, setErrors] = useState({
    insulin: '',
    carbohydrates: '',
    timeCoefficient: '',
    sportCoefficient: '',
    personalCoefficient: '',
  });

  // Calculate insulin dose automatically when any dependent value changes
  useEffect(() => {
    if (!manualInsulin) {
      calculateInsulinDose();
    }
  }, [carbohydrates, timeCoefficient, sportCoefficient, personalCoefficient, manualInsulin]);

  // Update carbs when food items change
  useEffect(() => {
    if (foodRecognitionResult && foodRecognitionResult.products) {
      const totalCarbs = foodRecognitionResult.products.reduce(
        (sum, item) => sum + item.carbs,
        0
      );
      setCarbohydrates(totalCarbs.toString());
    }
  }, [foodRecognitionResult]);

  const calculateInsulinDose = () => {
    // Only calculate if carbs is a valid number
    if (carbohydrates && !isNaN(Number(carbohydrates))) {
      const carbs = parseFloat(carbohydrates) || 0;
      const tCoeff = parseFloat(timeCoefficient) || 1.0;
      const sCoeff = parseFloat(sportCoefficient) || 1.0;
      const pCoeff = parseFloat(personalCoefficient) || 1.0;

      // Formula: insulin = Carbohydrates / 10 * PersonalCoefficient * SportCoefficient * TimeCoefficient
      const calculatedInsulin = (carbs / 10) * pCoeff * sCoeff * tCoeff;

      // Round to 1 decimal place
      setInsulin(calculatedInsulin.toFixed(1));
    }
  };

  const handleInsulinChange = (value: string) => {
    setManualInsulin(true);
    setInsulin(value);
  };

  const resetToCalculatedInsulin = () => {
    setManualInsulin(false);
    calculateInsulinDose();
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      insulin: '',
      carbohydrates: '',
      timeCoefficient: '',
      sportCoefficient: '',
      personalCoefficient: '',
    };

    // Validate carbohydrates (required)
    if (carbohydrates.trim() === '') {
      newErrors.carbohydrates = 'Carbohydrates is required';
      isValid = false;
    } else if (isNaN(Number(carbohydrates)) || Number(carbohydrates) < 0) {
      newErrors.carbohydrates = 'Carbohydrates must be a positive number';
      isValid = false;
    }

    // Optional fields - just validate format if provided
    if (insulin.trim() !== '' && (isNaN(Number(insulin)) || Number(insulin) < 0)) {
      newErrors.insulin = 'Insulin must be a positive number';
      isValid = false;
    }

    if (timeCoefficient.trim() !== '' && (isNaN(Number(timeCoefficient)) || Number(timeCoefficient) < 0)) {
      newErrors.timeCoefficient = 'Time coefficient must be a positive number';
      isValid = false;
    }

    if (sportCoefficient.trim() !== '' && (isNaN(Number(sportCoefficient)) || Number(sportCoefficient) < 0)) {
      newErrors.sportCoefficient = 'Sport coefficient must be a positive number';
      isValid = false;
    }

    if (personalCoefficient.trim() !== '' && (isNaN(Number(personalCoefficient)) || Number(personalCoefficient) < 0)) {
      newErrors.personalCoefficient = 'Personal coefficient must be a positive number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        insulin,
        carbohydrates,
        timeCoefficient,
        sportCoefficient,
        personalCoefficient,
        foodRecognitionId,
      });
    }
  };

  const handleFoodItemUpdate = (index: number, field: 'name' | 'grams', value: string) => {
    if (!foodRecognitionResult || !onUpdateFoodItem) return;

    const updatedItem = { ...foodRecognitionResult.products[index] };

    if (field === 'name') {
      updatedItem.name = value;
    } else if (field === 'grams') {
      const newGrams = parseFloat(value) || 0;
      const ratio = updatedItem.ratio;

      // Update carbs proportionally
      updatedItem.grams = newGrams;
      updatedItem.carbs = Math.round(newGrams / 100.0 * ratio)
    }

    onUpdateFoodItem(index, updatedItem);
  };

  return (
    <ScrollView style={styles.container}>
      {foodRecognitionResult && foodRecognitionResult.products && (
        <View style={styles.foodSection}>
          <Text style={styles.sectionTitle}>Recognized Food</Text>
          {foodRecognitionResult.products.map((item, index) => (
            <View key={index} style={styles.foodItem}>
              {/* <TextInput
                style={styles.foodNameInput}
                value={item.name}
                onChangeText={(value) => handleFoodItemUpdate(index, 'name', value)}
                placeholder="Food name"
              /> */}
              <Text style={styles.foodNameInput}>{item.name}</Text>
              <View style={styles.foodDetails}>
                <View style={styles.inputRow}>
                  <Text style={styles.label}>Grams:</Text>
                  <TextInput
                    style={styles.valueInput}
                    value={item.grams.toString()}
                    onChangeText={(value) => handleFoodItemUpdate(index, 'grams', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.label}>Carbs:</Text>
                  <Text style={styles.value}>{item.carbs}g</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={styles.totalCarbs}>
            <Text style={styles.totalLabel}>Total Carbs:</Text>
            <Text style={styles.totalValue}>
              {foodRecognitionResult.products
                .reduce((sum, item) => sum + item.carbs, 0)
                .toFixed(1)}g
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record Details</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Carbohydrates (g): <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.carbohydrates ? styles.inputError : null]}
            value={carbohydrates}
            onChangeText={setCarbohydrates}
            keyboardType="numeric"
            placeholder="0"
          />
          {errors.carbohydrates ? (
            <Text style={styles.errorText}>{errors.carbohydrates}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Insulin (units):</Text>
            {manualInsulin ? (
              <TouchableOpacity onPress={resetToCalculatedInsulin}>
                <Text style={styles.autoCalcLink}>Calculate automatically</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.autoCalcActive}>Auto-calculated</Text>
            )}
          </View>
          <TextInput
            style={[styles.input, errors.insulin ? styles.inputError : null, manualInsulin ? styles.manualInput : styles.autoInput]}
            value={insulin}
            onChangeText={handleInsulinChange}
            keyboardType="numeric"
            placeholder="0"
          />
          {errors.insulin ? (
            <Text style={styles.errorText}>{errors.insulin}</Text>
          ) : null}
          {!manualInsulin && (
            <Text style={styles.calculationNote}>
              Formula: Carbs / 10 × Time × Sport × Personal
            </Text>
          )}
        </View>

        <View style={styles.coeffContainer}>
          <Text style={styles.coeffTitle}>Coefficients</Text>
          <Text style={styles.coeffNote}>These values affect insulin calculation</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time Coefficient:</Text>
          <TextInput
            style={[styles.input, errors.timeCoefficient ? styles.inputError : null]}
            value={timeCoefficient}
            onChangeText={setTimeCoefficient}
            keyboardType="numeric"
            placeholder="1.0"
          />
          {errors.timeCoefficient ? (
            <Text style={styles.errorText}>{errors.timeCoefficient}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sport Coefficient:</Text>
          <TextInput
            style={[styles.input, errors.sportCoefficient ? styles.inputError : null]}
            value={sportCoefficient}
            onChangeText={setSportCoefficient}
            keyboardType="numeric"
            placeholder="1.0"
          />
          {errors.sportCoefficient ? (
            <Text style={styles.errorText}>{errors.sportCoefficient}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Personal Coefficient:</Text>
          <TextInput
            style={[styles.input, errors.personalCoefficient ? styles.inputError : null]}
            value={personalCoefficient}
            onChangeText={setPersonalCoefficient}
            keyboardType="numeric"
            placeholder="1.0"
          />
          {errors.personalCoefficient ? (
            <Text style={styles.errorText}>{errors.personalCoefficient}</Text>
          ) : null}
        </View>
      </View>

      <Button
        title={submitButtonText}
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  required: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  optional: {
    color: '#9E9E9E',
    fontSize: 12,
    fontStyle: 'italic',
  },
  autoCalcActive: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  autoCalcLink: {
    fontSize: 12,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  calculationNote: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  manualInput: {
    backgroundColor: '#fff',
  },
  autoInput: {
    backgroundColor: '#f0f8ff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  coeffContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  coeffTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  coeffNote: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
  },
  foodItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  foodNameInput: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodDetails: {
    marginTop: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  valueInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    width: 80,
    marginLeft: 5,
    fontSize: 14,
  },
  value: {
    marginLeft: 5,
    fontSize: 14,
  },
  totalCarbs: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  totalValue: {
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 30,
  },
});

export default RecordForm;