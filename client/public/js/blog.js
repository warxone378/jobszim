document.addEventListener('DOMContentLoaded', () => {
    fetch('/blog/posts')
        .then(res => res.json())
        .then(posts => {
            const container = document.getElementById('blog-posts');
            if (posts.length === 0) {
                container.innerHTML = '<p>No blog posts yet.</p>';
                return;
            }
            let html = '';
            posts.forEach(post => {
                html += `
                    <div class="job-card" style="margin-bottom:1rem;">
                        <h2><a href="/post.html?id=${post.id}">${post.title}</a></h2>
                        <small>${new Date(post.created).toLocaleDateString()}</small>
                        <p>${post.content.substring(0,200)}...</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        });
});
