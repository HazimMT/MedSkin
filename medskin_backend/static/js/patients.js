// 1) On page load, fetch existing patients and drug names from Django
window.addEventListener('DOMContentLoaded', () => {
  fetchPatientsList();
  fetchDrugsList();  // Fetch drug names on page load
});

// 2) Retrieve and display patients from Django
async function fetchPatientsList() {
  try {
      const response = await fetch('http://127.0.0.1:8000/patients/');
      if (!response.ok) {
          throw new Error('Failed to fetch patients');
      }
      const patientsData = await response.json();

      // Clear existing
      const patientsList = document.getElementById('patientsList');
      patientsList.innerHTML = '';

      // Populate <ul> with data
      patientsData.forEach((p) => {
          addPatientToList({
              id: p.patient_id,
              name: p.full_name,
              diseases: p.diseases
          });
      });
  } catch (error) {
      console.error(error);
      showModal('error', 'Fetch Error', error.message);
  }
}

// 3) Fetch drug names from Django
async function fetchDrugsList() {
  try {
      const response = await fetch('http://127.0.0.1:8000/patients/list/');  // Adjust the URL based on your routing
      if (!response.ok) {
          throw new Error('Failed to fetch drugs');
      }
      const drugsData = await response.json();

      // Populate the diseases dropdown
      const diseasesList = document.getElementById('diseasesList');
      diseasesList.innerHTML = '';  // Clear existing content

      drugsData.drugs.forEach(drug => {
          const label = document.createElement('label');
          label.innerHTML = `<input type="checkbox" value="${drug}"> ${drug}`;
          diseasesList.appendChild(label);
      });
  } catch (error) {
      console.error(error);
      showModal('error', 'Fetch Error', error.message);
  }
}

// 4) Handle form submission with POST request to Django
document.getElementById('patientForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const patientID = document.getElementById('patientID').value.trim();
  const fullName = document.getElementById('fullName').value.trim();
  const selectedDiseases = getSelectedDiseases();

  // POST request to Django
  try {
      const response = await fetch('http://127.0.0.1:8000/patients/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              patientID,
              fullName,
              diseases: selectedDiseases.join(', ')
          })
      });

      const result = await response.json();

      if (!response.ok) {
          showModal('error', 'Error', result.message || 'Failed to add patient.');
          return;
      }

      // Success
      showModal('success', 'Patient Added!', result.message || 'Patient added successfully.');
      fetchPatientsList(); // Refresh the list

      // Reset form
      document.getElementById('patientForm').reset();
      document.getElementById('diseasesDropdown').textContent = 'Select Diseases';
      document.getElementById('diseasesDropdown').classList.remove('selected');
      document.querySelectorAll('#diseasesList input[type="checkbox"]').forEach(cb => cb.checked = false);

  } catch (error) {
      console.error(error);
      showModal('error', 'Network Error', 'Could not connect to backend.');
  }
});

// 5) Add a single patient to the UI list
function addPatientToList(patient) {
  const patientEntry = document.createElement('li');
  patientEntry.innerHTML = `
    <div>
      <strong>${patient.name}</strong> (ID: P${patient.id})<br>
      Diseases: ${patient.diseases}
    </div>
    <button class="delete-btn" onclick="deletePatient('${patient.id}', this)">🗑️</button>
  `;
  document.getElementById('patientsList').appendChild(patientEntry);
}

// 6) Delete patient from the UI (optional: add a DELETE fetch call if you want)
function deletePatient(patientID, button) {
  // Example: just remove from the UI. 
  // If you want to remove it server-side, you could do a fetch DELETE here.
  button.parentElement.remove();
}

// 7) Disease dropdown logic
document.getElementById('diseasesDropdown').addEventListener('click', function() {
  this.parentElement.classList.toggle('active');
});

window.addEventListener('click', function(e) {
  if (!e.target.matches('.dropdown-btn')) {
      // Hide dropdown if clicked outside
      const wrapper = document.getElementById('diseasesDropdownWrapper');
      if (wrapper) wrapper.classList.remove('active');
  }
});

function getSelectedDiseases() {
  const checkboxes = document.querySelectorAll('#diseasesList input[type="checkbox"]');
  const selected = [];

  checkboxes.forEach(cb => {
      if (cb.checked && cb.value !== 'None') {
          selected.push(cb.value);
      }
  });

  const noneCheckbox = document.querySelector('#diseasesList input[value="None"]');
  if (noneCheckbox && noneCheckbox.checked) {
      // "None" means uncheck others
      checkboxes.forEach(cb => {
          if (cb.value !== 'None') cb.checked = false;
      });
      return ['None'];
  }

  const dropdownBtn = document.getElementById('diseasesDropdown');
  if (selected.length > 0) {
      dropdownBtn.textContent = selected.join(', ');
      dropdownBtn.classList.add('selected');
  } else {
      dropdownBtn.textContent = 'Select Diseases';
      dropdownBtn.classList.remove('selected');
  }

  return selected.length ? selected : ['None'];
}

// 8) Modal helpers
function showModal(type, title, message) {
  const modal = document.getElementById('messageModal');
  const modalContent = document.getElementById('modalContent');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');

  if (type === 'success') {
      modalContent.className = 'modal-content success';
      modalIcon.innerHTML = '✔️';
  } else {
      modalContent.className = 'modal-content error';
      modalIcon.innerHTML = '❌';
  }

  modalTitle.innerText = title;
  modalMessage.innerText = message;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('messageModal').classList.add('hidden');
}