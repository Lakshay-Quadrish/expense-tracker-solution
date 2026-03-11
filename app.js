document.addEventListener('DOMContentLoaded', async () => {
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
    const filterMonth = document.getElementById('filter-month'); // Note: Added back to HTML in next step
    const displayMonthTotal = document.getElementById('month-total-display');
    const currentDateDisplay = document.getElementById('current-date-display');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    const greetingText = document.getElementById('greeting-text');

    // Initialize
    async function init() {
        if (currentUser) {
            showApp();
        } else {
            showAuth();
        }

        // Check API connection
        isOnline = await API.checkConnection();

        if (!isOnline && currentUser) {
            showWarning('🔌 Offline mode. Data synced with local storage.', 3000);
        }

        // Set default date in form
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
            dateInput.max = new Date().toISOString().split("T")[0];
        }

        // Set default filter month
        if (filterMonth) filterMonth.value = getCurrentMonth();

        // Display current date header
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (currentDateDisplay) currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

        if (currentUser) {
            updateUserUI();
            await loadExpenses();
        }

        setupAuthListeners();
    }

    function showApp() {
        authSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
    }

    function showAuth() {
        authSection.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }

    function updateUserUI() {
        if (currentUser) {
            userNameDisplay.textContent = currentUser.name;
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

            // Set dynamic greeting
            const hour = new Date().getHours();
            let greeting = "Good Morning";
            if (hour >= 12) greeting = "Good Afternoon";
            if (hour >= 17) greeting = "Good Evening";
            if (greetingText) greetingText.textContent = `${greeting}, ${currentUser.name.split(' ')[0]}`;

            if (currentUser.avatar) {
                userAvatar.innerHTML = `<img src="${currentUser.avatar}" style="width:100%; height:100%; border-radius:50%">`;
            }
        }
    }

    function setupAuthListeners() {
        // Screen toggling
        document.getElementById('to-signup').onclick = (e) => {
            e.preventDefault();
            loginCard.classList.add('hidden');
            signupCard.classList.remove('hidden');
        };
        document.getElementById('to-login').onclick = (e) => {
            e.preventDefault();
            signupCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
        };
        document.getElementById('to-forgot').onclick = (e) => {
            e.preventDefault();
            loginCard.classList.add('hidden');
            forgotCard.classList.remove('hidden');
        };
        document.getElementById('back-to-login').onclick = (e) => {
            e.preventDefault();
            forgotCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
        };

        // Forms
        document.getElementById('login-form').onsubmit = async (e) => {
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

        document.getElementById('signup-form').onsubmit = async (e) => {
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

        document.getElementById('forgot-form').onsubmit = (e) => {
            e.preventDefault();
            showSuccess('Reset link sent to your email!');
            forgotCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
        };

        document.getElementById('google-login-btn').onclick = async () => {
            // Simulated Google Auth for demo purposes
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

    logoutBtn.onclick = () => {
        if (confirm('Are you sure you want to logout?')) {
            API.logout();
        }
    };

    // --- Core Functions ---

    async function loadExpenses() {
        try {
            showLoading(true);
            expenses = await API.getExpenses(filter);
            render();
        } catch (error) {
            console.error('Failed to load expenses:', error);
            showError('Failed to load expenses. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    async function addExpense(e) {
        e.preventDefault();

        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const notes = document.getElementById('notes').value;

        if (isNaN(amount) || amount <= 0) {
            showError("Please enter a valid amount greater than 0");
            return;
        }

        try {
            showLoading(true);
            const newExpense = await API.createExpense({ amount, category, date, notes });
            expenses.unshift(newExpense);
            render();
            closeModal();
            addExpenseForm.reset();
            document.getElementById('date').valueAsDate = new Date();
            showSuccess('Expense added successfully!');
        } catch (error) {
            showError('Failed to add expense: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

    async function deleteExpense(id) {
        if (confirm("Are you sure you want to delete this expense?")) {
            try {
                showLoading(true);
                await API.deleteExpense(id);
                expenses = expenses.filter(expense => expense._id !== id);
                render();
                showSuccess('Expense deleted!');
            } catch (error) {
                showError('Failed to delete: ' + error.message);
            } finally {
                showLoading(false);
            }
        }
    }

    // --- Helper Functions ---

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

    function showLoading(show) {
        document.body.style.cursor = show ? 'wait' : 'default';
        const btns = document.querySelectorAll('button');
        btns.forEach(btn => btn.disabled = show);
    }

    function showNotification(message, type = 'error', duration = 5000) {
        const existing = document.querySelectorAll('.custom-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;

        const icons = {
            error: 'fa-circle-exclamation',
            success: 'fa-circle-check',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };

        notification.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        document.body.appendChild(notification);
        notification.querySelector('.notification-close').onclick = () => notification.remove();

        setTimeout(() => notification.classList.add('show'), 10);
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    function showError(message) { showNotification(message, 'error', 5000); }
    function showSuccess(message) { showNotification(message, 'success', 3000); }
    function showWarning(message, duration = 5000) { showNotification(message, 'warning', duration); }

    // --- Rendering ---

    function render() {
        renderDashboard();
        renderExpenseList();
    }

    function renderDashboard() {
        const currentMonth = filter.month;
        const currentMonthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            return expenseMonth === currentMonth;
        });

        const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        displayMonthTotal.textContent = formatCurrency(total);

        const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];
        const categorySummaries = [];

        const categoryTotals = categories.map(cat => {
            const catTotal = currentMonthExpenses
                .filter(expense => expense.category === cat)
                .reduce((sum, expense) => sum + expense.amount, 0);

            const el = document.getElementById(`total-${cat.toLowerCase()}`);
            if (el) el.textContent = formatCurrency(catTotal);

            if (catTotal > 0) {
                categorySummaries.push({ name: cat, total: catTotal, percentage: (catTotal / total * 100).toFixed(0) });
            }

            return catTotal;
        });

        renderSummaryList(categorySummaries);
        updateChart(categories, categoryTotals);
    }

    function renderSummaryList(summaries) {
        const summaryListEl = document.getElementById('category-summary-list');
        if (!summaryListEl) return;

        if (summaries.length === 0) {
            summaryListEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No data for summary</p>';
            return;
        }

        const colors = { "Food": "#ef4444", "Travel": "#0ea5e9", "Shopping": "#f59e0b", "Bills": "#10b981", "Others": "#64748b" };

        summaryListEl.innerHTML = summaries.sort((a, b) => b.total - a.total).map(s => `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 0.9rem;">${s.name}</span>
                    <span style="font-weight: 700; font-size: 0.9rem;">${s.percentage}%</span>
                </div>
                <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${s.percentage}%; height: 100%; background: ${colors[s.name] || '#6366f1'}; border-radius: 10px;"></div>
                </div>
            </div>
        `).join('');
    }

    let expenseChart = null;
    function updateChart(labels, data) {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        if (expenseChart) expenseChart.destroy();

        const totalData = data.reduce((a, b) => a + b, 0);
        const chartData = totalData > 0 ? data : [1];

        // Premium Indigo/Slate Theme Colors
        const chartColors = totalData > 0
            ? ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b']
            : ['#e2e8f0'];

        const chartLabels = totalData > 0 ? labels : ['No Data'];

        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    hoverBackgroundColor: chartColors,
                    borderWidth: 4,
                    borderColor: '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { family: 'Montserrat', size: 12, weight: '600' },
                            color: '#64748b'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { family: 'Montserrat', size: 14 },
                        bodyFont: { family: 'Montserrat', size: 13 },
                        cornerRadius: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => ` ${context.label}: ${formatCurrency(context.parsed)}`
                        }
                    }
                },
                cutout: '80%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    function renderExpenseList() {
        expenseList.innerHTML = "";

        let filteredExpenses = expenses;
        if (filter.category !== 'All') {
            filteredExpenses = expenses.filter(e => e.category === filter.category);
        }

        if (filteredExpenses.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        filteredExpenses.forEach(expense => {
            const tr = document.createElement('tr');
            const iconMap = { "Food": "fa-utensils", "Travel": "fa-plane", "Shopping": "fa-bag-shopping", "Bills": "fa-indian-rupee-sign", "Others": "fa-tags" };
            const iconClass = iconMap[expense.category] || "fa-circle";
            const displayDate = new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

            tr.innerHTML = `
                <td><span style="font-weight: 600; color: var(--text-secondary);">${displayDate}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid ${iconClass}" style="color: var(--primary); font-size: 0.9rem;"></i>
                        <span style="font-weight: 600;">${expense.category}</span>
                    </div>
                </td>
                <td><span style="color: var(--text-secondary);">${expense.notes || '-'}</span></td>
                <td><span style="font-weight: 700; color: var(--text-primary);">${formatCurrency(expense.amount)}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-icon btn-delete" data-id="${expense._id}">
                        <i class="fa-solid fa-trash-can" style="font-size: 0.9rem;"></i>
                    </button>
                </td>
            `;
            expenseList.appendChild(tr);
        });
    }

    // --- App Event Listeners ---
    addExpenseBtn.onclick = () => modal.classList.remove('hidden');
    function closeModal() { modal.classList.add('hidden'); }
    closeModalBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    window.onclick = (e) => { if (e.target === modal) closeModal(); };
    addExpenseForm.onsubmit = addExpense;
    filterCategory.onchange = (e) => { filter.category = e.target.value; render(); };
    if (filterMonth) filterMonth.onchange = (e) => { filter.month = e.target.value; loadExpenses(); };

    // Updated Event Delegation for Delete
    expenseList.onclick = (e) => {
        const btn = e.target.closest('.btn-delete');
        if (btn) {
            const id = btn.dataset.id;
            deleteExpense(id);
        }
    };

    // Sidebar Navigation
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
    await init();

    // Splash Screen
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => splash.remove(), 500);
        }, 1500);
    }
});
