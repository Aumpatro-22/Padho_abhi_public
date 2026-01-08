from django.contrib import admin
from .models import (
    Subject, Unit, Topic, Note, Mindmap, Flashcard, FlashcardReview,
    MCQQuestion, MCQAttempt, PYQQuestion, UserProgress, StudyPlan,
    StudyPlanItem, ChatMessage
)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'created_at']
    search_fields = ['name', 'code']


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'unit_number']
    list_filter = ['subject']
    ordering = ['subject', 'unit_number']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'unit', 'order']
    list_filter = ['unit__subject', 'unit']
    search_fields = ['name']
    ordering = ['unit__subject', 'unit__unit_number', 'order']


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['topic', 'created_at', 'updated_at']
    list_filter = ['topic__unit__subject']


@admin.register(Mindmap)
class MindmapAdmin(admin.ModelAdmin):
    list_display = ['topic', 'created_at']
    list_filter = ['topic__unit__subject']


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ['front_text', 'topic', 'difficulty']
    list_filter = ['topic__unit__subject', 'difficulty']


@admin.register(FlashcardReview)
class FlashcardReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'flashcard', 'quality', 'next_due_at']
    list_filter = ['user']


@admin.register(MCQQuestion)
class MCQQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'topic', 'difficulty', 'correct_option']
    list_filter = ['topic__unit__subject', 'difficulty']


@admin.register(MCQAttempt)
class MCQAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'mcq', 'is_correct', 'attempted_at']
    list_filter = ['user', 'is_correct']


@admin.register(PYQQuestion)
class PYQQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'subject', 'year', 'exam_type', 'marks', 'is_tagged']
    list_filter = ['subject', 'year', 'exam_type', 'is_tagged']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'completion_percentage', 'mcq_accuracy', 'strength_level']
    list_filter = ['user', 'topic__unit__subject']


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'exam_date', 'hours_per_day']
    list_filter = ['user', 'subject']


@admin.register(StudyPlanItem)
class StudyPlanItemAdmin(admin.ModelAdmin):
    list_display = ['plan', 'topic', 'scheduled_date', 'is_completed']
    list_filter = ['is_completed']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'created_at']
    list_filter = ['user', 'topic__unit__subject']