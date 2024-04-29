import { RbacPermissions } from "./rbac-permissions";


export const SECURITY_PERMISSIONS: RbacPermissions = {
    rolId: 2,
    actions: {
        reservar: true,
        verReservas: true,
        eliminarReservas: false,
        reservasPorPeriodos: false,
        bloquearUsuarios: false,
        eliminarUsuarios: true,
        cambiarRoles: true,
        verCalendarioDeportivo: true,
        cargarActividadesDeportivas: false,
        generarReporte: false,
        cargarBanners: false
    }
};
