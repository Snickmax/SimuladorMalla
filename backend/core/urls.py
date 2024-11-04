from django.urls import path
from .views import AsignaturaViewSet
from .views import UsuarioViewSet

carrera_list = AsignaturaViewSet.as_view({'get': 'list_carreras'})
asignatura_list = AsignaturaViewSet.as_view({'get': 'list_asignaturas'})
asignatura_create = AsignaturaViewSet.as_view({'post': 'create'})
usuario_create = UsuarioViewSet.as_view({'post': 'create'})
obtener_creditos = UsuarioViewSet.as_view({'get': 'obtener_creditos'})  
guardar_asignaturas = UsuarioViewSet.as_view({'post': 'guardar_asignaturas'})
eliminar_relacion_asignatura = UsuarioViewSet.as_view({'delete': 'eliminar_relacion_asignatura'})


urlpatterns = [
    path('asignaturas/', asignatura_list, name='asignatura-list'),
    path('carreras/', carrera_list, name='carrera-list'),
    path('asignaturas/create/', asignatura_create, name='asignatura-create'),
    path('guardar-usuario/', usuario_create, name='guardar-usuario'),  
    path('obtener-creditos/<str:id_asignatura>/', obtener_creditos, name='obtener-creditos'), 
    path('guardar-asignaturas/', guardar_asignaturas, name='guardar-asignaturas'),
    path('eliminar-relacion-asignatura/<str:id_asignatura>/', eliminar_relacion_asignatura, name='eliminar-relacion-asignatura'),


]