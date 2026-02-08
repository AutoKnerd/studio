let app: App | undefined;
let _adminDb: Firestore | any = null;
let _adminAuth: Auth | any = null;
export let isAdminInitialized = false;
export let adminInitErrorMessage: string | null = null;

class AdminNotInitializedError extends Error {
  code = 'admin/not-initialized';
  constructor(message: string) {
    super(message);
    this.name = 'AdminNotInitializedError';
  }
}

/**
 * Lazy-load Firebase Admin SDK only at runtime (Node.js).
 * This prevents the module from being imported during build-time.
 */
function initializeAdmin() {
  if (_adminDb !== null) return; // Already initialized

  try {
    // Dynamically require to avoid build-time module loading
    let getAppsAdmin, initAppAdmin, appDefault, getFirestore, getAuth;
    
    try {
      const app_module = require('firebase-admin/app');
      getAppsAdmin = app_module.getApps;
      initAppAdmin = app_module.initializeApp;
      appDefault = app_module.applicationDefault;
    } catch (e: any) {
      throw new Error(`Failed to load firebase-admin/app: ${e.message}`);
    }

    try {
      getFirestore = require('firebase-admin/firestore').getFirestore;
    } catch (e: any) {
      throw new Error(`Failed to load firebase-admin/firestore: ${e.message}`);
    }

    try {
      getAuth = require('firebase-admin/auth').getAuth;
    } catch (e: any) {
      throw new Error(`Failed to load firebase-admin/auth: ${e.message}`);
    }

    if (getAppsAdmin().length === 0) {
      // In a managed Google Cloud environment like App Hosting, applicationDefault()
      // automatically uses the runtime service account. The projectId is inferred
      // from the environment, so we don't need to specify it manually.
      app = initAppAdmin({
        credential: appDefault(),
      });
      console.log(`[Firebase Admin] Initialized with project ID: ${app.options.projectId}`);
      isAdminInitialized = true;
    } else {
      app = getAppsAdmin()[0];
      isAdminInitialized = true;
    }

    _adminDb = getFirestore(app);
    _adminAuth = getAuth(app);
  } catch (err: any) {
    // Initialization can fail if Application Default Credentials are not available
    // (local dev without GOOGLE_APPLICATION_CREDENTIALS). Avoid throwing during
    // module import so API route handlers can still respond with controlled errors.
    console.error('[Firebase Admin] Initialization failed:', err && err.message ? err.message : err, err && err.stack ? err.stack : undefined);

    const errMsg = (err && err.message) ? err.message : String(err);
    adminInitErrorMessage = errMsg;
    isAdminInitialized = false;

    // Use a distinct Error type/code so API routes can reliably detect an
    // Admin initialization failure and return a 503 (service unavailable).
    const makeErr = (suffix: string) => new AdminNotInitializedError(
      `Firebase Admin not initialized. applicationDefault() failed: ${errMsg}. ${suffix}`
    );

    _adminAuth = {
      verifyIdToken: async () => {
        throw makeErr('Ensure Application Default Credentials are available (GOOGLE_APPLICATION_CREDENTIALS) or run in App Hosting.');
      },
    };

    _adminDb = {
      collection: () => {
        throw makeErr('Ensure Application Default Credentials are available (GOOGLE_APPLICATION_CREDENTIALS) or run in App Hosting.');
      },
      runTransaction: async () => {
        throw makeErr('Ensure Application Default Credentials are available (GOOGLE_APPLICATION_CREDENTIALS) or run in App Hosting.');
      },
    };
  }
}

// Lazy-load exports that trigger initialization on first call
export const getAdminDb = () => {
  if (_adminDb === null) initializeAdmin();
  return _adminDb as Firestore;
};

export const getAdminAuth = () => {
  if (_adminAuth === null) initializeAdmin();
  return _adminAuth as Auth;
};
