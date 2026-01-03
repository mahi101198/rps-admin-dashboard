// Firebase REST API client as a fallback for gRPC issues
import { getFirebaseAdmin } from '@/data/firebase.admin';

interface FirestoreDocument {
  name: string;
  fields: Record<string, any>;
  createTime: string;
  updateTime: string;
}

export class FirebaseRestClient {
  private projectId: string | undefined;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // Get project ID from environment variables
    this.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  }

  private async getAccessToken(): Promise<string> {
    // For now, we'll return a placeholder - in a real implementation,
    // you would implement proper token generation using the service account
    throw new Error('Not implemented: REST API fallback requires proper token generation');
  }

  private async ensureAccessToken(): Promise<void> {
    const now = Date.now();
    if (!this.accessToken || !this.tokenExpiry || now >= this.tokenExpiry) {
      this.accessToken = await this.getAccessToken();
      // Set expiry to 50 minutes from now (tokens typically expire in 1 hour)
      this.tokenExpiry = now + 50 * 60 * 1000;
    }
  }

  public async getDocument(collection: string, documentId: string): Promise<any | null> {
    try {
      if (!this.projectId) {
        throw new Error('Firebase project ID not configured');
      }

      await this.ensureAccessToken();
      
      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collection}/${documentId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.convertFirestoreData(data);
    } catch (error) {
      console.error('Error fetching document via REST API:', error);
      throw error;
    }
  }

  private convertFirestoreData(document: FirestoreDocument): any {
    const result: any = {
      id: document.name.split('/').pop() || ''
    };

    for (const [key, value] of Object.entries(document.fields)) {
      result[key] = this.convertFirestoreValue(value);
    }

    return result;
  }

  private convertFirestoreValue(value: any): any {
    if (value.stringValue !== undefined) {
      return value.stringValue;
    }
    if (value.integerValue !== undefined) {
      return parseInt(value.integerValue, 10);
    }
    if (value.doubleValue !== undefined) {
      return parseFloat(value.doubleValue);
    }
    if (value.booleanValue !== undefined) {
      return value.booleanValue;
    }
    if (value.timestampValue !== undefined) {
      return new Date(value.timestampValue);
    }
    if (value.nullValue !== undefined) {
      return null;
    }
    if (value.arrayValue !== undefined) {
      if (value.arrayValue.values) {
        return value.arrayValue.values.map((v: any) => this.convertFirestoreValue(v));
      }
      return [];
    }
    if (value.mapValue !== undefined) {
      if (value.mapValue.fields) {
        const result: any = {};
        for (const [k, v] of Object.entries(value.mapValue.fields)) {
          result[k] = this.convertFirestoreValue(v);
        }
        return result;
      }
      return {};
    }
    return value;
  }
}