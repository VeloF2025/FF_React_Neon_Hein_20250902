/**
 * Contractor Import Service
 * Main service for processing contractor import operations
 */

import type { 
  ContractorImportData, 
  ContractorImportOptions, 
  ContractorImportResult,
  ContractorImportRow 
} from '@/types/contractor/import.types';
import type { ContractorFormData } from '@/types/contractor/form.types';
import { ContractorImportValidator } from './contractorImportValidator';
import { CSV_HEADER_MAPPING } from '@/constants/contractor/validation';
import { contractorService } from '@/services/contractorService';
import { log } from '@/lib/logger';

class ContractorImportService {
  private validator = new ContractorImportValidator();

  /**
   * Process uploaded file and extract contractor data
   */
  async processFile(
    file: File, 
    options: ContractorImportOptions = { mode: 'skipDuplicates', hasHeaders: true }
  ): Promise<ContractorImportData> {
    try {
      // Initialize validator with service templates
      await this.validator.loadAvailableServices();
      
      // Process the actual file (CSV/Excel)
      const rawData = await this.parseFile(file, options);
      
      // Validate each row
      const processedContractors: ContractorImportRow[] = [];
      
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + (options.hasHeaders ? 2 : 1); // Account for headers
        
        // Validate the row
        const validation = this.validator.validateRow(row);
        
        const contractorRow: ContractorImportRow = {
          ...row,
          rowNumber,
          isValid: validation.isValid,
          isDuplicate: false, // TODO: Implement duplicate detection
          errors: validation.errors,
          warnings: validation.warnings
        };
        
        processedContractors.push(contractorRow);
      }
      
      return {
        contractors: processedContractors,
        summary: {
          totalRows: processedContractors.length,
          validRows: processedContractors.filter(c => c.isValid).length,
          errorRows: processedContractors.filter(c => !c.isValid).length,
          duplicateRows: processedContractors.filter(c => c.isDuplicate).length
        }
      };
      
    } catch (error) {
      // Enhanced error logging to debug CSV parsing issues
      log.error('🐛 CSV Processing Error Details:', { data: {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      } }, 'contractorImportService');
      
      // Re-throw error instead of falling back to mock data
      throw error;
      
      // Fallback to mock data if processing fails - DISABLED FOR DEBUGGING
      // log.error('File processing failed, using mock data:', { data: error }, 'contractorImportService');
      
      const mockContractors: ContractorImportRow[] = [
        {
          companyName: 'Alpha Construction Ltd',
          contactPerson: 'John Smith',
          email: 'john@alphaconstruction.com',
          registrationNumber: '2021/123456/07',
          phone: '0123456789',
          businessType: 'Pty Ltd',
          services: ['Fibre Installation', 'Network Maintenance'],
          province: 'Gauteng',
          regionOfOperations: ['Gauteng', 'Western Cape'],
          rowNumber: 1,
          isValid: true,
          isDuplicate: false,
          errors: [],
          warnings: []
        },
        {
          companyName: 'Beta Networks CC',
          contactPerson: 'Jane Doe',
          email: 'jane@betanetworks.co.za',
          registrationNumber: '2020/987654/23',
          phone: '0987654321',
          businessType: 'CC',
          services: ['Fibre Splicing', 'Network Testing'],
          province: 'Western Cape',
          regionOfOperations: ['Western Cape', 'Eastern Cape'],
          rowNumber: 2,
          isValid: true,
          isDuplicate: true,
          errors: [],
          warnings: ['Duplicate registration number found']
        },
        {
          companyName: 'Invalid Company',
          contactPerson: '',
          email: 'invalid-email',
          registrationNumber: '',
          rowNumber: 3,
          isValid: false,
          isDuplicate: false,
          errors: ['Contact person is required', 'Invalid email format', 'Registration number is required'],
          warnings: []
        }
      ];

      return {
        contractors: mockContractors,
        summary: {
          totalRows: mockContractors.length,
          validRows: mockContractors.filter(c => c.isValid).length,
          errorRows: mockContractors.filter(c => !c.isValid).length,
          duplicateRows: mockContractors.filter(c => c.isDuplicate).length
        }
      };
    }
  }

  /**
   * Parse uploaded file (CSV or Excel)
   */
  private async parseFile(file: File, options: ContractorImportOptions): Promise<Partial<ContractorImportRow>[]> {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      return this.parseCsvFile(file, options);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return this.parseExcelFile(file, options);
    } else {
      throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }
  }

  /**
   * Parse CSV file
   */
  private async parseCsvFile(file: File, options: ContractorImportOptions): Promise<Partial<ContractorImportRow>[]> {
    log.info('🔍 CSV Parsing Debug - Starting:', { data: { fileName: file.name, fileSize: file.size } }, 'contractorImportService');
const text = await file.text();
    log.info('📄 CSV Content Preview:', { data: text.substring(0, 200) + '...' }, 'contractorImportService');
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    log.info('📊 CSV Lines Found:', { data: lines.length }, 'contractorImportService');
    
    if (lines.length === 0) {
      throw new Error('The CSV file is empty.');
    }
    
    // Skip comment lines (starting with #)
    const dataLines = lines.filter(line => !line.startsWith('#'));
    log.info('🗂️ Data Lines (after filtering comments):', { data: dataLines.length }, 'contractorImportService');
    
    if (dataLines.length === 0) {
      throw new Error('No data found in CSV file.');
    }
    
    let headers: string[] = [];
    let dataStartIndex = 0;
    
    if (options.hasHeaders) {
      headers = this.parseCsvLine(dataLines[0]);
      dataStartIndex = 1;
    } else {
      // Use default headers if no headers in file
      headers = Object.keys(CSV_HEADER_MAPPING);
    }
    
    const results: Partial<ContractorImportRow>[] = [];
    
    for (let i = dataStartIndex; i < dataLines.length; i++) {
      const values = this.parseCsvLine(dataLines[i]);
      const rowData: Partial<ContractorImportRow> = {};
      
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index];
          const mappedField = this.mapCsvHeader(header);
          
          if (mappedField && value) {
            if (mappedField === 'services') {
              rowData[mappedField] = this.parseServicesField(value);
            } else if (mappedField === 'regionOfOperations') {
              rowData[mappedField] = this.parseRegionsField(value);
            } else if (mappedField === 'phone') {
              rowData[mappedField] = this.normalizePhoneNumber(value);
            } else {
              rowData[mappedField as keyof ContractorImportRow] = value;
            }
          }
        }
      });
      
      if (Object.keys(rowData).length > 0) {
        results.push(rowData);
      }
    }
    
    log.info('✅ CSV Parsing Complete:', { data: { 
      totalDataLines: dataLines.length - dataStartIndex, 
      recordsParsed: results.length,
      sampleRecord: results[0]
    } }, 'contractorImportService');
    return results;
  }

  /**
   * Parse Excel file using XLSX library
   */
  private async parseExcelFile(file: File, options: ContractorImportOptions): Promise<Partial<ContractorImportRow>[]> {
    log.info('📊 Excel Parsing Debug - Starting:', { data: { fileName: file.name, fileSize: file.size } }, 'contractorImportService');
    try {
      // Dynamically import XLSX to avoid bundle issues
      const XLSX = await import('xlsx');
      
      // Read file as array buffer
      const buffer = await file.arrayBuffer();
      
      // Parse workbook
      const workbook = XLSX.read(buffer, { type: 'array' });
      log.info('📋 Excel Workbook:', { data: { sheetNames: workbook.SheetNames } }, 'contractorImportService');
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,  // Use array format to preserve headers
        defval: '',  // Default value for empty cells
        blankrows: false // Skip blank rows
      }) as string[][];
      
      log.info('📄 Excel Data Preview:', { data: {
        totalRows: jsonData.length,
        firstRow: jsonData[0],
        sampleData: jsonData.slice(0, 3)
      } }, 'contractorImportService');
      
      if (jsonData.length === 0) {
        throw new Error('The Excel file appears to be empty.');
      }
      
      let headers: string[] = [];
      let dataStartIndex = 0;
      
      if (options.hasHeaders && jsonData.length > 0) {
        headers = jsonData[0].map(cell => String(cell || '').trim());
        dataStartIndex = 1;
      } else {
        // Use default headers if no headers in file
        headers = Object.keys(CSV_HEADER_MAPPING);
      }
      
      log.info('📝 Excel Headers:', { data: headers }, 'contractorImportService');
      log.info('🗂️ Header Mapping Test:', { data: headers.map(h => ({ 
        original: h, 
        cleaned: h.replace('*', '').trim(),
        mapped: this.mapCsvHeader(h) 
      })) }, 'contractorImportService');
      
      const results: Partial<ContractorImportRow>[] = [];
      
      for (let i = dataStartIndex; i < jsonData.length; i++) {
        const values = jsonData[i] || [];
        const rowData: Partial<ContractorImportRow> = {};
        
        // Debug first row mapping
        if (i === dataStartIndex) {
          log.info('🔍 First Row Mapping Debug:', undefined, 'contractorImportService');
          log.info('Raw values:', { data: values }, 'contractorImportService');
        }
        
        headers.forEach((header, index) => {
          if (index < values.length) {
            const value = String(values[index] || '').trim();
            const mappedField = this.mapCsvHeader(header);
            
            // Debug first row field mapping
            if (i === dataStartIndex) {
              if (mappedField === 'phone') {
                const normalized = this.normalizePhoneNumber(value);
                log.info(`  "${header}" -> "${mappedField}" = "${value}" -> "${normalized}"`, undefined, 'contractorImportService');
              } else {
                log.info(`  "${header}" -> "${mappedField}" = "${value}"`, undefined, 'contractorImportService');
              }
            }
            
            if (mappedField && value) {
              if (mappedField === 'services') {
                rowData[mappedField] = this.parseServicesField(value);
              } else if (mappedField === 'regionOfOperations') {
                rowData[mappedField] = this.parseRegionsField(value);
              } else if (mappedField === 'phone') {
                rowData[mappedField] = this.normalizePhoneNumber(value);
              } else {
                rowData[mappedField as keyof ContractorImportRow] = value;
              }
            }
          }
        });
        
        // Debug first row result
        if (i === dataStartIndex) {
          log.info('📊 First Row Result:', { data: rowData }, 'contractorImportService');
        }
        
        if (Object.keys(rowData).length > 0) {
          results.push(rowData);
        }
      }
      
      log.info('✅ Excel Parsing Complete:', { data: { 
        totalDataRows: jsonData.length - dataStartIndex, 
        recordsParsed: results.length,
        sampleRecord: results[0]
      } }, 'contractorImportService');
      
      return results;
      
    } catch (error) {
      log.error('❌ Excel parsing failed:', { data: error }, 'contractorImportService');
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Map CSV header to database field
   */
  private mapCsvHeader(header: string): string | null {
    // Try exact match first
    const exactMatch = CSV_HEADER_MAPPING[header as keyof typeof CSV_HEADER_MAPPING];
    if (exactMatch) {
      return exactMatch;
    }
    
    // Try with asterisk added for required fields
    const withAsterisk = `${header}*`;
    const asteriskMatch = CSV_HEADER_MAPPING[withAsterisk as keyof typeof CSV_HEADER_MAPPING];
    if (asteriskMatch) {
      return asteriskMatch;
    }
    
    // Try with asterisk removed
    const cleanHeader = header.replace('*', '').trim();
    const cleanMatch = CSV_HEADER_MAPPING[cleanHeader as keyof typeof CSV_HEADER_MAPPING];
    if (cleanMatch) {
      return cleanMatch;
    }
    
    // Try case-insensitive matching for common variations
    const normalizedHeader = header.toLowerCase().trim();
    
    const fieldMappings: Record<string, string> = {
      'company name': 'companyName',
      'company': 'companyName',
      'name': 'companyName',
      'trading name': 'tradingName',
      'trading': 'tradingName',
      'contact person': 'contactPerson',
      'contact': 'contactPerson',
      'person': 'contactPerson',
      'email': 'email',
      'email address': 'email',
      'registration number': 'registrationNumber',
      'registration': 'registrationNumber',
      'reg number': 'registrationNumber',
      'reg no': 'registrationNumber',
      'phone': 'phone',
      'telephone': 'phone',
      'cell': 'phone',
      'mobile': 'phone',
      'business type': 'businessType',
      'type': 'businessType',
      'services': 'services',
      'website': 'website',
      'web': 'website',
      'url': 'website',
      'address 1': 'address1',
      'address1': 'address1',
      'address line 1': 'address1',
      'street address': 'address1',
      'address 2': 'address2',
      'address2': 'address2',
      'address line 2': 'address2',
      'suburb': 'suburb',
      'city': 'city',
      'town': 'city',
      'province': 'province',
      'state': 'province',
      'postal code': 'postalCode',
      'postcode': 'postalCode',
      'zip': 'postalCode',
      'zip code': 'postalCode',
      'country': 'country',
      'region of operations': 'regionOfOperations',
      'regions': 'regionOfOperations',
      'operations': 'regionOfOperations'
    };
    
    return fieldMappings[normalizedHeader] || null;
  }

  /**
   * Parse services field (comma-separated)
   */
  private parseServicesField(value: string): string[] {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Parse regions field (comma-separated provinces)
   */
  private parseRegionsField(value: string): string[] {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Normalize phone number to South African format
   * Converts various formats to +27xxxxxxxxx or 0xxxxxxxxx
   */
  private normalizePhoneNumber(value: string): string {
    if (!value || !value.trim()) {
      return value;
    }

    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Handle different input formats
    if (cleaned.startsWith('+27')) {
      // Already in international format (+27xxxxxxxxx)
      return cleaned;
    } else if (cleaned.startsWith('27') && cleaned.length === 11) {
      // International format without + (27xxxxxxxxx) 
      return '+' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Local format (0xxxxxxxxx) - keep as is, it's valid
      return cleaned;
    } else if (cleaned.length === 9) {
      // 9 digits - assume missing leading 0
      return '0' + cleaned;
    } else if (cleaned.length === 10 && !cleaned.startsWith('0')) {
      // 10 digits but doesn't start with 0 - assume mobile number, add 0
      return '0' + cleaned;
    }
    
    // For debugging - log unrecognized formats
    log.info(`📞 Phone normalization: "${value}" -> "${cleaned}" (unrecognized format, keeping original, undefined, 'contractorImportService');`);
    
    // Return original if we can't recognize the format
    return value;
  }

  /**
   * Import validated contractor data to database
   */
  async importContractors(
    data: ContractorImportData, 
    options: ContractorImportOptions
  ): Promise<ContractorImportResult> {
    const startTime = Date.now();
    log.info('🚀 Starting real database import of contractors...', undefined, 'contractorImportService');
    
    const validContractors = data.contractors.filter(c => c.isValid);
    const invalidContractors = data.contractors.filter(c => !c.isValid);
    const duplicates = data.contractors.filter(c => c.isDuplicate);
    
    log.info('📊 Import Summary:', { data: {
      total: data.contractors.length,
      valid: validContractors.length,
      invalid: invalidContractors.length,
      duplicates: duplicates.length
    } }, 'contractorImportService');
    const importedIds: string[] = [];
    const errors: Array<{row: number; message: string; data: any}> = [];
    
    // Add invalid contractors to errors
    invalidContractors.forEach(contractor => {
      errors.push({
        row: contractor.rowNumber,
        message: contractor.errors.join(', '),
        data: { companyName: contractor.companyName }
      });
    });
    
    // Process valid contractors
    let successCount = 0;
    let duplicatesSkipped = 0;
    
    for (const contractor of validContractors) {
      try {
        // Skip duplicates if mode is set to skip
        if (contractor.isDuplicate && options.mode === 'skipDuplicates') {
          duplicatesSkipped++;
          log.info(`⏭️ Skipping duplicate: ${contractor.companyName}`, undefined, 'contractorImportService');
          continue;
        }
        
        // Convert import format to ContractorFormData
        const contractorData: ContractorFormData = this.convertToFormData(contractor);
        
        log.info(`💾 Creating contractor: ${contractorData.companyName}`, undefined, 'contractorImportService');
        
        // Create contractor in database
        const contractorId = await contractorService.create(contractorData);
        importedIds.push(contractorId);
        successCount++;
        
        log.info(`✅ Successfully created contractor with ID: ${contractorId}`, undefined, 'contractorImportService');
        
      } catch (error) {
        log.error(`❌ Failed to create contractor ${contractor.companyName}:`, { data: error }, 'contractorImportService');
        errors.push({
          row: contractor.rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error during creation',
          data: { companyName: contractor.companyName }
        });
      }
    }
    
    const result = {
      totalProcessed: data.contractors.length,
      successCount,
      duplicatesSkipped,
      errors,
      importedIds,
      duration: Date.now() - startTime
    };
    
    log.info('🎉 Import completed:', { data: result }, 'contractorImportService');
    return result;
  }

  /**
   * Convert import row format to ContractorFormData format
   */
  private convertToFormData(contractor: ContractorImportRow): ContractorFormData {
    // Map business type from import format to form format
    const businessTypeMapping: Record<string, ContractorFormData['businessType']> = {
      'Pty Ltd': 'pty_ltd',
      'CC': 'cc', 
      'Trust': 'cc', // Map Trust to cc for now
      'Sole Proprietor': 'sole_proprietor'
    };
    
    // Generate unique registration number if missing or is placeholder
    let registrationNumber = contractor.registrationNumber || '';
    if (!registrationNumber || registrationNumber === '0000/000000/00' || registrationNumber.trim() === '') {
      // Generate unique registration number using timestamp and random number
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      registrationNumber = `TEMP/${timestamp}/${random}`;
    }
    
    return {
      // Company Information
      companyName: contractor.companyName || '',
      registrationNumber: registrationNumber,
      businessType: businessTypeMapping[contractor.businessType || ''] || 'pty_ltd',
      industryCategory: 'Telecommunications', // Default category
      yearsInBusiness: undefined,
      employeeCount: undefined,
      
      // Contact Information
      contactPerson: contractor.contactPerson || '',
      email: contractor.email || '',
      phone: contractor.phone || '',
      alternatePhone: '',
      
      // Address - map from import format
      physicalAddress: [contractor.address1, contractor.address2, contractor.suburb]
        .filter(Boolean)
        .join(', '),
      postalAddress: [contractor.address1, contractor.address2, contractor.suburb]
        .filter(Boolean)
        .join(', '),
      city: contractor.city || '',
      province: contractor.province || '',
      postalCode: contractor.postalCode || '',
      
      // Service Information
      serviceCategory: 'Installation', // Default
      capabilities: contractor.services || [],
      equipmentOwned: [],
      certifications: [],
      
      // Business Details
      website: contractor.website || '',
      socialMediaProfiles: {},
      
      // Financial Information
      annualRevenue: 0,
      creditRating: 'Not Rated',
      taxClearance: false,
      
      // Compliance & Certifications
      beeLevel: 'Not Specified',
      insuranceCoverage: {},
      healthSafetyCertification: false,
      
      // Performance & Rating
      performanceRating: 0,
      reliabilityScore: 0,
      qualityScore: 0,
      
      // Operational Information
      operationalRegions: contractor.regionOfOperations || [],
      teamSize: 1,
      projectCapacity: 1,
      
      // Status & Metadata
      status: 'pending' as const, // Use lowercase to match the expected status values
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      notes: 'Imported via Excel/CSV import'
    };
  }

  /**
   * Download CSV template for contractor import
   */
  downloadTemplate(): void {
    const headers = [
      'Company Name*',
      'Trading Name',
      'Contact Person*', 
      'Email*',
      'Registration Number*',
      'Phone',
      'Business Type*',
      'Services',
      'Website',
      'Address 1',
      'Address 2',
      'Suburb',
      'City',
      'Province*',
      'Postal Code',
      'Country',
      'Region of Operations'
    ];

    const sampleData = [
      [
        'Alpha Construction Ltd',
        'Alpha Contractors',
        'John Smith',
        'john@alphaconstruction.com',
        '2021/123456/07',
        '0123456789',
        'Pty Ltd',
        'Fibre Installation, Network Maintenance',
        'https://www.alphaconstruction.com',
        '123 Main Street',
        'Unit 5A',
        'Sandton',
        'Johannesburg',
        'Gauteng',
        '2196',
        'South Africa',
        'Gauteng, Western Cape'
      ],
      [
        'Beta Networks CC',
        '',
        'Jane Doe',
        'jane@betanetworks.co.za',
        '2020/987654/23',
        '0987654321',
        'CC',
        'Fibre Splicing, Network Testing',
        'https://betanetworks.co.za',
        '456 Oak Avenue',
        '',
        'Claremont',
        'Cape Town',
        'Western Cape',
        '7708',
        'South Africa',
        'Western Cape, Eastern Cape'
      ],
      [
        'Gamma Trust',
        'GT Solutions',
        'Mike Johnson',
        'mike@gammatrust.org.za',
        '2019/555444/08',
        '+27116667777',
        'Trust',
        'Trenching, Civil Construction',
        'https://gammatrust.org.za',
        '789 Pine Road',
        'Suite 12B',
        'Durban North',
        'Durban',
        'KwaZulu-Natal',
        '4051',
        'South Africa',
        'KwaZulu-Natal'
      ]
    ];

    // Add validation options as comments
    const csvLines = [
      headers.join(','),
      '',
      '# VALIDATION GUIDE:',
      '# Business Type (required): Pty Ltd, CC, Trust, Sole Proprietor',
      '# Services: Choose from available services like Fibre Installation, Network Maintenance, Trenching, Fibre Splicing, etc. (separate multiple with commas)',
      '# Province (required): Eastern Cape, Free State, Gauteng, KwaZulu-Natal, Limpopo, Mpumalanga, Northern Cape, North West, Western Cape',
      '# Region of Operations: Multiple provinces allowed (separate with commas)',
      '# Phone: South African format preferred (+27 or 0 prefix)',
      '# Registration Number: SA company format (YYYY/XXXXXX/XX)',
      '# Website: Include https:// or http://',
      '',
      '# SAMPLE DATA:',
      ...sampleData.map(row => row.join(','))
    ];

    const csvContent = csvLines.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contractor_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export all contractors to Excel
   */
  async exportToExcel(): Promise<void> {
    // Mock export functionality
    log.info('Export to Excel functionality will be implemented', undefined, 'contractorImportService');
  }
}

export const contractorImportService = new ContractorImportService();// Force HMR reload
