from django.urls import path
from .views import AsignaturaViewSet
from .views import UsuarioViewSet

carrera_list = AsignaturaViewSet.as_view({'get': 'list_carreras'})
asignatura_list = AsignaturaViewSet.as_view({'get': 'list_asignaturas'})
usuario_create = UsuarioViewSet.as_view({'post': 'create'})
guardar_asignaturas = UsuarioViewSet.as_view({'post': 'guardar_asignaturas'})
eliminar_relacion_asignatura = UsuarioViewSet.as_view({'delete': 'eliminar_relacion_asignatura'})
obtener_estados = UsuarioViewSet.as_view({'get': 'obtener_estados'})
guardar_malla = AsignaturaViewSet.as_view({'post': 'guardar_malla'})
eliminar_malla = AsignaturaViewSet.as_view({'post': 'eliminar_malla'})


urlpatterns = [
    path('asignaturas/', asignatura_list, name='asignatura-list'),
    path('carreras/', carrera_list, name='carrera-list'),
    path('guardar-usuario/', usuario_create, name='guardar-usuario'),  
    path('guardar-asignaturas/', guardar_asignaturas, name='guardar-asignaturas'),
    path('obtener-estados/', obtener_estados, name='obtener-estados'),
    path('guardar-malla/', guardar_malla, name='guardar-malla'),
    path('eliminar-malla/', eliminar_malla, name='eliminar-malla'),
]