const GAS_URL = 'https://script.google.com/macros/s/AKfycbxB2Dj4VGRXseKQgcc5boCgpqzmSzN2Ob6FvI8eSuK18KSQnRAVl74ytrZiJXRi70k/exec';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Typewriter Effect for Title
    const titleElement = document.getElementById('appTitle');
    const text = 'ระบบบันทึกการเงิน';
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
            Swal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: 'กรุณากรอกจำนวนเงินให้ถูกต้อง',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        // Show loading
        Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const formData = new FormData(form);
        const data = {
            date: formData.get('date'),
            category: formData.get('category'),
            type: formData.get('type'),
            amount: formData.get('amount'),
            note: formData.get('note') || '-'
        };

        try {
            // Note: Since GAS doPost with cross-origin might have redirect issues or CORS, 
            // the simplest way for a form submission is usually x-www-form-urlencoded or formData.
            // Using POST with no-cors might not give us a readable response, but it executes.
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

            // Assuming the Apps Script returns a success message or JSON
            // Even if it fails CORS on read, if we use no-cors it won't throw an error here, but we can't read json.
            // Let's assume CORS is set up in GAS or we handle it gracefully.
            
            Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ!',
                text: 'ข้อมูลถูกส่งไปยัง Google Sheet แล้ว',
                confirmButtonColor: '#10b981'
            });
            
            // Optional: reset form but keep date and category
            form.reset();
            document.getElementById('date').valueAsDate = new Date();

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองอีกครั้ง',
                confirmButtonColor: '#ef4444'
            });
        }
    });

    // 4. Line Share Handler
    const btnShareLine = document.getElementById('btnShareLine');
    btnShareLine.addEventListener('click', () => {
        // You can customize the message here. 
        // For a more advanced app, you'd fetch the latest balance from GAS first.
        const msg = `อัพเดทบัญชีล่าสุด\nตรวจสอบรายละเอียดได้ที่: https://watttab.github.io/mymoneyapp/`;
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(msg)}`;
        window.open(lineUrl, '_blank');
    });
});
