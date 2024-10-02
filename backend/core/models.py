from django.db import models

class Asignatura(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    creditos = models.IntegerField()
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre
