import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Make sure this library is installed

import Button from '../components/Button';
import Colors from '../constants/colors';
import { saveEvent } from '../utils/storage'; // Ensure saveEvent can handle new fields

const EventCreationScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');

  // Category dropdown state
  const [category, setCategory] = useState('Tournament');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Tournament', value: 'Tournament' },
    { label: 'Training', value: 'Training' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Meeting', value: 'Meeting' },
    { label: 'Other', value: 'Other' },
  ]);

  // Hockey Type dropdown state (New)
  const [hockeyType, setHockeyType] = useState('Outdoor'); // Default type
  const [hockeyTypeOpen, setHockeyTypeOpen] = useState(false);
  const [hockeyTypeItems, setHockeyTypeItems] = useState([
    { label: 'Outdoor', value: 'Outdoor' },
    { label: 'Indoor', value: 'Indoor' },
  ]);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  // const [datePickerMode, setDatePickerMode] = useState('date'); // Not needed as mode is always 'date'
  const [currentDateField, setCurrentDateField] = useState(null);
  const [registrationDeadline, setRegistrationDeadline] = useState(new Date());
  // const [showDeadlinePicker, setShowDeadlinePicker] = useState(false); // Not needed, using showDatePicker

  const [location, setLocation] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [description, setDescription] = useState('');

  // Minimum Players state (New)
  const [minPlayers, setMinPlayers] = useState(''); // Store as string initially

  const [isLoading, setIsLoading] = useState(false);

  // --- Date/Time Picker Logic ---
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(); // Fallback to current date if selection is cancelled
    setShowDatePicker(false); // Always close picker after selection/cancellation

    if (event.type === 'set') { // Only update state if a date was actually selected (not cancelled)
      if (currentDateField === 'eventDate') {
        setDate(currentDate);
      } else if (currentDateField === 'deadlineDate') {
        setRegistrationDeadline(currentDate);
      }
    }
    setCurrentDateField(null); // Reset field tracker
  };

  const showDatePickerFor = (field) => {
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  // --- Form Submission ---
  const handleSubmit = async () => {
    // --- Validation ---
    if (!title || !location || !registrationFee || !hockeyType || minPlayers === '') {
      Alert.alert('Validation Error', 'Please fill in all required fields (*)');
      return;
    }

    const minPlayersNumber = parseInt(minPlayers, 10);

    if (isNaN(minPlayersNumber) || minPlayersNumber <= 0) {
        Alert.alert('Validation Error', 'Minimum Players must be a positive number.');
        return;
    }

    setIsLoading(true);

    try {
      const newEvent = {
        title,
        category,
        date: date.toISOString(), // Store date as ISO string
        registrationDeadline: registrationDeadline.toISOString(), // Store date as ISO string
        location,
        registrationFee,
        description,
        hockeyType, // Include new hockey type
        minPlayers: minPlayersNumber, // Include new min players as a number
      };

      await saveEvent(newEvent); // Make sure your saveEvent function in storage.js can handle these new fields

      setIsLoading(false);
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(), // Navigate back to the previous screen (Events List)
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create event. Please try again.');
      console.error('Error creating event:', error);
    }
  };

  // --- Render Form ---
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // Adjust keyboardVerticalOffset if needed based on your header height and content
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Create New Event</Text>
          <Text style={styles.subtitle}>Add a new event to the calendar</Text>

          {/* Event Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter event title"
            />
          </View>

          {/* Category Dropdown */}
          <View style={[styles.formGroup, { zIndex: 3000 }]}> {/* Higher zIndex for this dropdown */}
            <Text style={styles.label}>Category *</Text>
            <DropDownPicker
              open={categoryOpen}
              value={category}
              items={categoryItems}
              setOpen={(open) => { // Close other dropdowns when this one opens
                setCategoryOpen(open);
                if (open) setHockeyTypeOpen(false);
              }}
              setValue={setCategory}
              setItems={setCategoryItems}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              textStyle={styles.dropdownTextStyle}
              placeholderStyle={styles.dropdownPlaceholderStyle}
              listItemContainerStyle={styles.dropdownListItemStyle}
              zIndex={3000} // Match container zIndex
              zIndexInverse={1000}
            />
          </View>

          {/* Hockey Type Dropdown (New) */}
          <View style={[styles.formGroup, { zIndex: 2000 }]}> {/* Lower zIndex than Category */}
            <Text style={styles.label}>Hockey Type *</Text>
            <DropDownPicker
              open={hockeyTypeOpen}
              value={hockeyType}
              items={hockeyTypeItems}
              setOpen={(open) => { // Close other dropdowns when this one opens
                setHockeyTypeOpen(open);
                if (open) setCategoryOpen(false);
              }}
              setValue={setHockeyType}
              setItems={setHockeyTypeItems}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              textStyle={styles.dropdownTextStyle}
              placeholderStyle={styles.dropdownPlaceholderStyle}
              listItemContainerStyle={styles.dropdownListItemStyle}
              zIndex={2000} // Match container zIndex
              zIndexInverse={2000}
            />
          </View>


          {/* Event Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Date *</Text>
            <Button
              title={date.toLocaleDateString()}
              onPress={() => showDatePickerFor('eventDate')} // Use unique field name
              style={styles.dateButton}
              textStyle={styles.dateButtonText} // Added text style
            />
          </View>

          {/* Registration Deadline */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Registration Deadline *</Text>
            <Button
              title={registrationDeadline.toLocaleDateString()}
              onPress={() => showDatePickerFor('deadlineDate')} // Use unique field name
              style={styles.dateButton}
              textStyle={styles.dateButtonText} // Added text style
            />
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={currentDateField === 'eventDate' ? date : registrationDeadline}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Use spinner on iOS for clarity
              onChange={handleDateChange}
              minimumDate={currentDateField === 'eventDate' ? new Date() : registrationDeadline} // Optional: Prevent selecting past dates for event, or date after deadline
              maximumDate={currentDateField === 'deadlineDate' ? date : undefined} // Optional: Deadline cannot be after event date
            />
          )}

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter event location"
            />
          </View>

          {/* Registration Fee */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Registration Fee *</Text>
            <TextInput
              style={styles.input}
              value={registrationFee}
              onChangeText={setRegistrationFee}
              placeholder="Enter registration fee (e.g., N$500)"
              keyboardType="default" // Use default for currency string input
            />
          </View>

          {/* Minimum Players (New) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Minimum Players *</Text>
            <TextInput
              style={styles.input}
              value={minPlayers}
              onChangeText={setMinPlayers}
              placeholder="Enter minimum required players"
              keyboardType="number-pad" // Use number pad for easier input
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Create Event Button */}
          <Button
            title="Create Event"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30, // Add padding to ensure content is visible above keyboard/button
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.secondary,
    fontWeight: '600', // Make labels a bit bolder
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
    color: Colors.secondary, // Set text color
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.background,
    minHeight: 50,
  },
  dropdownContainerStyle: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.background,
  },
  dropdownTextStyle: {
    fontSize: 16,
    color: Colors.secondary,
  },
  dropdownPlaceholderStyle: {
    fontSize: 16,
    color: Colors.gray,
  },
  dropdownListItemStyle: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dateButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
    paddingVertical: 10, // Match input padding
    paddingHorizontal: 12,
    justifyContent: 'flex-start', // Align text to the left
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.secondary, // Text color
    textAlign: 'left', // Ensure text is left-aligned within the button
  }
});

export default EventCreationScreen;