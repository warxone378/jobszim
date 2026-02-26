document.addEventListener('DOMContentLoaded', () => {
    let educationCount = 0;
    let experienceCount = 0;

    // Load existing resume
    fetch('/resume/')
        .then(res => res.json())
        .then(data => {
            if (!data.error) {
                document.getElementById('full_name').value = data.full_name || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('address').value = data.address || '';
                document.getElementById('skills').value = data.skills || '';
                if (data.education) {
                    data.education.forEach(edu => addEducation(edu));
                }
                if (data.experience) {
                    data.experience.forEach(exp => addExperience(exp));
                }
            }
        });

    document.getElementById('addEducation').addEventListener('click', () => addEducation());
    document.getElementById('addExperience').addEventListener('click', () => addExperience());

    function addEducation(data = {}) {
        const container = document.getElementById('educationContainer');
        const id = `edu_${++educationCount}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = 'education-entry';
        div.innerHTML = `
            <div style="border:1px solid #ddd; padding:1rem; margin-bottom:1rem;">
                <input type="text" class="edu_degree" placeholder="Degree" value="${data.degree || ''}">
                <input type="text" class="edu_institution" placeholder="Institution" value="${data.institution || ''}">
                <input type="text" class="edu_year" placeholder="Year" value="${data.year || ''}">
                <button type="button" class="remove-btn" onclick="removeEducation('${id}')">Remove</button>
            </div>
        `;
        container.appendChild(div);
    }

    window.removeEducation = (id) => document.getElementById(id).remove();

    function addExperience(data = {}) {
        const container = document.getElementById('experienceContainer');
        const id = `exp_${++experienceCount}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = 'experience-entry';
        div.innerHTML = `
            <div style="border:1px solid #ddd; padding:1rem; margin-bottom:1rem;">
                <input type="text" class="exp_title" placeholder="Job Title" value="${data.title || ''}">
                <input type="text" class="exp_company" placeholder="Company" value="${data.company || ''}">
                <input type="text" class="exp_dates" placeholder="Dates (e.g., 2020-2023)" value="${data.dates || ''}">
                <textarea class="exp_description" placeholder="Description">${data.description || ''}</textarea>
                <button type="button" class="remove-btn" onclick="removeExperience('${id}')">Remove</button>
            </div>
        `;
        container.appendChild(div);
    }

    window.removeExperience = (id) => document.getElementById(id).remove();

    document.getElementById('resumeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            skills: document.getElementById('skills').value,
            education: [],
            experience: []
        };
        document.querySelectorAll('.education-entry').forEach(entry => {
            data.education.push({
                degree: entry.querySelector('.edu_degree').value,
                institution: entry.querySelector('.edu_institution').value,
                year: entry.querySelector('.edu_year').value
            });
        });
        document.querySelectorAll('.experience-entry').forEach(entry => {
            data.experience.push({
                title: entry.querySelector('.exp_title').value,
                company: entry.querySelector('.exp_company').value,
                dates: entry.querySelector('.exp_dates').value,
                description: entry.querySelector('.exp_description').value
            });
        });
        fetch('/resume/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(() => alert('Resume saved!'));
    });
});
