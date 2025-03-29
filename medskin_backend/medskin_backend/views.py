# medskin_backend/views.py
from django.shortcuts import render




def tool_view(request):  
    return render(request, 'tool.html')  

def patients_view(request):  
    return render(request, 'patients.html')  

def helpcenter_view(request):  
    return render(request, 'helpcenter.html')