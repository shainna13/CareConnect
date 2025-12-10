# ChatWindow Component - Quick Reference Guide

## Message Flow Diagrams

### 1. Text Message Flow
```
User Types Message
    ↓
Click Send Button
    ↓
handleSendText()
    ↓
addDoc(chats/{chatId}/convo) {
  sender: currentUser.uid
  senderName: accountData.name
  type: "text"
  message: inputValue
  timestamp: serverTimestamp()
}
    ↓
Real-time listener captures change
    ↓
Messages state updates
    ↓
UI renders new message
    ↓
onMessageSent() updates chat list preview
```

### 2. Prescription Flow
```
Doctor Clicks "+" Menu
    ↓
Selects "Prescription"
    ↓
PrescriptionFormModal opens
    ↓
Fills prescription details
    ↓
Submits form
    ↓
handleSendPrescription() {
  1. addDoc(convo) with:
     - prescriptionData object
     - status: "pending"
  2. onMessageSent() updates preview
}
    ↓
Real-time listener updates
    ↓
Message appears in chat
    ↓
Status badge: Pending (orange)
    ↓
Patient sees Accept/Decline buttons
```

### 3. Prescription Acceptance Flow
```
Patient sees Pending prescription
    ↓
Clicks "Accept" button
    ↓
handleAcceptPrescription() executes:

Step 1: Update Message
  updateDoc(chats/{chatId}/convo/{messageId}) {
    status: "accepted"
  }

Step 2: Create Task
  addDoc(accounts/{patientId}/tasks) {
    title: medicineName
    type: "prescription"
    medicines: array
    times: array
    duration: number
    dosage: string
    instructions: string
    status: "active"
    doctorId: chat.doctor
  }

Step 3: Notify Doctor
  addDoc(accounts/{doctorId}/notifications) {
    type: "prescription_accepted"
    patientName: chat.name
    medicineName: medicine
    patientId: patient.uid
    read: false
  }
    ↓
Real-time listeners update:
  - Message status changes to Accepted (green)
  - Doctor receives notification
  - Patient's tasks collection updated
  - All changes reflect immediately
```

### 4. Prescription Decline Flow
```
Patient sees Pending prescription
    ↓
Clicks "Decline" button
    ↓
handleDeclinePrescription() executes:

Step 1: Update Message
  updateDoc(chats/{chatId}/convo/{messageId}) {
    status: "declined"
  }

Step 2: Notify Doctor
  addDoc(accounts/{doctorId}/notifications) {
    type: "prescription_declined"
    patientName: chat.name
    medicineName: medicine
    patientId: patient.uid
    read: false
  }
    ↓
Real-time listeners update:
  - Message status changes to Declined (red)
  - Doctor receives notification
```

## Unread Count Management

### When Chat Opens
```
ChatWindow mounts with chat.id
    ↓
resetUnreadCount()
    ↓
Gets current user type (isDoctor)
    ↓
If Doctor:
  updateDoc(chats/{chatId}) {
    unreadCountDoctor: 0
  }
Else (Patient):
  updateDoc(chats/{chatId}) {
    unreadCountClient: 0
  }
```

### When New Message Arrives
```
Real-time listener receives new message
    ↓
Firestore unreadCount still reflects old count
    ↓
(Count updates automatically when chat page refetches)
```

## Photo Loading & Caching

### On Chat Change
```
Chat component receives new chat.id
    ↓
loadPhotos() effect runs
    ↓
Fetch doctor photo:
  GET /api/user/photo?userId={chat.doctor}
  ↓
  Add to cache: cache[doctor_id] = photo_url
    ↓
Fetch patient photo:
  GET /api/user/photo?userId={chat.client}
  ↓
  Add to cache: cache[client_id] = photo_url
    ↓
setPhotoCache(cache)
    ↓
All messages render with cached photos
```

## Key State Management

```
State Variables:
├── messages[] - Real-time message array from Firestore
├── inputValue - Current text in input field
├── isMenuOpen - Show/hide attachment menu
├── isFormOpen - Show/hide prescription form
├── isEvalOpen - Show/hide evaluation form
├── viewerData - Prescription data for viewer modal
├── evalViewerData - Evaluation data for viewer modal
├── loading - Initial message load state
├── photoCache - User photo URL cache
└── isSending - Disable buttons while sending

Real-time Listeners:
├── Messages: onSnapshot(convo subcollection)
├── Chat unread count: updateDoc() after opening
└── Photos: fetch() on mount
```

## Security & Permissions

### Doctor-Only Features
- Prescription menu button hidden for patients (`chat.isDoctor` check)
- Evaluation form menu button hidden for patients
- Prescription/evaluation modals only trigger for doctors

### Patient-Only Features
- Accept/Decline buttons only show for patients (`!chat.isDoctor` check)
- Task creation only for patients (handleAcceptPrescription)

### Firebase Rules (Implied)
- Only user's own messages can be read/written
- Doctors can create notifications for themselves
- Patients can create notifications for their doctor
- Tasks belong to patient's account

## Firestore Collections Used

```
chats/
  {chatId}/
    convo/
      {messageId} - Text, prescription, or evaluation
      
accounts/
  {userId}/
    notifications/
      {notificationId} - Doctor receives these
    tasks/
      {taskId} - Patient creates these from prescriptions
    photos/
      ... (accessed via /api/user/photo)
```

## API Endpoints Used

```
1. GET /api/chats/list?userId={uid}
   Returns: { chats: Array<Chat> }

2. GET /api/chats/{chatId}/lastMessage
   Returns: { message: Message | null }

3. GET /api/user/photo?userId={uid}
   Returns: { photo: string | null }

4. Implicit:
   - Firestore addDoc() for messages
   - Firestore updateDoc() for status updates
   - Firestore onSnapshot() for real-time updates
```

## Error Handling

```
Try-Catch Blocks:
├── loadPhotos() - Graceful fallback to initials
├── resetUnreadCount() - Logs error, continues
├── Message listener - Logs error, shows loading state
├── handleSendText() - Logs error, isSending reset
├── handleSendPrescription() - Logs error, isSending reset
├── handleSendEvaluation() - Logs error, isSending reset
├── handleAcceptPrescription() - Logs error, message remains
└── handleDeclinePrescription() - Logs error, message remains

Fallbacks:
├── Missing photo → Avatar with initial letter
├── Missing senderName → "Unknown"
├── Missing prescriptionData → Message hidden
└── No messages → "No messages yet. Start the conversation!"
```

## Performance Optimizations

1. **Photo Caching** - Load once, reuse for all messages
2. **Real-time Listener** - Only subscribe to one chat's messages
3. **Batch Updates** - Multiple operations in one async flow
4. **Conditional Rendering** - Doctors don't see patient buttons
5. **Unsubscribe on Unmount** - `return () => unsubscribe()` prevents memory leaks

## Testing Checklist

- [ ] Text message sends and appears in real-time
- [ ] Prescription form opens for doctors only
- [ ] Prescription displays with correct status color
- [ ] Patient can accept prescription
- [ ] Task created when accepting prescription
- [ ] Doctor receives notification on accept
- [ ] Patient can decline prescription
- [ ] Doctor receives notification on decline
- [ ] Photos load and cache properly
- [ ] Unread count resets when opening chat
- [ ] Evaluation form sends for doctors
- [ ] Message timestamps format correctly
- [ ] Scroll-to-bottom works on new messages
- [ ] Modals close after submit
- [ ] Error states handled gracefully
