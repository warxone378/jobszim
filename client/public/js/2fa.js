document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('2fa-status');
    const setupDiv = document.getElementById('2fa-setup');

    fetch('/2fa/status')
        .then(res => res.json())
        .then(data => {
            if (data.enabled) {
                statusDiv.innerHTML = '<p>2FA is enabled. <button id="disable-btn">Disable</button></p>';
                document.getElementById('disable-btn').addEventListener('click', disable2FA);
            } else {
                statusDiv.innerHTML = '<p>2FA is not enabled. <button id="setup-btn">Set up</button></p>';
                document.getElementById('setup-btn').addEventListener('click', setup2FA);
            }
        });

    function setup2FA() {
        fetch('/2fa/setup')
            .then(res => {
                if (res.ok) return res.blob();
                else return res.json().then(d => Promise.reject(d.error));
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                setupDiv.innerHTML = `
                    <p>Scan this QR code with your authenticator app (Google Authenticator, etc.)</p>
                    <img src="${url}" style="max-width:200px;">
                    <p>Then enter the 6-digit code below to verify:</p>
                    <input type="text" id="token" placeholder="000000">
                    <button id="verify-btn">Verify</button>
                `;
                document.getElementById('verify-btn').addEventListener('click', verify2FA);
            })
            .catch(err => alert('Error: ' + err));
    }

    function verify2FA() {
        const token = document.getElementById('token').value;
        fetch('/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                alert('2FA enabled successfully!');
                location.reload();
            }
        });
    }

    function disable2FA() {
        const token = prompt('Enter your current 2FA code to disable:');
        if (!token) return;
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
                location.reload();
            }
        });
    }
});
