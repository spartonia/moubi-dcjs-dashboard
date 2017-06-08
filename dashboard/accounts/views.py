# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import redirect
from django.urls import reverse
from django.shortcuts import render, HttpResponseRedirect
from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    logout
    )

from .forms import UserLoginForm

User = get_user_model()


def login_view(request):
    next_ = request.GET.get('next')
    form = UserLoginForm(request.POST or None)
    if form.is_valid():
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password')
        user = User.objects.filter(username=username).first()
        login(request, user)
        if next_:
            return redirect(next_)
        return HttpResponseRedirect(reverse('home'))

    return render(request, "form.html", {"form": form})


def register_view(request):
    return render(request, "form.html", {})


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('login'))