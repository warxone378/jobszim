document.addEventListener('DOMContentLoaded', () => {
    fetch('/user/referral')
        .then(res => res.json())
        .then(data => {
            const div = document.getElementById('referral-info');
            if (data.error) {
                div.innerHTML = `<p>${data.error}</p>`;
                return;
            }
            div.innerHTML = `
                <h2>Your Referral Link</h2>
                <p>Share this link with friends. When they register using it, you'll get credit.</p>
                <p><strong>${data.link}</strong></p>
                <p>People referred: ${data.count}</p>
            `;
        });
});
