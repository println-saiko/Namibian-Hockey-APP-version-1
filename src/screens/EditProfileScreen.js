// screens/EditProfileScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button'; // Assuming your Button component path
import Colors from '../constants/colors'; // Assuming your Colors file path
import { AuthContext } from '../context/AuthContext'; // Assuming your AuthContext path

const EditProfileScreen = ({ navigation, route }) => {
  const { user, updateUser } = useContext(AuthContext); // Assuming updateUser exists in AuthContext
  const currentUser = route.params?.currentUser || user; // Get user from navigation or context

  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [team, setTeam] = useState(currentUser?.team || '');
  const [position, setPosition] = useState(currentUser?.position || '');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Effect to update fields if the user context changes (e.g., after a save)
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setTeam(user.team || '');
      setPosition(user.position || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Validation Error', 'Username and Email cannot be empty.');
      return;
    }
    // Basic email validation (can be more robust)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address.');
        return;
    }

    setIsSaving(true);
    try {
      const updatedDetails = {
        // Only include fields that your updateUser function expects
        // It's good practice to only send changed fields if your backend supports partial updates
        username,
        email,
        phone,
        team,
        position,
        // Do not send password here. Password changes should be a separate, secure process.
      };

      // --- Placeholder for updateUser logic ---
      // In a real app, you would call a function from your AuthContext or an API service
      // For example: await updateUser(updatedDetails);
      console.log('Attempting to save profile:', updatedDetails);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // If using AuthContext to manage user state globally:
      if (updateUser) {
        await updateUser(updatedDetails); // This function should handle backend update and local state
      } else {
        console.warn("updateUser function not available in AuthContext. Profile not updated in context.");
      }
      // --- End Placeholder ---

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack(); // Or navigate to ProfileScreen
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', error.message || 'Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    // Navigate to a dedicated ChangePasswordScreen
    // You might want to pass the user ID or email if needed for that screen
    navigation.navigate('ChangePasswordScreen');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Team</Text>
              <TextInput
                style={styles.input}
                value={team}
                onChangeText={setTeam}
                placeholder="Enter your team name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position</Text>
              <TextInput
                style={styles.input}
                value={position}
                onChangeText={setPosition}
                placeholder="Enter your position"
              />
            </View>

            <Button
              title={isSaving ? "Saving..." : "Save Changes"}
              onPress={handleSaveChanges}
              style={styles.button}
              disabled={isSaving}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.lightGray || '#f0f0f0', // Fallback color
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Add padding at bottom for better scroll experience
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray || '#f0f0f0',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.secondary || '#333', // Fallback color
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: Colors.primary || '#007bff', // Fallback color
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.white || '#fff', // Fallback color
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray || '#ccc', // Fallback color
    fontSize: 16,
    color: Colors.darkGray || '#555', // Fallback color
  },
  button: {
    marginTop: 16,
    // Add other styles for your primary button if not covered by the component itself
  },
  secondaryButton: {
    backgroundColor: Colors.background || Colors.white || '#fff',
    borderWidth: 1,
    borderColor: Colors.primary || '#007bff',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: Colors.primary || '#007bff',
    // Ensure your Button component uses this prop for the text style
  },
  // Add more styles as needed
});

export default EditProfileScreen;
