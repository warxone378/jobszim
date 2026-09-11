document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('companyForm');
    const logoInput = document.getElementById('logo');
    const logoPreview = document.getElementById('logoPreview');

    fetch('/company/me')
        .then(res => res.json())
        .then(data => {
            document.getElementById('company_name').value = data.company_name || '';
            document.getElementById('company_description').value = data.company_description || '';
            document.getElementById('website').value = data.website || '';
            if (data.company_logo) {
                logoPreview.src = `/logos/${data.company_logo}`;
                logoPreview.style.display = 'block';
            }
        });

    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logoPreview.src = e.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('company_name', document.getElementById('company_name').value);
        formData.append('company_description', document.getElementById('company_description').value);
        formData.append('website', document.getElementById('website').value);
        if (logoInput.files[0]) {
            formData.append('logo', logoInput.files[0]);
        }

        const res = await fetch('/company/me', {
            method: 'PUT',
            body: formData
        });
        const data = await res.json();
        document.getElementById('message').innerHTML = `<p>${data.message}</p>`;
    });
});
