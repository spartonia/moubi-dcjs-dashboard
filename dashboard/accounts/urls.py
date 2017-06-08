# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^login/', view=views.login_view, name='login'),
    url(r'^logout/', view=views.logout_view, name='logout'),
]
