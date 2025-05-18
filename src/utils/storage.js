import AsyncStorage from '@react-native-async-storage/async-storage';
// Removed: import { Alert } from 'react-native'; // Alert should only be used in UI components

// Storage keys
export const STORAGE_KEYS = {
  TEAMS: 'hockey_teams',
  PLAYERS: 'hockey_players',
  EVENTS: 'hockey_events',
  EVENT_REGISTRATIONS: 'hockey_event_registrations',
  USERS: 'hockey_users',
  CURRENT_USER: 'hockey_current_user',
  ANNOUNCEMENTS: 'hockey_announcements',
};

// Helper functions
const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true; // Indicate success
  } catch (error) {
    console.error(`Error storing data for ${key}:`, error);
    // Rethrow or return false, depending on desired error handling in the caller
    throw error; // Rethrow the error so the calling component can catch it
  }
};

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for ${key}:`, error);
    // Rethrow or return null
    throw error; // Rethrow the error
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Teams
export const getTeams = async () => {
  try {
    const teams = await getData(STORAGE_KEYS.TEAMS);
    return teams || [];
  } catch (error) {
    console.error('Error getting teams:', error);
    return []; // Return empty array on error
  }
};

export const saveTeam = async (team) => {
  try {
    const teams = await getTeams();

    // If team has an id, it's an update
    if (team.id) {
      const updatedTeams = teams.map(t => t.id === team.id ? team : t);
      return storeData(STORAGE_KEYS.TEAMS, updatedTeams);
    } else {
      // New team
      const newTeam = {
        ...team,
        id: generateId(),
      };
      return storeData(STORAGE_KEYS.TEAMS, [...teams, newTeam]);
    }
  } catch (error) {
    console.error('Error saving team:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const teams = await getTeams();
    const filteredTeams = teams.filter(team => team.id !== teamId);
    return storeData(STORAGE_KEYS.TEAMS, filteredTeams);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error; // Rethrow for caller to handle
  }
};

// Players
export const getPlayers = async () => {
  try {
    const players = await getData(STORAGE_KEYS.PLAYERS);
    return players || [];
  } catch (error) {
    console.error('Error getting players:', error);
    return []; // Return empty array on error
  }
};

// This function handles BOTH adding new players and updating existing players
export const savePlayer = async (player) => {
  try {
    const players = await getPlayers();

    // If player has an id, it's an update
    if (player.id) {
      const updatedPlayers = players.map(p => p.id === player.id ? player : p);
      return storeData(STORAGE_KEYS.PLAYERS, updatedPlayers);
    } else {
      // New player
      const newPlayer = {
        ...player,
        id: generateId(),
      };
      return storeData(STORAGE_KEYS.PLAYERS, [...players, newPlayer]);
    }
  } catch (error) {
    console.error('Error saving player:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const deletePlayer = async (playerId) => {
  try {
    const players = await getPlayers();
    const filteredPlayers = players.filter(player => player.id !== playerId);
    return storeData(STORAGE_KEYS.PLAYERS, filteredPlayers);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error; // Rethrow for caller to handle
  }
};

/**
 * Update an existing player by ID.
 * @param {string} playerId - The ID of the player to update.
 * @param {object} updatedPlayerData - The new player data (should include id).
 * @returns {boolean} true if updated, false if not found.
 */
export const updatePlayer = async (playerId, updatedPlayerData) => {
  try {
    const players = await getPlayers();
    const index = players.findIndex(p => p.id === playerId);
    if (index === -1) {
      // Player not found
      return false;
    }
    // Update the player at the found index
    players[index] = { ...players[index], ...updatedPlayerData, id: playerId };
    await storeData(STORAGE_KEYS.PLAYERS, players);
    return true;
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

// Events
// Event objects now expected to have:
// id: string
// title: string
// date: string (ISO date string)
// location: string
// registrationFee: string (e.g., "$50")
// description: string
// category: string (e.g., 'Tournament', 'Training', 'Workshop')
// registrationDeadline: string (ISO date string)
// hockeyType: 'Indoor' | 'Outdoor' // Added property
// minPlayers: number // Added property
export const getEvents = async () => {
  try {
    const events = await getData(STORAGE_KEYS.EVENTS);
    return events || [];
  } catch (error) {
    console.error('Error getting events:', error);
    return []; // Return empty array on error
  }
};

export const saveEvent = async (event) => {
  try {
    const events = await getEvents();

    // If event has an id, it's an update
    if (event.id) {
      const updatedEvents = events.map(e => e.id === event.id ? event : e);
      return storeData(STORAGE_KEYS.EVENTS, updatedEvents);
    } else {
      // New event
      const newEvent = {
        ...event, // This will include hockeyType and minPlayers if present
        id: generateId(),
      };
      return storeData(STORAGE_KEYS.EVENTS, [...events, newEvent]);
    }
  } catch (error) {
    console.error('Error saving event:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const events = await getEvents();
    const filteredEvents = events.filter(event => event.id !== eventId);
    return storeData(STORAGE_KEYS.EVENTS, filteredEvents);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error; // Rethrow for caller to handle
  }
};


// Event Registrations
export const getEventRegistrations = async () => {
  try {
    const registrations = await getData(STORAGE_KEYS.EVENT_REGISTRATIONS);
    return registrations || [];
  } catch (error) {
    console.error('Error getting event registrations:', error);
    return []; // Return empty array on error
  }
};

export const saveEventRegistration = async (registration) => {
  try {
    const registrations = await getEventRegistrations();

    // If registration has an id, it's an update
    if (registration.id) {
      const updatedRegistrations = registrations.map(r => r.id === registration.id ? registration : r);
      return storeData(STORAGE_KEYS.EVENT_REGISTRATIONS, updatedRegistrations);
    } else {
      // New registration
      const newRegistration = {
        ...registration,
        id: generateId(),
        registrationDate: new Date().toISOString(),
      };
      return storeData(STORAGE_KEYS.EVENT_REGISTRATIONS, [...registrations, newRegistration]);
    }
  } catch (error) {
    console.error('Error saving event registration:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const deleteEventRegistration = async (registrationId) => {
  try {
    const registrations = await getEventRegistrations();
    const filteredRegistrations = registrations.filter(registration => registration.id !== registrationId);
    return storeData(STORAGE_KEYS.EVENT_REGISTRATIONS, filteredRegistrations);
  } catch (error) {
    console.error('Error deleting event registration:', error);
    throw error; // Rethrow for caller to handle
  }
};


// User Authentication Functions
export const getUsers = async () => {
  try {
    const data = await getData(STORAGE_KEYS.USERS);
    return data || [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const registerUser = async (userData) => {
  try {
    const users = await getUsers();

    // Check if username already exists
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create new user object
    const newUser = {
      id: generateId(),
      username: userData.username,
      password: userData.password, // In a real app, this should be hashed
      email: userData.email,
      isAdmin: false, // New users are not admins by default
      createdAt: new Date().toISOString()
    };

    // Add to users array and save
    users.push(newUser);
    await storeData(STORAGE_KEYS.USERS, users);

    // Return user without password
    const { password: pwd, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const loginUser = async (username, password) => {
  try {
    const users = await getUsers();

    // Find user with matching credentials
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Save current user to storage
    const { password: pwd, ...userWithoutPassword } = user;
    await storeData(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);

    return userWithoutPassword;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await getData(STORAGE_KEYS.CURRENT_USER);
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    // Don't rethrow here, just return null if getting current user fails
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false; // Indicate failure
  }
};

// Announcement Functions
export const getAnnouncements = async () => {
  try {
    const data = await getData(STORAGE_KEYS.ANNOUNCEMENTS);
    return data || [];
  } catch (error) {
    console.error('Error getting announcements:', error);
    return [];
  }
};

export const createAnnouncement = async (announcementData, user) => {
  try {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      // It's better to throw an error here than rely on UI in storage
      const authError = new Error('Only administrators can create announcements');
      authError.statusCode = 403; // Example of adding extra info
      throw authError;
    }

    const announcements = await getAnnouncements();

    // Create new announcement
    const newAnnouncement = {
      id: generateId(),
      title: announcementData.title,
      content: announcementData.content,
      createdBy: user.username,
      createdAt: new Date().toISOString(),
      important: announcementData.important || false
    };

    // Add to announcements array and save
    announcements.unshift(newAnnouncement); // Add to beginning of array
    await storeData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    return newAnnouncement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error; // Rethrow for caller to handle
  }
};

export const deleteAnnouncement = async (announcementId, user) => {
  try {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      // It's better to throw an error here than rely on UI in storage
      const authError = new Error('Only administrators can delete announcements');
      authError.statusCode = 403; // Example of adding extra info
      throw authError;
    }

    const announcements = await getAnnouncements();

    // Filter out the announcement to delete
    const updatedAnnouncements = announcements.filter(a => a.id !== announcementId);

    // Save updated announcements
    await storeData(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);

    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error; // Rethrow for caller to handle
  }
};

// Initialize storage with sample data
export const initializeStorage = async () => {
  try {
    // Check if teams exist, if not, initialize with sample data
    const teams = await getTeams();
    if (teams.length === 0) {
      const sampleTeams = [
        { id: '1', name: 'Windhoek Hockey Club', category: 'Men', division: 'Premier', contactName: 'John Smith', contactEmail: 'john@whc.com', contactPhone: '123-456-7890' },
        { id: '2', name: 'Coastal Hockey Club', category: 'Women', division: 'Premier', contactName: 'Sarah Johnson', contactEmail: 'sarah@chc.com', contactPhone: '234-567-8901' },
        { id: '3', name: 'University of Namibia', category: 'Men', division: 'First', contactName: 'Michael Brown', contactEmail: 'michael@unam.com', contactPhone: '345-678-9012' },
        { id: '4', name: 'Namibia Defense Force', category: 'Women', division: 'First', contactName: 'Emma Williams', contactEmail: 'emma@ndf.com', contactPhone: '456-789-0123' },
        { id: '5', name: 'Swakopmund Hockey Club', category: 'Men', division: 'Premier', contactName: 'David Miller', contactEmail: 'david@shc.com', contactPhone: '567-890-1234' },
      ];
      await storeData(STORAGE_KEYS.TEAMS, sampleTeams);
      console.log('Initialized teams');
    } else {
      console.log('Teams already exist');
    }

    // Initialize players if none exist
    const players = await getPlayers();
    if (players.length === 0) {
      const samplePlayers = [
        { id: 'p1', firstName: 'John', lastName: 'Smith', dateOfBirth: '1995-05-15', gender: 'Male', teamId: '1', position: 'Forward', email: 'john@example.com', phone: '123-456-7890' },
        { id: 'p2', firstName: 'Sarah', lastName: 'Johnson', dateOfBirth: '1997-08-22', gender: 'Female', teamId: '2', position: 'Midfielder', email: 'sarah@example.com', phone: '234-567-8901' },
        { id: 'p3', firstName: 'Michael', lastName: 'Brown', dateOfBirth: '1994-03-10', gender: 'Male', teamId: '3', position: 'Defender', email: 'michael@example.com', phone: '345-678-9012' },
        { id: 'p4', firstName: 'Emma', lastName: 'Williams', dateOfBirth: '1996-11-28', gender: 'Female', teamId: '4', position: 'Goalkeeper', email: 'emma@example.com', phone: '456-789-0123' },
        { id: 'p5', firstName: 'David', lastName: 'Miller', dateOfBirth: '1993-07-05', gender: 'Male', teamId: '5', position: 'Forward', email: 'david@example.com', phone: '567-890-1234' },
        { id: 'p6', firstName: 'Olivia', lastName: 'Davis', dateOfBirth: '1998-01-30', gender: 'Female', teamId: '2', position: 'Forward', email: 'olivia@example.com', phone: '555-123-4567' },
        { id: 'p7', firstName: 'Ethan', lastName: 'Garcia', dateOfBirth: '1996-04-18', gender: 'Male', teamId: '1', position: 'Defender', email: 'ethan@example.com', phone: '555-987-6543' },
        { id: 'p8', firstName: 'Sophia', lastName: 'Rodriguez', dateOfBirth: '1999-09-01', gender: 'Female', teamId: '4', position: 'Midfielder', email: 'sophia@example.com', phone: '555-555-1212' },
        { id: 'p9', firstName: 'Liam', lastName: 'Martinez', dateOfBirth: '1995-12-12', gender: 'Male', teamId: '3', position: 'Forward', email: 'liam@example.com', phone: '555-010-2030' },
        { id: 'p10', firstName: 'Ava', lastName: 'Hernandez', dateOfBirth: '1997-06-25', gender: 'Female', teamId: '2', position: 'Goalkeeper', email: 'ava@example.com', phone: '555-888-9999' },
        { id: 'p11', firstName: 'Noah', lastName: 'Lopez', dateOfBirth: '1994-02-03', gender: 'Male', teamId: '1', position: 'Midfielder', email: 'noah@example.com', phone: '555-333-4444' },
        { id: 'p12', firstName: 'Isabella', lastName: 'Gonzalez', dateOfBirth: '1998-07-07', gender: 'Female', teamId: '4', position: 'Forward', email: 'isabella@example.com', phone: '555-777-8888' },
      ];
      await storeData(STORAGE_KEYS.PLAYERS, samplePlayers);
      console.log('Initialized players');
    } else {
      console.log('Players already exist');
    }


    // Check if events exist, if not, initialize with sample data
    const events = await getEvents();
    if (events.length === 0) {
      const sampleEvents = [
        {
          id: 'e1',
          title: 'National Championship',
          date: '2025-06-15',
          location: 'Windhoek Stadium',
          category: 'Tournament',
          registrationDeadline: '2025-05-30',
          description: 'The annual National Hockey Championship brings together the best teams from across Namibia to compete for the national title.',
          registrationFee: 'N$500',
          hockeyType: 'Outdoor', // <-- Added hockeyType
          minPlayers: 10 // <-- Added minPlayers
        },
        {
          id: 'e2',
          title: 'Junior Development Camp (Indoor)',
          date: '2025-07-10',
          location: 'University of Namibia Hall', // Adjusted location for indoor
          category: 'Training',
          registrationDeadline: '2025-06-25',
          description: 'An indoor development camp for junior players.',
          registrationFee: 'N$300',
          hockeyType: 'Indoor', // <-- Added hockeyType
          minPlayers: 4 // <-- Added minPlayers (smaller for indoor)
        },
        {
          id: 'e3',
          title: 'Coastal Cup (Outdoor)',
          date: '2025-08-05',
          location: 'Swakopmund Sports Complex Field', // Adjusted location for outdoor
          category: 'Tournament',
          registrationDeadline: '2025-07-20',
          description: 'A regional outdoor tournament for teams from the coastal areas of Namibia.',
          registrationFee: 'N$400',
          hockeyType: 'Outdoor', // <-- Added hockeyType
          minPlayers: 8 // <-- Added minPlayers
        },
        {
          id: 'e4',
          title: 'Advanced Indoor Clinic',
          date: '2025-09-12',
          location: 'Windhoek Indoor Center',
          category: 'Training',
          registrationDeadline: '2025-08-30',
          description: 'An advanced clinic focused on indoor hockey techniques.',
          registrationFee: 'N$250',
          hockeyType: 'Indoor', // <-- Added hockeyType
          minPlayers: 3 // <-- Added minPlayers (can be smaller for clinics)
        },
        {
          id: 'e5',
          title: 'Schools Outdoor Festival',
          date: '2025-10-01',
          location: 'Windhoek High School Fields', // Adjusted location for outdoor
          category: 'Festival', // Changed category
          registrationDeadline: '2025-09-15',
          description: 'An outdoor hockey festival for school teams.',
          registrationFee: 'N$350',
          hockeyType: 'Outdoor', // <-- Added hockeyType
          minPlayers: 7 // <-- Added minPlayers
        },
      ];
      await storeData(STORAGE_KEYS.EVENTS, sampleEvents);
      console.log('Initialized events');
    } else {
      console.log('Events already exist');
    }


    // Initialize users with default admin account if none exist
    const users = await getUsers();
    if (users.length === 0) {
      const defaultAdmin = {
        id: generateId(),
        username: 'admin123',
        password: '12345', // In a real app, this should be hashed
        isAdmin: true,
        email: 'admin@hockeyapp.com',
        createdAt: new Date().toISOString()
      };
      await storeData(STORAGE_KEYS.USERS, [defaultAdmin]);
      console.log('Initialized default admin user');
    } else {
      console.log('Users already exist');
    }

    // Initialize announcements if none exist
    const announcements = await getAnnouncements();
    if (announcements.length === 0) {
      const welcomeAnnouncement = {
        id: generateId(),
        title: 'Welcome to Hockey App',
        content: 'This is the official app for managing hockey teams, players, and events.',
        createdBy: 'admin123',
        createdAt: new Date().toISOString(),
        important: true
      };
      await storeData(STORAGE_KEYS.ANNOUNCEMENTS, [welcomeAnnouncement]);
      console.log('Initialized welcome announcement');
    } else {
      console.log('Announcements already exist');
    }


    console.log('Async storage initialization check complete.');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Optional: Function to clear all storage data for testing
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Async storage cleared successfully');
    // UI Alert is okay here because this is a helper for debugging/testing,
    // but ideally, you'd handle the result in the component that calls this.
  } catch (error) {
    console.error('Error clearing storage:', error);
    // UI Alert is okay here for testing
  }
};