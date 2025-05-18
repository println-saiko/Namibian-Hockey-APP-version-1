import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Using community picker
import DateTimePicker from '@react-native-community/datetimepicker'; // For Date of Birth
import Button from '../components/Button'; // Assuming '../components/Button' exists
import Card from '../components/Card'; // Assuming '../components/Card' exists
import Colors from '../constants/colors'; // Assuming '../constants/colors' exists
import { getPlayers, getTeams, updatePlayer } from '../utils/storage'; // Import necessary storage functions

// Sample positions (you might fetch this from storage or have a constants file)
const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
// Sample genders (you might fetch this or have a constants file)
const GENDERS = ['Male', 'Female', 'Other'];

const ManagePlayerScreen = ({ route, navigation }) => {
  // Receive player data passed from PlayerDetailsScreen
  const initialPlayer = route.params?.player;

  const [editedPlayer, setEditedPlayer] = useState(initialPlayer || {
      id: Date.now().toString(), // Provide a default ID if creating (though this screen is for editing)
      firstName: '',
      lastName: '',
      position: '',
      teamId: '', // Store team ID
      dateOfBirth: '', // Store as string or Date object
      gender: '',
      email: '',
      phone: '',
      bio: '',
      profileImage: '', // Placeholder for image URI
  });

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // State for DatePicker visibility (for Date of Birth)
  const [showDatePicker, setShowDatePicker] = useState(false);


  useEffect(() => {
      const loadData = async () => {
          try {
              setIsLoading(true);
              setError(null);

              // Fetch the player data if it wasn't passed (or to ensure latest data)
              let playerToEdit = initialPlayer;
              if (!playerToEdit) {
                  const playersData = await getPlayers();
                  playerToEdit = playersData.find(p => p.id === route.params?.playerId);
                  if (!playerToEdit) {
                      setError('Player not found for editing.');
                      setIsLoading(false);
                      return;
                  }
              }

              // Ensure dateOfBirth is a Date object if it exists and is a valid date string
               if (playerToEdit.dateOfBirth) {
                   const dob = new Date(playerToEdit.dateOfBirth);
                   if (!isNaN(dob.getTime())) {
                       playerToEdit.dateOfBirth = dob;
                   } else {
                       // Handle invalid date string if necessary
                       playerToEdit.dateOfBirth = null; // Or new Date()
                       console.warn("Invalid date string found for player's DOB:", initialPlayer.dateOfBirth);
                   }
               } else {
                   playerToEdit.dateOfBirth = null; // Initialize as null if empty
               }


              setEditedPlayer(playerToEdit);

              // Fetch teams
              const teamsData = await getTeams();
              setTeams(teamsData);

              setIsLoading(false);
          } catch (err) {
              console.error('Error loading data for management:', err);
              setError('Failed to load data: ' + err.message);
              setIsLoading(false);
          }
      };

      loadData();
  }, [initialPlayer, route.params?.playerId]); // Depend on initialPlayer and playerId from route


  const handleInputChange = (field, value) => {
      setEditedPlayer(prevPlayer => ({
          ...prevPlayer,
          [field]: value
      }));
  };

  const handleSavePlayer = async () => {
      if (!editedPlayer.firstName || !editedPlayer.lastName) {
          Alert.alert('Validation Error', 'First Name and Last Name are required.');
          return;
      }

      setIsSaving(true);
      setError(null);

      try {
          // Prepare data for saving (ensure dateOfBirth is in a storable format, e.g., ISO string)
          const dataToSave = {
              ...editedPlayer,
              dateOfBirth: editedPlayer.dateOfBirth ? editedPlayer.dateOfBirth.toISOString() : null,
              // Add validation/formatting for other fields if needed
          };

          const success = await updatePlayer(dataToSave.id, dataToSave); // Call the update function

          if (success) {
              Alert.alert('Success', 'Player details updated.');
              navigation.goBack(); // Go back to the PlayerDetailsScreen
          } else {
              // This might indicate the player ID wasn't found to update
              setError('Failed to update player. Player ID not found?');
              Alert.alert('Error', 'Failed to update player details.');
          }

      } catch (err) {
          console.error('Error saving player:', err);
          setError('Failed to save player: ' + err.message);
          Alert.alert('Error', 'Failed to save player details.');
      } finally {
          setIsSaving(false);
      }
  };

   // DatePicker Handlers
  const onDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || editedPlayer.dateOfBirth;
      setShowDatePicker(Platform.OS === 'ios'); // Hide picker on Android after selection
      handleInputChange('dateOfBirth', currentDate);
  };

  const showDatepicker = () => {
      setShowDatePicker(true);
  };


  if (isLoading) {
      return (
          <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading player data...</Text>
          </View>
      );
  }

   if (error && !editedPlayer.id) { // Show error only if no player was found to edit
      return (
          <View style={styles.centeredContainer}>
              <Ionicons name="alert-circle-outline" size={50} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Go Back" onPress={() => navigation.goBack()} />
          </View>
      );
   }


  return (
      <ScrollView style={styles.screen}>
          <View style={styles.container}>
               <Text style={styles.title}>Manage Player</Text>

               {error && <Text style={styles.errorText}>{error}</Text>} {/* Display general errors */}


               <Card style={styles.formCard}>
                   <Text style={styles.cardTitle}>Basic Information</Text>
                   <Text style={styles.label}>First Name:</Text>
                   <TextInput
                       style={styles.input}
                       value={editedPlayer.firstName}
                       onChangeText={(text) => handleInputChange('firstName', text)}
                       placeholder="Enter first name"
                   />

                   <Text style={styles.label}>Last Name:</Text>
                   <TextInput
                       style={styles.input}
                       value={editedPlayer.lastName}
                       onChangeText={(text) => handleInputChange('lastName', text)}
                       placeholder="Enter last name"
                   />

                    <Text style={styles.label}>Date of Birth:</Text>
                    <Button title={editedPlayer.dateOfBirth ? editedPlayer.dateOfBirth.toLocaleDateString() : 'Select Date'} onPress={showDatepicker} style={styles.datePickerButton} />
                    {showDatePicker && (
                        <DateTimePicker
                            value={editedPlayer.dateOfBirth || new Date()} // Use current date if DOB is null
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                        />
                    )}

                   <Text style={styles.label}>Gender:</Text>
                   <View style={styles.pickerContainer}>
                        <Picker
                           selectedValue={editedPlayer.gender}
                           onValueChange={(itemValue) => handleInputChange('gender', itemValue)}
                           style={styles.picker}
                           dropdownIconColor={Colors.primary} // Customize dropdown arrow color (Android)
                       >
                           <Picker.Item label="Select Gender" value="" />
                           {GENDERS.map(gender => (
                               <Picker.Item key={gender} label={gender} value={gender} />
                           ))}
                       </Picker>
                   </View>

               </Card>


              <Card style={styles.formCard}>
                  <Text style={styles.cardTitle}>Team & Position</Text>

                  <Text style={styles.label}>Position:</Text>
                   <View style={styles.pickerContainer}>
                       <Picker
                           selectedValue={editedPlayer.position}
                           onValueChange={(itemValue) => handleInputChange('position', itemValue)}
                           style={styles.picker}
                           dropdownIconColor={Colors.primary}
                       >
                           <Picker.Item label="Select Position" value="" />
                           {POSITIONS.map(position => (
                               <Picker.Item key={position} label={position} value={position} />
                           ))}
                       </Picker>
                   </View>


                  <Text style={styles.label}>Team:</Text>
                  <View style={styles.pickerContainer}>
                       <Picker
                           selectedValue={editedPlayer.teamId}
                           onValueChange={(itemValue) => handleInputChange('teamId', itemValue)}
                           style={styles.picker}
                           dropdownIconColor={Colors.primary}
                       >
                           <Picker.Item label="Select Team" value="" />
                           {teams.map(team => (
                               <Picker.Item key={team.id} label={team.name} value={team.id} />
                           ))}
                       </Picker>
                   </View>
              </Card>


              <Card style={styles.formCard}>
                  <Text style={styles.cardTitle}>Contact Information</Text>

                  <Text style={styles.label}>Email:</Text>
                   <TextInput
                       style={styles.input}
                       value={editedPlayer.email}
                       onChangeText={(text) => handleInputChange('email', text)}
                       placeholder="Enter email"
                       keyboardType="email-address"
                       autoCapitalize="none"
                   />

                   <Text style={styles.label}>Phone:</Text>
                   <TextInput
                       style={styles.input}
                       value={editedPlayer.phone}
                       onChangeText={(text) => handleInputChange('phone', text)}
                       placeholder="Enter phone number"
                       keyboardType="phone-pad"
                   />
              </Card>

              <Card style={styles.formCard}>
                  <Text style={styles.cardTitle}>Biography</Text>
                  <TextInput
                       style={[styles.input, styles.bioInput]}
                       value={editedPlayer.bio}
                       onChangeText={(text) => handleInputChange('bio', text)}
                       placeholder="Enter biography"
                       multiline={true}
                       numberOfLines={4} // Hint for height on Android
                       textAlignVertical="top" // Start text at top on Android
                   />
              </Card>

              {/* You could add an image upload/selection section here */}
              {/*
               <Card style={styles.formCard}>
                   <Text style={styles.cardTitle}>Profile Image</Text>
                   <Button title="Select Image" onPress={() => Alert.alert('Image Picker', 'Implement image selection logic here')} />
                   {editedPlayer.profileImage && (
                       <Image source={{ uri: editedPlayer.profileImage }} style={styles.profileImagePreview} />
                   )}
               </Card>
               */}


              <View style={styles.buttonContainer}>
                  <Button
                      title={isSaving ? 'Saving...' : 'Save Changes'}
                      onPress={handleSavePlayer}
                      disabled={isSaving}
                      style={styles.saveButton}
                  />
                   <Button
                       title="Cancel"
                       onPress={() => navigation.goBack()} // Simply go back
                       style={styles.cancelButton}
                       color={Colors.secondary} // Example styling
                   />
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
  centeredContainer: {
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
       fontSize: 16,
       color: Colors.error,
       textAlign: 'center',
       marginBottom: 12,
       paddingHorizontal: 10,
   },
  container: {
    padding: 16,
  },
   title: {
       fontSize: 24,
       fontWeight: 'bold',
       color: Colors.secondary,
       textAlign: 'center',
       marginBottom: 24,
   },
   formCard: {
       marginBottom: 16,
       padding: 16,
   },
   cardTitle: {
       fontSize: 18,
       fontWeight: 'bold',
       color: Colors.secondary,
       marginBottom: 12,
       borderBottomWidth: 1,
       borderBottomColor: Colors.gray,
       paddingBottom: 8,
   },
   label: {
       fontSize: 16,
       color: Colors.secondary,
       marginBottom: 4,
       marginTop: 8,
   },
   input: {
       borderWidth: 1,
       borderColor: Colors.gray,
       borderRadius: 4,
       padding: 10,
       fontSize: 16,
       color: Colors.secondary,
       backgroundColor: Colors.background,
   },
   bioInput: {
       minHeight: 100,
   },
   pickerContainer: {
       borderWidth: 1,
       borderColor: Colors.gray,
       borderRadius: 4,
       overflow: 'hidden', // Ensures picker content stays within border
       backgroundColor: Colors.background,
   },
   picker: {
       height: 50, // Adjust height as needed
       width: '100%',
       color: Colors.secondary,
   },
   datePickerButton: {
       marginVertical: 8,
   },
   buttonContainer: {
       marginTop: 20,
       marginBottom: 20,
   },
   saveButton: {
       marginBottom: 12,
   },
   cancelButton: {
      backgroundColor: Colors.gray, // Example different color
   },
   profileImagePreview: {
       width: 100,
       height: 100,
       borderRadius: 50,
       marginTop: 10,
       alignSelf: 'center',
   }
});

export default ManagePlayerScreen;
