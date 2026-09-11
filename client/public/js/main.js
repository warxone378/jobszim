document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('jobs-container');
    const authSection = document.getElementById('auth-section');
    const jobFormContainer = document.getElementById('job-form-container');
    const postMessageDiv = document.createElement('div');
    postMessageDiv.id = 'post-message';
    postMessageDiv.style.cssText = 'max-width:800px; margin:1rem auto; padding:1rem; border-radius:8px; display:none;';
    if (jobFormContainer) {
        jobFormContainer.parentNode.insertBefore(postMessageDiv, jobFormContainer.nextSibling);
    }

    let currentUser = null;
    let currentUserId = null;
    let currentUserIsAdmin = false;
    let currentPage = 1;
    const perPage = 10;
    let totalPages = 1;
    let filterTitle = '';
    let filterLocation = '';
    let savedJobs = [];

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Dark mode toggle
    function initDarkMode() {
        const darkToggle = document.getElementById('dark-mode-toggle');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
                darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light' : '<i class="fas fa-moon"></i> Dark';
            });
        }
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            const darkToggle = document.getElementById('dark-mode-toggle');
            if (darkToggle) darkToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
        }
    }

    // Check login status
    fetch('/auth/status')
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                currentUser = data.user;
                currentUserId = data.user_id;
                currentUserIsAdmin = data.is_admin;
                return fetch('/saved/').then(res => res.json());
            } else {
                showLoggedOutLinks();
                loadJobs();
                initDarkMode();
            }
        })
        .then(savedJobsData => {
            if (savedJobsData) {
                savedJobs = savedJobsData.map(j => j.id);
                showLoggedInUI();
                loadJobs();
                initDarkMode();
            }
        })
        .catch(err => {
            console.error('Auth error, showing fallback links', err);
            if (authSection) {
                authSection.innerHTML = '<a href="/login.html">Login</a> | <a href="/register.html">Register</a>';
            }
        });

    function showLoggedOutLinks() {
        if (!authSection) return;
        authSection.innerHTML = `
            <a href="/login.html">Login</a>
            <a href="/register.html">Register</a>
            <button id="dark-mode-toggle" class="mode-toggle" style="background:none; border:none; color:white; cursor:pointer;">
                <i class="fas fa-moon"></i> Dark
            </button>
        `;
        if (jobFormContainer) jobFormContainer.style.display = 'none';
    }

    function showLoggedInUI() {
        if (!authSection) return;
        let menuItems = [];
        if (currentUserIsAdmin) {
            menuItems.push('<a href="/admin.html">Admin</a>');
        }
        menuItems.push('<a href="/saved.html">Saved Jobs</a>');
        menuItems.push('<a href="/alerts.html">Alerts</a>');
        menuItems.push('<a href="/edit-company.html">Edit Company</a>');
        menuItems.push('<a href="/my-applications.html">My Applications</a>');
        menuItems.push(`<a href="/profile.html">${currentUser}</a>`);
        const menuHtml = menuItems.join(' | ');

        authSection.innerHTML = `
            ${menuHtml}
            <button id="dark-mode-toggle" class="mode-toggle" style="background:none; border:none; color:white; cursor:pointer;">
                <i class="fas fa-moon"></i> Dark
            </button>
            <button id="logout-btn">Logout</button>
        `;
        document.getElementById('logout-btn')?.addEventListener('click', logout);
        if (jobFormContainer) jobFormContainer.style.display = 'block';
    }

    function logout() {
        fetch('/auth/logout', { method: 'POST' })
            .then(() => location.reload());
    }

    // Job posting form
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const jobData = {
                title: document.getElementById('title').value,
                company: document.getElementById('company').value,
                location: document.getElementById('location').value,
                type: document.getElementById('type').value,
                salary: document.getElementById('salary').value,
                description: document.getElementById('description').value,
                posted: new Date().toISOString().split('T')[0]
            };
            fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            })
            .then(res => {
                if (res.status === 401) {
                    alert('You must be logged in to post a job.');
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.job) {
                    postMessageDiv.style.display = 'block';
                    postMessageDiv.style.backgroundColor = '#d4edda';
                    postMessageDiv.style.color = '#155724';
                    postMessageDiv.innerHTML = '✅ Your job has been submitted and is awaiting admin approval.';
                    currentPage = 1;
                    loadJobs();
                    e.target.reset();
                    setTimeout(() => {
                        postMessageDiv.style.display = 'none';
                    }, 8000);
                }
            });
        });
    }

    // Filter UI
    if (container) {
        const filterContainer = document.createElement('div');
        filterContainer.id = 'filter-container';
        filterContainer.innerHTML = `
            <input type="text" id="filter-title" placeholder="Job title" value="${filterTitle}">
            <input type="text" id="filter-location" placeholder="Location" value="${filterLocation}">
            <button id="filter-btn">Filter</button>
        `;
        container.parentNode.insertBefore(filterContainer, container);

        document.getElementById('filter-btn')?.addEventListener('click', () => {
            filterTitle = document.getElementById('filter-title').value;
            filterLocation = document.getElementById('filter-location').value;
            currentPage = 1;
            loadJobs();
        });

        const paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.style.cssText = 'display:flex; justify-content:center; gap:1rem; margin:2rem;';
        container.parentNode.appendChild(paginationContainer);
    }

    function loadJobs() {
        if (!container) return;
        let url = `/api/jobs?page=${currentPage}&per_page=${perPage}`;
        if (filterTitle) url += `&title=${encodeURIComponent(filterTitle)}`;
        if (filterLocation) url += `&location=${encodeURIComponent(filterLocation)}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const jobs = data.jobs;
                totalPages = data.total_pages;
                container.innerHTML = '';
                jobs.forEach(job => {
                    const card = document.createElement('div');
                    card.className = 'job-card';
                    card.setAttribute('data-job-id', job.id);

                    const isOwner = currentUserId && job.posted_by === currentUserId;
                    const isSaved = currentUserId && savedJobs.includes(job.id);
                    const saveButton = currentUserId ? `<button class="save-btn ${isSaved ? 'saved' : ''}" data-id="${job.id}">${isSaved ? 'Saved' : 'Save'}</button>` : '';
                    const applyButton = currentUserId && !isOwner && job.status === 'approved' ? `<a href="/apply.html?jobId=${job.id}" class="apply-btn">Apply</a>` : '';

                    let actionButtons = '';
                    if (isOwner) {
                        actionButtons = `
                            <div class="job-actions">
                                <button class="edit-btn" data-id="${job.id}">Edit</button>
                                <button class="delete-btn" data-id="${job.id}">Delete</button>
                            </div>
                        `;
                    }

                    let statusBadge = '';
                    if (job.status !== 'approved') {
                        statusBadge = `<span class="status-badge ${job.status}">${job.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}</span>`;
                    }

                    card.innerHTML = `
                        <h2><a href="/job/${job.id}">${job.title}</a> ${statusBadge}</h2>
                        <p class="company"><a href="/company.html?id=${job.posted_by}">${job.company}</a></p>
                        <p class="location">${job.location}</p>
                        <p class="type">${job.type}</p>
                        <p class="salary">${job.salary}</p>
                        <p class="description">${job.description}</p>
                        <small>Posted: ${job.posted}</small>
                        <div class="card-actions">
                            ${saveButton}
                            ${applyButton}
                            ${actionButtons}
                        </div>
                    `;
                    container.appendChild(card);
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.target.dataset.id;
                        deleteJob(jobId);
                    });
                });

                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.target.dataset.id;
                        editJob(jobId);
                    });
                });

                document.querySelectorAll('.save-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.target.dataset.id;
                        toggleSave(jobId, btn);
                    });
                });

                renderPagination();
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p>Failed to load jobs.</p>';
            });
    }

    function toggleSave(jobId, btn) {
        const method = btn.classList.contains('saved') ? 'DELETE' : 'POST';
        const url = `/saved/${jobId}`;
        fetch(url, { method })
            .then(res => res.json())
            .then(data => {
                if (data.error) alert(data.error);
                else {
                    if (method === 'POST') {
                        btn.classList.add('saved');
                        btn.textContent = 'Saved';
                        savedJobs.push(parseInt(jobId));
                    } else {
                        btn.classList.remove('saved');
                        btn.textContent = 'Save';
                        savedJobs = savedJobs.filter(id => id !== parseInt(jobId));
                    }
                }
            })
            .catch(err => alert('Error saving job'));
    }

    function renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadJobs();
            }
        });

        const pageSpan = document.createElement('span');
        pageSpan.textContent = `Page ${currentPage} of ${totalPages}`;

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadJobs();
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageSpan);
        paginationContainer.appendChild(nextBtn);
    }

    function deleteJob(jobId) {
        if (!confirm('Delete this job?')) return;
        fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert('Deleted');
                    loadJobs();
                } else {
                    return res.json().then(data => alert(data.error));
                }
            })
            .catch(err => alert('Error'));
    }

    function editJob(jobId) {
        fetch(`/api/jobs/${jobId}`)
            .then(res => res.json())
            .then(job => {
                const newTitle = prompt('New title:', job.title);
                if (!newTitle) return;
                const newCompany = prompt('New company:', job.company);
                const newLocation = prompt('New location:', job.location);
                const newType = prompt('New type:', job.type);
                const newSalary = prompt('New salary:', job.salary);
                const newDesc = prompt('New description:', job.description);
                const updated = {
                    title: newTitle,
                    company: newCompany,
                    location: newLocation,
                    type: newType,
                    salary: newSalary,
                    description: newDesc,
                    posted: job.posted
                };
                fetch(`/api/jobs/${jobId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated)
                })
                .then(res => {
                    if (res.ok) {
                        alert('Updated');
                        loadJobs();
                    } else {
                        return res.json().then(data => alert(data.error));
                    }
                });
            });
    }

    // Initial load (if not already triggered)
    if (typeof loadJobs === 'function' && !currentUser) {
        // Already called inside auth flow
    }
});
