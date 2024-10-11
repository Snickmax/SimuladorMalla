from django.urls import path
from .views import AsignaturaViewSet

asignatura_list = AsignaturaViewSet.as_view({'get': 'list'})
asignatura_create = AsignaturaViewSet.as_view({'post': 'create'})
asignatura_delete = AsignaturaViewSet.as_view({'delete': 'destroy'}) 


urlpatterns = [
    path('asignaturas/', asignatura_list, name='asignatura-list'),
    path('asignaturas/create/', asignatura_create, name='asignatura-create'),
    path('asignaturas/<str:pk>/', asignatura_delete, name='asignatura-delete'),  # Ruta para eliminar asignaturas

]
