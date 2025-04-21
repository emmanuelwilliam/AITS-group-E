from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

def serve_frontend(request, path=None):
    """Add path parameter to handle catch-all routes"""
    return TemplateView.as_view(template_name='index.html')(request)

urlpatterns = [
    # API routes should come first
    path('admin/', admin.site.urls),
    path('api/', include('Apps.urls')),
    
    # Frontend routes
    path('', serve_frontend),
    path('home/', serve_frontend),
    path('login/', serve_frontend),
    path('dashboard/', serve_frontend),
    path('register/', serve_frontend),
    path('register/student/', serve_frontend),
    path('register/lecturer/', serve_frontend),
    path('register/administrator/', serve_frontend),
    path('issue/', serve_frontend),
    path('verification/', serve_frontend),

    # Explicit user dashboard routes
    path('student/dashboard/', serve_frontend),
    path('lecturer/dashboard/', serve_frontend),
    path('admin/dashboard/', serve_frontend),
    
    # Catch-all route - must be last
    re_path(r'^(?!api/|admin/).*$', serve_frontend),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)