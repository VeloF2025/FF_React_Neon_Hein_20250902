import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// 🟢 WORKING: Field mapping between database columns and API response
const mapContractorFromDb = (dbRow) => {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    companyName: dbRow.company_name,
    registrationNumber: dbRow.registration_number,
    contactPerson: dbRow.contact_person,
    email: dbRow.email,
    phone: dbRow.phone,
    alternatePhone: dbRow.alternate_phone,
    physicalAddress: dbRow.physical_address,
    postalAddress: dbRow.postal_address,
    city: dbRow.city,
    province: dbRow.province,
    postalCode: dbRow.postal_code,
    businessType: dbRow.business_type,
    industryCategory: dbRow.industry_category,
    yearsInBusiness: dbRow.years_in_business,
    employeeCount: dbRow.employee_count,
    annualTurnover: dbRow.annual_turnover ? parseFloat(dbRow.annual_turnover) : null,
    creditRating: dbRow.credit_rating,
    paymentTerms: dbRow.payment_terms,
    bankName: dbRow.bank_name,
    accountNumber: dbRow.account_number,
    branchCode: dbRow.branch_code,
    status: dbRow.status,
    isActive: dbRow.is_active,
    complianceStatus: dbRow.compliance_status,
    ragOverall: dbRow.rag_overall,
    ragFinancial: dbRow.rag_financial,
    ragCompliance: dbRow.rag_compliance,
    ragPerformance: dbRow.rag_performance,
    ragSafety: dbRow.rag_safety,
    performanceScore: dbRow.performance_score ? parseFloat(dbRow.performance_score) : null,
    safetyScore: dbRow.safety_score ? parseFloat(dbRow.safety_score) : null,
    qualityScore: dbRow.quality_score ? parseFloat(dbRow.quality_score) : null,
    timelinessScore: dbRow.timeliness_score ? parseFloat(dbRow.timeliness_score) : null,
    totalProjects: dbRow.total_projects || 0,
    completedProjects: dbRow.completed_projects || 0,
    activeProjects: dbRow.active_projects || 0,
    cancelledProjects: dbRow.cancelled_projects || 0,
    onboardingProgress: dbRow.onboarding_progress || 0,
    onboardingCompletedAt: dbRow.onboarding_completed_at,
    documentsExpiring: dbRow.documents_expiring || 0,
    notes: dbRow.notes,
    tags: dbRow.tags || [],
    lastActivity: dbRow.last_activity,
    nextReviewDate: dbRow.next_review_date,
    createdBy: dbRow.created_by,
    updatedBy: dbRow.updated_by,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
};

