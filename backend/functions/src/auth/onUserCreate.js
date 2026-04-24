const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Triggered when a new user is created in Firebase Auth
 * Creates a new user document in Firestore with default values
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const userRef = db.collection("users").doc(user.uid);

    await userRef.set({
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "",
      phone: "",
      roles: [], // Empty until user selects roles
      activeRole: null,
      location: {
        lat: null,
        lng: null,
        address: "",
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`User document created for ${user.uid}`);
  } catch (error) {
    console.error(`Error creating user document for ${user.uid}:`, error);
    throw error;
  }
});