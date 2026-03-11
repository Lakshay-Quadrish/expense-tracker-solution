// API Configuration
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.hostname.startsWith('192.168.');
const API_BASE_URL = isProduction
    ? '/api'
    : (isMobile ? 'http://192.168.1.4:3000/api' : 'http://localhost:3000/api');

// API Client for Expense Tracker
const API = {
    // Helper to get headers with Auth token
    getHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Authentication
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
            }
            return result;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async signup(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
            }
            return result;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    async googleAuth(googleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleData)
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
            }
            return result;
        } catch (error) {
            console.error('Google Auth error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    },

    // Expenses
    async getExpenses(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.category && filters.category !== 'All') params.append('category', filters.category);
            if (filters.month) params.append('month', filters.month);

            const url = `${API_BASE_URL}/expenses${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                this.logout();
                return [];
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    async createExpense(expenseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(expenseData)
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMsg = result.error ? `${result.message}: ${result.error}` : result.message;
                throw new Error(errorMsg || 'Failed to create expense');
            }
            return result.data;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    async deleteExpense(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMsg = result.error ? `${result.message}: ${result.error}` : result.message;
                throw new Error(errorMsg || 'Failed to delete expense');
            }
            return result.data;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    // Check if API is available
    async checkConnection() {
        try {
            // Use relative path for production health check
            const response = await fetch(isProduction ? '/api' : 'http://localhost:3000/');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};
