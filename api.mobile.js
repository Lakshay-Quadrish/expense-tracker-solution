// API Configuration for Mobile Access
// Use this configuration when accessing from your phone
const API_BASE_URL = 'http://192.168.1.6:3000/api';

// API Client for Expense Tracker
const API = {
    // Get all expenses with optional filters
    async getExpenses(filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.category && filters.category !== 'All') {
                params.append('category', filters.category);
            }

            if (filters.month) {
                params.append('month', filters.month);
            }

            const url = `${API_BASE_URL}/expenses${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    // Get single expense by ID
    async getExpense(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching expense:', error);
            throw error;
        }
    },

    // Create new expense
    async createExpense(expenseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    // Update existing expense
    async updateExpense(id, expenseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    // Delete expense
    async deleteExpense(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    // Get monthly statistics
    async getMonthlyStats(month) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/stats/monthly?month=${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            throw error;
        }
    },

    // Check if API is available
    async checkConnection() {
        try {
            const response = await fetch('http://192.168.1.6:3000/');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};
