/**
 * Contractor Document Service - Document management operations
 * Focused service following 250-line limit rule
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { neonDb } from '@/lib/neon/connection';
import { contractorDocuments } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { log } from '@/lib/logger';
import { 
  ContractorDocument,
  DocumentType
} from '@/types/contractor.types';

export interface DocumentUploadData {
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  issueDate?: Date;
  expiryDate?: Date;
  notes?: string;
}

export const contractorDocumentService = {
  /**
   * Get documents for a contractor
   */
  async getByContractor(contractorId: string): Promise<ContractorDocument[]> {
    try {
      // Try the optimized query first (requires composite index)
      const q = query(
        collection(db, 'contractor_documents'),
        where('contractorId', '==', contractorId),
        orderBy('documentType', 'asc'),
        orderBy('createdAt', 'desc')
      );
      
      try {
        const snapshot = await getDocs(q);
        return this.mapDocuments(snapshot);
      } catch (indexError: any) {
        // If index error, fall back to simpler query and sort in memory
        if (indexError?.code === 'failed-precondition' || 
            indexError?.message?.includes('index')) {
          log.warn('Composite index not available, using fallback query with client-side sorting', undefined, 'contractorDocumentService');
          
          // Fallback: Simple query with client-side sorting
          const fallbackQuery = query(
            collection(db, 'contractor_documents'),
            where('contractorId', '==', contractorId),
            orderBy('createdAt', 'desc')
          );
          
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const documents = this.mapDocuments(fallbackSnapshot);
          
          // Sort by documentType client-side
          return documents.sort((a, b) => {
            const typeCompare = a.documentType.localeCompare(b.documentType);
            if (typeCompare !== 0) return typeCompare;
            // If same type, maintain createdAt desc order
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }
        throw indexError;
      }
    } catch (error) {
      log.error('Error getting contractor documents:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to fetch contractor documents');
    }
  },

  /**
   * Helper method to map Firestore documents to ContractorDocument objects
   */
  mapDocuments(snapshot: any): ContractorDocument[] {
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        issueDate: data.issueDate?.toDate(),
        expiryDate: data.expiryDate?.toDate(),
        verifiedAt: data.verifiedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ContractorDocument;
    });
  },

  /**
   * Upload new document
   */
  async uploadDocument(contractorId: string, data: DocumentUploadData): Promise<string> {
    try {
      const now = Timestamp.now();
      
      // Calculate expiry status
      const isExpired = data.expiryDate ? new Date() > data.expiryDate : false;
      const daysUntilExpiry = data.expiryDate ? 
        Math.ceil((data.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
        null;
      
      const documentData = {
        contractorId,
        ...data,
        issueDate: data.issueDate ? Timestamp.fromDate(data.issueDate) : null,
        expiryDate: data.expiryDate ? Timestamp.fromDate(data.expiryDate) : null,
        isExpired,
        daysUntilExpiry,
        verificationStatus: 'pending' as const,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'contractor_documents'), documentData);
      
      // Sync to Neon
      try {
        await neonDb.insert(contractorDocuments).values({
          id: docRef.id,
          contractorId,
          documentType: data.documentType,
          documentName: data.documentName,
          documentNumber: data.documentNumber,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          issueDate: data.issueDate,
          expiryDate: data.expiryDate,
          isExpired,
          daysUntilExpiry,
          verificationStatus: 'pending',
          notes: data.notes,
        });
      } catch (neonError) {
        log.warn('Failed to sync document to Neon:', { data: neonError }, 'contractorDocumentService');
      }
      
      return docRef.id;
    } catch (error) {
      log.error('Error uploading document:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to upload document');
    }
  },

  /**
   * Verify document
   */
  async verifyDocument(documentId: string, verifiedBy: string, status: 'verified' | 'rejected', rejectionReason?: string): Promise<void> {
    try {
      const updateData: any = {
        verificationStatus: status,
        verifiedBy,
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      await updateDoc(doc(db, 'contractor_documents', documentId), updateData);
      
      // Sync to Neon
      try {
        await neonDb
          .update(contractorDocuments)
          .set({
            verificationStatus: status,
            verifiedBy,
            verifiedAt: new Date(),
            rejectionReason: rejectionReason || null,
            updatedAt: new Date(),
          })
          .where(eq(contractorDocuments.id, documentId));
      } catch (neonError) {
        log.warn('Failed to sync document verification to Neon:', { data: neonError }, 'contractorDocumentService');
      }
    } catch (error) {
      log.error('Error verifying document:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to verify document');
    }
  },

  /**
   * Update document details
   */
  async updateDocument(documentId: string, data: Partial<DocumentUploadData>): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      // Handle date conversion
      if (data.issueDate) {
        updateData.issueDate = Timestamp.fromDate(data.issueDate);
      }
      if (data.expiryDate) {
        updateData.expiryDate = Timestamp.fromDate(data.expiryDate);
        // Recalculate expiry status
        updateData.isExpired = new Date() > data.expiryDate;
        updateData.daysUntilExpiry = Math.ceil(
          (data.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      
      await updateDoc(doc(db, 'contractor_documents', documentId), updateData);
    } catch (error) {
      log.error('Error updating document:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to update document');
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contractor_documents', documentId));
      
      // Delete from Neon
      try {
        await neonDb
          .delete(contractorDocuments)
          .where(eq(contractorDocuments.id, documentId));
      } catch (neonError) {
        log.warn('Failed to delete document from Neon:', { data: neonError }, 'contractorDocumentService');
      }
    } catch (error) {
      log.error('Error deleting document:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to delete document');
    }
  },

  /**
   * Get documents expiring soon across all contractors
   */
  async getExpiringDocuments(daysAhead: number = 30): Promise<ContractorDocument[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
      
      try {
        // Try optimized query with multiple where clauses and orderBy
        const q = query(
          collection(db, 'contractor_documents'),
          where('expiryDate', '<=', Timestamp.fromDate(cutoffDate)),
          where('expiryDate', '>', Timestamp.now()),
          orderBy('expiryDate', 'asc')
        );
        const snapshot = await getDocs(q);
        return this.mapDocuments(snapshot);
      } catch (indexError: any) {
        // Fallback: Use single where clause and filter client-side
        if (indexError?.code === 'failed-precondition' || 
            indexError?.message?.includes('index')) {
          log.warn('Expiring documents query index not available, using fallback with client-side filtering', undefined, 'contractorDocumentService');
          
          const fallbackQuery = query(
            collection(db, 'contractor_documents'),
            where('expiryDate', '>', Timestamp.now()),
            orderBy('expiryDate', 'asc')
          );
          
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const documents = this.mapDocuments(fallbackSnapshot);
          
          // Filter client-side for cutoff date
          return documents.filter(doc => 
            doc.expiryDate && doc.expiryDate <= cutoffDate
          );
        }
        throw indexError;
      }
    } catch (error) {
      log.error('Error getting expiring documents:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to fetch expiring documents');
    }
  },

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<ContractorDocument | null> {
    try {
      const docRef = doc(db, 'contractor_documents', documentId);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        issueDate: data.issueDate?.toDate(),
        expiryDate: data.expiryDate?.toDate(),
        verifiedAt: data.verifiedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ContractorDocument;
    } catch (error) {
      log.error('Error getting document:', { data: error }, 'contractorDocumentService');
      throw new Error('Failed to fetch document');
    }
  }
};