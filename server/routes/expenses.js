const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('./middleware');

// Apply protection to all routes below
router.use(protect);

// GET /api/expenses - Get all expenses with optional filters
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { category, month, startDate, endDate } = req.query;

        // Build query filter
        let filter = { userId: req.user._id };

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (month) {
            // Month format: YYYY-MM
            const [year, monthNum] = month.split('-');
            const startOfMonth = new Date(year, monthNum - 1, 1);
            const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);
            filter.date = { $gte: startOfMonth, $lte: endOfMonth };
        } else if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const expenses = await Expense.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .lean();

        res.json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
});

// GET /api/expenses/stats/monthly - Get monthly statistics
router.get('/stats/monthly', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month parameter is required (format: YYYY-MM)'
            });
        }

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const [year, monthNum] = month.split('-');
        const startOfMonth = new Date(year, monthNum - 1, 1);
        const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

        const expenses = await Expense.find({
            userId: req.user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        // Calculate totals by category
        const categoryTotals = {
            Food: 0,
            Travel: 0,
            Shopping: 0,
            Bills: 0,
            Others: 0
        };

        let total = 0;

        expenses.forEach(expense => {
            if (categoryTotals.hasOwnProperty(expense.category)) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals.Others += expense.amount; // Fallback for uncategorized or new categories
            }
            total += expense.amount;
        });

        res.json({
            success: true,
            data: {
                month,
                total,
                categoryTotals,
                expenseCount: expenses.length
            }
        });
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly statistics',
            error: error.message
        });
    }
});

// GET /api/expenses/:id - Get single expense for the current user
router.get('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id // Ensure expense belongs to the current user
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found or unauthorized'
            });
        }

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
});

// POST /api/expenses - Create new expense for the current user
router.post('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { amount, category, date, notes } = req.body;

        // Validate required fields
        if (!amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: 'Amount, category, and date are required'
            });
        }

        const expense = await Expense.create({
            amount,
            category,
            date,
            notes: notes || '',
            userId: req.user._id // Explicitly use _id
        });

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error) {
        console.error('Error creating expense ERROR:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message // Keep for debugging
        });
    }
});

// PUT /api/expenses/:id - Update expense for the current user
router.put('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { amount, category, date, notes } = req.body;

        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id }, // Find by ID and user ID
            { amount, category, date, notes },
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('Error updating expense:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Expense deleted successfully',
            data: expense
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
});

module.exports = router;
