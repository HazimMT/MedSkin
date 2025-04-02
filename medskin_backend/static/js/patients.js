// patients.js
window.addEventListener('DOMContentLoaded', () => {
  fetchPatientsList();
  fetchDrugsList(); // Fetch drug names on page load
});

async function fetchPatientsList() {
  try {
    const response = await fetch('http://127.0.0.1:8000/patients/');
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    const patientsData = await response.json();
    const patientsList = document.getElementById('patientsList');
    patientsList.innerHTML = '';
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

async function fetchDrugsList(targetId = 'diseasesContainer') {
  try {
    const response = await fetch('http://127.0.0.1:8000/patients/list/');
    const drugsData = await response.json();
    const container = document.getElementById(targetId);
    container.innerHTML = '';
    
    drugsData.drugs.forEach(drug => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="${drug}"> ${drug}`;
      container.appendChild(label);
    });

    // Add event listeners to checkboxes
    const checkboxes = document.querySelectorAll(`#${targetId} input[type="checkbox"]`);
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const containerId = targetId;
        const buttonId = targetId.includes('edit') ? 'editDiseasesDropdown' : 'diseasesDropdown';
        getSelectedDiseases(containerId, buttonId);
      });
    });
  } catch (error) {
    console.error(error);
    showModal('error', 'Fetch Error', error.message);
  }
}

document.getElementById('patientForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const patientID = document.getElementById('patientID').value.trim();
  const fullName = document.getElementById('fullName').value.trim();
  const selectedDiseases = getSelectedDiseases('diseasesList', 'diseasesDropdown');

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

    showModal('success', 'Patient Added!', result.message || 'Patient added successfully.');
    fetchPatientsList();
    document.getElementById('patientForm').reset();
    document.getElementById('diseasesDropdown').textContent = 'Select Diseases';
    document.querySelectorAll('#diseasesList input[type="checkbox"]').forEach(cb => cb.checked = false);
  } catch (error) {
    console.error(error);
    showModal('error', 'Network Error', 'Could not connect to backend.');
  }
});

function addPatientToList(patient) {
  const patientEntry = document.createElement('li');
  patientEntry.innerHTML = `
    <div>
      <strong>${patient.name}</strong> (ID: P${patient.id})<br>
      Diseases: ${patient.diseases}
    </div>
    <button class="delete-btn" onclick="deletePatient('${patient.id}', this)">🗑️</button>
    <button class="edit-btn" onclick="editPatient('${patient.id}', this)">✏️</button>
  `;
  document.getElementById('patientsList').appendChild(patientEntry);
}

