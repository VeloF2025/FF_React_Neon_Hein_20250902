import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { staffService } from '@/services/staffService';
import { StaffImportResult } from '@/types/staff.types';
import { log } from '@/lib/logger';
import {
  StaffImportProps,
  FileDropZone,
  FilePreview,
  ImportResults,
  ImportInstructions,
  ImportActions
} from './import';

export function StaffImport({ onComplete }: StaffImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<StaffImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    try {
      let result: StaffImportResult;
      
      if (selectedFile.type === 'text/csv') {
        result = await staffService.importFromCSV(selectedFile);
      } else {
        result = await staffService.importFromExcel(selectedFile);
      }
      
      setImportResult(result);
      
      if (result.success && onComplete) {
        onComplete();
      }
    } catch (error) {
      log.error('Import error:', { data: error }, 'StaffImport');
      setImportResult({
        success: false,
        total: 0,
        imported: 0,
        failed: 1,
        errors: [{
          row: 0,
          field: 'general',
          message: 'Failed to import file. Please check the format and try again.'
        }],
        staffMembers: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = staffService.getImportTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    try {
      const blob = await staffService.exportToExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      log.error('Export error:', { data: error }, 'StaffImport');
      alert('Failed to export staff data');
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Import Staff</h2>
            </div>
            <ImportActions 
              onDownloadTemplate={handleDownloadTemplate}
              onExportAll={handleExportAll}
            />
          </div>
        </div>

        <div className="p-6">
          {!selectedFile && !importResult && (
            <FileDropZone
              onFileSelect={handleFile}
              dragActive={dragActive}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            />
          )}

          {selectedFile && !importResult && (
            <FilePreview
              file={selectedFile}
              isImporting={isImporting}
              onImport={handleImport}
              onCancel={resetImport}
            />
          )}

          {importResult && (
            <ImportResults
              result={importResult}
              onReset={resetImport}
            />
          )}

          {!importResult && (
            <ImportInstructions />
          )}
        </div>
      </div>
    </div>
  );
}