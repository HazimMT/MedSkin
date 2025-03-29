"""medskin_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views  # Import the views we created

urlpatterns = [
    path('admin/', admin.site.urls),
    path('patients/', include('patients.urls')),

    # Frontend routes
    # path('', views.index_view, name='index'),
    path('', views.tool_view, name='tool'),
    path('tool/', views.tool_view, name='tool'),
    path('patients-page/', views.patients_view, name='patients_page'),  
    path('help/', views.helpcenter_view, name='help'),
]

# Add this to serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)