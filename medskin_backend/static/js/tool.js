// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, setting up event handlers");
    
    // Set up the report generation button
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateReport);
        console.log("Event listener attached to generate button");
    }
});

// File handling functions
function allowDrop(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    displayFile(file);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    displayFile(file);
}

function displayFile(file) {
    if (!file) return;

    document.getElementById("fileList").style.display = "block";

    const fileNameElement = document.getElementById("fileName");
    const fileSizeKB = (file.size / 1024).toFixed(1) + "kb";
    fileNameElement.innerText = `${file.name} (${fileSizeKB})`;

    const progressBar = document.getElementById("uploadProgress");
    progressBar.value = 0;
    simulateProgress(progressBar);
}

function simulateProgress(progressBar) {
    let progress = 0;
    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
        } else {
            progress += 20;
            progressBar.value = progress;
        }
    }, 200);
}

function removeFile() {
    document.getElementById("fileList").style.display = "none";
    document.getElementById("fileInput").value = "";
}

// Search patient function
function searchPatient() {
    const patientID = document.getElementById("patientID").value.trim();
    if (!patientID) {
        showModal('error', 'Error', 'Please enter a Patient ID to search.');
        return;
    }

    // Show searching status
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.innerHTML = 'Searching...';

    // Use relative URL
    fetch(`/patients/${patientID}/`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Patient not found');
                });
            }
            return response.json();
        })
        .then(patientData => {
            document.getElementById("patientName").textContent = patientData.full_name;
            document.getElementById("patientDiseases").textContent = patientData.diseases;
            document.getElementById("patientDetails").classList.remove("hidden");
        })
        .catch(error => {
            showModal('error', 'Error', error.message);
            console.error('Search Error:', error);
        })
        .finally(() => {
            searchBtn.innerHTML = '🔍';
        });
}

// Report generation function
function handleGenerateReport(event) {
    // Prevent default behavior
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log("Generate report button clicked");
    
    // Get button and disable it
    const generateBtn = document.getElementById('generateReportBtn');
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    try {
        const patientID = document.getElementById("patientID").value.trim();
        const fileInput = document.getElementById("fileInput");
        
        if (!patientID) {
            showModal('error', 'Error', 'Please enter a Patient ID to search.');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Click to Generate';
            return false;
        }
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showModal('error', 'Error', 'Please select an image file!');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Click to Generate';
            return false;
        }
        
        const file = fileInput.files[0];
        console.log("Preparing to upload:", file.name);
        
        // Create form data
        const formData = new FormData();
        formData.append("patient_id", patientID);
        formData.append("image", file);
        
        console.log("Sending request to server...");
        
        // Use XMLHttpRequest with relative URL
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/patients/generate-report/", true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log("Server response received:", xhr.responseText);
                try {
                    const result = JSON.parse(xhr.responseText);
                    
                    if (result.pdf_url) {
                        console.log("PDF URL received:", result.pdf_url);
                        
                        // Update UI with report info
                        const reportSection = document.getElementById("reportSection");
                        reportSection.style.display = "flex";
                        reportSection.classList.remove("hidden");
                        
                        // Store PDF URL
                        reportSection.dataset.pdfUrl = result.pdf_url;
                        
                        // Update report details
                        document.querySelector('.report-name').textContent = `Report_${patientID}.pdf`;
                        showModal('success', 'Success', 'Report generated successfully!');
                        if (result.file_size) {
                            document.querySelector('.report-size').textContent = 
                                `${(result.file_size/1024).toFixed(1)}kb`;
                        } else {
                            document.querySelector('.report-size').textContent = 'Unknown size';
                        }
                        
                        // Scroll to report section
                        reportSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        throw new Error("No PDF URL in server response");
                    }
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                    showModal('error', 'Parsing Error', `Error processing server response: ${parseError.message}`);
                }
            } else {
                console.error("Server error:", xhr.status, xhr.responseText);
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    showModal('error', 'Server Error', errorData.error || `Server responded with status ${xhr.status}`);
                } catch (e) {
                    showModal('error', 'Server Error', `Server error: ${xhr.status}`);;
                }
            }
            
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.textContent = 'Click to Generate';
        };
        
        xhr.onerror = function() {
            console.error("Network error occurred");
            showModal('error', 'Network Error', 'Network error. Please check your connection.');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Click to Generate';
        };
        
        // Send the request
        xhr.send(formData);
        console.log("Request sent to server");
        
    } catch (error) {
        console.error("Error in generate report:", error);
        showModal('error', 'Error', error.message);
        
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.textContent = 'Click to Generate';
    }
    
    return false;
}

// Download report function
function downloadReport() {
    const reportSection = document.getElementById("reportSection");
    const pdfUrl = reportSection.dataset.pdfUrl;
    
    if (!pdfUrl) {
        showModal('error', 'Download Error', 'No PDF URL available. Please generate the report first.');
        return;
    }
    
    console.log("Downloading PDF from:", pdfUrl);
    
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = document.querySelector('.report-name').textContent || "Report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// View report function
function viewReport() {
    const reportSection = document.getElementById("reportSection");
    const pdfUrl = reportSection.dataset.pdfUrl;
    
    if (!pdfUrl) {
        showModal('error', 'View Error', 'No PDF URL available. Please generate the report first.');
        return;
    }
    
    console.log("Opening PDF in new tab:", pdfUrl);
    window.open(pdfUrl, "_blank");
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

