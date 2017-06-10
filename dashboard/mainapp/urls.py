from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', view=views.home, name='home'),
    url(r'userData/', view=views.user_data, name='userdata'),
]
