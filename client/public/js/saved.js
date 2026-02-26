document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('saved-container');

    fetch('/saved/')
        .then(res => {
            if (!res.ok) throw new Error('Not logged in');
            return res.json();
        })
        .then(jobs => {
            if (jobs.length === 0) {
                container.innerHTML = '<p>You have no saved jobs.</p>';
                return;
            }
            let html = '';
            jobs.forEach(job => {
                html += `
                    <div class="job-card" data-job-id="${job.id}">
                        <h2><a href="/job/${job.id}">${job.title}</a></h2>
                        <p class="company">${job.company}</p>
                        <p class="location">${job.location}</p>
                        <p class="type">${job.type}</p>
                        <p class="salary">${job.salary}</p>
                        <p>${job.description}</p>
                        <small>Posted: ${job.posted}</small>
                        <button class="unsave-btn" data-id="${job.id}">Remove</button>
                    </div>
                `;
            });
            container.innerHTML = html;

            document.querySelectorAll('.unsave-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const jobId = e.target.dataset.id;
                    fetch(`/saved/${jobId}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(data => {
                            alert('Job removed from saved');
                            location.reload();
                        })
                        .catch(err => alert('Error'));
                });
            });
        })
        .catch(err => {
            container.innerHTML = '<p>Please <a href="/">log in</a> to view saved jobs.</p>';
        });
});
