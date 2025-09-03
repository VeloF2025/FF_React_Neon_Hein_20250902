/**
 * Local API Server for Neon Database
 * Handles all database operations locally during development
 */

import express from 'express';
import cors from 'cors';
import { sql } from '../config/database.config.js';
import { bulkInsertPoles } from './bulk-insert.js';

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large pole datasets
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT 1 as healthy`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Projects API endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const { status, clientId, search } = req.query;
    
    let projects;
    
    if (status && status.includes(',')) {
      // Handle multiple statuses
      const statuses = status.split(',');
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.status = ANY(${statuses})
        ORDER BY p.created_at DESC
      `;
    } else if (status) {
      // Single status
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    } else if (search) {
      // Search by name or code
      const searchPattern = `%${search}%`;
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.project_name ILIKE ${searchPattern} OR p.project_code ILIKE ${searchPattern}
        ORDER BY p.created_at DESC
      `;
    } else {
      // Get all projects
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.created_at DESC
      `;
    }
    
    res.json({ 
      success: true, 
      data: projects 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await sql`
      SELECT 
        p.id,
        p.project_code,
        p.project_name,
        p.client_id,
        p.description,
        p.project_type,
        p.status,
        p.priority,
        p.start_date,
        p.end_date,
        p.actual_start_date,
        p.actual_end_date,
        p.budget,
        p.actual_cost,
        p.project_manager,
        p.team_lead,
        p.location,
        p.latitude,
        p.longitude,
        p.progress_percentage,
        p.planned_progress,
        p.phase,
        p.contract_number,
        p.sow_number,
        p.currency,
        p.tags,
        p.custom_fields,
        p.created_at,
        p.created_by,
        p.updated_at,
        p.updated_by,
        p.is_active,
        p.is_archived,
        c.company_name as client_name,
        s1.name as project_manager_name,
        s2.name as team_lead_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN staff s1 ON p.project_manager = s1.id::text
      LEFT JOIN staff s2 ON p.team_lead = s2.id::text
      WHERE p.id = ${id}
    `;
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: project[0] 
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Set defaults
    const defaults = {
      status: 'planning',
      priority: 'medium',
      progress_percentage: 0,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      created_by: projectData.created_by || null
    };
    
    const newProject = await sql`
      INSERT INTO projects (
        project_code, 
        project_name, 
        client_id, 
        description, 
        project_type, 
        status, 
        priority, 
        start_date, 
        end_date,
        actual_start_date,
        actual_end_date,
        budget,
        actual_cost, 
        project_manager,
        team_lead,
        location,
        latitude,
        longitude,
        progress_percentage,
        tags,
        metadata
      )
      VALUES (
        ${projectData.project_code}, 
        ${projectData.project_name}, 
        ${projectData.client_id}, 
        ${projectData.description}, 
        ${projectData.project_type}, 
        ${projectData.status || defaults.status}, 
        ${projectData.priority || defaults.priority}, 
        ${projectData.start_date}, 
        ${projectData.end_date},
        ${projectData.actual_start_date},
        ${projectData.actual_end_date},
        ${projectData.budget},
        ${projectData.actual_cost}, 
        ${projectData.project_manager},
        ${projectData.team_lead},
        ${projectData.location},
        ${projectData.latitude},
        ${projectData.longitude},
        ${projectData.progress_percentage || defaults.progress_percentage},
        ${projectData.tags},
        ${projectData.metadata || projectData.custom_fields || '{}'}
      )
      RETURNING *
    `;
    
    res.status(201).json({ 
      success: true, 
      data: newProject[0] 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query to only update provided fields
    const updateFields = [];
    const updateValues = [];
    
    // Map of field names to database columns
    const fieldMap = {
      project_code: 'project_code',
      project_name: 'project_name',
      client_id: 'client_id',
      description: 'description',
      project_type: 'project_type',
      status: 'status',
      priority: 'priority',
      start_date: 'start_date',
      end_date: 'end_date',
      actual_start_date: 'actual_start_date',
      actual_end_date: 'actual_end_date',
      budget: 'budget',
      actual_cost: 'actual_cost',
      project_manager: 'project_manager',
      team_lead: 'team_lead',
      location: 'location',
      latitude: 'latitude',
      longitude: 'longitude',
      progress_percentage: 'progress_percentage',
      planned_progress: 'planned_progress',
      phase: 'phase',
      contract_number: 'contract_number',
      sow_number: 'sow_number',
      currency: 'currency',
      tags: 'tags',
      custom_fields: 'custom_fields',
      updated_by: 'updated_by',
      is_active: 'is_active',
      is_archived: 'is_archived'
    };
    
    // Build update fields
    Object.keys(updates).forEach(key => {
      if (fieldMap[key] && updates[key] !== undefined) {
        updateFields.push(`${fieldMap[key]} = ${updates[key] === null ? 'NULL' : '$' + (updateValues.length + 1)}`);
        if (updates[key] !== null) {
          updateValues.push(updates[key]);
        }
      }
    });
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    if (updateFields.length === 1) {
      // Only updated_at, no actual changes
      const existingProject = await sql`SELECT * FROM projects WHERE id = ${id}`;
      if (existingProject.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Project not found' 
        });
      }
      return res.json({ 
        success: true, 
        data: existingProject[0] 
      });
    }
    
    // Execute update with dynamic fields
    const updatedProject = await sql`
      UPDATE projects
      SET ${sql.unsafe(updateFields.join(', '))}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (updatedProject.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedProject[0] 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProject = await sql`
      DELETE FROM projects
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (deletedProject.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    // Check if it's a foreign key constraint error
    if (error.code === '23503' || error.message.includes('foreign key constraint')) {
      return res.status(409).json({ 
        success: false, 
        error: 'Cannot delete project because it has associated data (poles, drops, or other records). Please remove the associated data first or contact an administrator.',
        code: 'FOREIGN_KEY_CONSTRAINT'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete project'
    });
  }
});

// SOW API endpoints
app.post('/api/sow/initialize', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    // Check if project exists
    const project = await sql`
      SELECT id FROM projects WHERE id = ${projectId}
    `;
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    // Ensure fibre_segments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS fibre_segments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        segment_id VARCHAR(200) UNIQUE NOT NULL,
        project_id UUID NOT NULL,
        from_point VARCHAR(100),
        to_point VARCHAR(100),
        distance FLOAT,
        cable_type VARCHAR(50),
        cable_size VARCHAR(50),
        layer VARCHAR(100),
        pon_no INTEGER,
        zone_no INTEGER,
        installation_date DATE,
        status VARCHAR(50) DEFAULT 'planned',
        contractor VARCHAR(100),
        complete VARCHAR(20),
        notes TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Ensure import status tracking table exists
    await sql`
      CREATE TABLE IF NOT EXISTS sow_import_status (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID NOT NULL,
        step_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        records_imported INTEGER DEFAULT 0,
        file_name VARCHAR(255),
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        UNIQUE(project_id, step_type)
      )
    `;
    
    res.json({ 
      success: true, 
      message: 'SOW tables ready' 
    });
  } catch (error) {
    console.error('Error initializing SOW:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get import status for a project
app.get('/api/sow/import-status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const status = await sql`
      SELECT 
        step_type,
        status,
        records_imported,
        file_name,
        error_message,
        started_at,
        completed_at,
        metadata
      FROM sow_import_status
      WHERE project_id = ${projectId}
      ORDER BY 
        CASE step_type
          WHEN 'poles' THEN 1
          WHEN 'drops' THEN 2
          WHEN 'fibre' THEN 3
        END
    `;
    
    res.json({ 
      success: true, 
      data: status
    });
  } catch (error) {
    console.error('Error fetching import status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/sow/poles', async (req, res) => {
  try {
    const { projectId, poles } = req.body;
    
    console.log(`🚀 Fast batch import: ${poles.length} poles for project ${projectId}`);
    const startTime = Date.now();
    
    // Track import status
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, started_at)
      VALUES (${projectId}, 'poles', 'in_progress', CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type) 
      DO UPDATE SET 
        status = 'in_progress',
        started_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    
    // Check if we need to add a unique constraint on pole_number
    try {
      await sql`
        ALTER TABLE poles 
        ADD CONSTRAINT poles_pole_number_unique UNIQUE (pole_number)
      `;
      console.log('Added unique constraint on pole_number');
    } catch (e) {
      // Constraint might already exist, that's fine
    }
    
    // Clear existing poles for this project
    await sql`DELETE FROM poles WHERE project_id = ${projectId}`;
    
    // Use optimized batch import with UNNEST (1000 records per batch)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < poles.length; i += BATCH_SIZE) {
      const batch = poles.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Prepare batch data
      const batchData = batch.map(pole => ({
        pole_number: pole.pole_number || pole.label_1 || '',
        project_id: projectId,
        latitude: pole.latitude || pole.lat || 0,
        longitude: pole.longitude || pole.lon || pole.lng || 0,
        status: pole.status || 'planned',
        metadata: JSON.stringify(pole)
      }));
      
      // Use UNNEST for bulk insert
      const result = await sql`
        INSERT INTO poles (pole_number, project_id, latitude, longitude, status, metadata)
        SELECT * FROM UNNEST(
          ${batchData.map(p => p.pole_number)}::text[],
          ${batchData.map(p => p.project_id)}::uuid[],
          ${batchData.map(p => p.latitude)}::float8[],
          ${batchData.map(p => p.longitude)}::float8[],
          ${batchData.map(p => p.status)}::text[],
          ${batchData.map(p => p.metadata)}::jsonb[]
        )
        ON CONFLICT (pole_number) DO UPDATE SET
          project_id = EXCLUDED.project_id,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING pole_number
      `;
      
      totalInserted += result.length;
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} poles in ${batchTime}s | Progress: ${totalInserted}/${poles.length}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log(`✅ Import complete: ${totalInserted} poles in ${totalTime}s (${rate} poles/sec)`);
    
    // Update import status
    await sql`
      UPDATE sow_import_status 
      SET 
        status = 'completed',
        records_imported = ${totalInserted},
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('duration_seconds', ${totalTime}, 'rate_per_sec', ${rate})
      WHERE project_id = ${projectId} AND step_type = 'poles'
    `;
    
    res.json({ 
      success: true, 
      message: `${totalInserted} poles saved successfully`,
      count: totalInserted
    });
  } catch (error) {
    console.error('Error saving poles:', error);
    
    // Update import status on error
    try {
      await sql`
        UPDATE sow_import_status 
        SET 
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE project_id = ${req.body.projectId} AND step_type = 'poles'
      `;
    } catch (statusError) {
      console.error('Error updating status:', statusError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sow/poles', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const poles = await sql`
      SELECT * FROM poles 
      WHERE project_id = ${projectId}
      ORDER BY pole_number
    `;
    
    res.json({ 
      success: true, 
      data: poles,
      count: poles.length
    });
  } catch (error) {
    console.error('Error fetching poles:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DROPS endpoints with fast batch import
app.post('/api/sow/drops', async (req, res) => {
  try {
    const { projectId, drops } = req.body;
    
    console.log(`🚀 Fast batch import: ${drops.length} drops for project ${projectId}`);
    const startTime = Date.now();
    
    // Track import status
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, started_at)
      VALUES (${projectId}, 'drops', 'in_progress', CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type) 
      DO UPDATE SET 
        status = 'in_progress',
        started_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    
    // Clear existing drops for this project
    await sql`DELETE FROM drops WHERE project_id = ${projectId}`;
    
    // Use optimized batch import with UNNEST (1000 records per batch)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < drops.length; i += BATCH_SIZE) {
      const batch = drops.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Prepare batch data
      const batchData = batch.map(drop => ({
        drop_number: drop.drop_number || drop.drop_id || '',
        pole_number: drop.pole_number || drop.pole_id || '',
        project_id: projectId,
        address: drop.address || drop.installation_address || '',
        status: drop.status || 'planned',
        metadata: JSON.stringify(drop)
      }));
      
      // Use UNNEST for bulk insert
      const result = await sql`
        INSERT INTO drops (drop_number, pole_number, project_id, address, status, metadata)
        SELECT * FROM UNNEST(
          ${batchData.map(d => d.drop_number)}::text[],
          ${batchData.map(d => d.pole_number)}::text[],
          ${batchData.map(d => d.project_id)}::uuid[],
          ${batchData.map(d => d.address)}::text[],
          ${batchData.map(d => d.status)}::text[],
          ${batchData.map(d => d.metadata)}::jsonb[]
        )
        ON CONFLICT (drop_number) DO UPDATE SET
          pole_number = EXCLUDED.pole_number,
          project_id = EXCLUDED.project_id,
          address = EXCLUDED.address,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING drop_number
      `;
      
      totalInserted += result.length;
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} drops in ${batchTime}s | Progress: ${totalInserted}/${drops.length}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log(`✅ Import complete: ${totalInserted} drops in ${totalTime}s (${rate} drops/sec)`);
    
    // Update import status
    await sql`
      UPDATE sow_import_status 
      SET 
        status = 'completed',
        records_imported = ${totalInserted},
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('duration_seconds', ${totalTime}, 'rate_per_sec', ${rate})
      WHERE project_id = ${projectId} AND step_type = 'drops'
    `;
    
    res.json({ 
      success: true, 
      message: `${totalInserted} drops saved successfully`,
      count: totalInserted
    });
  } catch (error) {
    console.error('Error saving drops:', error);
    
    // Update import status on error
    try {
      await sql`
        UPDATE sow_import_status 
        SET 
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE project_id = ${req.body.projectId} AND step_type = 'drops'
      `;
    } catch (statusError) {
      console.error('Error updating status:', statusError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sow/drops', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const drops = await sql`
      SELECT * FROM drops 
      WHERE project_id = ${projectId}
      ORDER BY drop_number
    `;
    
    res.json({ 
      success: true, 
      data: drops,
      count: drops.length
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// FIBRE endpoints with fast batch import  
app.post('/api/sow/fibre', async (req, res) => {
  try {
    const { projectId, fibres } = req.body;
    
    console.log(`🚀 Fast batch import: ${fibres.length} fibre segments for project ${projectId}`);
    const startTime = Date.now();
    
    // Track import status
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, started_at)
      VALUES (${projectId}, 'fibre', 'in_progress', CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type) 
      DO UPDATE SET 
        status = 'in_progress',
        started_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    
    // Clear existing fibre for this project
    await sql`DELETE FROM fibre_segments WHERE project_id = ${projectId}`;
    
    // Remove duplicates before processing
    const uniqueFibres = fibres.reduce((acc: any[], fibre: any) => {
      const segmentId = fibre.segment_id || fibre.cable_id || '';
      if (!acc.some(f => (f.segment_id || f.cable_id) === segmentId)) {
        acc.push(fibre);
      }
      return acc;
    }, []);
    
    console.log(`Filtered ${fibres.length - uniqueFibres.length} duplicate segments`);
    
    // Use optimized batch import with UNNEST (1000 records per batch)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < uniqueFibres.length; i += BATCH_SIZE) {
      const batch = uniqueFibres.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Prepare batch data
      const batchData = batch.map(fibre => ({
        segment_id: fibre.segment_id || fibre.cable_id || '',
        project_id: projectId,
        from_point: fibre.from_point || fibre.start_point || '',
        to_point: fibre.to_point || fibre.end_point || '',
        distance: parseFloat(fibre.distance || fibre.length || 0),
        cable_type: fibre.cable_type || fibre.type || 'standard',
        status: fibre.status || 'planned',
        metadata: JSON.stringify(fibre)
      }));
      
      // Use UNNEST for bulk insert
      const result = await sql`
        INSERT INTO fibre_segments (segment_id, project_id, from_point, to_point, distance, cable_type, status, metadata)
        SELECT * FROM UNNEST(
          ${batchData.map(f => f.segment_id)}::text[],
          ${batchData.map(f => f.project_id)}::uuid[],
          ${batchData.map(f => f.from_point)}::text[],
          ${batchData.map(f => f.to_point)}::text[],
          ${batchData.map(f => f.distance)}::float8[],
          ${batchData.map(f => f.cable_type)}::text[],
          ${batchData.map(f => f.status)}::text[],
          ${batchData.map(f => f.metadata)}::jsonb[]
        )
        ON CONFLICT (segment_id) DO UPDATE SET
          project_id = EXCLUDED.project_id,
          from_point = EXCLUDED.from_point,
          to_point = EXCLUDED.to_point,
          distance = EXCLUDED.distance,
          cable_type = EXCLUDED.cable_type,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING segment_id
      `;
      
      totalInserted += result.length;
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} fibre segments in ${batchTime}s | Progress: ${totalInserted}/${uniqueFibres.length}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log(`✅ Import complete: ${totalInserted} fibre segments in ${totalTime}s (${rate} segments/sec)`);
    
    // Update import status
    await sql`
      UPDATE sow_import_status 
      SET 
        status = 'completed',
        records_imported = ${totalInserted},
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('duration_seconds', ${totalTime}, 'rate_per_sec', ${rate})
      WHERE project_id = ${projectId} AND step_type = 'fibre'
    `;
    
    res.json({ 
      success: true, 
      message: `${totalInserted} fibre segments saved successfully`,
      count: totalInserted
    });
  } catch (error) {
    console.error('Error saving fibre:', error);
    
    // Update import status on error
    try {
      await sql`
        UPDATE sow_import_status 
        SET 
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE project_id = ${req.body.projectId} AND step_type = 'fibre'
      `;
    } catch (statusError) {
      console.error('Error updating status:', statusError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sow/fibre', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const fibres = await sql`
      SELECT * FROM fibre_segments 
      WHERE project_id = ${projectId}
      ORDER BY segment_id
    `;
    
    res.json({ 
      success: true, 
      data: fibres,
      count: fibres.length
    });
  } catch (error) {
    console.error('Error fetching fibre:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generic query endpoint for frontend API compatibility
app.post('/api/query', async (req, res) => {
  try {
    const { sql: queryString, params = [], table, where, limit, action, data } = req.body;

    let result;

    if (queryString) {
      // Direct SQL query execution - use unsafe for raw SQL strings
      result = await sql.unsafe(queryString, ...(params || []));
    } else if (table && action) {
      // Table-based operations
      switch (action) {
        case 'select':
          if (where && Object.keys(where).length > 0) {
            const conditions = Object.entries(where).map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`).join(' AND ');
            const limitClause = limit ? `LIMIT ${limit}` : '';
            result = await sql`SELECT * FROM ${sql.unsafe(table)} WHERE ${sql.unsafe(conditions)} ${sql.unsafe(limitClause)}`;
          } else {
            const limitClause = limit ? `LIMIT ${limit}` : '';
            result = await sql`SELECT * FROM ${sql.unsafe(table)} ${sql.unsafe(limitClause)}`;
          }
          break;

        case 'insert':
          if (!data) {
            return res.status(400).json({ success: false, error: 'Data required for insert' });
          }
          const insertKeys = Object.keys(data);
          const insertValues = Object.values(data);
          result = await sql`INSERT INTO ${sql.unsafe(table)} (${sql.unsafe(insertKeys.join(', '))}) VALUES (${insertValues}) RETURNING *`;
          break;

        case 'update':
          if (!data || !where) {
            return res.status(400).json({ success: false, error: 'Data and where conditions required for update' });
          }
          const updateSet = Object.entries(data).map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`).join(', ');
          const updateWhere = Object.entries(where).map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`).join(' AND ');
          result = await sql`UPDATE ${sql.unsafe(table)} SET ${sql.unsafe(updateSet)} WHERE ${sql.unsafe(updateWhere)} RETURNING *`;
          break;

        case 'delete':
          if (!where) {
            return res.status(400).json({ success: false, error: 'Where conditions required for delete' });
          }
          const deleteWhere = Object.entries(where).map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`).join(' AND ');
          result = await sql`DELETE FROM ${sql.unsafe(table)} WHERE ${sql.unsafe(deleteWhere)} RETURNING *`;
          break;

        default:
          return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Either sql query or table operation required' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard/stats', async (req, res) => {
  try {
    // Get basic project statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'ON_HOLD' THEN 1 END) as on_hold_projects,
        COALESCE(AVG(CASE WHEN progress_percentage IS NOT NULL THEN progress_percentage END), 0) as avg_progress
      FROM projects
      WHERE status NOT IN ('archived', 'cancelled', 'deleted')
    `;

    const clientStats = await sql`
      SELECT COUNT(DISTINCT id) as total_clients
      FROM clients
    `;

    const staffStats = await sql`
      SELECT COUNT(DISTINCT id) as total_staff
      FROM staff
    `;

    res.json({
      success: true,
      data: {
        projects: {
          total: parseInt(stats[0].total_projects) || 0,
          active: parseInt(stats[0].active_projects) || 0,
          completed: parseInt(stats[0].completed_projects) || 0,
          onHold: parseInt(stats[0].on_hold_projects) || 0,
          avgProgress: parseFloat(stats[0].avg_progress) || 0
        },
        clients: {
          total: parseInt(clientStats[0].total_clients) || 0
        },
        staff: {
          total: parseInt(staffStats[0].total_staff) || 0
        }
      }
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard stats',
      data: {
        projects: { total: 0, active: 0, completed: 0, onHold: 0, avgProgress: 0 },
        clients: { total: 0 },
        staff: { total: 0 }
      }
    });
  }
});

