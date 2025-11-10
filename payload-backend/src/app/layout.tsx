import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout as PayloadRootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './(payload)/admin/importMap'
import './globals.css'
import './(payload)/custom.scss'

type Props = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const RootLayout = ({ children }: Props) => (
  <PayloadRootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </PayloadRootLayout>
)

export default RootLayout

