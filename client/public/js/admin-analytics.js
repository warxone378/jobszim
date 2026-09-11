document.addEventListener('DOMContentLoaded', () => {
    fetch('/admin/stats')
        .then(res => res.json())
        .then(data => {
            const statsContainer = document.getElementById('stats-container');
            statsContainer.innerHTML = `
                <div class="stat-card"><h3>Total Users</h3><div class="number">${data.total_users}</div></div>
                <div class="stat-card"><h3>Total Jobs</h3><div class="number">${data.total_jobs}</div></div>
                <div class="stat-card"><h3>Approved</h3><div class="number">${data.approved}</div></div>
                <div class="stat-card"><h3>Pending</h3><div class="number">${data.pending}</div></div>
                <div class="stat-card"><h3>Rejected</h3><div class="number">${data.rejected}</div></div>
            `;

            // Jobs pie chart
            new Chart(document.getElementById('jobsChart'), {
                type: 'pie',
                data: {
                    labels: ['Approved', 'Pending', 'Rejected'],
                    datasets: [{
                        data: [data.approved, data.pending, data.rejected],
                        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                    }]
                }
            });

            // For applications, we still need to fetch all applications (if you have many, consider limiting)
            fetch('/applications/admin/all')
                .then(res => res.json())
                .then(apps => {
                    new Chart(document.getElementById('applicationsChart'), {
                        type: 'bar',
                        data: {
                            labels: ['Applications'],
                            datasets: [{
                                label: 'Total Applications',
                                data: [apps.length],
                                backgroundColor: '#007bff'
                            }]
                        }
                    });
                })
                .catch(() => {
                    document.getElementById('applicationsChart').parentNode.innerHTML = '<p>No application data</p>';
                });
        })
        .catch(err => {
            document.getElementById('stats-container').innerHTML = '<p>Failed to load stats.</p>';
        });
});
