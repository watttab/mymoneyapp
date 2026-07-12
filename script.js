const GAS_URL = 'https://script.google.com/macros/s/AKfycbxB2Dj4VGRXseKQgcc5boCgpqzmSzN2Ob6FvI8eSuK18KSQnRAVl74ytrZiJXRi70k/exec';
let myChart = null;

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
};

// Tab Switching
window.switchTab = function(tabId) {
    // Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update Sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(tabId + 'Section').classList.add('active');

    // If dashboard is clicked, try to refresh data
    if(tabId === 'dashboard') {
        fetchDashboardData();
    }
}

// Fetch Dashboard Data
async function fetchDashboardData() {
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        if(data.status === "ok") {
            document.getElementById('totalBalance').innerText = formatCurrency(data.total);
            document.getElementById('savingsBalance').innerText = formatCurrency(data.savings);
            document.getElementById('tuitionBalance').innerText = formatCurrency(data.tuition);

            updateChart(data.savings, data.tuition);
        }
    } catch (error) {
        console.error("Failed to fetch dashboard data", error);
    }
}

// Update Chart
function updateChart(savings, tuition) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    // Chart.js defaults for dark theme
    Chart.defaults.color = '#a3a3a3';
    Chart.defaults.font.family = 'Inter';

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['เงินเก็บ', 'ค่าเทอมลูก'],
            datasets: [{
                data: [savings, tuition],
                backgroundColor: [
                    '#f59e0b', // Amber/Gold
                    '#333333'  // Dark Gray
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                    }
                }
            }
        }
    });
}

// Custom Toast Notification
function showToast(message, isLoading = true) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toastMessage');
    const spinner = document.getElementById('toastSpinner');
    const check = document.getElementById('toastCheck');
    const progressFill = document.getElementById('toastProgress');

    msgEl.innerText = message;
    toast.classList.add('show');

    if (isLoading) {
        spinner.style.display = 'block';
        check.style.display = 'none';
        progressFill.className = 'progress-bar-fill loading';
        progressFill.style.width = '30%';
    } else {
        spinner.style.display = 'none';
        check.style.display = 'block';
        progressFill.className = 'progress-bar-fill';
        progressFill.style.width = '100%';
        progressFill.style.backgroundColor = '#10b981'; // Green for success
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            // Reset after animation
            setTimeout(() => {
                progressFill.style.backgroundColor = '#f59e0b';
                check.style.display = 'none';
            }, 400);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Typewriter Effect for Title
    const titleElement = document.getElementById('appTitle');
    const text = 'Money Master';
    let index = 0;

    function typeWriter() {
        if (index < text.length) {
            titleElement.innerHTML = text.substring(0, index + 1);
            index++;
            setTimeout(typeWriter, 150);
        }
    }
    setTimeout(typeWriter, 500);

    // 2. Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    // 3. Form Submit Handler
    const form = document.getElementById('recordForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate
        const amount = document.getElementById('amount').value;
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
            return;
        }

        // Show Progress Toast
        showToast('กำลังบันทึกข้อมูล...', true);

        const formData = new FormData(form);
        const data = {
            date: formData.get('date'),
            category: formData.get('category'),
            type: formData.get('type'),
            amount: formData.get('amount'),
            note: formData.get('note') || '-'
        };

        try {
            const urlParams = new URLSearchParams();
            for (const key in data) {
                urlParams.append(key, data[key]);
            }

            const response = await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: urlParams.toString()
            });
            
            // Show Success Toast
            showToast('บันทึกข้อมูลเรียบร้อย', false);
            
            // Optional: reset form but keep date and category
            form.reset();
            document.getElementById('date').valueAsDate = new Date();

            // Refresh dashboard data in background
            fetchDashboardData();

        } catch (error) {
            console.error('Error:', error);
            alert('ไม่สามารถบันทึกข้อมูลได้ โปรดลองอีกครั้ง');
            document.getElementById('toast').classList.remove('show');
        }
    });

    // 4. Line Share Handler
    const btnShareLine = document.getElementById('btnShareLine');
    btnShareLine.addEventListener('click', () => {
        const total = document.getElementById('totalBalance').innerText;
        const savings = document.getElementById('savingsBalance').innerText;
        const tuition = document.getElementById('tuitionBalance').innerText;
        
        const msg = `📊 สรุปบัญชีล่าสุด\n💰 เงินเก็บ: ${savings}\n🎓 ค่าเทอมลูก: ${tuition}\n------------------\nยอดรวมทั้งหมด: ${total}\nดูรายละเอียด: https://watttab.github.io/mymoneyapp/`;
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(msg)}`;
        window.open(lineUrl, '_blank');
    });

    // Initial Fetch for Dashboard
    fetchDashboardData();
});
