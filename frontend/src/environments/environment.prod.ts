/**
 * Environment configuration for production
 * 
 * IMPORTANTE: La URL del backend se configura mediante variable de entorno en Vercel.
 * Variable de entorno: API_URL
 * Ejemplo: https://api.mro-lite.railway.app
 * 
 * NOTA: En Vercel, las variables de entorno se inyectan en build time.
 * Si necesitas runtime, considera usar un archivo de configuración o API route.
 */
export const environment = {
  production: true,
  // Reemplazar con tu URL real del backend cuando lo despliegues
  // O usar variable de entorno en Vercel: API_URL
  apiUrl: 'https://tu-backend-url.com' // ← CAMBIAR ESTA URL
};

