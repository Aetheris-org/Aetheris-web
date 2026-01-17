// Frontend role overrides by UUID (fallback when Supabase role not delivered)
// Fill in the UUIDs for each role you want to force on the client.
// Example: '018eeeb8-80d5-40c7-b8da-a99900000000'
export const ROLE_BY_UUID: Record<string, string> = {
  // owner
  '018eeeb8-80d5-40c7-b8da-a9998d58679f': 'owner', //Ayakiro

  // admin
  '': 'admin',
  'ab3d05e1-45e0-4191-9aa0-22a24ecf0806' : 'admin', //Thaelen
  // super_admin
  // '018eeeb8-80d5-40c7-b8da-a99900000002': 'super_admin',

  // developer
  // '018eeeb8-80d5-40c7-b8da-a99900000003': 'developer',

  // moderator
  'e5462812-787f-41df-bf24-15953a0feb16': 'moderator', //Юккоан
  'baa1aee8-03d9-4bd0-906e-9160bb137c17': 'moderator', //Платон

  // manager/editor/writer/designer/tester/support
  // '018eeeb8-80d5-40c7-b8da-a99900000005': 'manager',
}

export const getRoleByUuid = (uuid?: string | null) => {
  if (!uuid) return undefined
  return ROLE_BY_UUID[uuid]
}