// 🟢 WORKING: Field mapping from API request to database columns
const mapContractorToDb = (apiData) => {
  return {
    company_name: apiData.companyName,
    registration_number: apiData.registrationNumber,
    contact_person: apiData.contactPerson,
    email: apiData.email,
    phone: apiData.phone || null,
    alternate_phone: apiData.alternatePhone || null,
    physical_address: apiData.physicalAddress || null,
    postal_address: apiData.postalAddress || null,
    city: apiData.city || null,
    province: apiData.province || null,
    postal_code: apiData.postalCode || null,
    business_type: apiData.businessType || null,
    industry_category: apiData.industryCategory || null,
    years_in_business: apiData.yearsInBusiness || null,
    employee_count: apiData.employeeCount || null,
    annual_turnover: apiData.annualTurnover || null,
    credit_rating: apiData.creditRating || null,
    payment_terms: apiData.paymentTerms || null,
    bank_name: apiData.bankName || null,
    account_number: apiData.accountNumber || null,
    branch_code: apiData.branchCode || null,
    status: apiData.status || 'pending',
    compliance_status: apiData.complianceStatus || 'pending',
    notes: apiData.notes || null,
    tags: apiData.tags || []
  };
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetContractors(req, res);
      case 'POST':
        return await handleCreateContractor(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetContractors(req, res) {
  try {
    const { status, complianceStatus, ragOverall, teamId, search, isActive } = req.query;
    
    let query = `
      SELECT * FROM contractors 
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (complianceStatus) {
      query += ` AND compliance_status = $${paramIndex}`;
      params.push(complianceStatus);
      paramIndex++;
    }

    if (ragOverall) {
      query += ` AND rag_overall = $${paramIndex}`;
      params.push(ragOverall);
      paramIndex++;
    }

    if (teamId) {
      query += ` AND EXISTS (
        SELECT 1 FROM contractor_teams 
        WHERE contractor_teams.contractor_id = contractors.id 
        AND contractor_teams.team_id = $${paramIndex}
      )`;
      params.push(teamId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        LOWER(company_name) LIKE LOWER($${paramIndex}) 
        OR LOWER(contact_person) LIKE LOWER($${paramIndex})
        OR LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    // 🟢 WORKING: Use template literals for dynamic queries
    let result;
    if (params.length === 0) {
      result = await sql`SELECT * FROM contractors WHERE 1=1 ORDER BY created_at DESC`;
    } else {
      // Build dynamic query using template literals
      const baseQuery = 'SELECT * FROM contractors WHERE 1=1';
      let dynamicQuery = baseQuery;
      let paramValues = [];
      paramIndex = 1;
      
      if (status) {
        dynamicQuery += ` AND status = $${paramIndex}`;
        paramValues.push(status);
        paramIndex++;
      }
      
      if (complianceStatus) {
        dynamicQuery += ` AND compliance_status = $${paramIndex}`;
        paramValues.push(complianceStatus);
        paramIndex++;
      }
      
      if (ragOverall) {
        dynamicQuery += ` AND rag_overall = $${paramIndex}`;
        paramValues.push(ragOverall);
        paramIndex++;
      }
      
      if (search) {
        dynamicQuery += ` AND (LOWER(company_name) LIKE LOWER($${paramIndex}) OR LOWER(contact_person) LIKE LOWER($${paramIndex}) OR LOWER(email) LIKE LOWER($${paramIndex}))`;
        paramValues.push(`%${search}%`);
        paramIndex++;
      }
      
      if (isActive !== undefined) {
        dynamicQuery += ` AND is_active = $${paramIndex}`;
        paramValues.push(isActive === 'true');
        paramIndex++;
      }
      
      dynamicQuery += ` ORDER BY created_at DESC`;
      result = await sql.query(dynamicQuery, paramValues);
    }

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM contractors WHERE 1=1
    `;
    
    // Apply the same filters for count
    const countParams = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (complianceStatus) {
      countQuery += ` AND compliance_status = $${countParamIndex}`;
      countParams.push(complianceStatus);
      countParamIndex++;
    }

    if (ragOverall) {
      countQuery += ` AND rag_overall = $${countParamIndex}`;
      countParams.push(ragOverall);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (
        LOWER(company_name) LIKE LOWER($${countParamIndex}) 
        OR LOWER(contact_person) LIKE LOWER($${countParamIndex})
        OR LOWER(email) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (isActive !== undefined) {
      countQuery += ` AND is_active = $${countParamIndex}`;
      countParams.push(isActive === 'true');
      countParamIndex++;
    }

    // 🟢 WORKING: Use template literals for count query
    let countResult;
    if (countParams.length === 0) {
      countResult = await sql`SELECT COUNT(*) as total FROM contractors WHERE 1=1`;
    } else {
      // Build dynamic count query
      let dynamicCountQuery = 'SELECT COUNT(*) as total FROM contractors WHERE 1=1';
      let countValues = [];
      countParamIndex = 1;
      
      if (status) {
        dynamicCountQuery += ` AND status = $${countParamIndex}`;
        countValues.push(status);
        countParamIndex++;
      }
      
      if (complianceStatus) {
        dynamicCountQuery += ` AND compliance_status = $${countParamIndex}`;
        countValues.push(complianceStatus);
        countParamIndex++;
      }
      
      if (ragOverall) {
        dynamicCountQuery += ` AND rag_overall = $${countParamIndex}`;
        countValues.push(ragOverall);
        countParamIndex++;
      }
      
      if (search) {
        dynamicCountQuery += ` AND (LOWER(company_name) LIKE LOWER($${countParamIndex}) OR LOWER(contact_person) LIKE LOWER($${countParamIndex}) OR LOWER(email) LIKE LOWER($${countParamIndex}))`;
        countValues.push(`%${search}%`);
        countParamIndex++;
      }
      
      if (isActive !== undefined) {
        dynamicCountQuery += ` AND is_active = $${countParamIndex}`;
        countValues.push(isActive === 'true');
        countParamIndex++;
      }
      
      countResult = await sql.query(dynamicCountQuery, countValues);
    }

    // 🟢 WORKING: Map database results to API format
    const mappedData = result.map(mapContractorFromDb);
    
    return res.status(200).json({ 
      success: true, 
      data: mappedData,
      total: parseInt(countResult[0]?.total || 0)
    });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleCreateContractor(req, res) {
  try {
    // 🟢 WORKING: Validate required fields using current schema
    const { companyName, contactPerson, email, registrationNumber } = req.body;
    
    if (!companyName || !contactPerson || !email || !registrationNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Company name, contact person, email, and registration number are required' 
      });
    }

    // 🟢 WORKING: Map API data to database format
    const dbData = mapContractorToDb(req.body);
    
    // 🟢 WORKING: Insert using correct schema
    const result = await sql`
      INSERT INTO contractors (
        company_name, registration_number, contact_person, email, phone, alternate_phone,
        physical_address, postal_address, city, province, postal_code,
        business_type, industry_category, years_in_business, employee_count,
        annual_turnover, credit_rating, payment_terms, bank_name, account_number, branch_code,
        status, is_active, compliance_status, notes, tags,
        created_at, updated_at
      )
      VALUES (
        ${dbData.company_name}, ${dbData.registration_number}, ${dbData.contact_person}, 
        ${dbData.email}, ${dbData.phone}, ${dbData.alternate_phone},
        ${dbData.physical_address}, ${dbData.postal_address}, ${dbData.city}, 
        ${dbData.province}, ${dbData.postal_code},
        ${dbData.business_type}, ${dbData.industry_category}, ${dbData.years_in_business}, 
        ${dbData.employee_count}, ${dbData.annual_turnover}, ${dbData.credit_rating}, 
        ${dbData.payment_terms}, ${dbData.bank_name}, ${dbData.account_number}, ${dbData.branch_code},
        ${dbData.status}, true, ${dbData.compliance_status}, ${dbData.notes}, ${JSON.stringify(dbData.tags)},
        NOW(), NOW()
      )
      RETURNING *
    `;

    // 🟢 WORKING: Map database result back to API format
    const mappedResult = mapContractorFromDb(result[0]);
    
    return res.status(201).json({ 
      success: true, 
      data: mappedResult 
    });
  } catch (error) {
    console.error('Error creating contractor:', error);
    
    // 🟢 WORKING: Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint?.includes('registration_number')) {
        return res.status(409).json({ 
          success: false, 
          error: 'A contractor with this registration number already exists' 
        });
      }
      if (error.constraint?.includes('email')) {
        return res.status(409).json({ 
          success: false, 
          error: 'A contractor with this email already exists' 
        });
      }
      return res.status(409).json({ 
        success: false, 
        error: 'A contractor with this information already exists' 
      });
    }
    
    return res.status(500).json({ success: false, error: error.message });
  }
}