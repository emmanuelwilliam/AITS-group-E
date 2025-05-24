from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    # Admin panel route
    path('admin/', admin.site.urls, name='admin'),

    # Backend API routes for your app
    path('api/', include(('Apps.urls', 'Apps'), namespace='api')),

    # React frontend route (catch-all for any frontend route)
    # This will be the fallback for routes that aren't handled by 'api/' or 'admin/'
    re_path(r'^(?!api/|admin/).*$', TemplateView.as_view(template_name='index.html')),

    # Serve static and media files in development (only when DEBUG is True)
    path('', TemplateView.as_view(template_name='index.html')),

]

# Serve static and media files in development (only when DEBUG is True)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
