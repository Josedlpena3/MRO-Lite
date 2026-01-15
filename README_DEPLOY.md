# 🚀 Deploy en Producción - Guía Rápida

## 📋 Inicio Rápido (12 minutos)

**Sigue estos pasos en orden:**

1. **Backend en Railway** (5 min) → `SETUP_RAPIDO.md`
2. **Actualizar Frontend** (1 min) → URL del backend
3. **Deploy en Vercel** (3 min) → Frontend
4. **Configurar CORS** (1 min) → URL de Vercel en Railway
5. **Verificar** (2 min) → Todo funciona

👉 **Empieza aquí:** Abre `SETUP_RAPIDO.md`

---

## 📚 Documentación Completa

- **`SETUP_RAPIDO.md`** - Guía rápida paso a paso (12 minutos)
- **`DEPLOY_COMPLETO.md`** - Guía detallada con troubleshooting
- **`DEPLOY_VERCEL.md`** - Análisis técnico completo

---

## ⚙️ Configuración Lista

✅ **Backend:**
- Dockerfile configurado
- CORS configurado para variables de entorno
- Railway.json listo

✅ **Frontend:**
- Environment files creados
- Services usando environment.apiUrl
- vercel.json para SPA routing
- Angular.json configurado

---

## 🎯 URLs Necesarias

Después del deploy tendrás:

- **Backend:** `https://tu-proyecto.up.railway.app`
- **Frontend:** `https://tu-app.vercel.app`

---

## ⚠️ Importante

1. **Backend primero:** Debes desplegar el backend ANTES que el frontend
2. **Actualizar URLs:** Después de cada deploy, actualiza las URLs en:
   - `frontend/src/environments/environment.prod.ts` (URL del backend)
   - Variables de entorno en Railway (URL del frontend para CORS)

---

## 🔧 Problemas Comunes

Ver sección "Solución de Problemas" en `DEPLOY_COMPLETO.md`

---

¡Empieza con `SETUP_RAPIDO.md`! 🚀

