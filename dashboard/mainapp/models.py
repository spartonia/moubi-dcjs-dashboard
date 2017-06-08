# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.conf import settings


class UserLabel(models.Model):
    label = models.IntegerField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, default=1)
    isActive = models.BooleanField(default=True)

    def __unicode__(self):
        return "%s  label: %s" %(self.user, self.label)

    def __str__(self):
        return "%s  label: %s" % (self.user, self.label)