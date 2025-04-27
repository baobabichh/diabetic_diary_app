import React, { useContext } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import { AuthContext } from '../App';

const UserScreen = () => {
  const { signOut } = useContext(AuthContext);
  const [uuid, setUuid] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUuid = async () => {
      try {
        const storedUuid = await AsyncStorage.getItem('userToken');
        setUuid(storedUuid);
      } catch (error) {
        console.error('Failed to get UUID from storage:', error);
      }
    };

    getUuid();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            signOut();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {uuid ? uuid.substring(0, 2).toUpperCase() : 'U'}
          </Text>
        </View>
        
        <Text style={styles.title}>User Profile</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{uuid || 'N/A'}</Text>
        </View>
        
        <Button 
          title="Logout" 
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About the App</Text>
        <Text style={styles.sectionText}>
          This app helps you identify foods and get nutritional information by simply taking a photo. 
          Take a picture of your meal, and the app will analyze it to show you what you're eating and the carbohydrate content.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: '30%',
  },
  value: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    width: '100%',
    marginTop: 10,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default UserScreen;