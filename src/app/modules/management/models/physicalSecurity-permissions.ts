import { RbacPermissions } from "./rbac-permissions";


export const PHYSICAL_SECURITY_PERMISSIONS: RbacPermissions = {
    rolId: 4,
    actions: {
        reservar: true,
        verReservas: true,
        eliminarReservas: false,
        reservasPorPeriodos: false,
        bloquearUsuarios: false,
        eliminarUsuarios: false,
        cambiarRoles: false,
        verCalendarioDeportivo: true,
        cargarActividadesDeportivas: false,
        generarReporte: true,
        cargarBanners: false
    }
};
