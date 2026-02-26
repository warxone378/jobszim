document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');
    const jobTitle = document.getElementById('job-title');

    if (!jobId) {
        jobTitle.textContent = 'No job specified';
        return;
    }

    fetch(`/api/jobs/${jobId}`)
        .then(res => res.json())
        .then(job => {
            jobTitle.textContent = `Applying for: ${job.title}`;
        })
        .catch(err => {
            jobTitle.textContent = 'Job not found';
        });

    document.getElementById('applicationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('message', document.getElementById('message').value);
        const cvFile = document.getElementById('cv').files[0];
        if (cvFile) formData.append('cv', cvFile);

        fetch(`/applications/apply/${jobId}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('status').innerHTML = `<p style="color:red">${data.error}</p>`;
            } else {
                document.getElementById('status').innerHTML = '<p style="color:green">Application submitted successfully!</p>';
                document.getElementById('applicationForm').reset();
            }
        })
        .catch(err => {
            document.getElementById('status').innerHTML = '<p style="color:red">An error occurred.</p>';
        });
    });
});