async function deletePatient(patientID, button) {
  try {
    const response = await fetch(`/patients/${patientID}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      button.parentElement.remove();
      showModal('success', 'Patient Deleted', 'Patient removed successfully.');
    } else {
      showModal('error', 'Error', 'Failed to delete patient.');
    }
  } catch (error) {
    console.error(error);
    showModal('error', 'Network Error', 'Could not connect to backend.');
  }
}

// Dropdown toggles
document.getElementById('diseasesDropdown').addEventListener('click', function() {
  this.parentElement.classList.toggle('active');
});

document.getElementById('editDiseasesDropdown').addEventListener('click', function() {
  this.parentElement.classList.toggle('active');
});

window.addEventListener('click', function(e) {
  // Close main dropdown
  const mainWrapper = document.getElementById('diseasesDropdownWrapper');
  if (mainWrapper && !e.target.closest('#diseasesDropdownWrapper')) {
    mainWrapper.classList.remove('active');
  }

  // Close edit dropdown
  const editWrapper = document.getElementById('editDiseasesDropdownWrapper');
  if (editWrapper && !e.target.closest('#editDiseasesDropdownWrapper')) {
    editWrapper.classList.remove('active');
  }
});

function getSelectedDiseases(containerId = 'diseasesList', buttonId = 'diseasesDropdown') {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]`);
  const selected = [];

  checkboxes.forEach(cb => {
    if (cb.checked && cb.value !== 'None') selected.push(cb.value);
  });

  const noneCheckbox = document.querySelector(`#${containerId} input[value="None"]`);
  if (noneCheckbox?.checked) return ['None'];

  const selectedList = selected.length ? selected : ['None'];
  
  // Update button text
  const dropdownBtn = document.getElementById(buttonId);
  if (dropdownBtn) {
    dropdownBtn.textContent = selectedList.join(', ') || 'Select Diseases';
    dropdownBtn.classList.toggle('selected', selectedList.length > 0);
  }

  return selectedList;
}

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

async function editPatient(patientID, button) {
  try {
    const response = await fetch(`/patients/${patientID}/`);
    const patientData = await response.json();

    document.getElementById('editPatientID').value = patientData.patient_id;
    document.getElementById('editFullName').value = patientData.full_name;

    await fetchDrugsList('editDiseasesList');

    const selectedDiseases = patientData.diseases.split(', ').map(d => d.trim());
    const checkboxes = document.querySelectorAll('#editDiseasesList input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = selectedDiseases.includes(cb.value));

    document.getElementById('editPatientModal').classList.remove('hidden');
  } catch (error) {
    showModal('error', 'Error', 'Failed to load patient data.');
  }
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const patientID = document.getElementById('editPatientID').value;
  const fullName = document.getElementById('editFullName').value;
  const selectedDiseases = getSelectedDiseases('editDiseasesList', 'editDiseasesDropdown');

  try {
    const response = await fetch(`/patients/${patientID}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientID,
        fullName,
        diseases: selectedDiseases.join(', ')
      })
    });

    if (response.ok) {
      const result = await response.json();
      showModal('success', 'Patient Updated', result.message || 'Patient updated successfully.');
      closeEditModal();
      fetchPatientsList();
    } else {
      const errorData = await response.json();
      showModal('error', 'Error', errorData.message || 'Update failed.');
    }
  } catch (error) {
    console.error(error);
    showModal('error', 'Network Error', 'Could not connect to backend.');
  }
});

function closeEditModal() {
  document.getElementById('editPatientModal').classList.add('hidden');
  document.getElementById('editForm').reset();
  document.querySelectorAll('#editDiseasesList input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('editDiseasesDropdown').textContent = 'Select Diseases';
}

document.getElementById('searchInput').addEventListener('keyup', (e) => {
  const query = e.target.value.toLowerCase();
  filterPatients(query);
});

function filterPatients(query) {
  const listItems = document.querySelectorAll('#patientsList li');
  listItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? '' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchDisease');
    if (searchBox) {
        searchBox.addEventListener('input', function () {
            filterDiseases(this.value);
        });
    }
});

function filterDiseases(query) {
    const diseasesContainer = document.getElementById('diseasesContainer');
    if (!diseasesContainer) return;

    const labels = diseasesContainer.getElementsByTagName('label');
    Array.from(labels).forEach(label => {
        if (label.textContent.toLowerCase().includes(query.toLowerCase())) {
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
    });
}



// Add this code to patients.js

// Disease search functionality
document.getElementById('searchDisease').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  filterDiseaseOptions(searchTerm, 'diseasesContainer');
});

// Edit modal disease search
document.getElementById('editDiseasesList').addEventListener('input', function(e) {
  if (e.target.id === 'searchDiseaseEdit') {  // Add matching ID in HTML
    const searchTerm = e.target.value.toLowerCase();
    filterDiseaseOptions(searchTerm, 'editDiseasesContainer');
  }
});

function filterDiseaseOptions(searchTerm, containerId) {
  const options = document.querySelectorAll(`#${containerId} label`);
  options.forEach(option => {
    const text = option.textContent.toLowerCase();
    option.style.display = text.includes(searchTerm) ? 'block' : 'none';
  });
}




