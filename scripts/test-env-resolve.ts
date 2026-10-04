import { readEnv, isFirebaseAdminConfigured } from '../src/lib/config/env';

console.log('FIREBASE_CLIENT_EMAIL:', readEnv('FIREBASE_CLIENT_EMAIL'));
console.log('FIREBASE_PRIVATE_KEY present:', readEnv('FIREBASE_PRIVATE_KEY').length > 0);
console.log('isFirebaseAdminConfigured():', isFirebaseAdminConfigured());
