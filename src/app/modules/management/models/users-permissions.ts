import { RbacPermissions } from "./rbac-permissions";


export const USERS_PERMISSIONS: RbacPermissions = {
    rolId: 1,
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
        generarReporte: false,
        cargarBanners: false
    }
};
