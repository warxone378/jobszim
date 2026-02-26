document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('setup-container');

    // Check if 2FA is already enabled
    fetch('/2fa/status')
        .then(res => res.json())
        .then(status => {
            if (status.enabled) {
                container.innerHTML = `
                    <h2>2FA is enabled</h2>
                    <p>Your account is protected by two-factor authentication.</p>
                    <button id="disable-btn">Disable 2FA</button>
                `;
                document.getElementById('disable-btn').addEventListener('click', () => {
                    const token = prompt('Enter your current 2FA code to disable:');
                    if (token) disable2FA(token);
                });
            } else {
                // Fetch QR code
                fetch('/2fa/setup')
                    .then(res => {
                        if (res.ok) return res.blob();
                        else return res.json().then(d => Promise.reject(d.error));
                    })
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        container.innerHTML = `
                            <h2>Setup Two-Factor Authentication</h2>
                            <p>Scan this QR code with Google Authenticator or any TOTP app.</p>
                            <div class="qr-code"><img src="${url}" style="max-width:200px;"></div>
                            <p>Then enter the 6-digit code below to enable.</p>
                            <div class="verify-box">
                                <input type="text" id="token" placeholder="000000" maxlength="6">
                                <button id="verify-btn">Verify & Enable</button>
                            </div>
                            <div id="message"></div>
                        `;
                        document.getElementById('verify-btn').addEventListener('click', verify);
                    })
                    .catch(err => {
                        container.innerHTML = `<p class="error">${err}</p>`;
                    });
            }
        });

    function verify() {
        const token = document.getElementById('token').value;
        const msgDiv = document.getElementById('message');
        fetch('/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                msgDiv.innerHTML = `<p class="error">${data.error}</p>`;
            } else {
                msgDiv.innerHTML = `<p class="message">${data.message}</p>`;
                setTimeout(() => { window.location.href = '/profile.html'; }, 2000);
            }
        });
    }

    function disable2FA(token) {
        fetch('/2fa/disable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                alert('2FA disabled');
                window.location.reload();
            }
        });
    }
});
