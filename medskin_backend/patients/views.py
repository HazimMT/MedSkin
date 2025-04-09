import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.decorators.http import require_GET
import pandas as pd
from .models import Patient
from reports.Report import generate_medical_report
from datetime import datetime
import logging
import os
import json
import logging
from datetime import datetime
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import render
from .models import Patient
from reports.Report import generate_medical_report
from reports.GD import recommend_drug


import torch  
from torchvision import models, transforms
from PIL import Image

logger = logging.getLogger(__name__)

# Create your views here.


# Model configuration  
MODEL_PATH = os.path.join(settings.BASE_DIR, 'model', 'end.pth')  
class_names = ["Acne Vulgaris",  
               "Eczema",  
               "Healthy",  
               "Herpes Labialis",  
               "Lichen Planus",  
               "Psoriasis",  
               "Rosacea",  
               "Urticaria"]  

# Device setup  
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")  

# Load model securely  
model = models.efficientnet_b0(pretrained=False)  
num_ftrs = model.classifier[1].in_features  
model.classifier[1] = torch.nn.Linear(num_ftrs, len(class_names))  
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))    
model = model.to(device)  
model.eval()  

# Preprocessing function  
def preprocess_image(image_file):  
    transform = transforms.Compose([  
        transforms.Resize(256),  
        transforms.CenterCrop(224),  
        transforms.ToTensor(),  
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  
    ])  

    try:  
        image = Image.open(image_file).convert('RGB')  
        return transform(image).unsqueeze(0).to(device)  
    except Exception as e:  
        logger.error(f"Image processing failed: {str(e)}")  
        raise ValueError("Invalid image file format")

def predict_real_image(image_file, model, threshold=0.5, tta=False):
    preprocess_base = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    if not tta:
        image = Image.open(image_file).convert('RGB')
        input_tensor = preprocess_base(image).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, preds = torch.max(probabilities, 1)
        if confidence.item() < threshold:
            return "Unknown / No Disease", confidence.item() * 100
        return class_names[preds.item()], confidence.item() * 100

    else:
        # Test Time Augmentation (TTA)
        tta_transforms = [
            transforms.Compose([
                transforms.Resize(256),
                transforms.RandomHorizontalFlip(p=1.0),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406],
                                     [0.229, 0.224, 0.225])
            ]),
            transforms.Compose([
                transforms.Resize(256),
                transforms.RandomRotation(10),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406],
                                     [0.229, 0.224, 0.225])
            ]),
            preprocess_base
        ]
        image = Image.open(image_file).convert('RGB')
        preds_sum = torch.zeros(len(class_names)).to(device)
        for tform in tta_transforms:
            input_tensor = tform(image).unsqueeze(0).to(device)
            with torch.no_grad():
                outputs = model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                preds_sum += probabilities.squeeze()

        avg_probs = preds_sum / len(tta_transforms)
        confidence, pred_idx = torch.max(avg_probs, 0)
        if confidence.item() < threshold:
            return "Unknown / No Disease", confidence.item() * 100
        return class_names[pred_idx.item()], confidence.item() * 100
@csrf_exempt
def patients_handler(request):
    if request.method == 'GET':
        patients = list(Patient.objects.values())
        return JsonResponse(patients, safe=False)

    elif request.method == 'POST':
        data = json.loads(request.body)
        patient_id = data.get('patientID')
        full_name = data.get('fullName')
        diseases = data.get('diseases', '')

        # Check for existing ID
        if Patient.objects.filter(patient_id=patient_id).exists():
            return JsonResponse({"status": "error", "message": f"Patient with ID {patient_id} already exists."}, status=400)

        # Create and save new patient
        Patient.objects.create(patient_id=patient_id, full_name=full_name, diseases=diseases)
        return JsonResponse({"status": "success", "message": f"Patient {full_name} added successfully!"}, status=201)

    else:
        # Return a 405 (Method Not Allowed) or handle OPTIONS specially
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def patient_detail(request, patient_id):  
    try:  
        patient = Patient.objects.get(patient_id=patient_id)  
        if request.method == 'GET':  
            return JsonResponse({  
                'patient_id': patient.patient_id,  
                'full_name': patient.full_name,  
                'diseases': patient.diseases,  
            })  
        elif request.method == 'DELETE':  
            patient.delete()  
            return JsonResponse({'status': 'success'}, status=204)  
        elif request.method == 'PUT':  
            data = json.loads(request.body)  
            patient.patient_id = data.get('patientID', patient.patient_id)  # Allow ID update  
            patient.full_name = data.get('fullName', patient.full_name)  
            patient.diseases = data.get('diseases', patient.diseases)  
            patient.save()  
            return JsonResponse({'status': 'success', 'message': 'Patient updated'}, status=200)  
    except Patient.DoesNotExist:  
        return JsonResponse({'error': 'Patient not found'}, status=404)


@csrf_exempt
def generate_report(request):
    if request.method == 'POST':
        try:
            # Log request received
            print("Report generation request received")

            patient_id = request.POST.get('patient_id')
            if not patient_id:
                return JsonResponse({'error': 'Missing patient ID'}, status=400)

            # Check if patient exists
            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                return JsonResponse({'error': 'Patient not found'}, status=404)

            # Check for image file
            if 'image' not in request.FILES:
                return JsonResponse({'error': 'No image uploaded'}, status=400)

            image = request.FILES['image']
            print(f"Image received: {image.name}")

            # Create directory if needed
            reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
            os.makedirs(reports_dir, exist_ok=True)
            

            # Get treatment from the graph database
            patient.diseases = [disease.strip() for disease in patient.diseases.split(',')]
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            filename = f"report_{patient_id}_{timestamp}.pdf"
            output_path = os.path.join(reports_dir, filename)

            predicted_class, confidence_pct = predict_real_image(image_file=image, model=model)

            treatments = recommend_drug(  
                predicted_class if predicted_class != "Unknown / No Disease" else None,  
                patient.diseases  
            )

            # Prepare data for report
            patient_info = {
                'name': patient.full_name,
                'birth_date': patient.birth_date.strftime('%Y-%m-%d') if patient.birth_date else '',
                'med_number': patient.patient_id,
                'phone': ''
            }

            doctor_info = {
                'name': "Dr . Hazim",
                'specialization': "Dermatology"
            }

            # Generate the report
            generate_medical_report(
                output_path=output_path,
                accuracy=confidence_pct,
                medicines=treatments,
                patient_info=patient_info,
                doctor_info=doctor_info,
                disease_name=predicted_class
            )

            # Get file size
            file_size = os.path.getsize(output_path)

            # Create the PDF URL
            pdf_url = f'{settings.MEDIA_URL}reports/{filename}'

            print(f"Report generated successfully: {pdf_url}")

            # Return JSON response with URL
            response = JsonResponse({
                'success': True,
                'pdf_url': pdf_url,
                'file_size': file_size
            })

            # Add CORS headers
            response["Access-Control-Allow-Origin"] = "*"
            response["Cache-Control"] = "no-cache"

            return response

        except Exception as e:
            print(f"Error generating report: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

    elif request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    return JsonResponse({'error': 'Invalid method'}, status=405)

def patient_view(request):    
    try:  
        csv_path = os.path.join(settings.BASE_DIR, 'static', 'assets', 'Cleaned_Drug_Data.csv')   
        df = pd.read_csv(csv_path)  
        unique_drugs = df['name'].drop_duplicates().dropna().sort_values().tolist()    
        return JsonResponse({'drugs': unique_drugs})  
    except Exception as e:    
        return JsonResponse({'error': str(e)}, status=500)