from django.urls import path
from .views import AsignaturaViewSet
from .views import UsuarioViewSet

carrera_list = AsignaturaViewSet.as_view({'get': 'list_carreras'})
asignatura_list = AsignaturaViewSet.as_view({'get': 'list_asignaturas'})
asignatura_create = AsignaturaViewSet.as_view({'post': 'create'})

#usuarios
usuario_create = UsuarioViewSet.as_view({'post': 'create'})

urlpatterns = [
    path('asignaturas/', asignatura_list, name='asignatura-list'),
    path('carreras/', carrera_list, name='carrera-list'),
    path('asignaturas/create/', asignatura_create, name='asignatura-create'),
    path('guardar-usuario/', usuario_create, name='guardar-usuario'),
]