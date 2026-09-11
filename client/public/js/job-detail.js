document.addEventListener('DOMContentLoaded', () => {
    const jobId = window.location.pathname.split('/').pop();
    const container = document.getElementById('job-detail-container');
    const reviewsContainer = document.getElementById('reviews');

    let currentUserId = null;

    fetch('/auth/status')
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                currentUserId = data.user_id;
            }
        });

    fetch(`/api/jobs/${jobId}`)
        .then(res => res.json())
        .then(job => {
            let statusMessage = '';
            if (job.status !== 'approved' && currentUserId === job.posted_by) {
                statusMessage = '<div class="pending-message">⏳ This job is pending approval and is not visible to the public yet.</div>';
            }
            container.innerHTML = `
                <div class="job-card full">
                    <h2>${job.title}</h2>
                    <p class="company">${job.company}</p>
                    <p class="location">${job.location}</p>
                    <p class="type">${job.type}</p>
                    <p class="salary">${job.salary}</p>
                    <p>${job.description}</p>
                    <p><strong>Posted:</strong> ${job.posted}</p>
                    ${statusMessage}
                </div>
            `;

            // Share buttons
            const shareDiv = document.createElement('div');
            shareDiv.className = 'share-buttons';
            shareDiv.innerHTML = `
                <h3>Share this job:</h3>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank">Facebook</a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(job.title)}" target="_blank">Twitter</a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank">LinkedIn</a>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(job.title + ' ' + window.location.href)}" target="_blank">WhatsApp</a>
            `;
            document.querySelector('.job-card.full').appendChild(shareDiv);
        })
        .catch(err => container.innerHTML = '<p>Job not found.</p>');

    // Load reviews
    fetch(`/reviews/job/${jobId}`)
        .then(res => res.json())
        .then(reviews => {
            let html = '<h3>Reviews</h3>';
            if (reviews.length === 0) html += '<p>No reviews yet.</p>';
            else {
                reviews.forEach(r => {
                    html += `
                        <div class="review">
                            <div class="rating">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                            <p>${r.comment}</p>
                            <small>${new Date(r.date).toLocaleString()}</small>
                        </div>
                    `;
                });
            }
            // Add review form if logged in
            fetch('/auth/status').then(res => res.json()).then(data => {
                if (data.logged_in) {
                    html += `
                        <h4>Add a Review</h4>
                        <form id="reviewForm">
                            <select id="rating" required>
                                <option value="5">5 ★</option>
                                <option value="4">4 ★</option>
                                <option value="3">3 ★</option>
                                <option value="2">2 ★</option>
                                <option value="1">1 ★</option>
                            </select>
                            <textarea id="comment" placeholder="Your review" required></textarea>
                            <button type="submit">Submit Review</button>
                        </form>
                    `;
                    reviewsContainer.innerHTML = html;
                    document.getElementById('reviewForm').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const rating = document.getElementById('rating').value;
                        const comment = document.getElementById('comment').value;
                        fetch(`/reviews/job/${jobId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rating, comment })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.error) alert(data.error);
                            else location.reload();
                        });
                    });
                } else {
                    reviewsContainer.innerHTML = html;
                }
            });
        });
});

    // Add JSON-LD structured data for Google Jobs
    if (job.status === 'approved') {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        const validThrough = new Date(job.posted);
        validThrough.setMonth(validThrough.getMonth() + 1); // 1 month validity

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description,
            "datePosted": job.posted,
            "validThrough": validThrough.toISOString().split('T')[0],
            "hiringOrganization": {
                "@type": "Organization",
                "name": job.company,
                "sameAs": job.website || null
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": job.location,
                    "addressCountry": "ZW"
                }
            },
            "employmentType": job.type,
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": job.salary.replace(/[^0-9k -]/g, '').trim(),
                    "unitText": "YEAR"
                }
            }
        };
        script.textContent = JSON.stringify(jsonLd);
        document.head.appendChild(script);
    }

    // Update title and meta description
    document.title = `${job.title} at ${job.company} - Jobszim Zimbabwe`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Apply for ${job.title} at ${job.company} in ${job.location}. ${job.description.substring(0,150)}...`;
