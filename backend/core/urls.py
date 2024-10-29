from django.urls import path
from .views import AsignaturaViewSet
from .views import UsuarioViewSet

carrera_list = AsignaturaViewSet.as_view({'get': 'list_carreras'})
asignatura_list = AsignaturaViewSet.as_view({'get': 'list_asignaturas'})
asignatura_create = AsignaturaViewSet.as_view({'post': 'create'})
usuario_create = UsuarioViewSet.as_view({'post': 'create'})
guardar_asignaturas_en_curso = UsuarioViewSet.as_view({'post': 'guardar_asignaturas_en_curso'})
obtener_creditos = UsuarioViewSet.as_view({'get': 'obtener_creditos'})  
actualizar_asignatura =  AsignaturaViewSet.as_view({'put': 'actualizar'})

urlpatterns = [
    path('asignaturas/', asignatura_list, name='asignatura-list'),
    path('carreras/', carrera_list, name='carrera-list'),
    path('asignaturas/create/', asignatura_create, name='asignatura-create'),
    path('guardar-usuario/', usuario_create, name='guardar-usuario'),  # Asegúrate de que esta línea esté presente
    path('guardar-asignaturas-en-curso/', guardar_asignaturas_en_curso, name='guardar-asignaturas-en-curso'),
    path('obtener-creditos/', obtener_creditos, name='obtener-creditos'),
    path('actualizar-asignatura/', actualizar_asignatura, name='actualizar-asignatura'),

]