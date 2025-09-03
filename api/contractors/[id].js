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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Contractor ID required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetContractor(req, res, id);
      case 'PUT':
        return await handleUpdateContractor(req, res, id);
      case 'DELETE':
        return await handleDeleteContractor(req, res, id);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetContractor(req, res, id) {
  try {
    const result = await sql`
      SELECT * FROM contractors 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    // Get associated teams
    const teams = await sql`
      SELECT t.* FROM teams t
      INNER JOIN contractor_teams ct ON t.id = ct.team_id
      WHERE ct.contractor_id = ${id}
    `;

    // Get documents count
    const documents = await sql`
      SELECT COUNT(*) as count, document_type
      FROM contractor_documents
      WHERE contractor_id = ${id}
      GROUP BY document_type
    `;

    // Get project statistics
    const projectStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_projects,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
        COUNT(*) as total_projects
      FROM project_assignments
      WHERE contractor_id = ${id}
    `;

    // 🟢 WORKING: Map database result to API format
    const mappedContractor = mapContractorFromDb(result[0]);
    
    const contractor = {
      ...mappedContractor,
      teams: teams,
      documents: documents,
      projectStats: projectStats[0] || { active_projects: 0, completed_projects: 0, total_projects: 0 }
    };

    return res.status(200).json({ 
      success: true, 
      data: contractor 
    });
  } catch (error) {
    console.error('Error fetching contractor:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateContractor(req, res, id) {
  try {
    // 🟢 WORKING: Extract fields using current schema field names
    const {
      companyName,
      registrationNumber,
      contactPerson,
      email,
      phone,
      alternatePhone,
      physicalAddress,
      postalAddress,
      city,
      province,
      postalCode,
      businessType,
      industryCategory,
      yearsInBusiness,
      employeeCount,
      annualTurnover,
      creditRating,
      paymentTerms,
      bankName,
      accountNumber,
      branchCode,
      status,
      complianceStatus,
      ragOverall,
      ragFinancial,
      ragCompliance,
      ragPerformance,
      ragSafety,
      performanceScore,
      safetyScore,
      qualityScore,
      timelinessScore,
      notes,
      tags
    } = req.body;

    // 🟢 WORKING: Build dynamic update query with correct field names
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (companyName !== undefined) {
      updates.push(`company_name = $${valueIndex}`);
      values.push(companyName);
      valueIndex++;
    }

    if (registrationNumber !== undefined) {
      updates.push(`registration_number = $${valueIndex}`);
      values.push(registrationNumber);
      valueIndex++;
    }

    if (contactPerson !== undefined) {
      updates.push(`contact_person = $${valueIndex}`);
      values.push(contactPerson);
      valueIndex++;
    }

    if (email !== undefined) {
      updates.push(`email = $${valueIndex}`);
      values.push(email);
      valueIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${valueIndex}`);
      values.push(phone);
      valueIndex++;
    }

    if (alternatePhone !== undefined) {
      updates.push(`alternate_phone = $${valueIndex}`);
      values.push(alternatePhone);
      valueIndex++;
    }

    if (physicalAddress !== undefined) {
      updates.push(`physical_address = $${valueIndex}`);
      values.push(physicalAddress);
      valueIndex++;
    }

    if (postalAddress !== undefined) {
      updates.push(`postal_address = $${valueIndex}`);
      values.push(postalAddress);
      valueIndex++;
    }

    if (city !== undefined) {
      updates.push(`city = $${valueIndex}`);
      values.push(city);
      valueIndex++;
    }

    if (province !== undefined) {
      updates.push(`province = $${valueIndex}`);
      values.push(province);
      valueIndex++;
    }

    if (postalCode !== undefined) {
      updates.push(`postal_code = $${valueIndex}`);
      values.push(postalCode);
      valueIndex++;
    }

    if (businessType !== undefined) {
      updates.push(`business_type = $${valueIndex}`);
      values.push(businessType);
      valueIndex++;
    }

    if (industryCategory !== undefined) {
      updates.push(`industry_category = $${valueIndex}`);
      values.push(industryCategory);
      valueIndex++;
    }

    if (yearsInBusiness !== undefined) {
      updates.push(`years_in_business = $${valueIndex}`);
      values.push(yearsInBusiness);
      valueIndex++;
    }

    if (employeeCount !== undefined) {
      updates.push(`employee_count = $${valueIndex}`);
      values.push(employeeCount);
      valueIndex++;
    }

    if (annualTurnover !== undefined) {
      updates.push(`annual_turnover = $${valueIndex}`);
      values.push(annualTurnover);
      valueIndex++;
    }

    if (creditRating !== undefined) {
      updates.push(`credit_rating = $${valueIndex}`);
      values.push(creditRating);
      valueIndex++;
    }

    if (paymentTerms !== undefined) {
      updates.push(`payment_terms = $${valueIndex}`);
      values.push(paymentTerms);
      valueIndex++;
    }

    if (bankName !== undefined) {
      updates.push(`bank_name = $${valueIndex}`);
      values.push(bankName);
      valueIndex++;
    }

    if (accountNumber !== undefined) {
      updates.push(`account_number = $${valueIndex}`);
      values.push(accountNumber);
      valueIndex++;
    }

    if (branchCode !== undefined) {
      updates.push(`branch_code = $${valueIndex}`);
      values.push(branchCode);
      valueIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${valueIndex}`);
      values.push(status);
      valueIndex++;
    }

    if (complianceStatus !== undefined) {
      updates.push(`compliance_status = $${valueIndex}`);
      values.push(complianceStatus);
      valueIndex++;
    }

    if (ragOverall !== undefined) {
      updates.push(`rag_overall = $${valueIndex}`);
      values.push(ragOverall);
      valueIndex++;
    }

    if (ragFinancial !== undefined) {
      updates.push(`rag_financial = $${valueIndex}`);
      values.push(ragFinancial);
      valueIndex++;
    }

    if (ragCompliance !== undefined) {
      updates.push(`rag_compliance = $${valueIndex}`);
      values.push(ragCompliance);
      valueIndex++;
    }

    if (ragPerformance !== undefined) {
      updates.push(`rag_performance = $${valueIndex}`);
      values.push(ragPerformance);
      valueIndex++;
    }

    if (ragSafety !== undefined) {
      updates.push(`rag_safety = $${valueIndex}`);
      values.push(ragSafety);
      valueIndex++;
    }

    if (performanceScore !== undefined) {
      updates.push(`performance_score = $${valueIndex}`);
      values.push(performanceScore);
      valueIndex++;
    }

    if (safetyScore !== undefined) {
      updates.push(`safety_score = $${valueIndex}`);
      values.push(safetyScore);
      valueIndex++;
    }

    if (qualityScore !== undefined) {
      updates.push(`quality_score = $${valueIndex}`);
      values.push(qualityScore);
      valueIndex++;
    }

    if (timelinessScore !== undefined) {
      updates.push(`timeliness_score = $${valueIndex}`);
      values.push(timelinessScore);
      valueIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${valueIndex}`);
      values.push(notes);
      valueIndex++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${valueIndex}`);
      values.push(JSON.stringify(tags));
      valueIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    // Add the ID as the last parameter
    values.push(id);

    const query = `
      UPDATE contractors 
      SET ${updates.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    // 🟢 WORKING: Use sql.query for parameterized queries
    const result = await sql.query(query, values);

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    // 🟢 WORKING: Map database result to API format
    const mappedResult = mapContractorFromDb(result[0]);
    
    return res.status(200).json({ 
      success: true, 
      data: mappedResult 
    });
  } catch (error) {
    console.error('Error updating contractor:', error);
    
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

async function handleDeleteContractor(req, res, id) {
  try {
    const { hard = false } = req.query;

    if (hard === 'true') {
      // Hard delete - permanently remove from database
      const result = await sql`
        DELETE FROM contractors 
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Contractor not found' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Contractor permanently deleted' 
      });
    } else {
      // Soft delete - mark as inactive
      const result = await sql`
        UPDATE contractors 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Contractor not found' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Contractor deactivated' 
      });
    }
  } catch (error) {
    console.error('Error deleting contractor:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}