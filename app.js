document.addEventListener('DOMContentLoaded', async () => {
    // --- Helper Functions (Hoisted) ---
    function getCurrentMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    // State
    let expenses = [];
    let currentUser = JSON.parse(localStorage.getItem('user')) || null;
    let filter = {
        category: 'All',
        month: getCurrentMonth()
    };
    let isOnline = false;

    // DOM Elements - Auth
    const authSection = document.getElementById('auth-section');
    const mainApp = document.getElementById('main-app');
    const loginCard = document.getElementById('login-card');
    const signupCard = document.getElementById('signup-card');
    const forgotCard = document.getElementById('forgot-card');

    // DOM Elements - App
    const expenseList = document.getElementById('expense-list-v2');
    const emptyState = document.getElementById('empty-state');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const modal = document.getElementById('add-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const addExpenseForm = document.getElementById('add-expense-form');
    const filterCategory = document.getElementById('filter-category');
    const filterMonth = document.getElementById('filter-month');
    const displayMonthTotal = document.getElementById('month-total-display');
    const currentDateDisplay = document.getElementById('current-date-display');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    const greetingText = document.getElementById('greeting-text');

    // --- Authentication Logic ---
    function showApp() {
        if (authSection) authSection.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        document.body.style.alignItems = 'flex-start'; // Better for dashboard
    }

    function showAuth() {
        if (authSection) authSection.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
        document.body.style.alignItems = 'center'; // Better for centering login card
    }

    function updateUserUI() {
        if (currentUser) {
            if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
            if (userAvatar) userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            if (greetingText) greetingText.textContent = `Hello, ${currentUser.name.split(' ')[0]}!`;
        }
    }

    function setupAuthListeners() {
        console.log('Setting up Auth Listeners...');

        // Screen toggling
        const toSignupBtn = document.getElementById('to-signup');
        if (toSignupBtn) toSignupBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Toggling to Signup');
            if (loginCard) loginCard.classList.add('hidden');
            if (signupCard) signupCard.classList.remove('hidden');
            if (forgotCard) forgotCard.classList.add('hidden');
        };

        const toLoginBtn = document.getElementById('to-login');
        if (toLoginBtn) toLoginBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Toggling to Login');
            if (signupCard) signupCard.classList.add('hidden');
            if (loginCard) loginCard.classList.remove('hidden');
            if (forgotCard) forgotCard.classList.add('hidden');
        };

        const toForgotBtn = document.getElementById('to-forgot');
        if (toForgotBtn) toForgotBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Toggling to Forgot Password');
            if (loginCard) loginCard.classList.add('hidden');
            if (forgotCard) forgotCard.classList.remove('hidden');
            if (signupCard) signupCard.classList.add('hidden');
        };

        const backToLoginBtn = document.getElementById('back-to-login');
        if (backToLoginBtn) backToLoginBtn.onclick = (e) => {
            e.preventDefault();
            if (forgotCard) forgotCard.classList.add('hidden');
            if (loginCard) loginCard.classList.remove('hidden');
        };

        // Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                showLoading(true);
                const res = await API.login(email, password);
                if (res.success) {
                    currentUser = res.data.user;
                    showApp();
                    updateUserUI();
                    await loadExpenses();
                    showSuccess(`Welcome back, ${currentUser.name}!`);
                } else {
                    showError(res.message);
                }
            } catch (err) {
                showError('Login failed. Please check your connection.');
            } finally {
                showLoading(false);
            }
        };

        // Signup Form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            try {
                showLoading(true);
                const res = await API.signup({ name, email, password });
                if (res.success) {
                    currentUser = res.data.user;
                    showApp();
                    updateUserUI();
                    await loadExpenses();
                    showSuccess(`Account created! Welcome, ${currentUser.name}`);
                } else {
                    showError(res.message);
                }
            } catch (err) {
                showError('Signup failed. Email may already be in use.');
            } finally {
                showLoading(false);
            }
        };

        // Forgot Form
        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) forgotForm.onsubmit = (e) => {
            e.preventDefault();
            showSuccess('Reset link sent to your email!');
            if (forgotCard) forgotCard.classList.add('hidden');
            if (loginCard) loginCard.classList.remove('hidden');
        };

        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) googleBtn.onclick = async () => {
            showNotification('Connecting to Google...', 'info', 2000);
            setTimeout(async () => {
                try {
                    const res = await API.googleAuth({
                        name: 'Google User',
                        email: 'google@example.com',
                        googleId: 'g' + Date.now(),
                        avatar: 'https://i.pravatar.cc/150?u=google'
                    });
                    if (res.success) {
                        currentUser = res.data.user;
                        showApp();
                        updateUserUI();
                        await loadExpenses();
                        showSuccess('Signed in with Google!');
                    }
                } catch (err) {
                    showError('Google authentication failed.');
                }
            }, 1000);
        };
    }

    // --- Core Functions ---
    async function loadExpenses() {
        if (!currentUser) return;
        try {
            showLoading(true);
            expenses = await API.getExpenses(filter);
            render();
        } catch (err) {
            console.error('Error loading expenses:', err);
        } finally {
            showLoading(false);
        }
    }

    async function addExpense(e) {
        e.preventDefault();
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const notes = document.getElementById('notes').value;

        try {
            showLoading(true);
            await API.createExpense({ amount, category, date, notes });
            closeModal();
            addExpenseForm.reset();
            // Reset date to today
            document.getElementById('date').valueAsDate = new Date();
            await loadExpenses();
            showSuccess('Transaction added!');
        } catch (err) {
            showError(err.message);
        } finally {
            showLoading(false);
        }
    }

    async function deleteExpense(id) {
        if (!confirm('Delete this transaction?')) return;
        try {
            showLoading(true);
            await API.deleteExpense(id);
            await loadExpenses();
            showSuccess('Transaction deleted');
        } catch (err) {
            showError('Failed to delete transaction');
        } finally {
            showLoading(false);
        }
    }

    // --- UI Helpers ---
    function showLoading(show) {
        const loader = document.getElementById('loader');
        if (loader) {
            if (show) loader.classList.add('show');
            else loader.classList.remove('show');
        }
    }

    function showNotification(message, type = 'error', duration = 5000) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        // Styling for notification
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: '600',
            animation: 'slideUp 0.3s ease-forward'
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function showError(m) { showNotification(m, 'error'); }
    function showSuccess(m) { showNotification(m, 'success'); }

    // --- Rendering ---
    function render() {
        renderDashboard();
        renderExpenseList();
    }

    function renderDashboard() {
        if (!displayMonthTotal) return;

        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        displayMonthTotal.textContent = formatCurrency(total);

        // Group by category for summary list
        const summary = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});

        // Update small cards
        ['Food', 'Travel', 'Shopping', 'Bills'].forEach(cat => {
            const el = document.getElementById(`total-${cat.toLowerCase()}`);
            if (el) el.textContent = formatCurrency(summary[cat] || 0);
        });

        renderSummaryList(summary);
        updateChart(Object.keys(summary), Object.values(summary));
    }

    function renderSummaryList(summary) {
        const list = document.getElementById('category-summary-list');
        if (!list) return;
        list.innerHTML = '';

        const categories = Object.keys(summary);
        if (categories.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No data for this period.</p>';
            return;
        }

        categories.sort((a, b) => summary[b] - summary[a]).forEach(cat => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.innerHTML = `
                <span style="font-weight: 500;">${cat}</span>
                <span style="font-weight: 700;">${formatCurrency(summary[cat])}</span>
            `;
            list.appendChild(item);
        });
    }

    let expenseChart = null;
    function updateChart(labels, data) {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;

        if (expenseChart) expenseChart.destroy();

        expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Expenses',
                    data: data.length ? data : [0],
                    borderColor: 'rgba(255,255,255,0.8)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointBackgroundColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }

    function renderExpenseList() {
        if (!expenseList) return;
        expenseList.innerHTML = '';

        if (expenses.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        expenses.forEach(expense => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${new Date(expense.date).toLocaleDateString()}</td>
                <td><span class="cat-badge">${expense.category}</span></td>
                <td style="color: var(--text-secondary);">${expense.notes || '-'}</td>
                <td style="font-weight: 700; color: var(--text-primary);">${formatCurrency(expense.amount)}</td>
                <td style="text-align: right;">
                    <button class="btn btn-icon btn-delete" data-id="${expense._id}">
                        <i class="fa-solid fa-trash-can" style="font-size: 0.9rem;"></i>
                    </button>
                </td>
            `;
            expenseList.appendChild(tr);
        });
    }

    // --- Initialize ---
    async function init() {
        console.log('Initializing Application...');

        if (currentUser) {
            showApp();
            updateUserUI();
            await loadExpenses();
        } else {
            showAuth();
        }

        setupAuthListeners();

        // Check Connection
        isOnline = await API.checkConnection();
        if (!isOnline && currentUser) {
            showWarning('🔌 Offline mode. Data synced with local storage.');
        }

        // Set default dates
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
            dateInput.max = new Date().toISOString().split("T")[0];
        }
        if (filterMonth) filterMonth.value = getCurrentMonth();

        // Header Date
        if (currentDateDisplay) {
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            currentDateDisplay.textContent = `Today is ${new Date().toLocaleDateString(undefined, options)}`;
        }
    }

    // --- App Listeners ---
    if (addExpenseBtn) addExpenseBtn.onclick = () => modal.classList.remove('hidden');
    function closeModal() { if (modal) modal.classList.add('hidden'); }
    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    window.onclick = (e) => { if (e.target === modal) closeModal(); };
    if (addExpenseForm) addExpenseForm.onsubmit = addExpense;
    if (filterCategory) filterCategory.onchange = (e) => { filter.category = e.target.value; render(); };
    if (filterMonth) filterMonth.onchange = (e) => { filter.month = e.target.value; loadExpenses(); };
    if (logoutBtn) logoutBtn.onclick = () => API.logout();

    if (expenseList) expenseList.onclick = (e) => {
        const btn = e.target.closest('.btn-delete');
        if (btn) deleteExpense(btn.dataset.id);
    };

    // Sidebar Nav
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const section = item.dataset.section;
            if (section === 'transactions') {
                document.querySelector('.data-card').scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
    });

    // Run
    try {
        await init();
    } catch (err) {
        console.error('Initialization error:', err);
    }

    // Splash Screen
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => splash.remove(), 500);
        }, 1500);
    }
});

function showWarning(m) { console.warn(m); }
