document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/jobs/my') // we need an endpoint to get all jobs by current user
        .then(res => res.json())
        .then(data => {
            const jobs = data.jobs || data; // handle both paginated and non-paginated
            const container = document.getElementById('jobs-list');
            if (jobs.length === 0) {
                container.innerHTML = '<p>You haven\'t posted any jobs yet.</p>';
                return;
            }
            let html = '';
            jobs.forEach(job => {
                html += `
                    <div class="job-card">
                        <h3>${job.title}</h3>
                        <p>${job.company} - ${job.location}</p>
                        <p>Status: ${job.status}</p>
                        <button onclick="viewApplications(${job.id})">View Applications (${job.applications || 0})</button>
                        <div id="apps-${job.id}" style="display:none;"></div>
                    </div>
                `;
            });
            container.innerHTML = html;
        });

    window.viewApplications = function(jobId) {
        const div = document.getElementById(`apps-${jobId}`);
        if (div.style.display === 'none') {
            fetch(`/applications/job/${jobId}`)
                .then(res => res.json())
                .then(apps => {
                    let html = '<h4>Applications</h4>';
                    if (apps.length === 0) html += '<p>No applications yet.</p>';
                    else {
                        html += '<table><tr><th>User ID</th><th>Message</th><th>CV</th><th>Status</th><th>Date</th></tr>';
                        apps.forEach(app => {
                            html += `
                                <tr>
                                    <td>${app.user_id}</td>
                                    <td>${app.message}</td>
                                    <td>${app.cv ? `<a href="/uploads/${app.cv}" target="_blank">CV</a>` : 'None'}</td>
                                    <td>${app.status}</td>
                                    <td>${new Date(app.date).toLocaleString()}</td>
                                </tr>
                            `;
                        });
                        html += '</table>';
                    }
                    div.innerHTML = html;
                    div.style.display = 'block';
                });
        } else {
            div.style.display = 'none';
        }
    };
});
