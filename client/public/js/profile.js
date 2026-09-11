document.addEventListener('DOMContentLoaded', () => {
    fetch('/auth/profile')
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                window.location.href = '/';  // not logged in
                return;
            }
            displayProfile(data.user);
            displayJobs(data.jobs);
        });

    function displayProfile(user) {
        const div = document.getElementById('profile-info');
        div.innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <button id="edit-profile">Edit Profile</button>
        `;
        document.getElementById('edit-profile').addEventListener('click', () => editProfile(user));
    }

    function displayJobs(jobs) {
        const container = document.getElementById('my-jobs');
        if (jobs.length === 0) {
            container.innerHTML = '<p>You have not posted any jobs yet.</p>';
            return;
        }
        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <h3>${job.title}</h3>
                <p>${job.company} - ${job.location}</p>
                <small>Posted: ${job.posted}</small>
                <button class="edit-job" data-id="${job.id}">Edit</button>
                <button class="delete-job" data-id="${job.id}">Delete</button>
            `;
            container.appendChild(card);
        });
        // Attach edit/delete handlers (reuse functions from main.js)
    }

    function editProfile(user) {
        const newUsername = prompt('New username:', user.username);
        if (newUsername === null) return;
        const newEmail = prompt('New email:', user.email);
        const newPassword = prompt('New password (leave blank to keep current):');
        const data = {};
        if (newUsername && newUsername !== user.username) data.username = newUsername;
        if (newEmail && newEmail !== user.email) data.email = newEmail;
        if (newPassword) data.password = newPassword;

        fetch('/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                alert('Profile updated');
                location.reload();
            }
        });
    }
});