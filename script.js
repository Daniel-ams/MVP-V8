document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentSectionIndex = 0;
    let sectionsData = []; // This will hold our form schema

    // --- DOM ELEMENTS ---
    const formContainer = document.getElementById('snapshot-form');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const saveBtn = document.getElementById('saveBtn');
    const validateBtn = document.getElementById('validateBtn');
    const summaryContent = document.getElementById('summary-content');

    // --- INITIALIZATION ---
    // Fetch the form schema and render the form
    fetch('form-schema.json')
        .then(response => response.json())
        .then(schema => {
            sectionsData = schema;
            renderForm();
            showSection(currentSectionIndex);
        })
        .catch(error => console.error('Error fetching form schema:', error));

    // --- UI RENDERING ---

    /**
     * Renders the entire form based on the fetched schema.
     */
    function renderForm() {
        sectionsData.forEach(sectionData => {
            const sectionEl = createSection(sectionData);
            formContainer.appendChild(sectionEl);
        });
    }

    /**
     * Creates a single section element.
     * @param {object} sectionData - The data for the section from the schema.
     * @returns {HTMLElement} The created section element.
     */
    function createSection(sectionData) {
        const section = document.createElement('section');
        section.id = sectionData.id;
        
        const title = document.createElement('h2');
        title.textContent = sectionData.title;
        section.appendChild(title);

        if (sectionData.note) {
            const note = document.createElement('p');
            note.className = 'note';
            note.textContent = sectionData.note;
            section.appendChild(note);
        }

        sectionData.fields.forEach(field => {
            const formGroup = createField(field);
            section.appendChild(formGroup);
        });

        return section;
    }

    /**
     * Creates a form field (label + input) based on schema data.
     * @param {object} fieldData - The data for the field from the schema.
     * @returns {HTMLElement} The created form group element.
     */
    function createField(fieldData) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', fieldData.id);
        label.textContent = fieldData.label;
        formGroup.appendChild(label);

        let input;
        switch (fieldData.type) {
            case 'textarea':
                input = document.createElement('textarea');
                break;
            case 'select':
                input = document.createElement('select');
                fieldData.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
                break;
            default: // 'text', 'number', etc.
                input = document.createElement('input');
                input.type = fieldData.type;
        }

        input.id = fieldData.id;
        input.name = fieldData.id;
        if (fieldData.placeholder) {
            input.placeholder = fieldData.placeholder;
        }
        
        formGroup.appendChild(input);
        return formGroup;
    }

    /**
     * Shows a specific section and updates navigation buttons.
     * @param {number} index - The index of the section to show.
     */
    function showSection(index) {
        const sections = formContainer.querySelectorAll('section');
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
        });
        updateNavButtons();
    }

    /**
     * Updates the visibility and state of navigation buttons.
     */
    function updateNavButtons() {
        prevBtn.style.display = (currentSectionIndex > 0) ? 'inline-block' : 'none';
        nextBtn.style.display = (currentSectionIndex < sectionsData.length - 1) ? 'inline-block' : 'none';
        saveBtn.style.display = (currentSectionIndex === sectionsData.length - 1) ? 'inline-block' : 'none';
        validateBtn.style.display = (currentSectionIndex === sectionsData.length - 1) ? 'inline-block' : 'none';
    }
    
    /**
     * Updates the summary panel with the current form data.
     */
    function updateSummary() {
        // This function can be enhanced later
        summaryContent.innerHTML = '<p>Summary will be updated here...</p>';
    }

    // --- DATA HANDLING ---

    /**
     * Gathers all data from the form and sends it to our Netlify function.
     */
    async function saveProfile() {
        const form = document.getElementById('snapshot-form');
        const allFormData = new FormData(form);
        const profileData = {};

        for (const [key, value] of allFormData.entries()) {
            profileData[key] = value;
        }

        console.log("Sending data to backend:", profileData);

        try {
            const response = await fetch('/.netlify/functions/save-snapshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Success:", result);
            alert('Your profile has been successfully sent to the server!');

        } catch (error) {
            console.error("Error saving profile:", error);
            alert('There was an error saving your profile. Please try again.');
        }
    }


    // --- EVENT LISTENERS ---
    
    nextBtn.addEventListener('click', () => {
        if (currentSectionIndex < sectionsData.length - 1) {
            currentSectionIndex++;
            showSection(currentSectionIndex);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            showSection(currentSectionIndex);
        }
    });

    saveBtn.addEventListener('click', (event) => {
        event.preventDefault();
        saveProfile();
    });

    validateBtn.addEventListener('click', (event) => {
        event.preventDefault();
        alert('AI validation coming soon!');
    });
});
