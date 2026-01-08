from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'auth', views.AuthViewSet, basename='auth')
router.register(r'subjects', views.SubjectViewSet)
router.register(r'units', views.UnitViewSet)
router.register(r'topics', views.TopicViewSet)
router.register(r'notes', views.NoteViewSet)
router.register(r'mindmaps', views.MindmapViewSet)
router.register(r'flashcards', views.FlashcardViewSet)
router.register(r'mcqs', views.MCQViewSet)
router.register(r'pyqs', views.PYQViewSet)
router.register(r'progress', views.UserProgressViewSet)
router.register(r'study-plans', views.StudyPlanViewSet)
router.register(r'study-sessions', views.StudySessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', views.ChatView.as_view(), name='chat'),
]
