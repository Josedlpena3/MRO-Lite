# 🎯 EMPIEZA AQUÍ - Deploy Completo

## ✅ TODO ESTÁ LISTO

Tu proyecto está **100% configurado** para deploy en producción. Solo necesitas seguir los pasos.

---

## 🚀 PASOS RÁPIDOS (12 minutos)

### 1️⃣ Deploy Backend en Railway (5 min)

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Selecciona tu repositorio
5. Railway detectará automáticamente el Dockerfile ✅
6. En **Settings → Variables**, agrega:

```
ASPNETCORE_ENVIRONMENT=Production
Cors__Origins__0=https://tu-app.vercel.app
Cors__Origins__1=https://*.vercel.app
```

**⚠️ IMPORTANTE:** Por ahora deja `https://tu-app.vercel.app` como placeholder. Lo actualizarás después.

7. Railway generará una URL: `https://tu-proyecto.up.railway.app`
8. **ANOTA ESTA URL** - la necesitas en el paso 2

---

### 2️⃣ Actualizar Frontend con URL del Backend (1 min)

1. Abre: `frontend/src/environments/environment.prod.ts`
2. Reemplaza `https://tu-backend-url.com` con tu URL de Railway:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-proyecto.up.railway.app' // ← Pega tu URL aquí
};
```

3. Guarda el archivo
4. Commit y push a GitHub

---

### 3️⃣ Deploy Frontend en Vercel (3 min)

1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. **"Add New..."** → **"Project"**
4. Importa tu repositorio
5. Configura:

   - **Framework Preset:** Angular
   - **Root Directory:** (vacío)
   - **Build Command:** 
     ```bash
     cd frontend && npm install && npm run build -- --configuration production
     ```
   - **Output Directory:**
     ```
     frontend/dist/mro-lite
     ```
   - **Install Command:**
     ```bash
     cd frontend && npm install
     ```

6. Clic en **"Deploy"**
7. Vercel generará una URL: `https://tu-app.vercel.app`
8. **ANOTA ESTA URL** - la necesitas en el paso 4

---

### 4️⃣ Actualizar CORS en Railway (1 min)

1. Ve a Railway → Tu proyecto → **Settings → Variables**
2. Actualiza las variables:

```
Cors__Origins__0=https://tu-app.vercel.app  ← Pega la URL de Vercel aquí
Cors__Origins__1=https://*.vercel.app
```

3. Railway redeployará automáticamente ✅

---

### 5️⃣ Verificar que Funciona (2 min)

1. Abre tu aplicación en Vercel: `https://tu-app.vercel.app`
2. Abre DevTools (F12)
3. Ve a la pestaña **Network**
4. Recarga la página
5. Verifica:
   - ✅ Requests van a `https://tu-proyecto.up.railway.app`
   - ✅ Status 200 (sin errores CORS)
   - ✅ Los datos cargan correctamente

---

## 🎉 ¡LISTO!

Tu aplicación está en producción:

- **Backend:** `https://tu-proyecto.up.railway.app`
- **Frontend:** `https://tu-app.vercel.app`

---

## 📚 Documentación Adicional

- **`SETUP_RAPIDO.md`** - Misma guía, más detallada
- **`DEPLOY_COMPLETO.md`** - Guía completa con troubleshooting
- **`DEPLOY_VERCEL.md`** - Análisis técnico completo

---

## ⚠️ Si Algo Falla

1. Verifica que el backend esté accesible:
   ```bash
   curl https://tu-proyecto.up.railway.app/technicians
   ```

2. Verifica CORS:
   - DevTools → Network → Busca errores en rojo
   - Si ves errores CORS, verifica las variables en Railway

3. Verifica URLs:
   - `environment.prod.ts` tiene la URL correcta del backend
   - Railway tiene la URL correcta de Vercel en CORS

4. Revisa logs:
   - Railway: Dashboard → Tu servicio → Logs
   - Vercel: Dashboard → Tu proyecto → Deployments → Ver logs

---

## 🔧 Configuraciones Ya Listas

✅ **Backend:**
- Dockerfile configurado
- CORS lee desde variables de entorno
- Railway.json configurado
- Program.cs actualizado

✅ **Frontend:**
- Environment files creados
- Services usando `environment.apiUrl`
- vercel.json para SPA routing
- Angular.json con fileReplacements
- Build verificado (funciona ✅)

---

**¡Empieza con el Paso 1!** 🚀

