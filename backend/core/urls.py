from django.urls import path
from .views import AsignaturaViewSet

asignatura_list = AsignaturaViewSet.as_view({'get': 'list'})
asignatura_create = AsignaturaViewSet.as_view({'post': 'create'})

urlpatterns = [
    path('asignaturas/', asignatura_list, name='asignatura-list'),
    path('asignaturas/create/', asignatura_create, name='asignatura-create'),
]
