# Checklist de Despliegue y Promoción (Testing -> Main)

Esta guía detalla los pasos de verificación y ejecución para promover cambios probados desde la rama `testing` hacia la rama de producción `main`.

---

## 1. Verificación Previa (Gatekeeper)
Antes de tocar `main`, verificar:
- [ ] Ambos repositorios (`folium-web-app` y `folium-api`) están en la rama `testing`.
- [ ] No hay archivos sin confirmar (`git status` limpio).
- [ ] No existen marcadores de conflicto de merge (`<<<<<<<`, `=======`, `>>>>>>>`).
- [ ] Todos los archivos Python en `folium-api` compilan correctamente (`python -m py_compile ...`).
- [ ] La build del frontend compila sin errores (`cd folium-web-app && npm run build`).
- [ ] Los tests manuales en el entorno local (`localhost:5173`) confirmaron el funcionamiento de los cambios.

---

## 2. Promoción de Backend (`folium-api`)
```bash
cd folium-api
git checkout main
git pull origin main
git merge testing --no-ff -m "merge: promover cambios probados desde testing"
git push origin main
git checkout testing
```
*Si hay cambios de infraestructura en AWS EC2:*
- Conectarse por SSH a la instancia EC2.
- Ejecutar `git pull origin main`.
- Si hubo cambios en modelos: `python manage.py migrate`.
- Reiniciar el servicio web o Gunicorn: `sudo systemctl restart gunicorn` (o el servicio correspondiente).

---

## 3. Promoción de Frontend (`folium-web-app`)
```bash
cd folium-web-app
git checkout main
git pull origin main
git merge testing --no-ff -m "merge: promover cambios probados desde testing"
git push origin main
git checkout testing
```
*Monitoreo en Vercel:*
- Al hacer push a `origin/main`, Vercel iniciará automáticamente el despliegue en producción.
- Verificar en el dashboard de Vercel que el build finalice con estado "Ready".
- Abrir `https://folium-web.vercel.app` para confirmar que los cambios ya están activos.