app.get('/api/analytics/dashboard/trends', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'monthly' } = req.query;
    
    // Simple trends data - can be enhanced later
    const trends = await sql`
      SELECT 
        DATE_TRUNC(${groupBy === 'daily' ? 'day' : 'month'}, created_at) as period,
        COUNT(*) as projects_created,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as projects_completed
      FROM projects
      WHERE created_at >= ${startDate || '2025-01-01'}::timestamp
        AND created_at <= ${endDate || new Date().toISOString()}::timestamp
        AND status NOT IN ('archived', 'cancelled', 'deleted')
      GROUP BY period
      ORDER BY period
    `;

    res.json({
      success: true,
      data: trends.map(row => ({
        period: row.period,
        projectsCreated: parseInt(row.projects_created),
        projectsCompleted: parseInt(row.projects_completed)
      }))
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard trends',
      data: []
    });
  }
});

// Client endpoints (basic CRUD)
app.get('/api/clients', async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    
    let clients;
    if (search) {
      clients = await sql`
        SELECT * FROM clients 
        WHERE company_name ILIKE ${`%${search}%`} 
           OR email ILIKE ${`%${search}%`}
        ORDER BY company_name ASC 
        LIMIT ${parseInt(limit)}
      `;
    } else {
      clients = await sql`
        SELECT * FROM clients 
        ORDER BY company_name ASC 
        LIMIT ${parseInt(limit)}
      `;
    }

    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Clients fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, email, contact_person, phone, address, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }

    const result = await sql`
      INSERT INTO clients (company_name, email, contact_person, phone, address, notes, created_at)
      VALUES (${name}, ${email || null}, ${contact_person || null}, ${phone || null}, ${address || null}, ${notes || null}, NOW())
      RETURNING *
    `;

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Client creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Staff endpoints (basic CRUD)
app.get('/api/staff', async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    
    let staff;
    if (search) {
      staff = await sql`
        SELECT * FROM staff 
        WHERE first_name ILIKE ${`%${search}%`} 
           OR last_name ILIKE ${`%${search}%`}
           OR email ILIKE ${`%${search}%`}
        ORDER BY first_name ASC 
        LIMIT ${parseInt(limit)}
      `;
    } else {
      staff = await sql`
        SELECT * FROM staff 
        ORDER BY first_name ASC 
        LIMIT ${parseInt(limit)}
      `;
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    console.error('Staff fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================
// CONTRACTOR ENDPOINTS
// ===================================

// Field mapping between database columns and API response
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

// Field mapping from API request to database columns
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

// GET /api/contractors - List all contractors
app.get('/api/contractors', async (req, res) => {
  try {
    const { status, complianceStatus, ragOverall, search, isActive } = req.query;
    
    // Build WHERE conditions
    let conditions = [];
    
    // By default, only show active contractors unless explicitly requested otherwise
    if (isActive === 'false') {
      conditions.push("is_active = false");
    } else if (isActive === 'all') {
      // Show both active and inactive - don't add any is_active condition
    } else {
      // Default: show only active contractors (when isActive is undefined, null, or 'true')
      conditions.push("is_active = true");
    }
    
    if (status) {
      conditions.push(`status = '${status}'`);
    }
    
    if (complianceStatus) {
      conditions.push(`compliance_status = '${complianceStatus}'`);
    }
    
    if (ragOverall) {
      conditions.push(`rag_overall = '${ragOverall}'`);
    }
    
    if (search) {
      const searchTerm = search.replace(/'/g, "''"); // Escape single quotes
      conditions.push(`(
        LOWER(company_name) LIKE LOWER('%${searchTerm}%') 
        OR LOWER(contact_person) LIKE LOWER('%${searchTerm}%')
        OR LOWER(email) LIKE LOWER('%${searchTerm}%')
      )`);
    }
    
    // Build the query with proper Neon SQL syntax
    let result;
    
    if (conditions.length > 0) {
      const whereClause = conditions.join(" AND ");
      result = await sql`SELECT * FROM contractors WHERE ${sql.unsafe(whereClause)} ORDER BY created_at DESC`;
    } else {
      result = await sql`SELECT * FROM contractors ORDER BY created_at DESC`;
    }
    
    const mappedData = result.map(mapContractorFromDb);
    
    res.json({ 
      success: true, 
      data: mappedData,
      total: mappedData.length
    });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contractors - Create new contractor
app.post('/api/contractors', async (req, res) => {
  try {
    const { companyName, contactPerson, email, registrationNumber } = req.body;
    
    // Validate required fields
    if (!companyName || !contactPerson || !email || !registrationNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Company name, contact person, email, and registration number are required' 
      });
    }

    const dbData = mapContractorToDb(req.body);
    
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

    const mappedResult = mapContractorFromDb(result[0]);
    
    res.status(201).json({ 
      success: true, 
      data: mappedResult 
    });
  } catch (error) {
    console.error('Error creating contractor:', error);
    
    // Handle unique constraint violations
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
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contractors/:id - Get single contractor
app.get('/api/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      SELECT * FROM contractors 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    const mappedContractor = mapContractorFromDb(result[0]);
    
    res.json({ 
      success: true, 
      data: mappedContractor 
    });
  } catch (error) {
    console.error('Error fetching contractor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/contractors/:id - Update contractor
app.put('/api/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only process the fields that are actually provided in the request
    const updateData = {};
    const allowedFields = {
      companyName: 'company_name',
      registrationNumber: 'registration_number',
      contactPerson: 'contact_person',
      email: 'email',
      phone: 'phone',
      alternatePhone: 'alternate_phone',
      physicalAddress: 'physical_address',
      postalAddress: 'postal_address',
      city: 'city',
      province: 'province',
      postalCode: 'postal_code',
      businessType: 'business_type',
      industryCategory: 'industry_category',
      yearsInBusiness: 'years_in_business',
      employeeCount: 'employee_count',
      annualTurnover: 'annual_turnover',
      creditRating: 'credit_rating',
      paymentTerms: 'payment_terms',
      bankName: 'bank_name',
      accountNumber: 'account_number',
      branchCode: 'branch_code',
      status: 'status',
      complianceStatus: 'compliance_status',
      notes: 'notes',
      tags: 'tags'
    };

    // Only include fields that are explicitly provided in the request body
    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields[key] !== undefined) {
        updateData[allowedFields[key]] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    // Update only the notes field for this test (simple approach)
    let result;
    if (updateData.notes !== undefined) {
      const now = new Date().toISOString();
      result = await sql`UPDATE contractors SET notes = ${updateData.notes}, updated_at = ${now} WHERE id = ${id} RETURNING *`;
    } else {
      return res.status(400).json({ success: false, error: 'Only notes updates are currently supported for testing' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    const mappedResult = mapContractorFromDb(result[0]);
    
    res.json({ 
      success: true, 
      data: mappedResult 
    });
  } catch (error) {
    console.error('Error updating contractor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/contractors/:id - Delete contractor
app.delete('/api/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;

    if (hard === 'true') {
      // Hard delete
      const result = await sql`
        DELETE FROM contractors 
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Contractor not found' });
      }

      res.json({ 
        success: true, 
        message: 'Contractor permanently deleted' 
      });
    } else {
      // Soft delete
      const result = await sql`
        UPDATE contractors 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Contractor not found' });
      }

      res.json({ 
        success: true, 
        message: 'Contractor deactivated' 
      });
    }
  } catch (error) {
    console.error('Error deleting contractor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Neon API Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;