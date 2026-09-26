// =====================================================
// MEDIGO API CONFIGURATION
//
// LOCAL:
// http://localhost:5138
//
// VERCEL:
// VITE_API_URL environment variable
// =====================================================

const configuredApiUrl =
  import.meta.env.VITE_API_URL
    ?.trim();


// =====================================================
// API URL
// =====================================================

export const API_URL =
  (
    configuredApiUrl ||
    "http://localhost:5138"
  )
    .replace(
      /\/+$/,
      ""
    );


// =====================================================
// BUILD API URL
//
// Example:
//
// apiUrl("/api/Doctor/login")
//
// Local:
// http://localhost:5138/api/Doctor/login
//
// Production:
// https://medigo-api.azurewebsites.net/api/Doctor/login
// =====================================================

export function apiUrl(
  path = ""
) {

  if (!path) {

    return API_URL;

  }


  if (
    path.startsWith("/")
  ) {

    return `${API_URL}${path}`;

  }


  return `${API_URL}/${path}`;

}


// =====================================================
// BUILD UPLOAD / IMAGE URL
//
// Database may contain:
//
// uploads/doctors/a.jpg
// /uploads/doctors/a.jpg
// uploads\doctors\a.jpg
//
// Returns:
//
// https://backend/uploads/doctors/a.jpg
// =====================================================

export function mediaUrl(
  imagePath
) {

  if (!imagePath) {

    return "";

  }


  // Already a complete URL
  if (
    imagePath.startsWith(
      "http://"
    )
    ||
    imagePath.startsWith(
      "https://"
    )
  ) {

    return imagePath;

  }


  // Browser generated preview
  if (
    imagePath.startsWith(
      "blob:"
    )
    ||
    imagePath.startsWith(
      "data:"
    )
  ) {

    return imagePath;

  }


  const cleanPath =
    imagePath
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      );


  return `${API_URL}/${cleanPath}`;

}