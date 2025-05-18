// screens/PlayerEditScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Use hooks for navigation/route

import Button from '../components/Button';
import Colors from '../constants/colors';
import { getPlayers, savePlayer } from '../utils/storage'; // Import savePlayer

const PlayerEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { playerId } = route.params; // Get the player ID from route params

  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Player Data for Editing ---
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const players = await getPlayers();
        const foundPlayer = players.find(p => p.id === playerId);

        if (!foundPlayer) {
          setError('Player not found for editing.');
          setPlayerData(null);
        } else {
          setPlayerData(foundPlayer);
        }
      } catch (err) {
        console.error('Error fetching player for edit:', err);
        setError('Failed to load player data.');
        setPlayerData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]); // Re-fetch if playerId changes

  // --- Save Changes Handler ---
  const handleSaveChanges = async () => {
    if (!playerData) {
      Alert.alert('Error', 'No player data to save.');
      return;
    }

    setIsLoading(true);
    try {
      // Call the savePlayer function from storage (which handles updates)
      const success = await savePlayer(playerData); // playerData should be the updated object from your form
      if (success) {
        Alert.alert('Success', 'Player updated successfully!');
        navigation.goBack(); // Go back to the PlayerDetails screen
      } else {
         Alert.alert('Error', 'Failed to save player changes.');
      }
    } catch (err) {
      console.error('Error saving player:', err);
      Alert.alert('Error', 'Failed to save player changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Loading/Error ---
  if (isLoading && !playerData && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading player for editing...</Text>
      </View>
    );
  }

  if (error || !playerData) {
     return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Could not load player.'}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // --- Render Edit Form (You will replace this with your actual form inputs) ---
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Edit Player</Text>
      <Text>Player ID: {playerId}</Text>
      {/*
        // TODO: Replace the text below with your actual form inputs
        // You'll need state variables to hold the form values (e.g., name, position, etc.)
        // Initialize form state with `playerData` fetched above
        // Add TextInput components for each field
        // Update the state variables as the user types
        // The `handleSaveChanges` function should use these updated state variables
      */}
      <View style={{ marginVertical: 20 }}>
        <Text>Implement your form inputs here!</Text>
        <Text>Name: {playerData.firstName} {playerData.lastName}</Text>
        <Text>Position: {playerData.position}</Text>
        {/* ... add other fields ... */}
      </View>


      <Button
        title="Save Changes"
        onPress={handleSaveChanges} // Call the save handler
        disabled={isLoading} // Disable button while saving
      />

      {isLoading && <ActivityIndicator size="small" color={Colors.secondary} style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.secondary,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.secondary,
    textAlign: 'center',
  },
  // Add styles for your form inputs here
});

export default PlayerEditScreen;