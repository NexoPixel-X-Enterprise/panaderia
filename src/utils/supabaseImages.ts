const SUPABASE_URL = "https://ahnwufslxmgrfqywuoqe.supabase.co";

// Cambia esto a false cuando quieras trabajar con tu carpeta /public local
const USAR_SUPABASE = true; 

export function getImageUrl(bucketName: string, imagePath: string): string {
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  if (USAR_SUPABASE) {
    // Retorna la URL de la nube
    return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${cleanPath}`;
  } else {
    // Retorna la ruta de tu carpeta public local
    return `/${bucketName}/${cleanPath}`;
  }
}