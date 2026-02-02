import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService {
  private readonly db: admin.firestore.Firestore;

  constructor() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      try {
        // Try to load from config/firebase-key.json
        // Path navigation: dist/firebase/firebase.service.js -> dist/ -> src/server/ -> ...
        // Development path: src/server/src/firebase/ -> ../../../../config/firebase-key.json
        
        // Use process.cwd() to be safer relative to the execution root
        // Assuming cwd is project root or src/server
        const possiblePaths = [
            path.join(process.cwd(), '..', '..', 'config', 'firebase-key.json'), // If running from src/server
            path.join(process.cwd(), 'config', 'firebase-key.json'), // If running from root
            path.resolve(__dirname, '..', '..', '..', '..', 'config', 'firebase-key.json') // Relative to source file
        ];

        let serviceAccount = null;
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                console.log(`[Firebase] Found key at: ${p}`);
                serviceAccount = require(p);
                break;
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('[Firebase] Connected successfully using key file');
        } else {
            console.warn('[Firebase] Key file not found. Trying default credential...');
            admin.initializeApp();
        }
      } catch (error) {
        console.error('[Firebase] Initialization error:', error);
      }
    }
    this.db = admin.firestore();
  }

  getFirestore() {
    return this.db;
  }

  // Tenant operations
  async getTenants() {
    const snapshot = await this.db.collection('tenants').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getTenant(id: string) {
    const doc = await this.db.collection('tenants').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async createTenant(data: any) {
    const doc = await this.db.collection('tenants').add(data);
    return { id: doc.id, ...data };
  }

  async updateTenant(id: string, data: any) {
    await this.db.collection('tenants').doc(id).update(data);
    return this.getTenant(id);
  }

  async deleteTenant(id: string) {
    await this.db.collection('tenants').doc(id).delete();
  }

  // Stats operations
  async getStats(pageId?: string) {
    let ref: admin.firestore.Query | admin.firestore.CollectionReference = this.db.collection('tenants');
    
    if (pageId) {
      const snapshot = await (ref as admin.firestore.CollectionReference).where('id', '==', pageId).get();
      const tenants = snapshot.docs.map(doc => doc.data());
      
      return {
        totalPages: tenants.length,
        totalSpins: tenants.reduce((sum: number, tenant: any) => sum + (tenant.totalSpins || 0), 0),
        totalPrizes: tenants.reduce((sum: number, tenant: any) => sum + (tenant.totalPrizes || 0), 0),
        totalUsers: tenants.reduce((sum: number, tenant: any) => sum + (tenant.totalUsers || 0), 0),
      };
    }
    
    const snapshot = await (ref as admin.firestore.CollectionReference).get();
    const tenants = snapshot.docs.map(doc => doc.data());
    
    return {
      totalPages: tenants.length,
      totalSpins: tenants.reduce((sum: number, tenant: any) => sum + (tenant.totalSpins || 0), 0),
      totalPrizes: tenants.reduce((sum: number, tenant: any) => sum + (tenant.totalPrizes || 0), 0),
      totalUsers: tenants.reduce((sum: number, tenant: any) => sum + (tenant.totalUsers || 0), 0),
    };
  }
}