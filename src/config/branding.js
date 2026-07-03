// Logo mostrado en el header (DashboardPage) y en la pantalla de login (PinLogin).
// Cada deployment de cliente define REACT_APP_CLIENT_LOGO_URL con su propio logo;
// si no está seteada, se usa el logo por defecto de la app.
export const CLIENT_LOGO_URL = process.env.REACT_APP_CLIENT_LOGO_URL || '/maui-logo.png';

// Acceso demo y autoregistro de staff en PinLogin — pensados para el deployment
// de showcase/ventas, no para clientes productivos. Deployments de cliente
// setean REACT_APP_ENABLE_DEMO_AND_SIGNUP=false para ocultarlos.
export const ENABLE_DEMO_AND_SIGNUP = process.env.REACT_APP_ENABLE_DEMO_AND_SIGNUP !== 'false';
