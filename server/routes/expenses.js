const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET /api/expenses - Get all expenses with optional filters
router.get('/', async (req, res) => {
    try {
        const { category, month, startDate, endDate } = req.query;

        // Build query filter
        let filter = {};

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

        const [year, monthNum] = month.split('-');
        const startOfMonth = new Date(year, monthNum - 1, 1);
        const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

        const expenses = await Expense.find({
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
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user.id // Ensure expense belongs to the current user
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
            userId: req.user.id // Associate expense with the current user
        });

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error) {
        console.error('Error creating expense:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
});

// PUT /api/expenses/:id - Update expense for the current user
router.put('/:id', async (req, res) => {
    try {
        const { amount, category, date, notes } = req.body;

        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // Find by ID and user ID
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
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
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
