---
name: folium-test-and-deploy
description: >-
  Utiliza esta skill cuando el usuario pida testear el proyecto, verificar la integridad de folium-web-app o folium-api, sincronizar o auditar la rama testing, o promover cambios probados desde testing hacia producción (main).
---

# Folium Test & Deploy Workflow

Esta skill define los protocolos estandarizados para validar, auditar y desplegar cambios en la plataforma **Folium** (tanto en el frontend `folium-web-app` como en el backend `folium-api`), garantizando que la producción (`main`) nunca sea afectada sin validación previa.

---

## 1. Arquitectura de Entornos y Ramas

| Entorno | Rama Git | Destino | Propósito |
| :--- | :--- | :--- | :--- |
| **Pruebas / Staging** | `testing` | `origin/testing` | Entorno activo de desarrollo, auditorías y pruebas locales. |
| **Producción** | `main` | `origin/main` (Vercel / AWS EC2) | Entorno productivo para usuarios finales. Protegido y restringido. |

> [!IMPORTANT]
> Nunca realizar cambios directos sobre la rama `main`. Cualquier corrección, nueva funcionalidad o refactor debe aplicarse y validarse primero en la rama `testing`.

---

## 2. Auditoría Rápida del Workspace

Para verificar de inmediato el estado de ambos repositorios, ramas activas, conflictos residuales y sintaxis, ejecutar el script auxiliar:

```bash
python .agents/skills/folium-test-and-deploy/scripts/audit_workspace.py
```

Este script valida:
1. Que tanto `folium-web-app` como `folium-api` estén situados en la rama `testing`.
2. Que no existan cambios huérfanos sin confirmar.
3. Que no haya marcadores de conflicto de merge (`<<<<<<<`, `=======`, `>>>>>>>`).
4. Que todos los archivos de Python compilen correctamente.

---

## 3. Protocolo de Pruebas Locales

### A. Frontend (`folium-web-app`)
1. Iniciar servidor de desarrollo local:
   ```bash
   cd folium-web-app
   npm run dev
   ```
2. Verificar funcionalidades clave en `http://localhost:5173`:
   - **Catálogo (`/catalog`):** Navegación fluida, carrusel 3D Coverflow en modo móvil con gestos táctiles (Swipe) y paginación server-side de 16/20 libros.
   - **Importador (`/importer`):** Carga y simulación de archivos `.xlsx`, `.csv` y `.bib` (BibTeX).
   - **Autenticación & Checkout:** Login, tokens JWT y planes de membresía.

### B. Backend (`folium-api`)
1. Validar sintaxis y compilación:
   ```bash
   python -m py_compile folium-api/folium_api/importer_views.py
   ```
2. Si se modificaron modelos en `folium_api/models.py`:
   - Asegurarse de que las migraciones estén generadas antes de promover cambios.

---

## 4. Despliegue en Testing

Cuando una funcionalidad esté lista para ser probada:
1. Confirmar los cambios en local dentro de la rama `testing`:
   ```bash
   git add <archivos>
   git commit -m "feat/fix: descripción del cambio"
   ```
2. Subir a la rama remota de testing:
   ```bash
   git push origin testing
   ```

---

## 5. Promoción a Producción (`main`)

Una vez que el usuario y las pruebas locales confirmen que todo funciona correctamente:
1. Consultar la lista de verificación completa en [deployment_checklist.md](./references/deployment_checklist.md).
2. Ejecutar la fusión de `testing` hacia `main` en ambos repositorios:
   ```bash
   # En folium-web-app (despliegue automático a Vercel)
   cd folium-web-app
   git checkout main
   git merge testing
   git push origin main
   git checkout testing

   # En folium-api (despliegue hacia AWS EC2)
   cd folium-api
   git checkout main
   git merge testing
   git push origin main
   git checkout testing
   ```
