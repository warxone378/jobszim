document.addEventListener('DOMContentLoaded', () => {
    let allJobs = [];
    const container = document.getElementById('jobs-container');
    const filterTitle = document.getElementById('filter-title');
    const filterStatus = document.getElementById('filter-status');
    const filterBtn = document.getElementById('filter-btn');

    loadJobs();

    filterBtn.addEventListener('click', () => filterJobs());

    function loadJobs() {
        fetch('/admin/jobs/all')
            .then(res => res.json())
            .then(jobs => {
                allJobs = jobs;
                displayJobs(jobs);
            })
            .catch(err => {
                container.innerHTML = '<p>Failed to load jobs.</p>';
            });
    }

    function displayJobs(jobs) {
        if (jobs.length === 0) {
            container.innerHTML = '<p>No jobs found.</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Posted By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        jobs.forEach(job => {
            let statusClass = '';
            if (job.status === 'approved') statusClass = 'status-approved';
            else if (job.status === 'pending') statusClass = 'status-pending';
            else if (job.status === 'rejected') statusClass = 'status-rejected';

            html += `
                <tr data-job-id="${job.id}">
                    <td>${job.id}</td>
                    <td>${job.title}</td>
                    <td>${job.company}</td>
                    <td>${job.location}</td>
                    <td><span class="status-badge ${statusClass}">${job.status}</span></td>
                    <td>${job.posted_by || 'N/A'}</td>
                    <td class="job-actions">
                        <button class="edit-btn" data-id="${job.id}">Edit</button>
                        <button class="delete-btn" data-id="${job.id}">Delete</button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        // Attach edit handlers
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.dataset.id;
                editJob(jobId);
            });
        });

        // Attach delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.dataset.id;
                deleteJob(jobId);
            });
        });
    }

    function filterJobs() {
        const titleFilter = filterTitle.value.toLowerCase();
        const statusFilter = filterStatus.value;
        const filtered = allJobs.filter(job => {
            const matchesTitle = job.title.toLowerCase().includes(titleFilter);
            const matchesStatus = !statusFilter || job.status === statusFilter;
            return matchesTitle && matchesStatus;
        });
        displayJobs(filtered);
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
                // Optionally allow admin to change status
                const newStatus = prompt('Enter new status (approved/pending/rejected):', job.status);

                const updatedData = {
                    title: newTitle,
                    company: newCompany,
                    location: newLocation,
                    type: newType,
                    salary: newSalary,
                    description: newDescription,
                    status: newStatus,
                    posted: job.posted
                };

                fetch(`/api/jobs/${jobId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                })
                .then(res => {
                    if (res.ok) {
                        alert('Job updated successfully');
                        loadJobs(); // reload all jobs
                    } else {
                        return res.json().then(data => alert(data.error || 'Update failed'));
                    }
                })
                .catch(err => alert('Error updating job'));
            });
    }

    function deleteJob(jobId) {
        if (!confirm('Are you sure you want to delete this job?')) return;
        fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert('Job deleted successfully');
                    loadJobs();
                } else {
                    return res.json().then(data => alert(data.error || 'Delete failed'));
                }
            })
            .catch(err => alert('Error deleting job'));
    }
});
