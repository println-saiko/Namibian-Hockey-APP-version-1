import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

import Card from '../components/Card'; // Assuming '../components/Card' exists
import Button from '../components/Button'; // Assuming '../components/Button' exists
import Colors from '../constants/colors'; // Assuming '../constants/colors' exists
// Assuming these storage functions exist and handle data persistence
import { getPlayers, getTeams, updatePlayer } from '../utils/storage';

const PlayerDetailsScreen = ({ route, navigation }) => {
  const { playerId } = route.params;

  const [player, setPlayer] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch player and team data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      // Fetch players
      const playersData = await getPlayers();
      const foundPlayer = playersData.find(p => p.id === playerId);

      if (!foundPlayer) {
        setError('Player not found');
        setPlayer(null); // Ensure player state is null if not found
        return;
      }

      setPlayer(foundPlayer);

      // Fetch team name
      let currentTeamName = '';
      if (foundPlayer.teamId) {
        const teamsData = await getTeams();
        const team = teamsData.find(t => t.id === foundPlayer.teamId);
        if (team) {
          currentTeamName = team.name;
        } else {
           // Handle case where teamId exists but team data is missing
           currentTeamName = 'Unknown Team';
        }
      } else {
        currentTeamName = 'No Team Assigned'; // Handle case where teamId is null or undefined
      }
      setTeamName(currentTeamName);

    } catch (error) {
      console.error('Error fetching player details:', error);
      setError('Failed to load player details. ' + error.message); // Show error message
    } finally {
      setIsLoading(false);
    }
  }, [playerId]); // Depend on playerId

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  // This handles cases where we navigate back from an editing screen
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]) // Depend on fetchData
  );


  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    // Ensure dateOfBirth is a Date object (it might be a string from storage)
    const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
    const today = new Date();

    // Basic validation
    if (isNaN(birthDate.getTime())) {
        console.warn('Invalid dateOfBirth format:', dateOfBirth);
        return 'Invalid Date'; // Or return an empty string
    }


    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check for negative age (future date of birth)
    if (age < 0) {
        return 'Invalid Age'; // Or handle as an error
    }

    return age;
  };

  // --- Management Button Handler ---
  const handleManagePlayer = () => {
      if (player) {
          // Navigate to the new ManagePlayerScreen
          // Pass the player object or just the playerId
          navigation.navigate('ManagePlayer', { player: player });
      }
  };
  // ----------------------------------


  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading player details...</Text>
      </View>
    );
  }

  // Show error message
  if (error || !player) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Player not found'}</Text>
        {/* You might want a "Retry" button here too */}
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Player stats - using mock data since we don't store this in our database yet
  // TODO: Replace with actual fetched stats if available
  const playerStats = {
    matches: 45,
    goals: 28,
    assists: 12,
    yellowCards: 3,
    redCards: 0,
  };

  // Player bio - using mock data or fallback
  const playerBio = player.bio ||
    `${player.firstName} ${player.lastName} is a ${player.position ? player.position.toLowerCase() : 'player'} for ${teamName}. ` +
    'They are a valuable member of the team with great skills and dedication to the sport.';

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {player.profileImage ? (
              <Image source={{ uri: player.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={Colors.gray} />
              </View>
            )}
          </View>
          <Text style={styles.playerName}>{`${player.firstName} ${player.lastName}`}</Text>
          {player.position && ( // Only show position badge if position exists
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{player.position}</Text>
            </View>
          )}
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          {player.dateOfBirth && ( // Only show DOB/Age if it exists
            <>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>Age: {calculateAge(player.dateOfBirth)}</Text>
              </View>
               <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>Date of Birth: {new Date(player.dateOfBirth).toLocaleDateString()}</Text>
              </View>
            </>
          )}
          {player.gender && ( // Only show gender if it exists
             <View style={styles.infoRow}>
               <Ionicons name="person-outline" size={20} color={Colors.primary} />
               <Text style={styles.infoText}>Gender: {player.gender}</Text>
             </View>
          )}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Team Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Team: {teamName || 'No Team'}</Text> {/* Display "No Team" if teamName is empty */}
          </View>
          {player.position && ( // Only show position if it exists
            <View style={styles.infoRow}>
              <Ionicons name="football-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>Position: {player.position}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          {player.email && ( // Only show email if it exists
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{player.email}</Text>
            </View>
          )}
          {player.phone && ( // Only show phone if it exists
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{player.phone}</Text>
            </View>
          )}
           {!player.email && !player.phone && (
               <Text style={styles.infoText}>No contact information available.</Text>
           )}
        </Card>

        {/* Display stats card only if you plan to add actual stats */}
        <Card style={styles.infoCard}>
           <Text style={styles.cardTitle}>Player Statistics</Text>
           <View style={styles.statsContainer}>
             <View style={styles.statItem}>
               <Text style={styles.statValue}>{playerStats.matches}</Text>
               <Text style={styles.statLabel}>Matches</Text>
             </View>
             <View style={styles.statItem}>
               <Text style={styles.statValue}>{playerStats.goals}</Text>
               <Text style={styles.statLabel}>Goals</Text>
             </View>
             <View style={styles.statItem}>
               <Text style={styles.statValue}>{playerStats.assists}</Text>
               <Text style={styles.statLabel}>Assists</Text>
             </View>
             <View style={styles.statItem}>
               <Text style={styles.statValue}>{playerStats.yellowCards}</Text>
               <Text style={styles.statLabel}>Yellow Cards</Text>
             </View>
             <View style={styles.statItem}>
               <Text style={styles.statValue}>{playerStats.redCards}</Text>
               <Text style={styles.statLabel}>Red Cards</Text>
             </View>
           </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Biography</Text>
          <Text style={styles.bio}>{playerBio}</Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Manage Player" // Changed button title
            onPress={handleManagePlayer} // Changed onPress handler
            style={styles.button}
          />
           {/* You might add a Delete button here as another management option */}
           {/*
           <Button
               title="Delete Player"
               onPress={() => Alert.alert('Confirm Delete', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete player') }])}
               style={[styles.button, { backgroundColor: Colors.error }]} // Example styling for delete
           />
           */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 20,
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
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
    backgroundColor: Colors.background, // Or a slightly lighter gray
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  playerName: {
    fontSize: 28, // Slightly larger font size
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 8,
    textAlign: 'center', // Center the name
  },
  positionBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, // More padding
    paddingVertical: 8, // More padding
    borderRadius: 20, // Make it more badge-like
    minWidth: 80, // Ensure minimum width
    alignItems: 'center', // Center text inside badge
  },
  positionText: {
    color: Colors.background,
    fontSize: 16, // Slightly larger font size
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: 16,
    padding: 16, // Added padding inside the card
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 12,
    borderBottomWidth: 1, // Add a subtle separator
    borderBottomColor: Colors.gray,
    paddingBottom: 8,
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
    flexShrink: 1, // Allow text to wrap
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute space evenly
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    width: '30%', // Adjust width for better spacing
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 4,
    textAlign: 'center', // Center label text
  },
  bio: {
    fontSize: 16,
    color: Colors.secondary,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20, // Add some space at the bottom
  },
  button: {
    marginBottom: 12,
  },
});

export default PlayerDetailsScreen;