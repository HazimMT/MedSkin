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
- Neo4j 5.28
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

### Backend Architecture  
| Component               | Technology/Package           | Version     | Implementation Details                          |  
|-------------------------|------------------------------|-------------|-------------------------------------------------|  
| Web Framework           | Django                       | 4.1.4       | `medskin_backend/settings.py` configuration     |  
| Primary Database        | SQLite (Development)         | 3.37+       | `DATABASES` in settings.py                      |  
| Graph Database          | Neo4j                        | 4.4         | `GD.py` driver configuration                    |  
| ML Framework            | PyTorch                      | 1.12.0      | Integrated via `model_method.ipynb`             |  
| PDF Generation          | pdfkit + wkhtmltopdf         | 1.0.0       | `Report.py` template rendering                  |  
| API Security            | django-cors-headers          | 3.13.0      | CORS configuration in settings.py               |  
| Database ORM            | django-neomodel              | 0.0.9       | Neo4j graph operations in `GD.py`               |  
| Template Engine         | Jinja2                       | 3.1.2       | HTML template rendering in `Report.py`          |  
  
### Frontend Implementation  
| Component               | Technology                   | Implementation Files                          | Key Features                                  |  
|-------------------------|------------------------------|-----------------------------------------------|-----------------------------------------------|  
| Core Markup             | HTML5                        | `templates/tool.html`                         | Semantic structure, WAI-ARIA                 |  
| Styling                 | CSS3 + Custom Framework      | `static/css/tool.css`, `navbar.css`           | Responsive design, CSS variables              |  
| Interactivity           | Vanilla JavaScript           | `static/js/tool.js`, `navbar.js`              | DOM manipulation, Fetch API                  |  
| UI Components           | Custom Design System         | `templates/*.html`                            | Reusable components, BEM methodology         |  
| File Handling           | Drag & Drop API              | `tool.html` dropzone                          | File validation, progress tracking           |  
| PDF Handling            | PDF.js (Browser-native)      | `tool.html` report section                    | In-browser preview, download functionality   |

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

