import { RbacPermissions } from "./rbac-permissions";


export const QUALITY_LIFE_PERMISSIONS: RbacPermissions = {
    rolId: 3,
    actions: {
        reservar: true,
        verReservas: true,
        eliminarReservas: true,
        reservasPorPeriodos: true,
        bloquearUsuarios: true,
        eliminarUsuarios: false,
        cambiarRoles: false,
        verCalendarioDeportivo: true,
        cargarActividadesDeportivas: true,
        generarReporte: true,
        cargarBanners: true
    }
};
