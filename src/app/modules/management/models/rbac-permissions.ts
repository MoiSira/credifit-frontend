export interface RbacPermissions {
    rolId: number,
    actions: {
        reservar: boolean,
        verReservas: boolean,
        eliminarReservas: boolean,
        reservasPorPeriodos: boolean,
        bloquearUsuarios: boolean,
        eliminarUsuarios: boolean,
        cambiarRoles: boolean,
        verCalendarioDeportivo: boolean,
        cargarActividadesDeportivas: boolean,
        generarReporte: boolean,
        cargarBanners: boolean
    }
}
