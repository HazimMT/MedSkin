# python/Report

from jinja2 import Environment, FileSystemLoader
import pdfkit
from datetime import datetime

def generate_medical_report(output_path, accuracy, medicines, patient_info, doctor_info, disease_name):
    try:
        env = Environment(loader=FileSystemLoader('.'))
        template = env.get_template("./reports/report_template.html")

        context = {
            'doctor_name': doctor_info.get('name', 'Not assigned'),
            'specialization': doctor_info.get('specialization', 'Not assigned'),
            'visit_date': datetime.now().strftime("%d.%m.%Y"),
            'patient_name': patient_info.get('name', ''),
            'birth_date': patient_info.get('birth_date', ''),
            'med_number': patient_info.get('med_number', ''),
            'phone': patient_info.get('phone', ''),
            'disease_name': disease_name,
            'accuracy': accuracy,
            'medicines': medicines,
            'diagnosis': disease_name  
        }

        rendered_html = template.render(context)

        # Update wkhtmltopdf path (verify your installation path)
        config = pdfkit.configuration(
            wkhtmltopdf=r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'  # Windows
            # For Linux/Mac: wkhtmltopdf='/usr/local/bin/wkhtmltopdf'
        )

        pdfkit.from_string(
            rendered_html,
            output_path,
            configuration=config,
            options={
                'encoding': 'UTF-8',
                'quiet': '',
                'enable-local-file-access': ''
            }
        )
    except Exception as e:
        raise RuntimeError(f"PDF generation failed: {str(e)}")