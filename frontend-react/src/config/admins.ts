// List of admin/owner UUIDs enforced at frontend level (fallback when role not delivered)
export const ADMIN_UUIDS: string[] = [
  // Add UUIDs of admins/owners here, e.g. '018eeeb8-80d5-40c7-b8da-a99900000000'
]

// Helper to check if a uuid is in admin list
export const isAdminUuid = (uuid?: string | null) => {
  if (!uuid) return false
  return ADMIN_UUIDS.includes(uuid)
}

