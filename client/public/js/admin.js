document.addEventListener('DOMContentLoaded', () => {
    fetch('/admin/users')
        .then(res => {
            if (!res.ok) {
                if (res.status === 403) window.location.href = '/';
                throw new Error('Failed to load users');
            }
            return res.json();
        })
        .then(users => displayUsers(users))
        .catch(err => document.getElementById('users-container').innerHTML = '<p>Error loading users.</p>');

    function displayUsers(users) {
        const container = document.getElementById('users-container');
        let html = `<table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
        users.forEach(user => {
            const isBlocked = user.is_blocked;
            const isAdmin = user.is_admin;
            const rowClass = isBlocked ? 'blocked' : '';
            const adminBadge = isAdmin ? '<span class="admin-badge">Admin</span>' : '';
            html += `<tr class="${rowClass}" data-user-id="${user.id}">
                <td>${user.id}</td>
                <td>${user.username} ${adminBadge}</td>
                <td>${user.email}</td>
                <td>${isBlocked ? 'Blocked' : 'Active'}</td>
                <td>
                    ${!isAdmin ? `
                        <button class="delete-user" data-id="${user.id}">Delete</button>
                        ${isBlocked ? `<button class="unblock-user" data-id="${user.id}">Unblock</button>` : `<button class="block-user" data-id="${user.id}">Block</button>`}
                    ` : '<em>Protected</em>'}
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this user?')) {
                    fetch(`/admin/users/${e.target.dataset.id}`, { method: 'DELETE' })
                        .then(res => res.ok ? location.reload() : res.json().then(d => alert(d.error)));
                }
            });
        });
        document.querySelectorAll('.block-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                fetch(`/admin/users/${e.target.dataset.id}/block`, { method: 'PUT' })
                    .then(res => res.ok ? location.reload() : res.json().then(d => alert(d.error)));
            });
        });
        document.querySelectorAll('.unblock-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                fetch(`/admin/users/${e.target.dataset.id}/unblock`, { method: 'PUT' })
                    .then(res => res.ok ? location.reload() : res.json().then(d => alert(d.error)));
            });
        });
    }
});
