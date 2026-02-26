document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (!postId) {
        document.getElementById('post-container').innerHTML = '<p>No post specified.</p>';
        return;
    }
    fetch(`/blog/posts/${postId}`)
        .then(res => res.json())
        .then(post => {
            document.getElementById('post-container').innerHTML = `
                <div class="job-card full">
                    <h1>${post.title}</h1>
                    <p><small>Published: ${new Date(post.created).toLocaleString()}</small></p>
                    <p>${post.content.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        })
        .catch(() => {
            document.getElementById('post-container').innerHTML = '<p>Post not found.</p>';
        });
});
