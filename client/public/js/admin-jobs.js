document.addEventListener('DOMContentLoaded', () => {
    loadPendingJobs();

    function loadPendingJobs() {
        fetch('/admin/jobs/pending')
            .then(res => res.json())
            .then(jobs => {
                const container = document.getElementById('pending-container');
                if (jobs.length === 0) {
                    container.innerHTML = '<p>No pending jobs.</p>';
                    return;
                }
                let html = '';
                jobs.forEach(job => {
                    html += `
                        <div class="job-card" data-job-id="${job.id}">
                            <h3>${job.title}</h3>
                            <p><strong>${job.company}</strong> - ${job.location}</p>
                            <p>${job.type} | ${job.salary}</p>
                            <p>${job.description}</p>
                            <p><small>Posted by user ${job.posted_by} on ${job.posted}</small></p>
                            <div class="job-actions">
                                <button class="edit-btn" data-id="${job.id}">Edit</button>
                                <button class="approve-btn" data-id="${job.id}">Approve</button>
                                <button class="reject-btn" data-id="${job.id}">Reject</button>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.target.dataset.id;
                        editJob(jobId);
                    });
                });

                document.querySelectorAll('.approve-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.target.dataset.id;
                        fetch(`/admin/jobs/${jobId}/approve`, { method: 'PUT' })
                            .then(res => res.json())
                            .then(data => {
                                alert(data.message);
                                loadPendingJobs();
                            })
                            .catch(err => alert('Error approving job'));
                    });
                });

                document.querySelectorAll('.reject-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.target.dataset.id;
                        fetch(`/admin/jobs/${jobId}/reject`, { method: 'PUT' })
                            .then(res => res.json())
                            .then(data => {
                                alert(data.message);
                                loadPendingJobs();
                            })
                            .catch(err => alert('Error rejecting job'));
                    });
                });
            })
            .catch(err => {
                document.getElementById('pending-container').innerHTML = '<p>Failed to load jobs.</p>';
            });
    }

    function editJob(jobId) {
        fetch(`/api/jobs/${jobId}`)
            .then(res => res.json())
            .then(job => {
                const newTitle = prompt('Enter new title:', job.title);
                if (newTitle === null) return;
                const newCompany = prompt('Enter new company:', job.company);
                const newLocation = prompt('Enter new location:', job.location);
                const newType = prompt('Enter new type (Full-time/Part-time/Contract/Remote):', job.type);
                const newSalary = prompt('Enter new salary:', job.salary);
                const newDescription = prompt('Enter new description:', job.description);

                const updatedData = {
                    title: newTitle,
                    company: newCompany,
                    location: newLocation,
                    type: newType,
                    salary: newSalary,
                    description: newDescription,
                    posted: job.posted,
                    status: 'pending'  // stays pending after edit
                };

                fetch(`/api/jobs/${jobId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                })
                .then(res => {
                    if (res.ok) {
                        alert('Job updated successfully (still pending)');
                        loadPendingJobs();
                    } else {
                        return res.json().then(data => alert(data.error || 'Update failed'));
                    }
                })
                .catch(err => alert('Error updating job'));
            });
    }
});
