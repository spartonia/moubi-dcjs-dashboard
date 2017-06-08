# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

# Register your models here.
from mainapp.models import UserLabel


class UserLabelAdmin(admin.ModelAdmin):
    list_display = ['label', 'user', 'isActive']
    list_display_links = ['label', 'user', 'isActive']
    list_filter = ['isActive']
    search_fields = ['label', 'user']

    class Meta:
        model = UserLabel

admin.site.register(UserLabel, UserLabelAdmin)