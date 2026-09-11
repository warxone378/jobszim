document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.getElementById('verify-btn');
    const tokenInput = document.getElementById('token');
    const errorMsg = document.getElementById('errorMsg');

    verifyBtn.addEventListener('click', () => {
        const token = tokenInput.value;
        if (token.length !== 6) {
            errorMsg.textContent = 'Please enter a 6-digit code';
            return;
        }
        fetch('/auth/verify-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                errorMsg.textContent = data.error;
            } else {
                window.location.href = '/';
            }
        })
        .catch(() => {
            errorMsg.textContent = 'An error occurred.';
        });
    });
});
