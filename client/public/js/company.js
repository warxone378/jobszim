document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    if (!userId) {
        document.getElementById('company-container').innerHTML = '<p>No company specified.</p>';
        return;
    }

    let currentUserId = null;
    fetch('/auth/status').then(res => res.json()).then(data => {
        if (data.logged_in) currentUserId = data.user_id;
    });

    fetch(`/company/${userId}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('company-container');
            let logoHtml = '';
            if (data.company_logo) {
                logoHtml = `<img src="/logos/${data.company_logo}" alt="${data.company_name}" class="logo">`;
            }
            let followButton = '';
            if (currentUserId && currentUserId != userId) {
                // Check if already following
                fetch(`/company/${userId}/followers`)
                    .then(res => res.json())
                    .then(followers => {
                        const isFollowing = followers.some(f => f.id === currentUserId);
                        followButton = `<button id="follow-btn" data-following="${isFollowing}">${isFollowing ? 'Unfollow' : 'Follow'}</button>`;
                        document.getElementById('follow-container').innerHTML = followButton;
                        document.getElementById('follow-btn').addEventListener('click', toggleFollow);
                    });
            }
            let jobsHtml = '';
            if (data.jobs.length === 0) {
                jobsHtml = '<p>No jobs posted yet.</p>';
            } else {
                jobsHtml = '<h3>Jobs</h3>';
                data.jobs.forEach(job => {
                    jobsHtml += `
                        <div class="job-card">
                            <h2><a href="/job/${job.id}">${job.title}</a></h2>
                            <p>${job.type} | ${job.salary}</p>
                            <p>${job.description.substring(0,100)}...</p>
                        </div>
                    `;
                });
            }
            container.innerHTML = `
                <div class="company-header">
                    ${logoHtml}
                    <h1>${data.company_name}</h1>
                </div>
                <div id="follow-container"></div>
                <div class="company-info">
                    <p>${data.company_description || 'No description provided.'}</p>
                    ${data.website ? `<p>Website: <a href="${data.website}" target="_blank">${data.website}</a></p>` : ''}
                </div>
                <div class="jobs-list">
                    ${jobsHtml}
                </div>
            `;
        })
        .catch(err => {
            document.getElementById('company-container').innerHTML = '<p>Company not found.</p>';
        });
});

function toggleFollow(e) {
    const btn = e.target;
    const userId = new URLSearchParams(window.location.search).get('id');
    const isFollowing = btn.dataset.following === 'true';
    const url = `/company/${userId}/${isFollowing ? 'unfollow' : 'follow'}`;
    fetch(url, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            btn.dataset.following = !isFollowing;
            btn.textContent = !isFollowing ? 'Unfollow' : 'Follow';
        });
}

    // Add follow/unfollow button
    fetch('/auth/status')
        .then(res => res.json())
        .then(auth => {
            if (auth.logged_in && auth.user_id != userId) {
                // Check if already following
                fetch(`/company/${userId}/follow-status`)
                    .then(res => res.json())
                    .then(status => {
                        const btn = document.createElement('button');
                        btn.id = 'follow-btn';
                        btn.textContent = status.following ? 'Unfollow' : 'Follow';
                        btn.addEventListener('click', () => {
                            const method = status.following ? 'DELETE' : 'POST';
                            fetch(`/company/${userId}/follow`, { method })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.error) alert(data.error);
                                    else location.reload();
                                });
                        });
                        document.querySelector('.company-header').appendChild(btn);
                    });
            }
        });
