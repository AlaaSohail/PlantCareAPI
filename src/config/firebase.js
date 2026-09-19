const {
    initializeApp,
    cert,
    getApps,
    getApp,
} = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const getFirebaseApp = () => {
    if (getApps().length) {
        return getApp();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawPrivateKey) {
        throw new Error(
            "Firebase Admin environment variables are missing: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
        );
    }

    const privateKey = rawPrivateKey
        .replace(/^"|"$/g, "")
        .replace(/\\n/g, "\n")
        .trim();

    if (
        !privateKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
        !privateKey.endsWith("-----END PRIVATE KEY-----")
    ) {
        throw new Error("FIREBASE_PRIVATE_KEY has invalid PEM formatting");
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
};

const getMessagingClient = () => getMessaging(getFirebaseApp());

module.exports = {
    getFirebaseApp,
    getMessagingClient,
};
