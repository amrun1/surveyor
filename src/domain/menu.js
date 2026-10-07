// Pure helpers over the menu tree produced by mapMenuTree() (mappers.js).
// A node with children is a *group* (a toggle in the sidebar — its own uri is
// ignored); a node without children is a *leaf* (a link to its uri).

/**
 * Keeps what `role` may see. Leaves are kept if their roles include `role`.
 * Groups are kept if any child survives — the group's own `roles` are ignored,
 * because the backend sends parents whose roles are narrower than their
 * children's (e.g. Monitoring: [MARKETING, KING], Report Order also APPRAISAL_ADMIN).
 */
export function filterMenuByRole(menus, role) {
    if (!role) return []
    return menus.flatMap(item => {
        if (item.children.length === 0) {
            return item.roles.includes(role) ? [item] : []
        }
        const children = filterMenuByRole(item.children, role)
        return children.length ? [{ ...item, children }] : []
    })
}

/** Every leaf, depth-first, in menu order. */
export function collectLeaves(menus) {
    return menus.flatMap(item => (item.children.length ? collectLeaves(item.children) : [item]))
}

/** Set of leaf uris — what the router guard allows. */
export function collectLeafUris(menus) {
    return new Set(collectLeaves(menus).map(item => item.uri))
}
