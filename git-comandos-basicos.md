# Comandos Básicos de Git

## 1. Configuración Inicial
- `git config --global user.name "Tu Nombre"`
- `git config --global user.email "tuemail@ejemplo.com"`

## 2. Crear un Repositorio
- `git init`  
  Crea un nuevo repositorio en el directorio actual.

## 3. Clonar un Repositorio
- `git clone <url>`  
  Clona un repositorio existente desde una URL.

## 4. Ver el Estado del Repositorio
- `git status`  
  Muestra el estado de los archivos en el directorio de trabajo.

## 5. Añadir Cambios
- `git add <archivo>`  
  Añade un archivo específico al área de preparación.
- `git add .`  
  Añade todos los cambios en el directorio actual.

## 6. Hacer un Commit
- `git commit -m "Mensaje del commit"`  
  Guarda los cambios preparados con un mensaje descriptivo.

## 7. Ver el Historial de Commits
- `git log`  
  Muestra el historial de commits del repositorio.

## 8. Crear y Cambiar de Rama
- `git branch <nombre-rama>`  
  Crea una nueva rama.
- `git checkout <nombre-rama>`  
  Cambia a la rama especificada.
- `git checkout -b <nombre-rama>`  
  Crea y cambia a una nueva rama.

## 9. Fusionar Ramas
- `git merge <nombre-rama>`  
  Fusiona la rama especificada en la rama actual.

## 10. Eliminar una Rama
- `git branch -d <nombre-rama>`  
  Elimina la rama especificada.

## 11. Sincronizar Cambios
- `git pull`  
  Descarga y fusiona cambios desde el repositorio remoto.
- `git push`  
  Envía los cambios locales al repositorio remoto.

## 12. Deshacer Cambios
- `git checkout -- <archivo>`  
  Deshace los cambios en el archivo especificado.
- `git reset HEAD <archivo>`  
  Elimina el archivo del área de preparación, pero mantiene los cambios en el directorio de trabajo.

## 13. Ver Diferencias
- `git diff`  
  Muestra las diferencias entre los cambios en el directorio de trabajo y el último commit.

## 14. Trabajar con Remotos
- `git remote -v`  
  Muestra los remotos configurados.
- `git remote add <nombre> <url>`  
  Añade un nuevo remoto con el nombre y la URL especificados.