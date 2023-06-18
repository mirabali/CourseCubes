"""
URL configuration for coursecubes project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.urls import path, re_path, include
from . import paths, settings
from django.conf.urls.static import static
from .core import test

urlpatterns = [
    re_path(r'^django_rq/', include('django_rq.urls')),
    path('admin/', admin.site.urls),
    
    path('flowchart/all', paths.list_all_flows),
    path('flowchart/', paths.create_flowchart),
    path('flowchart/<uuid_flowchart>', paths.get_replace_flowchart),
    path('execution/flowchart/<uuid_flowchart>', paths.execute_flowchart),
    path('execution/<uuid_execution>', paths.get_execution),
    
    path('presentation/', paths.create_presentation),
    path('presentation/<uuid_presentation>', paths.get_presentation)
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#test()
