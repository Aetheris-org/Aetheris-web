// Frontend role overrides by UUID (fallback when Supabase role not delivered)
// Fill in the UUIDs for each role you want to force on the client.
// Example: '018eeeb8-80d5-40c7-b8da-a99900000000'
export const ROLE_BY_UUID: Record<string, string> = {
  // owner
  '018eeeb8-80d5-40c7-b8da-a9998d58679f': 'owner',

  // admin
  'e688502d-3006-49c3-bcf7-2ba7bd0be92c': 'admin',
  // super_admin
  // '018eeeb8-80d5-40c7-b8da-a99900000002': 'super_admin',

  // developer
  // '018eeeb8-80d5-40c7-b8da-a99900000003': 'developer',

  // moderator
  // '018eeeb8-80d5-40c7-b8da-a99900000004': 'moderator',

  // manager/editor/writer/designer/tester/support
  // '018eeeb8-80d5-40c7-b8da-a99900000005': 'manager',
}

export const getRoleByUuid = (uuid?: string | null) => {
  if (!uuid) return undefined
  return ROLE_BY_UUID[uuid]
}

