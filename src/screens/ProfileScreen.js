import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button'; // Assuming you have this Button component
import Card from '../components/Card';     // Assuming you have this Card component
import Colors from '../constants/colors'; // Assuming you have this Colors file
// import { getCurrentUser } from '../utils/storage'; // This was commented out in your original, might be needed depending on AuthContext setup
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // No need to navigate - the AuthContext will handle updating the auth state
      // which will cause the app to show the login screen
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Use the user data from context or fallback to default values
  const userData = user || {
    username: 'Guest User',
    email: 'guest@example.com',
    phone: 'Not available',
    team: 'Not assigned',
    position: 'Not assigned',
    memberSince: new Date().getFullYear().toString(),
    profileImage: null, // We'll use a placeholder
  };

  const handleEditProfile = () => {
    // Navigate to the EditProfileScreen, passing current user data if needed
    navigation.navigate('EditProfileScreen', { currentUser: userData });
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={Colors.gray} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData.username || userData.name || 'User'}</Text>
          <Text style={styles.userTeam}>{userData.team}</Text>
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{userData.phone}</Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Hockey Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Team: {userData.team}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="football-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Position: {userData.position}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Member since: {userData.memberSince}</Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Edit Profile"
            onPress={handleEditProfile} // Updated onPress handler
            style={styles.button}
            disabled={isLoading} // Optionally disable while logging out
          />
          {/* Change Password button removed */}
          <Button
            title={isLoading ? "Logging out..." : "Logout"}
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  container: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background, // Or lightGray for better contrast if background is white
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 4,
  },
  userTeam: {
    fontSize: 16,
    color: Colors.primary,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.secondary,
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    marginBottom: 12,
  },
  // secondaryButton and secondaryButtonText styles are no longer needed
  logoutButton: {
    backgroundColor: Colors.error, // Ensure this color is defined in your Colors.js
  },
});

export default ProfileScreen;
