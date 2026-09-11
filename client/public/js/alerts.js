document.addEventListener('DOMContentLoaded', () => {
    loadAlerts();

    document.getElementById('alertForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            keyword: document.getElementById('keyword').value,
            location: document.getElementById('location').value,
            frequency: document.getElementById('frequency').value
        };
        fetch('/alerts/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                alert('Alert created');
                loadAlerts();
                document.getElementById('alertForm').reset();
            }
        })
        .catch(err => alert('Error creating alert'));
    });

    function loadAlerts() {
        fetch('/alerts/')
            .then(res => res.json())
            .then(alerts => {
                const container = document.getElementById('alerts-list');
                if (alerts.length === 0) {
                    container.innerHTML = '<h2>Your Alerts</h2><p>No alerts yet.</p>';
                    return;
                }
                let html = '<h2>Your Alerts</h2>';
                alerts.forEach(alert => {
                    html += `
                        <div class="alert-item ${alert.active ? 'active' : 'inactive'}" data-id="${alert.id}">
                            <div>
                                <strong>${alert.keyword || 'Any'}</strong> in <strong>${alert.location || 'Any'}</strong> (${alert.frequency})
                            </div>
                            <div>
                                <button class="toggle-btn" data-id="${alert.id}" data-active="${alert.active}">
                                    ${alert.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button class="delete-btn" data-id="${alert.id}">Delete</button>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

                document.querySelectorAll('.toggle-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        const active = e.target.dataset.active === 'true' ? false : true;
                        fetch(`/alerts/${id}/toggle`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ active })
                        })
                        .then(res => res.json())
                        .then(data => {
                            loadAlerts();
                        })
                        .catch(err => alert('Error toggling alert'));
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        if (!confirm('Delete this alert?')) return;
                        fetch(`/alerts/${id}`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(data => {
                                loadAlerts();
                            })
                            .catch(err => alert('Error deleting alert'));
                    });
                });
            })
            .catch(err => {
                document.getElementById('alerts-list').innerHTML = '<p>Please log in to manage alerts.</p>';
            });
    }
});
