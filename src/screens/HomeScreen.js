import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Linking, Alert } from 'react-native'; // Import Linking and Alert
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getAnnouncements } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';

// Define the URL you want to open
const websiteUrl = 'https://namibiahockey.org';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch announcements from storage
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await getAnnouncements();
        // Only show the 3 most recent announcements on home screen
        setAnnouncements(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Function to handle button press and open the URL
  const handleWebsitePress = async () => {
    // Check if the device can open the URL (optional but good practice)
    const supported = await Linking.canOpenURL(websiteUrl);

    if (supported) {
      // Open the URL
      Linking.openURL(websiteUrl);
    } else {
      // Handle the case where the URL cannot be opened (e.g., show an alert)
      console.error(`Don't know how to open this URL: ${websiteUrl}`);
      // Show an Alert to the user
      Alert.alert('Error', `Could not open the link: ${websiteUrl}`);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Namibia Hockey Union</Text>
      </View>

      <View style={styles.quickActions}>
        <Card style={styles.actionCard} onPress={() => navigation.navigate('TeamsTab', { screen: 'TeamRegistration' })}>
          <Ionicons name="people" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Register Team</Text>
        </Card>
        <Card style={styles.actionCard} onPress={() => navigation.navigate('PlayersTab', { screen: 'PlayerRegistration' })}>
          <Ionicons name="person-add" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Register Player</Text>
        </Card>

      </View>


      <View style={styles.section}>
        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('Announcements')}
            style={styles.viewAllButton}
            textStyle={styles.viewAllButtonText}
          />
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading announcements...</Text>
        ) : announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements available</Text>
        ) : (
          announcements.map(announcement => (
            <Card key={announcement.id} style={[styles.announcementCard, announcement.important && styles.importantCard]}>
              {announcement.important && (
                <View style={styles.importantBadge}>
                  <Ionicons name="alert-circle" size={12} color={Colors.background} />
                  <Text style={styles.importantText}>Important</Text>
                </View>
              )}
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementDate}>{new Date(announcement.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.announcementMessage}>
                {announcement.content.length > 100
                  ? `${announcement.content.substring(0, 100)}...`
                  : announcement.content}
              </Text>
            </Card>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <Button
          title="Visit Namibia Hockey Website"
          onPress={handleWebsitePress} // Updated onPress to call the new function
          style={styles.linkButton}
        />
        <Button
          title="View Upcoming Events"
          onPress={() => navigation.navigate('EventsTab')}
          style={styles.linkButton}
        />
        <Button
          title="View Teams"
          onPress={() => navigation.navigate('TeamsTab')}
          style={styles.linkButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: Colors.secondary,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  viewAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 0,
    height: 30,
  },
  viewAllButtonText: {
    fontSize: 12,
  },
  announcementCard: {
    marginBottom: 10,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.primary,
  },
  announcementDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  announcementMessage: {
    fontSize: 14,
    color: Colors.secondary,
  },
  importantCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 5,
  },
  importantText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginVertical: 10,
  },
  linkButton: {
    marginVertical: 5,
  },
});

export default HomeScreen;
