import express from 'express';
import { body, query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all leads with pagination and filters
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation errors', errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause and params for filters
    let whereConditions = ['user_id = $1'];
    let params = [req.user.id];
    let paramCount = 1;

    // Dynamic filters
    const filters = req.query;
    const filterableFields = {
      first_name: 'string',
      last_name: 'string',
      email: 'string',
      phone: 'string',
      company: 'string',
      city: 'string',
      state: 'string',
      source: 'enum',
      status: 'enum',
      score: 'number',
      lead_value: 'number',
      is_qualified: 'boolean'
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (filterableFields[key] && value !== undefined && value !== '') {
        paramCount++;
        
        if (filterableFields[key] === 'string') {
          if (key.endsWith('_contains')) {
            const fieldName = key.replace('_contains', '');
            whereConditions.push(`${fieldName} ILIKE $${paramCount}`);
            params.push(`%${value}%`);
          } else {
            whereConditions.push(`${key} = $${paramCount}`);
            params.push(value);
          }
        } else if (filterableFields[key] === 'enum') {
          if (Array.isArray(value)) {
            whereConditions.push(`${key} = ANY($${paramCount})`);
            params.push(value);
          } else {
            whereConditions.push(`${key} = $${paramCount}`);
            params.push(value);
          }
        } else if (filterableFields[key] === 'number') {
          if (key.endsWith('_gt')) {
            const fieldName = key.replace('_gt', '');
            whereConditions.push(`${fieldName} > $${paramCount}`);
            params.push(parseFloat(value));
          } else if (key.endsWith('_lt')) {
            const fieldName = key.replace('_lt', '');
            whereConditions.push(`${fieldName} < $${paramCount}`);
            params.push(parseFloat(value));
          } else {
            whereConditions.push(`${key} = $${paramCount}`);
            params.push(parseFloat(value));
          }
        } else if (filterableFields[key] === 'boolean') {
          whereConditions.push(`${key} = $${paramCount}`);
          params.push(value === 'true');
        }
      }
    });

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM leads WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get leads
    const leadsQuery = `
      SELECT * FROM leads 
      WHERE ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    params.push(limit, offset);

    const leadsResult = await pool.query(leadsQuery, params);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: leadsResult.rows,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single lead
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create lead
router.post('/', authenticateToken, [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('leadValue').optional().isFloat({ min: 0 }),
  body('isQualified').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation errors', errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      city,
      state,
      source,
      status = 'new',
      score = 0,
      leadValue = 0,
      isQualified = false
    } = req.body;

    // Check if email already exists
    const existingLead = await pool.query('SELECT id FROM leads WHERE email = $1', [email]);
    if (existingLead.rows.length > 0) {
      return res.status(409).json({ message: 'Lead with this email already exists' });
    }

    const result = await pool.query(`
      INSERT INTO leads (
        user_id, first_name, last_name, email, phone, company, city, state,
        source, status, score, lead_value, is_qualified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      req.user.id, firstName, lastName, email, phone, company, city, state,
      source, status, score, leadValue, isQualified
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update lead
router.put('/:id', authenticateToken, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').optional().isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('leadValue').optional().isFloat({ min: 0 }),
  body('isQualified').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation errors', errors: errors.array() });
    }

    // Check if lead exists and belongs to user
    const existingLead = await pool.query(
      'SELECT id FROM leads WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existingLead.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if email is unique (if being updated)
    if (req.body.email) {
      const emailCheck = await pool.query(
        'SELECT id FROM leads WHERE email = $1 AND id != $2',
        [req.body.email, req.params.id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Lead with this email already exists' });
      }
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      company: 'company',
      city: 'city',
      state: 'state',
      source: 'source',
      status: 'status',
      score: 'score',
      leadValue: 'lead_value',
      isQualified: 'is_qualified'
    };

    Object.entries(req.body).forEach(([key, value]) => {
      if (fieldMap[key] && value !== undefined) {
        paramCount++;
        updateFields.push(`${fieldMap[key]} = $${paramCount}`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    // Add last_activity_at
    paramCount++;
    updateFields.push(`last_activity_at = $${paramCount}`);
    updateValues.push(new Date());

    // Add WHERE clause parameters
    paramCount++;
    updateValues.push(req.params.id);
    paramCount++;
    updateValues.push(req.user.id);

    const updateQuery = `
      UPDATE leads 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete lead
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM leads WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;