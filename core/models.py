from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
import json


class UserProfile(models.Model):
    """Extended user profile to store API keys and usage stats"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gemini_api_key = models.CharField(max_length=255, blank=True, null=True, help_text="User's personal Gemini API Key")
    daily_ai_usage_count = models.IntegerField(default=0)
    last_usage_date = models.DateField(default=timezone.now)
    
    # Token usage tracking
    total_input_tokens = models.BigIntegerField(default=0)
    total_output_tokens = models.BigIntegerField(default=0)
    
    @property
    def total_tokens(self):
        return self.total_input_tokens + self.total_output_tokens
        
    @property
    def estimated_cost(self):
        # Using approximate pricing for Gemini Flash (per 1M tokens)
        # Input: $0.10, Output: $0.40 (Adjust as per actual pricing)
        input_cost = (self.total_input_tokens / 1_000_000) * 0.10
        output_cost = (self.total_output_tokens / 1_000_000) * 0.40
        return round(input_cost + output_cost, 4)

    def __str__(self):
        return f"Profile: {self.user.username}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Subject(models.Model):
    """Subject like Computer Networks, OS, DBMS"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Unit(models.Model):
    """Unit within a subject"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='units')
    name = models.CharField(max_length=200)
    unit_number = models.IntegerField(default=1)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['unit_number']

    def __str__(self):
        return f"{self.subject.name} - Unit {self.unit_number}: {self.name}"


class Topic(models.Model):
    """Topic within a unit"""
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


# ==================== CONTENT MODELS ====================

class Note(models.Model):
    """AI-generated notes for a topic"""
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='note')
    summary = models.TextField()  # 150-word summary
    detailed_content = models.TextField(blank=True)  # Longer explanation
    analogies = models.JSONField(default=list)  # List of real-life analogies
    diagram_description = models.TextField(blank=True)  # Text description of diagram
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notes: {self.topic.name}"


class Mindmap(models.Model):
    """AI-generated mindmap structure for a topic"""
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='mindmap')
    json_data = models.JSONField()  # {central_idea: str, branches: [{title, subpoints}]}
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mindmap: {self.topic.name}"


class Flashcard(models.Model):
    """Flashcards for a topic"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='flashcards')
    front_text = models.TextField()  # Question/term
    back_text = models.TextField()  # Answer/definition
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Flashcard: {self.front_text[:50]}..."


class FlashcardReview(models.Model):
    """User's flashcard review history for spaced repetition"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_reviews')
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='reviews')
    last_reviewed_at = models.DateTimeField(auto_now=True)
    quality = models.IntegerField(default=0)  # 0-5 rating
    next_due_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['user', 'flashcard']

    def update_next_due(self, quality):
        """Update next_due_at based on quality of recall"""
        self.quality = quality
        self.last_reviewed_at = timezone.now()
        
        if quality >= 4:  # "I knew this"
            self.next_due_at = timezone.now() + timedelta(days=3)
        elif quality >= 2:  # "I was unsure"
            self.next_due_at = timezone.now() + timedelta(days=1)
        else:  # "I didn't know"
            self.next_due_at = timezone.now() + timedelta(hours=8)
        
        self.save()


class MCQQuestion(models.Model):
    """MCQ questions for a topic"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='mcqs')
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_option = models.CharField(max_length=1)  # a, b, c, or d
    explanation = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"MCQ: {self.question_text[:50]}..."


class MCQAttempt(models.Model):
    """User's MCQ attempt history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mcq_attempts')
    mcq = models.ForeignKey(MCQQuestion, on_delete=models.CASCADE, related_name='attempts')
    selected_option = models.CharField(max_length=1)
    is_correct = models.BooleanField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.is_correct = self.selected_option == self.mcq.correct_option
        super().save(*args, **kwargs)


# ==================== PYQ MODELS ====================

class PYQQuestion(models.Model):
    """Previous Year Questions"""
    EXAM_TYPE_CHOICES = [
        ('midsem', 'Mid Semester'),
        ('endsem', 'End Semester'),
        ('internal', 'Internal'),
    ]
    
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='pyqs')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='pyqs', null=True, blank=True)
    year = models.IntegerField()
    exam_type = models.CharField(max_length=10, choices=EXAM_TYPE_CHOICES)
    question_text = models.TextField()
    marks = models.IntegerField(default=0)
    is_tagged = models.BooleanField(default=False)  # Whether AI has tagged it to a topic

    def __str__(self):
        return f"PYQ {self.year}: {self.question_text[:50]}..."


# ==================== PROGRESS MODELS ====================

class UserProgress(models.Model):
    """Track user's progress on topics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='user_progress')
    
    # Completion tracking
    mindmap_viewed = models.BooleanField(default=False)
    notes_read = models.BooleanField(default=False)
    flashcards_completed = models.IntegerField(default=0)  # Count
    mcqs_attempted = models.IntegerField(default=0)
    mcqs_correct = models.IntegerField(default=0)
    
    # Explicit completion flag (user confirmed)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Total study time in seconds
    total_study_time = models.IntegerField(default=0)
    
    # Timestamps
    last_studied_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'topic']

    @property
    def mcq_accuracy(self):
        if self.mcqs_attempted == 0:
            return 0
        return (self.mcqs_correct / self.mcqs_attempted) * 100

    @property
    def completion_percentage(self):
        """Calculate overall completion for this topic"""
        # If user explicitly marked as complete, return 100
        if self.is_completed:
            return 100
        
        score = 0
        if self.mindmap_viewed:
            score += 20
        if self.notes_read:
            score += 20
        # Lower thresholds for flashcards (at least 3)
        if self.flashcards_completed >= 3:
            score += 30
        # Lower thresholds for MCQs (at least 3)
        if self.mcqs_attempted >= 3:
            score += 30
        return min(score, 100)

    @property
    def strength_level(self):
        """Determine if topic is weak, medium, or strong"""
        if self.mcqs_attempted == 0:
            return 'not_started'
        if self.mcq_accuracy >= 80:
            return 'strong'
        elif self.mcq_accuracy >= 60:
            return 'medium'
        return 'weak'
    
    def mark_complete(self):
        """Mark topic as completed by user"""
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()


class StudyPlan(models.Model):
    """User's study plan"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_date = models.DateField()
    hours_per_day = models.FloatField(default=2.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s plan for {self.subject.name}"


class StudyPlanItem(models.Model):
    """Individual items in study plan"""
    plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='items')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    scheduled_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['scheduled_date']


class StudySession(models.Model):
    """Track time a user spends studying a topic (start/end timestamps and duration)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='study_sessions')
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)

    class Meta:
        ordering = ['-started_at']

    def end(self):
        """Mark session ended and compute duration."""
        self.ended_at = timezone.now()
        self.duration_seconds = int((self.ended_at - self.started_at).total_seconds())
        self.save()


# ==================== CHAT MODELS ====================

class ChatMessage(models.Model):
    """Chat history for doubt chatbot"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='chat_messages', null=True)
    user_message = models.TextField()
    ai_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
