const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Triggered when a new driver application is created in Firestore
 * Notifies admin to review the application
 */
exports.onDriverApply = functions.firestore
  .document("drivers/{driverId}")
  .onCreate(async (snap, context) => {
    try {
      const driver = snap.data();

      // Get driver's user details
      const userSnap = await db.collection("users").doc(driver.uid).get();
      if (!userSnap.exists) {
        console.warn("User not found for driver", context.params.driverId);
        return;
      }

      const user = userSnap.data();

      // Prepare notification
      const notificationMessage = `New driver application from ${driver.name} (${user.email}). License: ${driver.licenseNumber}, Experience: ${driver.experienceYears} years`;

      // FUTURE: Send email to admin
      console.log(`Email to admins: ${notificationMessage}`);

      // FUTURE: Send push notification to admin
      console.log(`Push notification to admins: ${notificationMessage}`);

      // Create admin notification in database
      const adminSnap = await db.collection("users").where("roles", "array-contains", "admin").get();

      for (const adminDoc of adminSnap.docs) {
        await db
          .collection("users")
          .doc(adminDoc.id)
          .collection("notifications")
          .add({
            type: "driver_application",
            driverId: context.params.driverId,
            driverName: driver.name,
            email: user.email,
            phone: driver.phone,
            experienceYears: driver.experienceYears,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
          });
      }

      return {
        success: true,
        driverId: context.params.driverId,
        notified: true,
      };
    } catch (error) {
      console.error("Error in onDriverApply:", error);
      throw error;
    }
  });