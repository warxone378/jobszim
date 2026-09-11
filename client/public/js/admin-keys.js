document.addEventListener('DOMContentLoaded', () => {
    loadKeys();
    document.getElementById('generate-key').addEventListener('click', generateKey);

    function loadKeys() {
        fetch('/admin/keys')
            .then(res => res.ok ? res.json() : Promise.reject('Failed'))
            .then(keys => displayKeys(keys))
            .catch(() => document.getElementById('keys-container').innerHTML = '<p>Error loading keys.</p>');
    }

    function displayKeys(keys) {
        const container = document.getElementById('keys-container');
        if (!keys.length) {
            container.innerHTML = '<p>No keys found.</p>';
            return;
        }

        let html = `<table><thead><tr><th>ID</th><th>Key</th><th>Created</th><th>Expires</th><th>Status</th><th>Used By</th><th>Action</th></tr></thead><tbody>`;
        const now = new Date();
        keys.forEach(key => {
            const created = new Date(key.created_at).toLocaleString();
            const expires = key.expires_at ? new Date(key.expires_at).toLocaleString() : 'Never';
            let status = key.used ? 'Used' : 'Available';
            let rowClass = '';
            if (key.used) rowClass = 'used';
            else if (key.expires_at && new Date(key.expires_at) < now) {
                status = 'Expired';
                rowClass = 'expired';
            }
            html += `<tr class="${rowClass}">
                <td>${key.id}</td>
                <td class="key-value">${key.key}</td>
                <td>${created}</td>
                <td>${expires}</td>
                <td>${status}</td>
                <td>${key.used_by || '-'}</td>
                <td><button class="btn-delete" data-id="${key.id}">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this key?')) {
                    fetch(`/admin/keys/${e.target.dataset.id}`, { method: 'DELETE' })
                        .then(res => res.ok ? location.reload() : alert('Delete failed'));
                }
            });
        });
    }

    function generateKey() {
        fetch('/admin/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expires_in_days: 7 })
        })
        .then(res => res.ok ? location.reload() : res.json().then(d => alert(d.error)));
    }
});
