# Firebase Setup Guide: Elite Properties Mumbai

This guide outlines the Firestore data structure, security rules, and deployment instructions for the Elite Properties real estate website.

## 1. Firestore Data Structure

### /projects/{projectId}
```json
{
  "name": "Elite Residency",
  "slug": "elite-residency",
  "tagline": "Luxury Living in the Heart of Mumbai",
  "location": "Andheri West, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400053",
  "status": "ongoing",
  "type": "residential",
  "reraNumber": "P51800012345",
  "description": "Premium luxury apartments with modern amenities.",
  "highlights": ["Swimming Pool", "24/7 Security", "Modular Kitchen"],
  "configurations": [
    {"type": "2BHK", "carpetArea": "750 sqft", "price": "₹85 Lakhs"},
    {"type": "3BHK", "carpetArea": "1100 sqft", "price": "₹1.2 Crore"}
  ],
  "amenities": ["Pool", "Gym", "Clubhouse", "Parking", "Garden"],
  "coverImage": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "images": ["url1", "url2"],
  "floorPlanUrl": "https://...",
  "videoUrl": "https://youtube.com/...",
  "mapEmbed": "<iframe...>",
  "isFeatured": true,
  "priceRange": "₹85L - ₹1.2Cr",
  "createdAt": "Timestamp"
}
```

### /leads/{leadId}
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "message": "I am interested in 2BHK units.",
  "projectInterest": "Elite Residency",
  "status": "New",
  "source": "Website Form",
  "createdAt": "Timestamp"
}
```

### /siteVisits/{id}
```json
{
  "name": "Jane Smith",
  "phone": "+91 9988776655",
  "projectId": "elite-residency-id",
  "preferredDate": "2026-04-15",
  "status": "Pending",
  "createdAt": "Timestamp"
}
```

### /testimonials/{id}
```json
{
  "name": "Amit Sharma",
  "role": "Home Owner",
  "content": "Excellent service and quality construction.",
  "rating": 5,
  "avatar": "https://..."
}
```

## 2. Firebase Security Rules

### Firestore Rules (`firestore.rules`)
- **Public READ:** `projects`, `testimonials`, `awards`, `gallery`, `blogs`
- **Public CREATE:** `leads`, `siteVisits`, `channelPartners`
- **Admin READ/WRITE:** Full access to all collections
- **Validation:** Enforced on `leads` and `siteVisits` creation.

### Storage Rules (`storage.rules`)
- **Public READ:** `/projects/`, `/gallery/`
- **Admin WRITE:** Full access

## 3. Firebase Indexes

You must create the following composite indexes in the Firebase Console:

| Collection | Fields | Order |
|------------|--------|-------|
| `projects` | `status` (ASC), `createdAt` (DESC) | Composite |
| `projects` | `type` (ASC), `city` (ASC), `status` (ASC) | Composite |
| `projects` | `isFeatured` (ASC), `status` (ASC) | Composite |
| `leads`    | `status` (ASC), `createdAt` (DESC) | Composite |

## 4. Deployment Commands

Use the Firebase CLI to deploy your configuration:

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init firestore
firebase init storage

# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Storage Rules
firebase deploy --only storage:rules

# Deploy Firestore Indexes (if defined in firestore.indexes.json)
firebase deploy --only firestore:indexes

# Deploy Everything
firebase deploy
```

## 5. Environment Variables
Ensure the following variables are set in your application:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
