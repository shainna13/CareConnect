# ChatWindow Component - Full Implementation

## Overview
The `ChatWindow` component has been completely rewritten to support real-time Firebase messaging, prescription handling, and task creation - mirroring the Flutter mobile app's chat functionality.

## Key Features Implemented

### 1. **Real-Time Message Streaming**
- Uses Firestore's `onSnapshot` listener on the `chats/{chatId}/convo` subcollection
- Messages are ordered by timestamp (ascending)
- Real-time updates when new messages arrive
- Automatic unread count reset when opening a chat

**Implementation:**
```typescript
const q = query(messagesRef, orderBy("timestamp", "asc"));
const unsubscribe = onSnapshot(q, (snapshot) => {
  // Process and update messages
});
```

### 2. **Message Types Support**
The component handles four message types:

#### Text Messages
- Simple text content with sender info and timestamp
- Shown with sender avatar and name (for non-current user)
- Different styling for current user (sender) vs other user

#### Prescription Messages
- Display medicine name, status badge (Pending/Accepted/Declined)
- Three buttons:
  - **View**: Opens PrescriptionViewerModal to show full prescription details
  - **Accept** (Patient only): Creates task + sends notification to doctor
  - **Decline** (Patient only): Updates status + sends notification to doctor
- Status color coding:
  - Orange for "Pending"
  - Green for "Accepted"
  - Red for "Declined"

#### Evaluation Messages
- Shows diagnosis/evaluation summary
- "View Details" button opens EvaluationViewerModal
- Full evaluation data stored and accessible

#### Message Structure in Firestore:
```javascript
{
  sender: string (uid),
  senderName: string,
  type: 'text' | 'prescription' | 'evaluation',
  message: string,
  timestamp: Timestamp,
  // For prescriptions:
  prescriptionData: {
    medicineName: string,
    medicines: array,
    times: array,
    duration: number,
    dosage: string,
    instructions: string
  },
  status: 'pending' | 'accepted' | 'declined'
}
```

### 3. **Photo Caching System**
- Loads both doctor and patient photos on chat initialization
- Caches photos to avoid redundant API calls
- Falls back to avatar with user initial if photo unavailable
- Photos displayed next to all messages for identification

**API Endpoint Used:**
```
GET /api/user/photo?userId={uid}
Returns: { photo: string (URL) | null }
```

### 4. **Prescription Acceptance Flow** (Patient Only)

When patient accepts a prescription:
1. **Update Message Status**: Changes prescription status from "pending" to "accepted"
2. **Create Task**: Adds task to patient's tasks collection with:
   - Title: medicine name
   - Type: "prescription"
   - Medicine details (medicines array, times, duration, dosage)
   - Doctor ID reference
   - Status: "active"
3. **Send Notification**: Creates notification in doctor's account with:
   - Type: "prescription_accepted"
   - Patient and medicine details
   - Message ID for reference
   - Read flag: false

### 5. **Prescription Decline Flow** (Patient Only)

When patient declines a prescription:
1. **Update Message Status**: Changes prescription status from "pending" to "declined"
2. **Send Notification**: Creates notification in doctor's account with:
   - Type: "prescription_declined"
   - Patient and medicine details
   - Message ID for reference

### 6. **Sending Messages**

#### Text Messages
- Uses Firebase `addDoc` to add message to `convo` subcollection
- Updates parent chat document with last message preview
- Handles optimistic updates via real-time listener
- Error handling and sending state management

#### Prescriptions
- Doctor-only feature (menu button hidden for patients)
- Opens `PrescriptionFormModal`
- Sends prescription with full `prescriptionData` object
- Sets initial status as "pending"

#### Evaluations
- Doctor-only feature (menu button hidden for patients)
- Opens `EvaluationFormModal`
- Stores full evaluation data with message

### 7. **User Context Integration**
Uses `UserContext` to get:
- `currentUser`: Firebase User object with uid
- `accountData`: User account data including name and type (doctor/patient)

### 8. **Unread Count Management**
- Automatically resets unread count when opening chat
- Updates the appropriate unreadCount field based on user type:
  - `unreadCountDoctor` for doctor users
  - `unreadCountClient` for patient users

## Data Flow

### Message Creation
```
User Input → addDoc(convo subcollection) → Real-time listener captures → Messages state updates → UI rerenders
```

### Prescription Acceptance
```
Accept Button → updateDoc(message status) → addDoc(task) → addDoc(notification) → Doctor notified
```

### Photo Loading
```
Component Mount → fetch user photos → cache them → display in messages
```

## Files Modified

### 1. `app/dashboard/chats/components/ChatWindow.tsx`
- Complete rewrite to support Firebase real-time messaging
- Removed mock data
- Added Firestore integration
- Implemented all prescription and evaluation handling
- Added photo caching system

### 2. `app/dashboard/chats/page.tsx`
- Updated Chat interface to include `doctor` and `client` fields
- Updated chat object creation to include doctor/client IDs

## Component Props

```typescript
interface Props {
  chat: {
    id: string;
    name: string;
    avatar: string | null;
    doctor: string;
    client: string;
    otherUserId: string;
    isDoctor: boolean;
    unreadCount: number;
  };
  onMessageSent?: (chatId: string, lastMessage: string) => void;
}
```

## Dependencies
- Firebase Firestore (`collection`, `query`, `onSnapshot`, `addDoc`, `updateDoc`, `doc`, `serverTimestamp`, `Timestamp`)
- React hooks (`useState`, `useEffect`, `useRef`)
- UserContext for authentication
- Child modals: `PrescriptionFormModal`, `PrescriptionViewerModal`, `EvaluationFormModal`, `EvaluationViewerModal`

## Error Handling
- Console error logging for all async operations
- Graceful fallbacks for missing photos
- Loading and empty states for message feed
- Try-catch blocks for all Firebase operations

## UI/UX Features
- Auto-scroll to latest message
- Sender identification with avatars and names
- Timestamp formatting (using existing `formatTime` utility)
- Message grouping by sender
- Status badges with color coding for prescriptions
- Disabled states for buttons during operations
- Responsive layout

## Future Enhancements
- Typing indicators
- Message read receipts
- File/image attachments
- Message search/filtering
- Conversation archiving
- Voice message support
