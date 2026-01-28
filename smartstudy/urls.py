"""URL configuration for smartstudy project."""

import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings


def serve_react_index(request):
    """Serve the React app's index.html for all non-API routes (SPA routing)."""
    react_index = settings.REACT_APP_DIR / "index.html"
    if react_index.exists():
        return HttpResponse(
            react_index.read_text(),
            content_type="text/html"
        )
    # Fallback to old frontend if React build doesn't exist
    from django.views.generic import TemplateView
    return TemplateView.as_view(
        template_name="index.html",
        extra_context={"NEON_AUTH_URL": os.environ.get("NEON_AUTH_URL", "")},
    )(request)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    # Serve React app for all other routes (SPA catch-all)
    re_path(r"^(?!api/|admin/|static/).*$", serve_react_index, name="react-app"),
]
