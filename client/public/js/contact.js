document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'message-status';
    statusDiv.style.display = 'none';

    fetch('/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            statusDiv.textContent = 'Error: ' + data.error;
            statusDiv.classList.add('error');
        } else {
            statusDiv.textContent = data.message;
            statusDiv.classList.add('success');
            document.getElementById('contactForm').reset();
        }
        statusDiv.style.display = 'block';
    })
    .catch(err => {
        statusDiv.textContent = 'An error occurred. Please try again.';
        statusDiv.classList.add('error');
        statusDiv.style.display = 'block';
    });
});
