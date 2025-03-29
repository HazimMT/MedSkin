# MedSkin
 Welcome to the MedSkin project! This repository contains a backend system designed for managing medical reports and patient data. It utilizes various tools and packages to ensure efficient data handling and reporting.

 # MedSkin - AI-Powered Skin Disease Diagnosis & Management System

## Project Overview
MedSkin is an intelligent web application combining AI-powered skin disease detection with comprehensive patient management. The system features:

- Deep Learning-based disease classification (5 skin conditions) 
- Smart drug interaction checking using graph databases
- Automated medical report generation
- Full patient lifecycle management
- Treatment effectiveness tracking

## Installation Guide

### Prerequisites
- Python 3.10+
- SQLite 3
- Neo4j 4.4
- wkhtmltopdf 0.12.6

### Setup Steps
1. Clone repository:
```bash
git clone https://github.com/HazimMT/MedSkin.git
cd MedSkin
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure databases:
```python
# SQLite3 Configuration (settings.py)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Neo4j Configuration (GD.py)
URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "newpassword"
```

5. Initialize system:
```bash
python manage.py migrate
python manage.py loaddata initial_data.json
```

## Key Features

### Core Modules:
1. **AI Diagnosis Engine**
   - EfficientNet-B0 model (85%+ accuracy)
   - Image preprocessing pipeline
   - Confidence-based predictions

2. **Patient Management**
   - CRUD operations for patient records
   - Disease history tracking


3. **Smart Pharmacology**
   - Neo4j-powered drug interaction checker
   - 150+ drug compatibility rules
   - Treatment recommendation system

4. **Report Automation**
   - PDF generation with Jinja2 templates
   - Dynamic content insertion
   - Download/View functionality

## Technical Specifications

### Backend Stack
- Django 4.1 (Web Framework)
- SQLite (Primary Database)
- Neo4j (Graph Database)
- PyTorch 1.12 (ML Framework)
- pdfkit + wkhtmltopdf (PDF Generation)

### Frontend Stack
- HTML5 + CSS3
- Custom CSS Framework
- Vanilla JavaScript
- Custom Design System

### Machine Learning Components
```python
# Model Architecture
model = models.efficientnet_b0(pretrained=False)
model.classifier[1] = nn.Linear(1280, 5)  # 5 disease classes

# Image Preprocessing
transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                        [0.229, 0.224, 0.225])
])
```

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/` | GET | List all patients |
| `/api/patients/{id}/` | GET | Get patient details |
| `/api/reports/` | POST | Generate medical report |
| `/api/drugs/` | GET | List available medications |

## Usage Instructions

1. **Patient Registration**
   - Navigate to `/patients-page`
   - Enter patient ID and full name
   - Select existing conditions from dropdown

2. **Diagnosis Process**
   - Go to `/tool`
   - Search patient by ID
   - Upload lesion image (JPEG/PNG)
   - Click "Generate Report"

3. **Report Generation**
   - System processes image
   - AI model generates diagnosis
   - PDF report created automatically

## Support and Maintenance

For technical support or bug reports:
- GitHub Issues: https://github.com/HazimMT/medskin/issues


## License
This project is not licensed yet.

---
Last Updated: March 2024
Version: 1.0.0

