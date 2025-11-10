/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/(payload)/api/[...slug]/route";
exports.ids = ["app/(payload)/api/[...slug]/route"];
exports.modules = {

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&page=%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute.ts&appDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&page=%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute.ts&appDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   handler: () => (/* binding */ handler),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/request-meta */ \"(rsc)/./node_modules/next/dist/server/request-meta.js\");\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/dist/server/lib/trace/tracer */ \"(rsc)/./node_modules/next/dist/server/lib/trace/tracer.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/shared/lib/router/utils/app-paths */ \"next/dist/shared/lib/router/utils/app-paths\");\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/base-http/node */ \"(rsc)/./node_modules/next/dist/server/base-http/node.js\");\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/dist/server/web/spec-extension/adapters/next-request */ \"(rsc)/./node_modules/next/dist/server/web/spec-extension/adapters/next-request.js\");\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/dist/server/lib/trace/constants */ \"(rsc)/./node_modules/next/dist/server/lib/trace/constants.js\");\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/dist/server/instrumentation/utils */ \"(rsc)/./node_modules/next/dist/server/instrumentation/utils.js\");\n/* harmony import */ var next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! next/dist/server/send-response */ \"(rsc)/./node_modules/next/dist/server/send-response.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(rsc)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! next/dist/server/lib/cache-control */ \"(rsc)/./node_modules/next/dist/server/lib/cache-control.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! next/dist/lib/constants */ \"(rsc)/./node_modules/next/dist/lib/constants.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! next/dist/shared/lib/no-fallback-error.external */ \"next/dist/shared/lib/no-fallback-error.external\");\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! next/dist/server/response-cache */ \"(rsc)/./node_modules/next/dist/server/response-cache/index.js\");\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var _Users_zimbazo_WebstormProjects_Aetheris_shadcn_payload_backend_src_app_payload_api_slug_route_ts__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./src/app/(payload)/api/[...slug]/route.ts */ \"(rsc)/./src/app/(payload)/api/[...slug]/route.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_Users_zimbazo_WebstormProjects_Aetheris_shadcn_payload_backend_src_app_payload_api_slug_route_ts__WEBPACK_IMPORTED_MODULE_16__]);\n_Users_zimbazo_WebstormProjects_Aetheris_shadcn_payload_backend_src_app_payload_api_slug_route_ts__WEBPACK_IMPORTED_MODULE_16__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/(payload)/api/[...slug]/route\",\n        pathname: \"/api/[...slug]\",\n        filename: \"route\",\n        bundlePath: \"app/(payload)/api/[...slug]/route\"\n    },\n    distDir: \".next\" || 0,\n    relativeProjectDir:  false || '',\n    resolvedPagePath: \"/Users/zimbazo/WebstormProjects/Aetheris shadcn/payload-backend/src/app/(payload)/api/[...slug]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_zimbazo_WebstormProjects_Aetheris_shadcn_payload_backend_src_app_payload_api_slug_route_ts__WEBPACK_IMPORTED_MODULE_16__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\nasync function handler(req, res, ctx) {\n    var _nextConfig_experimental;\n    let srcPage = \"/(payload)/api/[...slug]/route\";\n    // turbopack doesn't normalize `/index` in the page name\n    // so we need to to process dynamic routes properly\n    // TODO: fix turbopack providing differing value from webpack\n    if (false) {} else if (srcPage === '/index') {\n        // we always normalize /index specifically\n        srcPage = '/';\n    }\n    const multiZoneDraftMode = false;\n    const prepareResult = await routeModule.prepare(req, res, {\n        srcPage,\n        multiZoneDraftMode\n    });\n    if (!prepareResult) {\n        res.statusCode = 400;\n        res.end('Bad Request');\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n        return null;\n    }\n    const { buildId, params, nextConfig, isDraftMode, prerenderManifest, routerServerContext, isOnDemandRevalidate, revalidateOnlyGenerated, resolvedPathname } = prepareResult;\n    const normalizedSrcPage = (0,next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__.normalizeAppPath)(srcPage);\n    let isIsr = Boolean(prerenderManifest.dynamicRoutes[normalizedSrcPage] || prerenderManifest.routes[resolvedPathname]);\n    if (isIsr && !isDraftMode) {\n        const isPrerendered = Boolean(prerenderManifest.routes[resolvedPathname]);\n        const prerenderInfo = prerenderManifest.dynamicRoutes[normalizedSrcPage];\n        if (prerenderInfo) {\n            if (prerenderInfo.fallback === false && !isPrerendered) {\n                throw new next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError();\n            }\n        }\n    }\n    let cacheKey = null;\n    if (isIsr && !routeModule.isDev && !isDraftMode) {\n        cacheKey = resolvedPathname;\n        // ensure /index and / is normalized to one key\n        cacheKey = cacheKey === '/index' ? '/' : cacheKey;\n    }\n    const supportsDynamicResponse = // If we're in development, we always support dynamic HTML\n    routeModule.isDev === true || // If this is not SSG or does not have static paths, then it supports\n    // dynamic HTML.\n    !isIsr;\n    // This is a revalidation request if the request is for a static\n    // page and it is not being resumed from a postponed render and\n    // it is not a dynamic RSC request then it is a revalidation\n    // request.\n    const isRevalidate = isIsr && !supportsDynamicResponse;\n    const method = req.method || 'GET';\n    const tracer = (0,next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.getTracer)();\n    const activeSpan = tracer.getActiveScopeSpan();\n    const context = {\n        params,\n        prerenderManifest,\n        renderOpts: {\n            experimental: {\n                cacheComponents: Boolean(nextConfig.experimental.cacheComponents),\n                authInterrupts: Boolean(nextConfig.experimental.authInterrupts)\n            },\n            supportsDynamicResponse,\n            incrementalCache: (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'incrementalCache'),\n            cacheLifeProfiles: (_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.cacheLife,\n            isRevalidate,\n            waitUntil: ctx.waitUntil,\n            onClose: (cb)=>{\n                res.on('close', cb);\n            },\n            onAfterTaskError: undefined,\n            onInstrumentationRequestError: (error, _request, errorContext)=>routeModule.onRequestError(req, error, errorContext, routerServerContext)\n        },\n        sharedContext: {\n            buildId\n        }\n    };\n    const nodeNextReq = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextRequest(req);\n    const nodeNextRes = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextResponse(res);\n    const nextReq = next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.NextRequestAdapter.fromNodeNextRequest(nodeNextReq, (0,next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.signalFromNodeResponse)(res));\n    try {\n        const invokeRouteModule = async (span)=>{\n            return routeModule.handle(nextReq, context).finally(()=>{\n                if (!span) return;\n                span.setAttributes({\n                    'http.status_code': res.statusCode,\n                    'next.rsc': false\n                });\n                const rootSpanAttributes = tracer.getRootSpanAttributes();\n                // We were unable to get attributes, probably OTEL is not enabled\n                if (!rootSpanAttributes) {\n                    return;\n                }\n                if (rootSpanAttributes.get('next.span_type') !== next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest) {\n                    console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);\n                    return;\n                }\n                const route = rootSpanAttributes.get('next.route');\n                if (route) {\n                    const name = `${method} ${route}`;\n                    span.setAttributes({\n                        'next.route': route,\n                        'http.route': route,\n                        'next.span_name': name\n                    });\n                    span.updateName(name);\n                } else {\n                    span.updateName(`${method} ${req.url}`);\n                }\n            });\n        };\n        const handleResponse = async (currentSpan)=>{\n            var _cacheEntry_value;\n            const responseGenerator = async ({ previousCacheEntry })=>{\n                try {\n                    if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isOnDemandRevalidate && revalidateOnlyGenerated && !previousCacheEntry) {\n                        res.statusCode = 404;\n                        // on-demand revalidate always sets this header\n                        res.setHeader('x-nextjs-cache', 'REVALIDATED');\n                        res.end('This page could not be found');\n                        return null;\n                    }\n                    const response = await invokeRouteModule(currentSpan);\n                    req.fetchMetrics = context.renderOpts.fetchMetrics;\n                    let pendingWaitUntil = context.renderOpts.pendingWaitUntil;\n                    // Attempt using provided waitUntil if available\n                    // if it's not we fallback to sendResponse's handling\n                    if (pendingWaitUntil) {\n                        if (ctx.waitUntil) {\n                            ctx.waitUntil(pendingWaitUntil);\n                            pendingWaitUntil = undefined;\n                        }\n                    }\n                    const cacheTags = context.renderOpts.collectedTags;\n                    // If the request is for a static response, we can cache it so long\n                    // as it's not edge.\n                    if (isIsr) {\n                        const blob = await response.blob();\n                        // Copy the headers from the response.\n                        const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.toNodeOutgoingHttpHeaders)(response.headers);\n                        if (cacheTags) {\n                            headers[next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER] = cacheTags;\n                        }\n                        if (!headers['content-type'] && blob.type) {\n                            headers['content-type'] = blob.type;\n                        }\n                        const revalidate = typeof context.renderOpts.collectedRevalidate === 'undefined' || context.renderOpts.collectedRevalidate >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? false : context.renderOpts.collectedRevalidate;\n                        const expire = typeof context.renderOpts.collectedExpire === 'undefined' || context.renderOpts.collectedExpire >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? undefined : context.renderOpts.collectedExpire;\n                        // Create the cache entry for the response.\n                        const cacheEntry = {\n                            value: {\n                                kind: next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE,\n                                status: response.status,\n                                body: Buffer.from(await blob.arrayBuffer()),\n                                headers\n                            },\n                            cacheControl: {\n                                revalidate,\n                                expire\n                            }\n                        };\n                        return cacheEntry;\n                    } else {\n                        // send response without caching if not ISR\n                        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, response, context.renderOpts.pendingWaitUntil);\n                        return null;\n                    }\n                } catch (err) {\n                    // if this is a background revalidate we need to report\n                    // the request error here as it won't be bubbled\n                    if (previousCacheEntry == null ? void 0 : previousCacheEntry.isStale) {\n                        await routeModule.onRequestError(req, err, {\n                            routerKind: 'App Router',\n                            routePath: srcPage,\n                            routeType: 'route',\n                            revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                                isRevalidate,\n                                isOnDemandRevalidate\n                            })\n                        }, routerServerContext);\n                    }\n                    throw err;\n                }\n            };\n            const cacheEntry = await routeModule.handleResponse({\n                req,\n                nextConfig,\n                cacheKey,\n                routeKind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n                isFallback: false,\n                prerenderManifest,\n                isRoutePPREnabled: false,\n                isOnDemandRevalidate,\n                revalidateOnlyGenerated,\n                responseGenerator,\n                waitUntil: ctx.waitUntil\n            });\n            // we don't create a cacheEntry for ISR\n            if (!isIsr) {\n                return null;\n            }\n            if ((cacheEntry == null ? void 0 : (_cacheEntry_value = cacheEntry.value) == null ? void 0 : _cacheEntry_value.kind) !== next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE) {\n                var _cacheEntry_value1;\n                throw Object.defineProperty(new Error(`Invariant: app-route received invalid cache entry ${cacheEntry == null ? void 0 : (_cacheEntry_value1 = cacheEntry.value) == null ? void 0 : _cacheEntry_value1.kind}`), \"__NEXT_ERROR_CODE\", {\n                    value: \"E701\",\n                    enumerable: false,\n                    configurable: true\n                });\n            }\n            if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode')) {\n                res.setHeader('x-nextjs-cache', isOnDemandRevalidate ? 'REVALIDATED' : cacheEntry.isMiss ? 'MISS' : cacheEntry.isStale ? 'STALE' : 'HIT');\n            }\n            // Draft mode should never be cached\n            if (isDraftMode) {\n                res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');\n            }\n            const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.fromNodeOutgoingHttpHeaders)(cacheEntry.value.headers);\n            if (!((0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isIsr)) {\n                headers.delete(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER);\n            }\n            // If cache control is already set on the response we don't\n            // override it to allow users to customize it via next.config\n            if (cacheEntry.cacheControl && !res.getHeader('Cache-Control') && !headers.get('Cache-Control')) {\n                headers.set('Cache-Control', (0,next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__.getCacheControlHeader)(cacheEntry.cacheControl));\n            }\n            await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(cacheEntry.value.body, {\n                headers,\n                status: cacheEntry.value.status || 200\n            }));\n            return null;\n        };\n        // TODO: activeSpan code path is for when wrapped by\n        // next-server can be removed when this is no longer used\n        if (activeSpan) {\n            await handleResponse(activeSpan);\n        } else {\n            await tracer.withPropagatedContext(req.headers, ()=>tracer.trace(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest, {\n                    spanName: `${method} ${req.url}`,\n                    kind: next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.SpanKind.SERVER,\n                    attributes: {\n                        'http.method': method,\n                        'http.target': req.url\n                    }\n                }, handleResponse));\n        }\n    } catch (err) {\n        if (!(err instanceof next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError)) {\n            await routeModule.onRequestError(req, err, {\n                routerKind: 'App Router',\n                routePath: normalizedSrcPage,\n                routeType: 'route',\n                revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                    isRevalidate,\n                    isOnDemandRevalidate\n                })\n            });\n        }\n        // rethrow so that we can handle serving error page\n        // If this is during static generation, throw the error again.\n        if (isIsr) throw err;\n        // Otherwise, send a 500 response.\n        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(null, {\n            status: 500\n        }));\n        return null;\n    }\n}\n\n//# sourceMappingURL=app-route.js.map\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkYocGF5bG9hZCklMkZhcGklMkYlNUIuLi5zbHVnJTVEJTJGcm91dGUmcGFnZT0lMkYocGF5bG9hZCklMkZhcGklMkYlNUIuLi5zbHVnJTVEJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGKHBheWxvYWQpJTJGYXBpJTJGJTVCLi4uc2x1ZyU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnppbWJhem8lMkZXZWJzdG9ybVByb2plY3RzJTJGQWV0aGVyaXMlMjBzaGFkY24lMkZwYXlsb2FkLWJhY2tlbmQlMkZzcmMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGemltYmF6byUyRldlYnN0b3JtUHJvamVjdHMlMkZBZXRoZXJpcyUyMHNoYWRjbiUyRnBheWxvYWQtYmFja2VuZCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCZpc0dsb2JhbE5vdEZvdW5kRW5hYmxlZD0hIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2Q7QUFDUztBQUNPO0FBQ0s7QUFDbUM7QUFDakQ7QUFDTztBQUNmO0FBQ3NDO0FBQ3pCO0FBQ007QUFDQztBQUNoQjtBQUNtRTtBQUNySTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxhQUFhLE9BQW9DLElBQUksQ0FBRTtBQUN2RCx3QkFBd0IsTUFBdUM7QUFDL0Q7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7QUFDbkY7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxLQUFxQixFQUFFLEVBRTFCLENBQUM7QUFDTjtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsS0FBd0M7QUFDdkU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksb0pBQW9KO0FBQ2hLLDhCQUE4Qiw2RkFBZ0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLDZGQUFlO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDRFQUFTO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSw4QkFBOEIsNkVBQWM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLDRFQUFlO0FBQzNDLDRCQUE0Qiw2RUFBZ0I7QUFDNUMsb0JBQW9CLHlHQUFrQixrQ0FBa0MsaUhBQXNCO0FBQzlGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsZ0ZBQWM7QUFDL0UsK0RBQStELHlDQUF5QztBQUN4RztBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxRQUFRLEVBQUUsTUFBTTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLGtCQUFrQjtBQUNsQix1Q0FBdUMsUUFBUSxFQUFFLFFBQVE7QUFDekQ7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLG9CQUFvQjtBQUNuRTtBQUNBLHlCQUF5Qiw2RUFBYztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLHNGQUF5QjtBQUNqRTtBQUNBLG9DQUFvQyw0RUFBc0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzSkFBc0osb0VBQWM7QUFDcEssMElBQTBJLG9FQUFjO0FBQ3hKO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyw2RUFBZTtBQUNyRDtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0EsOEJBQThCLDZFQUFZO0FBQzFDO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsMkZBQW1CO0FBQ2pFO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsa0VBQVM7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxSUFBcUksNkVBQWU7QUFDcEo7QUFDQSwyR0FBMkcsaUhBQWlIO0FBQzVOO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGlCQUFpQiw2RUFBYztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsd0ZBQTJCO0FBQ3ZELGtCQUFrQiw2RUFBYztBQUNoQywrQkFBK0IsNEVBQXNCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLDBGQUFxQjtBQUNsRTtBQUNBLGtCQUFrQiw2RUFBWTtBQUM5QjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDViw2RUFBNkUsZ0ZBQWM7QUFDM0YsaUNBQWlDLFFBQVEsRUFBRSxRQUFRO0FBQ25ELDBCQUEwQix1RUFBUTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLE1BQU07QUFDTiw2QkFBNkIsNkZBQWU7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsMkZBQW1CO0FBQ3JEO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDZFQUFZO0FBQzFCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCB7IGdldFJlcXVlc3RNZXRhIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcmVxdWVzdC1tZXRhXCI7XG5pbXBvcnQgeyBnZXRUcmFjZXIsIFNwYW5LaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3RyYWNlL3RyYWNlclwiO1xuaW1wb3J0IHsgbm9ybWFsaXplQXBwUGF0aCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2hhcmVkL2xpYi9yb3V0ZXIvdXRpbHMvYXBwLXBhdGhzXCI7XG5pbXBvcnQgeyBOb2RlTmV4dFJlcXVlc3QsIE5vZGVOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9iYXNlLWh0dHAvbm9kZVwiO1xuaW1wb3J0IHsgTmV4dFJlcXVlc3RBZGFwdGVyLCBzaWduYWxGcm9tTm9kZVJlc3BvbnNlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL3NwZWMtZXh0ZW5zaW9uL2FkYXB0ZXJzL25leHQtcmVxdWVzdFwiO1xuaW1wb3J0IHsgQmFzZVNlcnZlclNwYW4gfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvdHJhY2UvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBnZXRSZXZhbGlkYXRlUmVhc29uIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvaW5zdHJ1bWVudGF0aW9uL3V0aWxzXCI7XG5pbXBvcnQgeyBzZW5kUmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9zZW5kLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBmcm9tTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMsIHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvdXRpbHNcIjtcbmltcG9ydCB7IGdldENhY2hlQ29udHJvbEhlYWRlciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9jYWNoZS1jb250cm9sXCI7XG5pbXBvcnQgeyBJTkZJTklURV9DQUNIRSwgTkVYVF9DQUNIRV9UQUdTX0hFQURFUiB9IGZyb20gXCJuZXh0L2Rpc3QvbGliL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgTm9GYWxsYmFja0Vycm9yIH0gZnJvbSBcIm5leHQvZGlzdC9zaGFyZWQvbGliL25vLWZhbGxiYWNrLWVycm9yLmV4dGVybmFsXCI7XG5pbXBvcnQgeyBDYWNoZWRSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yZXNwb25zZS1jYWNoZVwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvYXBwLyhwYXlsb2FkKS9hcGkvWy4uLnNsdWddL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiLyhwYXlsb2FkKS9hcGkvWy4uLnNsdWddL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvWy4uLnNsdWddXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwLyhwYXlsb2FkKS9hcGkvWy4uLnNsdWddL3JvdXRlXCJcbiAgICB9LFxuICAgIGRpc3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9ESVNUX0RJUiB8fCAnJyxcbiAgICByZWxhdGl2ZVByb2plY3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9QUk9KRUNUX0RJUiB8fCAnJyxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvYXBwLyhwYXlsb2FkKS9hcGkvWy4uLnNsdWddL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMsIGN0eCkge1xuICAgIHZhciBfbmV4dENvbmZpZ19leHBlcmltZW50YWw7XG4gICAgbGV0IHNyY1BhZ2UgPSBcIi8ocGF5bG9hZCkvYXBpL1suLi5zbHVnXS9yb3V0ZVwiO1xuICAgIC8vIHR1cmJvcGFjayBkb2Vzbid0IG5vcm1hbGl6ZSBgL2luZGV4YCBpbiB0aGUgcGFnZSBuYW1lXG4gICAgLy8gc28gd2UgbmVlZCB0byB0byBwcm9jZXNzIGR5bmFtaWMgcm91dGVzIHByb3Blcmx5XG4gICAgLy8gVE9ETzogZml4IHR1cmJvcGFjayBwcm92aWRpbmcgZGlmZmVyaW5nIHZhbHVlIGZyb20gd2VicGFja1xuICAgIGlmIChwcm9jZXNzLmVudi5UVVJCT1BBQ0spIHtcbiAgICAgICAgc3JjUGFnZSA9IHNyY1BhZ2UucmVwbGFjZSgvXFwvaW5kZXgkLywgJycpIHx8ICcvJztcbiAgICB9IGVsc2UgaWYgKHNyY1BhZ2UgPT09ICcvaW5kZXgnKSB7XG4gICAgICAgIC8vIHdlIGFsd2F5cyBub3JtYWxpemUgL2luZGV4IHNwZWNpZmljYWxseVxuICAgICAgICBzcmNQYWdlID0gJy8nO1xuICAgIH1cbiAgICBjb25zdCBtdWx0aVpvbmVEcmFmdE1vZGUgPSBwcm9jZXNzLmVudi5fX05FWFRfTVVMVElfWk9ORV9EUkFGVF9NT0RFO1xuICAgIGNvbnN0IHByZXBhcmVSZXN1bHQgPSBhd2FpdCByb3V0ZU1vZHVsZS5wcmVwYXJlKHJlcSwgcmVzLCB7XG4gICAgICAgIHNyY1BhZ2UsXG4gICAgICAgIG11bHRpWm9uZURyYWZ0TW9kZVxuICAgIH0pO1xuICAgIGlmICghcHJlcGFyZVJlc3VsdCkge1xuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgcmVzLmVuZCgnQmFkIFJlcXVlc3QnKTtcbiAgICAgICAgY3R4LndhaXRVbnRpbCA9PSBudWxsID8gdm9pZCAwIDogY3R4LndhaXRVbnRpbC5jYWxsKGN0eCwgUHJvbWlzZS5yZXNvbHZlKCkpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBidWlsZElkLCBwYXJhbXMsIG5leHRDb25maWcsIGlzRHJhZnRNb2RlLCBwcmVyZW5kZXJNYW5pZmVzdCwgcm91dGVyU2VydmVyQ29udGV4dCwgaXNPbkRlbWFuZFJldmFsaWRhdGUsIHJldmFsaWRhdGVPbmx5R2VuZXJhdGVkLCByZXNvbHZlZFBhdGhuYW1lIH0gPSBwcmVwYXJlUmVzdWx0O1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRTcmNQYWdlID0gbm9ybWFsaXplQXBwUGF0aChzcmNQYWdlKTtcbiAgICBsZXQgaXNJc3IgPSBCb29sZWFuKHByZXJlbmRlck1hbmlmZXN0LmR5bmFtaWNSb3V0ZXNbbm9ybWFsaXplZFNyY1BhZ2VdIHx8IHByZXJlbmRlck1hbmlmZXN0LnJvdXRlc1tyZXNvbHZlZFBhdGhuYW1lXSk7XG4gICAgaWYgKGlzSXNyICYmICFpc0RyYWZ0TW9kZSkge1xuICAgICAgICBjb25zdCBpc1ByZXJlbmRlcmVkID0gQm9vbGVhbihwcmVyZW5kZXJNYW5pZmVzdC5yb3V0ZXNbcmVzb2x2ZWRQYXRobmFtZV0pO1xuICAgICAgICBjb25zdCBwcmVyZW5kZXJJbmZvID0gcHJlcmVuZGVyTWFuaWZlc3QuZHluYW1pY1JvdXRlc1tub3JtYWxpemVkU3JjUGFnZV07XG4gICAgICAgIGlmIChwcmVyZW5kZXJJbmZvKSB7XG4gICAgICAgICAgICBpZiAocHJlcmVuZGVySW5mby5mYWxsYmFjayA9PT0gZmFsc2UgJiYgIWlzUHJlcmVuZGVyZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTm9GYWxsYmFja0Vycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IGNhY2hlS2V5ID0gbnVsbDtcbiAgICBpZiAoaXNJc3IgJiYgIXJvdXRlTW9kdWxlLmlzRGV2ICYmICFpc0RyYWZ0TW9kZSkge1xuICAgICAgICBjYWNoZUtleSA9IHJlc29sdmVkUGF0aG5hbWU7XG4gICAgICAgIC8vIGVuc3VyZSAvaW5kZXggYW5kIC8gaXMgbm9ybWFsaXplZCB0byBvbmUga2V5XG4gICAgICAgIGNhY2hlS2V5ID0gY2FjaGVLZXkgPT09ICcvaW5kZXgnID8gJy8nIDogY2FjaGVLZXk7XG4gICAgfVxuICAgIGNvbnN0IHN1cHBvcnRzRHluYW1pY1Jlc3BvbnNlID0gLy8gSWYgd2UncmUgaW4gZGV2ZWxvcG1lbnQsIHdlIGFsd2F5cyBzdXBwb3J0IGR5bmFtaWMgSFRNTFxuICAgIHJvdXRlTW9kdWxlLmlzRGV2ID09PSB0cnVlIHx8IC8vIElmIHRoaXMgaXMgbm90IFNTRyBvciBkb2VzIG5vdCBoYXZlIHN0YXRpYyBwYXRocywgdGhlbiBpdCBzdXBwb3J0c1xuICAgIC8vIGR5bmFtaWMgSFRNTC5cbiAgICAhaXNJc3I7XG4gICAgLy8gVGhpcyBpcyBhIHJldmFsaWRhdGlvbiByZXF1ZXN0IGlmIHRoZSByZXF1ZXN0IGlzIGZvciBhIHN0YXRpY1xuICAgIC8vIHBhZ2UgYW5kIGl0IGlzIG5vdCBiZWluZyByZXN1bWVkIGZyb20gYSBwb3N0cG9uZWQgcmVuZGVyIGFuZFxuICAgIC8vIGl0IGlzIG5vdCBhIGR5bmFtaWMgUlNDIHJlcXVlc3QgdGhlbiBpdCBpcyBhIHJldmFsaWRhdGlvblxuICAgIC8vIHJlcXVlc3QuXG4gICAgY29uc3QgaXNSZXZhbGlkYXRlID0gaXNJc3IgJiYgIXN1cHBvcnRzRHluYW1pY1Jlc3BvbnNlO1xuICAgIGNvbnN0IG1ldGhvZCA9IHJlcS5tZXRob2QgfHwgJ0dFVCc7XG4gICAgY29uc3QgdHJhY2VyID0gZ2V0VHJhY2VyKCk7XG4gICAgY29uc3QgYWN0aXZlU3BhbiA9IHRyYWNlci5nZXRBY3RpdmVTY29wZVNwYW4oKTtcbiAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHByZXJlbmRlck1hbmlmZXN0LFxuICAgICAgICByZW5kZXJPcHRzOiB7XG4gICAgICAgICAgICBleHBlcmltZW50YWw6IHtcbiAgICAgICAgICAgICAgICBjYWNoZUNvbXBvbmVudHM6IEJvb2xlYW4obmV4dENvbmZpZy5leHBlcmltZW50YWwuY2FjaGVDb21wb25lbnRzKSxcbiAgICAgICAgICAgICAgICBhdXRoSW50ZXJydXB0czogQm9vbGVhbihuZXh0Q29uZmlnLmV4cGVyaW1lbnRhbC5hdXRoSW50ZXJydXB0cylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdXBwb3J0c0R5bmFtaWNSZXNwb25zZSxcbiAgICAgICAgICAgIGluY3JlbWVudGFsQ2FjaGU6IGdldFJlcXVlc3RNZXRhKHJlcSwgJ2luY3JlbWVudGFsQ2FjaGUnKSxcbiAgICAgICAgICAgIGNhY2hlTGlmZVByb2ZpbGVzOiAoX25leHRDb25maWdfZXhwZXJpbWVudGFsID0gbmV4dENvbmZpZy5leHBlcmltZW50YWwpID09IG51bGwgPyB2b2lkIDAgOiBfbmV4dENvbmZpZ19leHBlcmltZW50YWwuY2FjaGVMaWZlLFxuICAgICAgICAgICAgaXNSZXZhbGlkYXRlLFxuICAgICAgICAgICAgd2FpdFVudGlsOiBjdHgud2FpdFVudGlsLFxuICAgICAgICAgICAgb25DbG9zZTogKGNiKT0+e1xuICAgICAgICAgICAgICAgIHJlcy5vbignY2xvc2UnLCBjYik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BZnRlclRhc2tFcnJvcjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgb25JbnN0cnVtZW50YXRpb25SZXF1ZXN0RXJyb3I6IChlcnJvciwgX3JlcXVlc3QsIGVycm9yQ29udGV4dCk9PnJvdXRlTW9kdWxlLm9uUmVxdWVzdEVycm9yKHJlcSwgZXJyb3IsIGVycm9yQ29udGV4dCwgcm91dGVyU2VydmVyQ29udGV4dClcbiAgICAgICAgfSxcbiAgICAgICAgc2hhcmVkQ29udGV4dDoge1xuICAgICAgICAgICAgYnVpbGRJZFxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBub2RlTmV4dFJlcSA9IG5ldyBOb2RlTmV4dFJlcXVlc3QocmVxKTtcbiAgICBjb25zdCBub2RlTmV4dFJlcyA9IG5ldyBOb2RlTmV4dFJlc3BvbnNlKHJlcyk7XG4gICAgY29uc3QgbmV4dFJlcSA9IE5leHRSZXF1ZXN0QWRhcHRlci5mcm9tTm9kZU5leHRSZXF1ZXN0KG5vZGVOZXh0UmVxLCBzaWduYWxGcm9tTm9kZVJlc3BvbnNlKHJlcykpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGludm9rZVJvdXRlTW9kdWxlID0gYXN5bmMgKHNwYW4pPT57XG4gICAgICAgICAgICByZXR1cm4gcm91dGVNb2R1bGUuaGFuZGxlKG5leHRSZXEsIGNvbnRleHQpLmZpbmFsbHkoKCk9PntcbiAgICAgICAgICAgICAgICBpZiAoIXNwYW4pIHJldHVybjtcbiAgICAgICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAnaHR0cC5zdGF0dXNfY29kZSc6IHJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgICAgICAgICAnbmV4dC5yc2MnOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3RTcGFuQXR0cmlidXRlcyA9IHRyYWNlci5nZXRSb290U3BhbkF0dHJpYnV0ZXMoKTtcbiAgICAgICAgICAgICAgICAvLyBXZSB3ZXJlIHVuYWJsZSB0byBnZXQgYXR0cmlidXRlcywgcHJvYmFibHkgT1RFTCBpcyBub3QgZW5hYmxlZFxuICAgICAgICAgICAgICAgIGlmICghcm9vdFNwYW5BdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTcGFuQXR0cmlidXRlcy5nZXQoJ25leHQuc3Bhbl90eXBlJykgIT09IEJhc2VTZXJ2ZXJTcGFuLmhhbmRsZVJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmV4cGVjdGVkIHJvb3Qgc3BhbiB0eXBlICcke3Jvb3RTcGFuQXR0cmlidXRlcy5nZXQoJ25leHQuc3Bhbl90eXBlJyl9Jy4gUGxlYXNlIHJlcG9ydCB0aGlzIE5leHQuanMgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlcmNlbC9uZXh0LmpzYCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgcm91dGUgPSByb290U3BhbkF0dHJpYnV0ZXMuZ2V0KCduZXh0LnJvdXRlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBgJHttZXRob2R9ICR7cm91dGV9YDtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICduZXh0LnJvdXRlJzogcm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC5yb3V0ZSc6IHJvdXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ25leHQuc3Bhbl9uYW1lJzogbmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi51cGRhdGVOYW1lKG5hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4udXBkYXRlTmFtZShgJHttZXRob2R9ICR7cmVxLnVybH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGFuZGxlUmVzcG9uc2UgPSBhc3luYyAoY3VycmVudFNwYW4pPT57XG4gICAgICAgICAgICB2YXIgX2NhY2hlRW50cnlfdmFsdWU7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUdlbmVyYXRvciA9IGFzeW5jICh7IHByZXZpb3VzQ2FjaGVFbnRyeSB9KT0+e1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZ2V0UmVxdWVzdE1ldGEocmVxLCAnbWluaW1hbE1vZGUnKSAmJiBpc09uRGVtYW5kUmV2YWxpZGF0ZSAmJiByZXZhbGlkYXRlT25seUdlbmVyYXRlZCAmJiAhcHJldmlvdXNDYWNoZUVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9uLWRlbWFuZCByZXZhbGlkYXRlIGFsd2F5cyBzZXRzIHRoaXMgaGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCd4LW5leHRqcy1jYWNoZScsICdSRVZBTElEQVRFRCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgnVGhpcyBwYWdlIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBpbnZva2VSb3V0ZU1vZHVsZShjdXJyZW50U3Bhbik7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5mZXRjaE1ldHJpY3MgPSBjb250ZXh0LnJlbmRlck9wdHMuZmV0Y2hNZXRyaWNzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGVuZGluZ1dhaXRVbnRpbCA9IGNvbnRleHQucmVuZGVyT3B0cy5wZW5kaW5nV2FpdFVudGlsO1xuICAgICAgICAgICAgICAgICAgICAvLyBBdHRlbXB0IHVzaW5nIHByb3ZpZGVkIHdhaXRVbnRpbCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQncyBub3Qgd2UgZmFsbGJhY2sgdG8gc2VuZFJlc3BvbnNlJ3MgaGFuZGxpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdXYWl0VW50aWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHgud2FpdFVudGlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LndhaXRVbnRpbChwZW5kaW5nV2FpdFVudGlsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nV2FpdFVudGlsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlVGFncyA9IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRUYWdzO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBzdGF0aWMgcmVzcG9uc2UsIHdlIGNhbiBjYWNoZSBpdCBzbyBsb25nXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzIGl0J3Mgbm90IGVkZ2UuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0lzcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlIGhlYWRlcnMgZnJvbSB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gdG9Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZVRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzW05FWFRfQ0FDSEVfVEFHU19IRUFERVJdID0gY2FjaGVUYWdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoZWFkZXJzWydjb250ZW50LXR5cGUnXSAmJiBibG9iLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IGJsb2IudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldmFsaWRhdGUgPSB0eXBlb2YgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZFJldmFsaWRhdGUgPT09ICd1bmRlZmluZWQnIHx8IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRSZXZhbGlkYXRlID49IElORklOSVRFX0NBQ0hFID8gZmFsc2UgOiBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkUmV2YWxpZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4cGlyZSA9IHR5cGVvZiBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkRXhwaXJlID09PSAndW5kZWZpbmVkJyB8fCBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkRXhwaXJlID49IElORklOSVRFX0NBQ0hFID8gdW5kZWZpbmVkIDogY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZEV4cGlyZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgY2FjaGUgZW50cnkgZm9yIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlRW50cnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogQ2FjaGVkUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEJ1ZmZlci5mcm9tKGF3YWl0IGJsb2IuYXJyYXlCdWZmZXIoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlQ29udHJvbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBpcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlRW50cnk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHJlc3BvbnNlIHdpdGhvdXQgY2FjaGluZyBpZiBub3QgSVNSXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzZW5kUmVzcG9uc2Uobm9kZU5leHRSZXEsIG5vZGVOZXh0UmVzLCByZXNwb25zZSwgY29udGV4dC5yZW5kZXJPcHRzLnBlbmRpbmdXYWl0VW50aWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhIGJhY2tncm91bmQgcmV2YWxpZGF0ZSB3ZSBuZWVkIHRvIHJlcG9ydFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcmVxdWVzdCBlcnJvciBoZXJlIGFzIGl0IHdvbid0IGJlIGJ1YmJsZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzQ2FjaGVFbnRyeSA9PSBudWxsID8gdm9pZCAwIDogcHJldmlvdXNDYWNoZUVudHJ5LmlzU3RhbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJvdXRlTW9kdWxlLm9uUmVxdWVzdEVycm9yKHJlcSwgZXJyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyS2luZDogJ0FwcCBSb3V0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlUGF0aDogc3JjUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVR5cGU6ICdyb3V0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2YWxpZGF0ZVJlYXNvbjogZ2V0UmV2YWxpZGF0ZVJlYXNvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNPbkRlbWFuZFJldmFsaWRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgcm91dGVyU2VydmVyQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBjYWNoZUVudHJ5ID0gYXdhaXQgcm91dGVNb2R1bGUuaGFuZGxlUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIHJlcSxcbiAgICAgICAgICAgICAgICBuZXh0Q29uZmlnLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIHJvdXRlS2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgICAgICAgICBpc0ZhbGxiYWNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcmVyZW5kZXJNYW5pZmVzdCxcbiAgICAgICAgICAgICAgICBpc1JvdXRlUFBSRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNPbkRlbWFuZFJldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgcmV2YWxpZGF0ZU9ubHlHZW5lcmF0ZWQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VHZW5lcmF0b3IsXG4gICAgICAgICAgICAgICAgd2FpdFVudGlsOiBjdHgud2FpdFVudGlsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IGNyZWF0ZSBhIGNhY2hlRW50cnkgZm9yIElTUlxuICAgICAgICAgICAgaWYgKCFpc0lzcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChjYWNoZUVudHJ5ID09IG51bGwgPyB2b2lkIDAgOiAoX2NhY2hlRW50cnlfdmFsdWUgPSBjYWNoZUVudHJ5LnZhbHVlKSA9PSBudWxsID8gdm9pZCAwIDogX2NhY2hlRW50cnlfdmFsdWUua2luZCkgIT09IENhY2hlZFJvdXRlS2luZC5BUFBfUk9VVEUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2NhY2hlRW50cnlfdmFsdWUxO1xuICAgICAgICAgICAgICAgIHRocm93IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXcgRXJyb3IoYEludmFyaWFudDogYXBwLXJvdXRlIHJlY2VpdmVkIGludmFsaWQgY2FjaGUgZW50cnkgJHtjYWNoZUVudHJ5ID09IG51bGwgPyB2b2lkIDAgOiAoX2NhY2hlRW50cnlfdmFsdWUxID0gY2FjaGVFbnRyeS52YWx1ZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9jYWNoZUVudHJ5X3ZhbHVlMS5raW5kfWApLCBcIl9fTkVYVF9FUlJPUl9DT0RFXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiRTcwMVwiLFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWdldFJlcXVlc3RNZXRhKHJlcSwgJ21pbmltYWxNb2RlJykpIHtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCd4LW5leHRqcy1jYWNoZScsIGlzT25EZW1hbmRSZXZhbGlkYXRlID8gJ1JFVkFMSURBVEVEJyA6IGNhY2hlRW50cnkuaXNNaXNzID8gJ01JU1MnIDogY2FjaGVFbnRyeS5pc1N0YWxlID8gJ1NUQUxFJyA6ICdISVQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERyYWZ0IG1vZGUgc2hvdWxkIG5ldmVyIGJlIGNhY2hlZFxuICAgICAgICAgICAgaWYgKGlzRHJhZnRNb2RlKSB7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICdwcml2YXRlLCBuby1jYWNoZSwgbm8tc3RvcmUsIG1heC1hZ2U9MCwgbXVzdC1yZXZhbGlkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gZnJvbU5vZGVPdXRnb2luZ0h0dHBIZWFkZXJzKGNhY2hlRW50cnkudmFsdWUuaGVhZGVycyk7XG4gICAgICAgICAgICBpZiAoIShnZXRSZXF1ZXN0TWV0YShyZXEsICdtaW5pbWFsTW9kZScpICYmIGlzSXNyKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuZGVsZXRlKE5FWFRfQ0FDSEVfVEFHU19IRUFERVIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgY2FjaGUgY29udHJvbCBpcyBhbHJlYWR5IHNldCBvbiB0aGUgcmVzcG9uc2Ugd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vIG92ZXJyaWRlIGl0IHRvIGFsbG93IHVzZXJzIHRvIGN1c3RvbWl6ZSBpdCB2aWEgbmV4dC5jb25maWdcbiAgICAgICAgICAgIGlmIChjYWNoZUVudHJ5LmNhY2hlQ29udHJvbCAmJiAhcmVzLmdldEhlYWRlcignQ2FjaGUtQ29udHJvbCcpICYmICFoZWFkZXJzLmdldCgnQ2FjaGUtQ29udHJvbCcpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5zZXQoJ0NhY2hlLUNvbnRyb2wnLCBnZXRDYWNoZUNvbnRyb2xIZWFkZXIoY2FjaGVFbnRyeS5jYWNoZUNvbnRyb2wpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHNlbmRSZXNwb25zZShub2RlTmV4dFJlcSwgbm9kZU5leHRSZXMsIG5ldyBSZXNwb25zZShjYWNoZUVudHJ5LnZhbHVlLmJvZHksIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIHN0YXR1czogY2FjaGVFbnRyeS52YWx1ZS5zdGF0dXMgfHwgMjAwXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVE9ETzogYWN0aXZlU3BhbiBjb2RlIHBhdGggaXMgZm9yIHdoZW4gd3JhcHBlZCBieVxuICAgICAgICAvLyBuZXh0LXNlcnZlciBjYW4gYmUgcmVtb3ZlZCB3aGVuIHRoaXMgaXMgbm8gbG9uZ2VyIHVzZWRcbiAgICAgICAgaWYgKGFjdGl2ZVNwYW4pIHtcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKGFjdGl2ZVNwYW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdHJhY2VyLndpdGhQcm9wYWdhdGVkQ29udGV4dChyZXEuaGVhZGVycywgKCk9PnRyYWNlci50cmFjZShCYXNlU2VydmVyU3Bhbi5oYW5kbGVSZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW5OYW1lOiBgJHttZXRob2R9ICR7cmVxLnVybH1gLFxuICAgICAgICAgICAgICAgICAgICBraW5kOiBTcGFuS2luZC5TRVJWRVIsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwLm1ldGhvZCc6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwLnRhcmdldCc6IHJlcS51cmxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGhhbmRsZVJlc3BvbnNlKSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgTm9GYWxsYmFja0Vycm9yKSkge1xuICAgICAgICAgICAgYXdhaXQgcm91dGVNb2R1bGUub25SZXF1ZXN0RXJyb3IocmVxLCBlcnIsIHtcbiAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnQXBwIFJvdXRlcicsXG4gICAgICAgICAgICAgICAgcm91dGVQYXRoOiBub3JtYWxpemVkU3JjUGFnZSxcbiAgICAgICAgICAgICAgICByb3V0ZVR5cGU6ICdyb3V0ZScsXG4gICAgICAgICAgICAgICAgcmV2YWxpZGF0ZVJlYXNvbjogZ2V0UmV2YWxpZGF0ZVJlYXNvbih7XG4gICAgICAgICAgICAgICAgICAgIGlzUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgaXNPbkRlbWFuZFJldmFsaWRhdGVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0aHJvdyBzbyB0aGF0IHdlIGNhbiBoYW5kbGUgc2VydmluZyBlcnJvciBwYWdlXG4gICAgICAgIC8vIElmIHRoaXMgaXMgZHVyaW5nIHN0YXRpYyBnZW5lcmF0aW9uLCB0aHJvdyB0aGUgZXJyb3IgYWdhaW4uXG4gICAgICAgIGlmIChpc0lzcikgdGhyb3cgZXJyO1xuICAgICAgICAvLyBPdGhlcndpc2UsIHNlbmQgYSA1MDAgcmVzcG9uc2UuXG4gICAgICAgIGF3YWl0IHNlbmRSZXNwb25zZShub2RlTmV4dFJlcSwgbm9kZU5leHRSZXMsIG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgICAgICBzdGF0dXM6IDUwMFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcFxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&page=%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute.ts&appDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fnode_modules%2F%40payloadcms%2Fnext%2Fdist%2Fprod%2Fstyles.css%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fnode_modules%2F%40payloadcms%2Fnext%2Fdist%2Fprod%2Fstyles.css%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./payload.config.ts":
/*!***************************!*\
  !*** ./payload.config.ts ***!
  \***************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ \"url\");\n/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var payload__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! payload */ \"(rsc)/./node_modules/payload/dist/config/build.js\");\n/* harmony import */ var _payloadcms_db_sqlite__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @payloadcms/db-sqlite */ \"(rsc)/./node_modules/@payloadcms/db-sqlite/dist/index.js\");\n/* harmony import */ var _src_collections_Users__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/collections/Users */ \"(rsc)/./src/collections/Users.ts\");\n/* harmony import */ var _src_collections_Media__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/collections/Media */ \"(rsc)/./src/collections/Media.ts\");\n/* harmony import */ var _src_collections_Articles__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/collections/Articles */ \"(rsc)/./src/collections/Articles.ts\");\n/* harmony import */ var _src_collections_Comments__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./src/collections/Comments */ \"(rsc)/./src/collections/Comments.ts\");\n/* harmony import */ var _src_collections_ArticleReactions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./src/collections/ArticleReactions */ \"(rsc)/./src/collections/ArticleReactions.ts\");\n/* harmony import */ var _src_collections_CommentReactions__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./src/collections/CommentReactions */ \"(rsc)/./src/collections/CommentReactions.ts\");\n/* harmony import */ var _src_collections_ArticleBookmarks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./src/collections/ArticleBookmarks */ \"(rsc)/./src/collections/ArticleBookmarks.ts\");\n/* harmony import */ var _src_collections_Notifications__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./src/collections/Notifications */ \"(rsc)/./src/collections/Notifications.ts\");\n/* harmony import */ var _src_collections_ArticleLikeThresholds__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./src/collections/ArticleLikeThresholds */ \"(rsc)/./src/collections/ArticleLikeThresholds.ts\");\n/* harmony import */ var _src_collections_RefreshTokens__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./src/collections/RefreshTokens */ \"(rsc)/./src/collections/RefreshTokens.ts\");\n/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\");\n/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(dotenv__WEBPACK_IMPORTED_MODULE_12__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_payloadcms_db_sqlite__WEBPACK_IMPORTED_MODULE_14__]);\n_payloadcms_db_sqlite__WEBPACK_IMPORTED_MODULE_14__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ndotenv__WEBPACK_IMPORTED_MODULE_12___default().config();\nconst databaseUrl = process.env.DATABASE_URL ?? 'file:./payload-data.sqlite';\nconst filename = (0,url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath)(\"file:///Users/zimbazo/WebstormProjects/Aetheris%20shadcn/payload-backend/payload.config.ts\");\nconst dirname = path__WEBPACK_IMPORTED_MODULE_0___default().dirname(filename);\nconst defaultServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,payload__WEBPACK_IMPORTED_MODULE_13__.buildConfig)({\n    secret: process.env.PAYLOAD_SECRET ?? 'development-secret-change-me',\n    serverURL: defaultServerURL,\n    admin: {\n        user: _src_collections_Users__WEBPACK_IMPORTED_MODULE_2__.Users.slug,\n        importMap: {\n            baseDir: path__WEBPACK_IMPORTED_MODULE_0___default().resolve(dirname)\n        },\n        meta: {\n            favicon: '/media/favicon.png',\n            titleSuffix: ' | Payload Admin'\n        }\n    },\n    collections: [\n        _src_collections_Users__WEBPACK_IMPORTED_MODULE_2__.Users,\n        _src_collections_Media__WEBPACK_IMPORTED_MODULE_3__.Media,\n        _src_collections_Articles__WEBPACK_IMPORTED_MODULE_4__.Articles,\n        _src_collections_Comments__WEBPACK_IMPORTED_MODULE_5__.Comments,\n        _src_collections_ArticleReactions__WEBPACK_IMPORTED_MODULE_6__.ArticleReactions,\n        _src_collections_CommentReactions__WEBPACK_IMPORTED_MODULE_7__.CommentReactions,\n        _src_collections_ArticleBookmarks__WEBPACK_IMPORTED_MODULE_8__.ArticleBookmarks,\n        _src_collections_Notifications__WEBPACK_IMPORTED_MODULE_9__.Notifications,\n        _src_collections_ArticleLikeThresholds__WEBPACK_IMPORTED_MODULE_10__.ArticleLikeThresholds,\n        _src_collections_RefreshTokens__WEBPACK_IMPORTED_MODULE_11__.RefreshTokens\n    ],\n    globals: [],\n    cors: [\n        defaultServerURL,\n        process.env.PAYLOAD_PUBLIC_FRONTEND_URL ?? ''\n    ].filter(Boolean),\n    csrf: [\n        defaultServerURL,\n        process.env.PAYLOAD_PUBLIC_FRONTEND_URL ?? ''\n    ],\n    routes: {\n        admin: '/admin'\n    },\n    db: (0,_payloadcms_db_sqlite__WEBPACK_IMPORTED_MODULE_14__.sqliteAdapter)({\n        client: {\n            url: databaseUrl\n        }\n    }),\n    typescript: {\n        outputFile: path__WEBPACK_IMPORTED_MODULE_0___default().resolve(dirname, 'payload-types.ts')\n    },\n    graphQL: {\n        disable: false\n    }\n}));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9wYXlsb2FkLmNvbmZpZy50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXVCO0FBQ1k7QUFDRTtBQUNnQjtBQUNOO0FBQ0E7QUFDTTtBQUNBO0FBQ2dCO0FBQ0E7QUFDQTtBQUNOO0FBQ2dCO0FBQ2hCO0FBRXBDO0FBRTNCYyxxREFBYTtBQUViLE1BQU1FLGNBQWNDLFFBQVFDLEdBQUcsQ0FBQ0MsWUFBWSxJQUFJO0FBQ2hELE1BQU1DLFdBQVduQixrREFBYUEsQ0FBQyw0RkFBZTtBQUM5QyxNQUFNcUIsVUFBVXRCLG1EQUFZLENBQUNvQjtBQUM3QixNQUFNRyxtQkFDSk4sUUFBUUMsR0FBRyxDQUFDTSx5QkFBeUIsSUFDckNQLFFBQVFDLEdBQUcsQ0FBQ08sb0JBQW9CLElBQ2hDO0FBRUYsaUVBQWV2QixxREFBV0EsQ0FBQztJQUN6QndCLFFBQVFULFFBQVFDLEdBQUcsQ0FBQ1MsY0FBYyxJQUFJO0lBQ3RDQyxXQUFXTDtJQUNYTSxPQUFPO1FBQ0xDLE1BQU0xQix5REFBS0EsQ0FBQzJCLElBQUk7UUFDaEJDLFdBQVc7WUFDVEMsU0FBU2pDLG1EQUFZLENBQUNzQjtRQUN4QjtRQUNBYSxNQUFNO1lBQ0pDLFNBQVM7WUFDVEMsYUFBYTtRQUNmO0lBQ0Y7SUFDQUMsYUFBYTtRQUNYbEMseURBQUtBO1FBQ0xDLHlEQUFLQTtRQUNMQywrREFBUUE7UUFDUkMsK0RBQVFBO1FBQ1JDLCtFQUFnQkE7UUFDaEJDLCtFQUFnQkE7UUFDaEJDLCtFQUFnQkE7UUFDaEJDLHlFQUFhQTtRQUNiQywwRkFBcUJBO1FBQ3JCQywwRUFBYUE7S0FDZDtJQUNEMEIsU0FBUyxFQUFFO0lBQ1hDLE1BQU07UUFDSmpCO1FBQ0FOLFFBQVFDLEdBQUcsQ0FBQ3VCLDJCQUEyQixJQUFJO0tBQzVDLENBQUNDLE1BQU0sQ0FBQ0M7SUFDVEMsTUFBTTtRQUNKckI7UUFDQU4sUUFBUUMsR0FBRyxDQUFDdUIsMkJBQTJCLElBQUk7S0FDNUM7SUFDREksUUFBUTtRQUNOaEIsT0FBTztJQUNUO0lBQ0FpQixJQUFJM0MscUVBQWFBLENBQUM7UUFDaEI0QyxRQUFRO1lBQ04xQixLQUFLTDtRQUNQO0lBQ0Y7SUFDQWdDLFlBQVk7UUFDVkMsWUFBWWpELG1EQUFZLENBQUNzQixTQUFTO0lBQ3BDO0lBQ0E0QixTQUFTO1FBQ1BDLFNBQVM7SUFDWDtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9wYXlsb2FkLmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCB7IGJ1aWxkQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IHNxbGl0ZUFkYXB0ZXIgfSBmcm9tICdAcGF5bG9hZGNtcy9kYi1zcWxpdGUnXG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4vc3JjL2NvbGxlY3Rpb25zL1VzZXJzJ1xuaW1wb3J0IHsgTWVkaWEgfSBmcm9tICcuL3NyYy9jb2xsZWN0aW9ucy9NZWRpYSdcbmltcG9ydCB7IEFydGljbGVzIH0gZnJvbSAnLi9zcmMvY29sbGVjdGlvbnMvQXJ0aWNsZXMnXG5pbXBvcnQgeyBDb21tZW50cyB9IGZyb20gJy4vc3JjL2NvbGxlY3Rpb25zL0NvbW1lbnRzJ1xuaW1wb3J0IHsgQXJ0aWNsZVJlYWN0aW9ucyB9IGZyb20gJy4vc3JjL2NvbGxlY3Rpb25zL0FydGljbGVSZWFjdGlvbnMnXG5pbXBvcnQgeyBDb21tZW50UmVhY3Rpb25zIH0gZnJvbSAnLi9zcmMvY29sbGVjdGlvbnMvQ29tbWVudFJlYWN0aW9ucydcbmltcG9ydCB7IEFydGljbGVCb29rbWFya3MgfSBmcm9tICcuL3NyYy9jb2xsZWN0aW9ucy9BcnRpY2xlQm9va21hcmtzJ1xuaW1wb3J0IHsgTm90aWZpY2F0aW9ucyB9IGZyb20gJy4vc3JjL2NvbGxlY3Rpb25zL05vdGlmaWNhdGlvbnMnXG5pbXBvcnQgeyBBcnRpY2xlTGlrZVRocmVzaG9sZHMgfSBmcm9tICcuL3NyYy9jb2xsZWN0aW9ucy9BcnRpY2xlTGlrZVRocmVzaG9sZHMnXG5pbXBvcnQgeyBSZWZyZXNoVG9rZW5zIH0gZnJvbSAnLi9zcmMvY29sbGVjdGlvbnMvUmVmcmVzaFRva2VucydcblxuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnXG5cbmRvdGVudi5jb25maWcoKVxuXG5jb25zdCBkYXRhYmFzZVVybCA9IHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCA/PyAnZmlsZTouL3BheWxvYWQtZGF0YS5zcWxpdGUnXG5jb25zdCBmaWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKVxuY29uc3QgZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlbmFtZSlcbmNvbnN0IGRlZmF1bHRTZXJ2ZXJVUkwgPVxuICBwcm9jZXNzLmVudi5QQVlMT0FEX1BVQkxJQ19TRVJWRVJfVVJMID8/XG4gIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NJVEVfVVJMID8/XG4gICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXG5cbmV4cG9ydCBkZWZhdWx0IGJ1aWxkQ29uZmlnKHtcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5QQVlMT0FEX1NFQ1JFVCA/PyAnZGV2ZWxvcG1lbnQtc2VjcmV0LWNoYW5nZS1tZScsXG4gIHNlcnZlclVSTDogZGVmYXVsdFNlcnZlclVSTCxcbiAgYWRtaW46IHtcbiAgICB1c2VyOiBVc2Vycy5zbHVnLFxuICAgIGltcG9ydE1hcDoge1xuICAgICAgYmFzZURpcjogcGF0aC5yZXNvbHZlKGRpcm5hbWUpLFxuICAgIH0sXG4gICAgbWV0YToge1xuICAgICAgZmF2aWNvbjogJy9tZWRpYS9mYXZpY29uLnBuZycsXG4gICAgICB0aXRsZVN1ZmZpeDogJyB8IFBheWxvYWQgQWRtaW4nLFxuICAgIH0sXG4gIH0sXG4gIGNvbGxlY3Rpb25zOiBbXG4gICAgVXNlcnMsXG4gICAgTWVkaWEsXG4gICAgQXJ0aWNsZXMsXG4gICAgQ29tbWVudHMsXG4gICAgQXJ0aWNsZVJlYWN0aW9ucyxcbiAgICBDb21tZW50UmVhY3Rpb25zLFxuICAgIEFydGljbGVCb29rbWFya3MsXG4gICAgTm90aWZpY2F0aW9ucyxcbiAgICBBcnRpY2xlTGlrZVRocmVzaG9sZHMsXG4gICAgUmVmcmVzaFRva2Vuc1xuICBdLFxuICBnbG9iYWxzOiBbXSxcbiAgY29yczogW1xuICAgIGRlZmF1bHRTZXJ2ZXJVUkwsXG4gICAgcHJvY2Vzcy5lbnYuUEFZTE9BRF9QVUJMSUNfRlJPTlRFTkRfVVJMID8/ICcnLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgY3NyZjogW1xuICAgIGRlZmF1bHRTZXJ2ZXJVUkwsXG4gICAgcHJvY2Vzcy5lbnYuUEFZTE9BRF9QVUJMSUNfRlJPTlRFTkRfVVJMID8/ICcnLFxuICBdLFxuICByb3V0ZXM6IHtcbiAgICBhZG1pbjogJy9hZG1pbicsXG4gIH0sXG4gIGRiOiBzcWxpdGVBZGFwdGVyKHtcbiAgICBjbGllbnQ6IHtcbiAgICAgIHVybDogZGF0YWJhc2VVcmwsXG4gICAgfSxcbiAgfSksXG4gIHR5cGVzY3JpcHQ6IHtcbiAgICBvdXRwdXRGaWxlOiBwYXRoLnJlc29sdmUoZGlybmFtZSwgJ3BheWxvYWQtdHlwZXMudHMnKSxcbiAgfSxcbiAgZ3JhcGhRTDoge1xuICAgIGRpc2FibGU6IGZhbHNlLFxuICB9LFxufSlcbiJdLCJuYW1lcyI6WyJwYXRoIiwiZmlsZVVSTFRvUGF0aCIsImJ1aWxkQ29uZmlnIiwic3FsaXRlQWRhcHRlciIsIlVzZXJzIiwiTWVkaWEiLCJBcnRpY2xlcyIsIkNvbW1lbnRzIiwiQXJ0aWNsZVJlYWN0aW9ucyIsIkNvbW1lbnRSZWFjdGlvbnMiLCJBcnRpY2xlQm9va21hcmtzIiwiTm90aWZpY2F0aW9ucyIsIkFydGljbGVMaWtlVGhyZXNob2xkcyIsIlJlZnJlc2hUb2tlbnMiLCJkb3RlbnYiLCJjb25maWciLCJkYXRhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJEQVRBQkFTRV9VUkwiLCJmaWxlbmFtZSIsInVybCIsImRpcm5hbWUiLCJkZWZhdWx0U2VydmVyVVJMIiwiUEFZTE9BRF9QVUJMSUNfU0VSVkVSX1VSTCIsIk5FWFRfUFVCTElDX1NJVEVfVVJMIiwic2VjcmV0IiwiUEFZTE9BRF9TRUNSRVQiLCJzZXJ2ZXJVUkwiLCJhZG1pbiIsInVzZXIiLCJzbHVnIiwiaW1wb3J0TWFwIiwiYmFzZURpciIsInJlc29sdmUiLCJtZXRhIiwiZmF2aWNvbiIsInRpdGxlU3VmZml4IiwiY29sbGVjdGlvbnMiLCJnbG9iYWxzIiwiY29ycyIsIlBBWUxPQURfUFVCTElDX0ZST05URU5EX1VSTCIsImZpbHRlciIsIkJvb2xlYW4iLCJjc3JmIiwicm91dGVzIiwiZGIiLCJjbGllbnQiLCJ0eXBlc2NyaXB0Iiwib3V0cHV0RmlsZSIsImdyYXBoUUwiLCJkaXNhYmxlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./payload.config.ts\n");

/***/ }),

/***/ "(rsc)/./src/app/(payload)/api/[...slug]/route.ts":
/*!**************************************************!*\
  !*** ./src/app/(payload)/api/[...slug]/route.ts ***!
  \**************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   OPTIONS: () => (/* binding */ OPTIONS),\n/* harmony export */   PATCH: () => (/* binding */ PATCH),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var _payloadcms_next_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @payloadcms/next/css */ \"(rsc)/./node_modules/@payloadcms/next/dist/prod/styles.css\");\n/* harmony import */ var _payload_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @payload-config */ \"(rsc)/./payload.config.ts\");\n/* harmony import */ var _payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @payloadcms/next/routes */ \"(rsc)/./node_modules/@payloadcms/next/dist/routes/rest/index.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_payload_config__WEBPACK_IMPORTED_MODULE_1__]);\n_payload_config__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\nconst GET = (0,_payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__.GET)(_payload_config__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\nconst POST = (0,_payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__.POST)(_payload_config__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\nconst DELETE = (0,_payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__.DELETE)(_payload_config__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\nconst PATCH = (0,_payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__.PATCH)(_payload_config__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\nconst PUT = (0,_payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__.PUT)(_payload_config__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\nconst OPTIONS = (0,_payloadcms_next_routes__WEBPACK_IMPORTED_MODULE_2__.OPTIONS)(_payload_config__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwLyhwYXlsb2FkKS9hcGkvWy4uLnNsdWddL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUE2QjtBQUVPO0FBUUo7QUFFekIsTUFBTU8sTUFBTUwsNERBQVFBLENBQUNGLHVEQUFNQSxFQUFDO0FBQzVCLE1BQU1RLE9BQU9ILDZEQUFTQSxDQUFDTCx1REFBTUEsRUFBQztBQUM5QixNQUFNUyxTQUFTUiwrREFBV0EsQ0FBQ0QsdURBQU1BLEVBQUM7QUFDbEMsTUFBTVUsUUFBUU4sOERBQVVBLENBQUNKLHVEQUFNQSxFQUFDO0FBQ2hDLE1BQU1XLE1BQU1MLDREQUFRQSxDQUFDTix1REFBTUEsRUFBQztBQUM1QixNQUFNWSxVQUFVVCxnRUFBWUEsQ0FBQ0gsdURBQU1BLEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvYXBwLyhwYXlsb2FkKS9hcGkvWy4uLnNsdWddL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnQHBheWxvYWRjbXMvbmV4dC9jc3MnXG5cbmltcG9ydCBjb25maWcgZnJvbSAnQHBheWxvYWQtY29uZmlnJ1xuaW1wb3J0IHtcbiAgUkVTVF9ERUxFVEUsXG4gIFJFU1RfR0VULFxuICBSRVNUX09QVElPTlMsXG4gIFJFU1RfUEFUQ0gsXG4gIFJFU1RfUE9TVCxcbiAgUkVTVF9QVVQsXG59IGZyb20gJ0BwYXlsb2FkY21zL25leHQvcm91dGVzJ1xuXG5leHBvcnQgY29uc3QgR0VUID0gUkVTVF9HRVQoY29uZmlnKVxuZXhwb3J0IGNvbnN0IFBPU1QgPSBSRVNUX1BPU1QoY29uZmlnKVxuZXhwb3J0IGNvbnN0IERFTEVURSA9IFJFU1RfREVMRVRFKGNvbmZpZylcbmV4cG9ydCBjb25zdCBQQVRDSCA9IFJFU1RfUEFUQ0goY29uZmlnKVxuZXhwb3J0IGNvbnN0IFBVVCA9IFJFU1RfUFVUKGNvbmZpZylcbmV4cG9ydCBjb25zdCBPUFRJT05TID0gUkVTVF9PUFRJT05TKGNvbmZpZylcblxuIl0sIm5hbWVzIjpbImNvbmZpZyIsIlJFU1RfREVMRVRFIiwiUkVTVF9HRVQiLCJSRVNUX09QVElPTlMiLCJSRVNUX1BBVENIIiwiUkVTVF9QT1NUIiwiUkVTVF9QVVQiLCJHRVQiLCJQT1NUIiwiREVMRVRFIiwiUEFUQ0giLCJQVVQiLCJPUFRJT05TIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/(payload)/api/[...slug]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/ArticleBookmarks.ts":
/*!*********************************************!*\
  !*** ./src/collections/ArticleBookmarks.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ArticleBookmarks: () => (/* binding */ ArticleBookmarks)\n/* harmony export */ });\nconst ArticleBookmarks = {\n    slug: 'article-bookmarks',\n    labels: {\n        singular: 'Закладка статьи',\n        plural: 'Закладки статей'\n    },\n    access: {\n        read: ({ req })=>!!req.user,\n        create: ({ req })=>!!req.user,\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id)\n    },\n    fields: [\n        {\n            name: 'article',\n            label: 'Статья',\n            type: 'relationship',\n            relationTo: 'articles',\n            required: true\n        },\n        {\n            name: 'user',\n            label: 'Пользователь',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true\n        }\n    ],\n    indexes: [\n        {\n            fields: [\n                'article',\n                'user'\n            ],\n            unique: true\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (!data.user && req.user) {\n                    data.user = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvQXJ0aWNsZUJvb2ttYXJrcy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsbUJBQXFDO0lBQ2hEQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsUUFBUTtRQUNOQyxNQUFNLENBQUMsRUFBRUMsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQzdCQyxRQUFRLENBQUMsRUFBRUYsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQy9CRSxRQUFRLENBQUMsRUFBRUgsR0FBRyxFQUFFSSxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNKLElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDSSxJQUFJLEtBQUssV0FBV0QsS0FBS0gsU0FBU0QsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO0lBQ2pHO0lBQ0FDLFFBQVE7UUFDTjtZQUNFQyxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1lBQ1pDLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFlBQVk7WUFDWkMsVUFBVTtRQUNaO0tBQ0Q7SUFDREMsU0FBUztRQUNQO1lBQ0VOLFFBQVE7Z0JBQUM7Z0JBQVc7YUFBTztZQUMzQk8sUUFBUTtRQUNWO0tBQ0Q7SUFDREMsT0FBTztRQUNMQyxjQUFjO1lBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUVqQixHQUFHLEVBQUU7Z0JBQzNCLElBQUksQ0FBQ2lCLE1BQU0sT0FBT0E7Z0JBQ2xCLElBQUksQ0FBQ0EsS0FBS2hCLElBQUksSUFBSUQsSUFBSUMsSUFBSSxFQUFFO29CQUMxQmdCLEtBQUtoQixJQUFJLEdBQUdELElBQUlDLElBQUksQ0FBQ0ssRUFBRTtnQkFDekI7Z0JBQ0EsT0FBT1c7WUFDVDtTQUFFO0lBQ0o7QUFDRixFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvemltYmF6by9XZWJzdG9ybVByb2plY3RzL0FldGhlcmlzIHNoYWRjbi9wYXlsb2FkLWJhY2tlbmQvc3JjL2NvbGxlY3Rpb25zL0FydGljbGVCb29rbWFya3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGNvbnN0IEFydGljbGVCb29rbWFya3M6IENvbGxlY3Rpb25Db25maWcgPSB7XG4gIHNsdWc6ICdhcnRpY2xlLWJvb2ttYXJrcycsXG4gIGxhYmVsczoge1xuICAgIHNpbmd1bGFyOiAn0JfQsNC60LvQsNC00LrQsCDRgdGC0LDRgtGM0LgnLFxuICAgIHBsdXJhbDogJ9CX0LDQutC70LDQtNC60Lgg0YHRgtCw0YLQtdC5JyxcbiAgfSxcbiAgYWNjZXNzOiB7XG4gICAgcmVhZDogKHsgcmVxIH0pID0+ICEhcmVxLnVzZXIsXG4gICAgY3JlYXRlOiAoeyByZXEgfSkgPT4gISFyZXEudXNlcixcbiAgICBkZWxldGU6ICh7IHJlcSwgZG9jIH0pID0+ICEhcmVxLnVzZXIgJiYgKHJlcS51c2VyLnJvbGUgPT09ICdhZG1pbicgfHwgZG9jPy51c2VyID09PSByZXEudXNlci5pZCksXG4gIH0sXG4gIGZpZWxkczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdhcnRpY2xlJyxcbiAgICAgIGxhYmVsOiAn0KHRgtCw0YLRjNGPJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ2FydGljbGVzJyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3VzZXInLFxuICAgICAgbGFiZWw6ICfQn9C+0LvRjNC30L7QstCw0YLQtdC70YwnLFxuICAgICAgdHlwZTogJ3JlbGF0aW9uc2hpcCcsXG4gICAgICByZWxhdGlvblRvOiAndXNlcnMnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgaW5kZXhlczogW1xuICAgIHtcbiAgICAgIGZpZWxkczogWydhcnRpY2xlJywgJ3VzZXInXSxcbiAgICAgIHVuaXF1ZTogdHJ1ZSxcbiAgICB9LFxuICBdLFxuICBob29rczoge1xuICAgIGJlZm9yZUNoYW5nZTogWyh7IGRhdGEsIHJlcSB9KSA9PiB7XG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBkYXRhXG4gICAgICBpZiAoIWRhdGEudXNlciAmJiByZXEudXNlcikge1xuICAgICAgICBkYXRhLnVzZXIgPSByZXEudXNlci5pZFxuICAgICAgfVxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XSxcbiAgfSxcbn1cbiJdLCJuYW1lcyI6WyJBcnRpY2xlQm9va21hcmtzIiwic2x1ZyIsImxhYmVscyIsInNpbmd1bGFyIiwicGx1cmFsIiwiYWNjZXNzIiwicmVhZCIsInJlcSIsInVzZXIiLCJjcmVhdGUiLCJkZWxldGUiLCJkb2MiLCJyb2xlIiwiaWQiLCJmaWVsZHMiLCJuYW1lIiwibGFiZWwiLCJ0eXBlIiwicmVsYXRpb25UbyIsInJlcXVpcmVkIiwiaW5kZXhlcyIsInVuaXF1ZSIsImhvb2tzIiwiYmVmb3JlQ2hhbmdlIiwiZGF0YSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/ArticleBookmarks.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/ArticleLikeThresholds.ts":
/*!**************************************************!*\
  !*** ./src/collections/ArticleLikeThresholds.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ArticleLikeThresholds: () => (/* binding */ ArticleLikeThresholds)\n/* harmony export */ });\nconst ArticleLikeThresholds = {\n    slug: 'article-like-thresholds',\n    labels: {\n        singular: 'Порог лайков статьи',\n        plural: 'Пороги лайков статей'\n    },\n    access: {\n        read: ({ req })=>!!req.user,\n        create: ({ req })=>!!req.user,\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id)\n    },\n    fields: [\n        {\n            name: 'article',\n            label: 'Статья',\n            type: 'relationship',\n            relationTo: 'articles',\n            required: true\n        },\n        {\n            name: 'user',\n            label: 'Пользователь',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true\n        },\n        {\n            name: 'threshold',\n            label: 'Порог',\n            type: 'number',\n            required: true,\n            min: 0\n        },\n        {\n            name: 'reachedAt',\n            label: 'Дата достижения',\n            type: 'date'\n        }\n    ],\n    indexes: [\n        {\n            fields: [\n                'article',\n                'user',\n                'threshold'\n            ],\n            unique: true\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (!data.user && req.user) {\n                    data.user = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvQXJ0aWNsZUxpa2VUaHJlc2hvbGRzLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFFTyxNQUFNQSx3QkFBMEM7SUFDckRDLE1BQU07SUFDTkMsUUFBUTtRQUNOQyxVQUFVO1FBQ1ZDLFFBQVE7SUFDVjtJQUNBQyxRQUFRO1FBQ05DLE1BQU0sQ0FBQyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNBLElBQUlDLElBQUk7UUFDN0JDLFFBQVEsQ0FBQyxFQUFFRixHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNBLElBQUlDLElBQUk7UUFDL0JFLFFBQVEsQ0FBQyxFQUFFSCxHQUFHLEVBQUVJLEdBQUcsRUFBRSxHQUFLLENBQUMsQ0FBQ0osSUFBSUMsSUFBSSxJQUFLRCxDQUFBQSxJQUFJQyxJQUFJLENBQUNJLElBQUksS0FBSyxXQUFXRCxLQUFLSCxTQUFTRCxJQUFJQyxJQUFJLENBQUNLLEVBQUU7SUFDakc7SUFDQUMsUUFBUTtRQUNOO1lBQ0VDLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFlBQVk7WUFDWkMsVUFBVTtRQUNaO1FBQ0E7WUFDRUosTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkMsWUFBWTtZQUNaQyxVQUFVO1FBQ1o7UUFDQTtZQUNFSixNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNORSxVQUFVO1lBQ1ZDLEtBQUs7UUFDUDtRQUNBO1lBQ0VMLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1FBQ1I7S0FDRDtJQUNESSxTQUFTO1FBQ1A7WUFDRVAsUUFBUTtnQkFBQztnQkFBVztnQkFBUTthQUFZO1lBQ3hDUSxRQUFRO1FBQ1Y7S0FDRDtJQUNEQyxPQUFPO1FBQ0xDLGNBQWM7WUFBQyxDQUFDLEVBQUVDLElBQUksRUFBRWxCLEdBQUcsRUFBRTtnQkFDM0IsSUFBSSxDQUFDa0IsTUFBTSxPQUFPQTtnQkFDbEIsSUFBSSxDQUFDQSxLQUFLakIsSUFBSSxJQUFJRCxJQUFJQyxJQUFJLEVBQUU7b0JBQzFCaUIsS0FBS2pCLElBQUksR0FBR0QsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO2dCQUN6QjtnQkFDQSxPQUFPWTtZQUNUO1NBQUU7SUFDSjtBQUNGLEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvY29sbGVjdGlvbnMvQXJ0aWNsZUxpa2VUaHJlc2hvbGRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5cbmV4cG9ydCBjb25zdCBBcnRpY2xlTGlrZVRocmVzaG9sZHM6IENvbGxlY3Rpb25Db25maWcgPSB7XG4gIHNsdWc6ICdhcnRpY2xlLWxpa2UtdGhyZXNob2xkcycsXG4gIGxhYmVsczoge1xuICAgIHNpbmd1bGFyOiAn0J/QvtGA0L7QsyDQu9Cw0LnQutC+0LIg0YHRgtCw0YLRjNC4JyxcbiAgICBwbHVyYWw6ICfQn9C+0YDQvtCz0Lgg0LvQsNC50LrQvtCyINGB0YLQsNGC0LXQuScsXG4gIH0sXG4gIGFjY2Vzczoge1xuICAgIHJlYWQ6ICh7IHJlcSB9KSA9PiAhIXJlcS51c2VyLFxuICAgIGNyZWF0ZTogKHsgcmVxIH0pID0+ICEhcmVxLnVzZXIsXG4gICAgZGVsZXRlOiAoeyByZXEsIGRvYyB9KSA9PiAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8udXNlciA9PT0gcmVxLnVzZXIuaWQpLFxuICB9LFxuICBmaWVsZHM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnYXJ0aWNsZScsXG4gICAgICBsYWJlbDogJ9Ch0YLQsNGC0YzRjycsXG4gICAgICB0eXBlOiAncmVsYXRpb25zaGlwJyxcbiAgICAgIHJlbGF0aW9uVG86ICdhcnRpY2xlcycsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICd1c2VyJyxcbiAgICAgIGxhYmVsOiAn0J/QvtC70YzQt9C+0LLQsNGC0LXQu9GMJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ3VzZXJzJyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3RocmVzaG9sZCcsXG4gICAgICBsYWJlbDogJ9Cf0L7RgNC+0LMnLFxuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIG1pbjogMCxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdyZWFjaGVkQXQnLFxuICAgICAgbGFiZWw6ICfQlNCw0YLQsCDQtNC+0YHRgtC40LbQtdC90LjRjycsXG4gICAgICB0eXBlOiAnZGF0ZScsXG4gICAgfSxcbiAgXSxcbiAgaW5kZXhlczogW1xuICAgIHtcbiAgICAgIGZpZWxkczogWydhcnRpY2xlJywgJ3VzZXInLCAndGhyZXNob2xkJ10sXG4gICAgICB1bmlxdWU6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgaG9va3M6IHtcbiAgICBiZWZvcmVDaGFuZ2U6IFsoeyBkYXRhLCByZXEgfSkgPT4ge1xuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gZGF0YVxuICAgICAgaWYgKCFkYXRhLnVzZXIgJiYgcmVxLnVzZXIpIHtcbiAgICAgICAgZGF0YS51c2VyID0gcmVxLnVzZXIuaWRcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfV0sXG4gIH0sXG59XG4iXSwibmFtZXMiOlsiQXJ0aWNsZUxpa2VUaHJlc2hvbGRzIiwic2x1ZyIsImxhYmVscyIsInNpbmd1bGFyIiwicGx1cmFsIiwiYWNjZXNzIiwicmVhZCIsInJlcSIsInVzZXIiLCJjcmVhdGUiLCJkZWxldGUiLCJkb2MiLCJyb2xlIiwiaWQiLCJmaWVsZHMiLCJuYW1lIiwibGFiZWwiLCJ0eXBlIiwicmVsYXRpb25UbyIsInJlcXVpcmVkIiwibWluIiwiaW5kZXhlcyIsInVuaXF1ZSIsImhvb2tzIiwiYmVmb3JlQ2hhbmdlIiwiZGF0YSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/ArticleLikeThresholds.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/ArticleReactions.ts":
/*!*********************************************!*\
  !*** ./src/collections/ArticleReactions.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ArticleReactions: () => (/* binding */ ArticleReactions)\n/* harmony export */ });\nconst ArticleReactions = {\n    slug: 'article-reactions',\n    labels: {\n        singular: 'Реакция на статью',\n        plural: 'Реакции на статьи'\n    },\n    access: {\n        read: ({ req })=>!!req.user,\n        create: ({ req })=>!!req.user,\n        update: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id)\n    },\n    fields: [\n        {\n            name: 'article',\n            label: 'Статья',\n            type: 'relationship',\n            relationTo: 'articles',\n            required: true\n        },\n        {\n            name: 'user',\n            label: 'Пользователь',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true\n        },\n        {\n            name: 'reaction',\n            label: 'Реакция',\n            type: 'select',\n            required: true,\n            options: [\n                {\n                    label: 'Лайк',\n                    value: 'like'\n                },\n                {\n                    label: 'Дизлайк',\n                    value: 'dislike'\n                }\n            ]\n        }\n    ],\n    indexes: [\n        {\n            fields: [\n                'article',\n                'user'\n            ],\n            unique: true\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (!data.user && req.user) {\n                    data.user = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvQXJ0aWNsZVJlYWN0aW9ucy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsbUJBQXFDO0lBQ2hEQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsUUFBUTtRQUNOQyxNQUFNLENBQUMsRUFBRUMsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQzdCQyxRQUFRLENBQUMsRUFBRUYsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQy9CRSxRQUFRLENBQUMsRUFBRUgsR0FBRyxFQUFFSSxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNKLElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDSSxJQUFJLEtBQUssV0FBV0QsS0FBS0gsU0FBU0QsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO1FBQy9GQyxRQUFRLENBQUMsRUFBRVAsR0FBRyxFQUFFSSxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNKLElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDSSxJQUFJLEtBQUssV0FBV0QsS0FBS0gsU0FBU0QsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO0lBQ2pHO0lBQ0FFLFFBQVE7UUFDTjtZQUNFQyxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1lBQ1pDLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFlBQVk7WUFDWkMsVUFBVTtRQUNaO1FBQ0E7WUFDRUosTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkUsVUFBVTtZQUNWQyxTQUFTO2dCQUNQO29CQUFFSixPQUFPO29CQUFRSyxPQUFPO2dCQUFPO2dCQUMvQjtvQkFBRUwsT0FBTztvQkFBV0ssT0FBTztnQkFBVTthQUN0QztRQUNIO0tBQ0Q7SUFDREMsU0FBUztRQUNQO1lBQ0VSLFFBQVE7Z0JBQUM7Z0JBQVc7YUFBTztZQUMzQlMsUUFBUTtRQUNWO0tBQ0Q7SUFDREMsT0FBTztRQUNMQyxjQUFjO1lBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUVwQixHQUFHLEVBQUU7Z0JBQzNCLElBQUksQ0FBQ29CLE1BQU0sT0FBT0E7Z0JBQ2xCLElBQUksQ0FBQ0EsS0FBS25CLElBQUksSUFBSUQsSUFBSUMsSUFBSSxFQUFFO29CQUMxQm1CLEtBQUtuQixJQUFJLEdBQUdELElBQUlDLElBQUksQ0FBQ0ssRUFBRTtnQkFDekI7Z0JBQ0EsT0FBT2M7WUFDVDtTQUFFO0lBQ0o7QUFDRixFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvemltYmF6by9XZWJzdG9ybVByb2plY3RzL0FldGhlcmlzIHNoYWRjbi9wYXlsb2FkLWJhY2tlbmQvc3JjL2NvbGxlY3Rpb25zL0FydGljbGVSZWFjdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGNvbnN0IEFydGljbGVSZWFjdGlvbnM6IENvbGxlY3Rpb25Db25maWcgPSB7XG4gIHNsdWc6ICdhcnRpY2xlLXJlYWN0aW9ucycsXG4gIGxhYmVsczoge1xuICAgIHNpbmd1bGFyOiAn0KDQtdCw0LrRhtC40Y8g0L3QsCDRgdGC0LDRgtGM0Y4nLFxuICAgIHBsdXJhbDogJ9Cg0LXQsNC60YbQuNC4INC90LAg0YHRgtCw0YLRjNC4JyxcbiAgfSxcbiAgYWNjZXNzOiB7XG4gICAgcmVhZDogKHsgcmVxIH0pID0+ICEhcmVxLnVzZXIsXG4gICAgY3JlYXRlOiAoeyByZXEgfSkgPT4gISFyZXEudXNlcixcbiAgICB1cGRhdGU6ICh7IHJlcSwgZG9jIH0pID0+ICEhcmVxLnVzZXIgJiYgKHJlcS51c2VyLnJvbGUgPT09ICdhZG1pbicgfHwgZG9jPy51c2VyID09PSByZXEudXNlci5pZCksXG4gICAgZGVsZXRlOiAoeyByZXEsIGRvYyB9KSA9PiAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8udXNlciA9PT0gcmVxLnVzZXIuaWQpLFxuICB9LFxuICBmaWVsZHM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnYXJ0aWNsZScsXG4gICAgICBsYWJlbDogJ9Ch0YLQsNGC0YzRjycsXG4gICAgICB0eXBlOiAncmVsYXRpb25zaGlwJyxcbiAgICAgIHJlbGF0aW9uVG86ICdhcnRpY2xlcycsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICd1c2VyJyxcbiAgICAgIGxhYmVsOiAn0J/QvtC70YzQt9C+0LLQsNGC0LXQu9GMJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ3VzZXJzJyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3JlYWN0aW9uJyxcbiAgICAgIGxhYmVsOiAn0KDQtdCw0LrRhtC40Y8nLFxuICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgeyBsYWJlbDogJ9Cb0LDQudC6JywgdmFsdWU6ICdsaWtlJyB9LFxuICAgICAgICB7IGxhYmVsOiAn0JTQuNC30LvQsNC50LonLCB2YWx1ZTogJ2Rpc2xpa2UnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gIGluZGV4ZXM6IFtcbiAgICB7XG4gICAgICBmaWVsZHM6IFsnYXJ0aWNsZScsICd1c2VyJ10sXG4gICAgICB1bmlxdWU6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgaG9va3M6IHtcbiAgICBiZWZvcmVDaGFuZ2U6IFsoeyBkYXRhLCByZXEgfSkgPT4ge1xuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gZGF0YVxuICAgICAgaWYgKCFkYXRhLnVzZXIgJiYgcmVxLnVzZXIpIHtcbiAgICAgICAgZGF0YS51c2VyID0gcmVxLnVzZXIuaWRcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfV0sXG4gIH0sXG59XG4iXSwibmFtZXMiOlsiQXJ0aWNsZVJlYWN0aW9ucyIsInNsdWciLCJsYWJlbHMiLCJzaW5ndWxhciIsInBsdXJhbCIsImFjY2VzcyIsInJlYWQiLCJyZXEiLCJ1c2VyIiwiY3JlYXRlIiwidXBkYXRlIiwiZG9jIiwicm9sZSIsImlkIiwiZGVsZXRlIiwiZmllbGRzIiwibmFtZSIsImxhYmVsIiwidHlwZSIsInJlbGF0aW9uVG8iLCJyZXF1aXJlZCIsIm9wdGlvbnMiLCJ2YWx1ZSIsImluZGV4ZXMiLCJ1bmlxdWUiLCJob29rcyIsImJlZm9yZUNoYW5nZSIsImRhdGEiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/ArticleReactions.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/Articles.ts":
/*!*************************************!*\
  !*** ./src/collections/Articles.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Articles: () => (/* binding */ Articles)\n/* harmony export */ });\n/* harmony import */ var _utils_slugify__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/slugify */ \"(rsc)/./src/utils/slugify.ts\");\n\nconst Articles = {\n    slug: 'articles',\n    labels: {\n        singular: 'Статья',\n        plural: 'Статьи'\n    },\n    admin: {\n        useAsTitle: 'title',\n        defaultColumns: [\n            'title',\n            'status',\n            'publishedAt',\n            'author'\n        ]\n    },\n    access: {\n        read: ()=>true,\n        create: ({ req })=>!!req.user,\n        update: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.author === req.user.id),\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.author === req.user.id)\n    },\n    fields: [\n        {\n            name: 'title',\n            label: 'Заголовок',\n            type: 'text',\n            required: true\n        },\n        {\n            name: 'slug',\n            label: 'Слаг',\n            type: 'text',\n            required: true,\n            unique: true,\n            localized: false\n        },\n        {\n            name: 'excerpt',\n            label: 'Краткое описание',\n            type: 'textarea'\n        },\n        {\n            name: 'content',\n            label: 'Контент',\n            type: 'textarea',\n            required: true\n        },\n        {\n            name: 'difficulty',\n            label: 'Сложность',\n            type: 'select',\n            defaultValue: 'medium',\n            options: [\n                {\n                    label: 'Легкая',\n                    value: 'easy'\n                },\n                {\n                    label: 'Средняя',\n                    value: 'medium'\n                },\n                {\n                    label: 'Сложная',\n                    value: 'hard'\n                }\n            ]\n        },\n        {\n            name: 'tags',\n            label: 'Теги',\n            type: 'array',\n            labels: {\n                singular: 'Тег',\n                plural: 'Теги'\n            },\n            fields: [\n                {\n                    name: 'tag',\n                    label: 'Значение',\n                    type: 'text'\n                }\n            ]\n        },\n        {\n            name: 'previewImage',\n            label: 'Превью-изображение',\n            type: 'upload',\n            relationTo: 'media'\n        },\n        {\n            name: 'status',\n            label: 'Статус',\n            type: 'select',\n            defaultValue: 'draft',\n            options: [\n                {\n                    label: 'Черновик',\n                    value: 'draft'\n                },\n                {\n                    label: 'Опубликовано',\n                    value: 'published'\n                }\n            ],\n            required: true\n        },\n        {\n            name: 'publishedAt',\n            label: 'Дата публикации',\n            type: 'date'\n        },\n        {\n            name: 'views',\n            label: 'Просмотры',\n            type: 'number',\n            defaultValue: 0,\n            min: 0\n        },\n        {\n            name: 'likesCount',\n            label: 'Лайки',\n            type: 'number',\n            defaultValue: 0,\n            min: 0\n        },\n        {\n            name: 'dislikesCount',\n            label: 'Дизлайки',\n            type: 'number',\n            defaultValue: 0,\n            min: 0\n        },\n        {\n            name: 'commentsCount',\n            label: 'Комментариев',\n            type: 'number',\n            defaultValue: 0,\n            min: 0\n        },\n        {\n            name: 'author',\n            label: 'Автор',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true,\n            admin: {\n                readOnly: true\n            }\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (data.title && !data.slug) {\n                    data.slug = (0,_utils_slugify__WEBPACK_IMPORTED_MODULE_0__.slugify)(data.title);\n                }\n                if (data.status === 'published' && !data.publishedAt) {\n                    data.publishedAt = new Date().toISOString();\n                }\n                if (data.status === 'draft') {\n                    data.publishedAt = null;\n                }\n                if (data.tags && Array.isArray(data.tags)) {\n                    data.tags = data.tags.map((entry)=>typeof entry === 'string' ? {\n                            tag: entry\n                        } : entry);\n                }\n                if (!data.author && req.user) {\n                    data.author = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvQXJ0aWNsZXMudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDMEM7QUFFbkMsTUFBTUMsV0FBNkI7SUFDeENDLE1BQU07SUFDTkMsUUFBUTtRQUNOQyxVQUFVO1FBQ1ZDLFFBQVE7SUFDVjtJQUNBQyxPQUFPO1FBQ0xDLFlBQVk7UUFDWkMsZ0JBQWdCO1lBQUM7WUFBUztZQUFVO1lBQWU7U0FBUztJQUM5RDtJQUNBQyxRQUFRO1FBQ05DLE1BQU0sSUFBTTtRQUNaQyxRQUFRLENBQUMsRUFBRUMsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQy9CQyxRQUFRLENBQUMsRUFBRUYsR0FBRyxFQUFFRyxHQUFHLEVBQUUsR0FDbkIsQ0FBQyxDQUFDSCxJQUFJQyxJQUFJLElBQUtELENBQUFBLElBQUlDLElBQUksQ0FBQ0csSUFBSSxLQUFLLFdBQVdELEtBQUtFLFdBQVdMLElBQUlDLElBQUksQ0FBQ0ssRUFBRTtRQUN6RUMsUUFBUSxDQUFDLEVBQUVQLEdBQUcsRUFBRUcsR0FBRyxFQUFFLEdBQ25CLENBQUMsQ0FBQ0gsSUFBSUMsSUFBSSxJQUFLRCxDQUFBQSxJQUFJQyxJQUFJLENBQUNHLElBQUksS0FBSyxXQUFXRCxLQUFLRSxXQUFXTCxJQUFJQyxJQUFJLENBQUNLLEVBQUU7SUFDM0U7SUFDQUUsUUFBUTtRQUNOO1lBQ0VDLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFVBQVU7UUFDWjtRQUNBO1lBQ0VILE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFVBQVU7WUFDVkMsUUFBUTtZQUNSQyxXQUFXO1FBQ2I7UUFDQTtZQUNFTCxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtRQUNSO1FBQ0E7WUFDRUYsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkMsVUFBVTtRQUNaO1FBQ0E7WUFDRUgsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkksY0FBYztZQUNkQyxTQUFTO2dCQUNQO29CQUFFTixPQUFPO29CQUFVTyxPQUFPO2dCQUFPO2dCQUNqQztvQkFBRVAsT0FBTztvQkFBV08sT0FBTztnQkFBUztnQkFDcEM7b0JBQUVQLE9BQU87b0JBQVdPLE9BQU87Z0JBQU87YUFDbkM7UUFDSDtRQUNBO1lBQ0VSLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05wQixRQUFRO2dCQUNOQyxVQUFVO2dCQUNWQyxRQUFRO1lBQ1Y7WUFDQWUsUUFBUTtnQkFDTjtvQkFDRUMsTUFBTTtvQkFDTkMsT0FBTztvQkFDUEMsTUFBTTtnQkFDUjthQUNEO1FBQ0g7UUFDQTtZQUNFRixNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOTyxZQUFZO1FBQ2Q7UUFDQTtZQUNFVCxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOSSxjQUFjO1lBQ2RDLFNBQVM7Z0JBQ1A7b0JBQUVOLE9BQU87b0JBQVlPLE9BQU87Z0JBQVE7Z0JBQ3BDO29CQUFFUCxPQUFPO29CQUFnQk8sT0FBTztnQkFBWTthQUM3QztZQUNETCxVQUFVO1FBQ1o7UUFDQTtZQUNFSCxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtRQUNSO1FBQ0E7WUFDRUYsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkksY0FBYztZQUNkSSxLQUFLO1FBQ1A7UUFDQTtZQUNFVixNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOSSxjQUFjO1lBQ2RJLEtBQUs7UUFDUDtRQUNBO1lBQ0VWLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05JLGNBQWM7WUFDZEksS0FBSztRQUNQO1FBQ0E7WUFDRVYsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkksY0FBYztZQUNkSSxLQUFLO1FBQ1A7UUFDQTtZQUNFVixNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOTyxZQUFZO1lBQ1pOLFVBQVU7WUFDVmxCLE9BQU87Z0JBQ0wwQixVQUFVO1lBQ1o7UUFDRjtLQUNEO0lBQ0RDLE9BQU87UUFDTEMsY0FBYztZQUFDLENBQUMsRUFBRUMsSUFBSSxFQUFFdkIsR0FBRyxFQUFFO2dCQUMzQixJQUFJLENBQUN1QixNQUFNLE9BQU9BO2dCQUNsQixJQUFJQSxLQUFLQyxLQUFLLElBQUksQ0FBQ0QsS0FBS2pDLElBQUksRUFBRTtvQkFDNUJpQyxLQUFLakMsSUFBSSxHQUFHRix1REFBT0EsQ0FBQ21DLEtBQUtDLEtBQUs7Z0JBQ2hDO2dCQUNBLElBQUlELEtBQUtFLE1BQU0sS0FBSyxlQUFlLENBQUNGLEtBQUtHLFdBQVcsRUFBRTtvQkFDcERILEtBQUtHLFdBQVcsR0FBRyxJQUFJQyxPQUFPQyxXQUFXO2dCQUMzQztnQkFDQSxJQUFJTCxLQUFLRSxNQUFNLEtBQUssU0FBUztvQkFDM0JGLEtBQUtHLFdBQVcsR0FBRztnQkFDckI7Z0JBQ0EsSUFBSUgsS0FBS00sSUFBSSxJQUFJQyxNQUFNQyxPQUFPLENBQUNSLEtBQUtNLElBQUksR0FBRztvQkFDekNOLEtBQUtNLElBQUksR0FBR04sS0FBS00sSUFBSSxDQUFDRyxHQUFHLENBQUMsQ0FBQ0MsUUFDekIsT0FBT0EsVUFBVSxXQUFXOzRCQUFFQyxLQUFLRDt3QkFBTSxJQUFJQTtnQkFFakQ7Z0JBQ0EsSUFBSSxDQUFDVixLQUFLbEIsTUFBTSxJQUFJTCxJQUFJQyxJQUFJLEVBQUU7b0JBQzVCc0IsS0FBS2xCLE1BQU0sR0FBR0wsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO2dCQUMzQjtnQkFDQSxPQUFPaUI7WUFDVDtTQUFFO0lBQ0o7QUFDRixFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvemltYmF6by9XZWJzdG9ybVByb2plY3RzL0FldGhlcmlzIHNoYWRjbi9wYXlsb2FkLWJhY2tlbmQvc3JjL2NvbGxlY3Rpb25zL0FydGljbGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBzbHVnaWZ5IH0gZnJvbSAnLi4vdXRpbHMvc2x1Z2lmeSdcblxuZXhwb3J0IGNvbnN0IEFydGljbGVzOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICBzbHVnOiAnYXJ0aWNsZXMnLFxuICBsYWJlbHM6IHtcbiAgICBzaW5ndWxhcjogJ9Ch0YLQsNGC0YzRjycsXG4gICAgcGx1cmFsOiAn0KHRgtCw0YLRjNC4JyxcbiAgfSxcbiAgYWRtaW46IHtcbiAgICB1c2VBc1RpdGxlOiAndGl0bGUnLFxuICAgIGRlZmF1bHRDb2x1bW5zOiBbJ3RpdGxlJywgJ3N0YXR1cycsICdwdWJsaXNoZWRBdCcsICdhdXRob3InXSxcbiAgfSxcbiAgYWNjZXNzOiB7XG4gICAgcmVhZDogKCkgPT4gdHJ1ZSxcbiAgICBjcmVhdGU6ICh7IHJlcSB9KSA9PiAhIXJlcS51c2VyLFxuICAgIHVwZGF0ZTogKHsgcmVxLCBkb2MgfSkgPT5cbiAgICAgICEhcmVxLnVzZXIgJiYgKHJlcS51c2VyLnJvbGUgPT09ICdhZG1pbicgfHwgZG9jPy5hdXRob3IgPT09IHJlcS51c2VyLmlkKSxcbiAgICBkZWxldGU6ICh7IHJlcSwgZG9jIH0pID0+XG4gICAgICAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8uYXV0aG9yID09PSByZXEudXNlci5pZCksXG4gIH0sXG4gIGZpZWxkczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICd0aXRsZScsXG4gICAgICBsYWJlbDogJ9CX0LDQs9C+0LvQvtCy0L7QuicsXG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzbHVnJyxcbiAgICAgIGxhYmVsOiAn0KHQu9Cw0LMnLFxuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICB1bmlxdWU6IHRydWUsXG4gICAgICBsb2NhbGl6ZWQ6IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2V4Y2VycHQnLFxuICAgICAgbGFiZWw6ICfQmtGA0LDRgtC60L7QtSDQvtC/0LjRgdCw0L3QuNC1JyxcbiAgICAgIHR5cGU6ICd0ZXh0YXJlYScsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnY29udGVudCcsXG4gICAgICBsYWJlbDogJ9Ca0L7QvdGC0LXQvdGCJyxcbiAgICAgIHR5cGU6ICd0ZXh0YXJlYScsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdkaWZmaWN1bHR5JyxcbiAgICAgIGxhYmVsOiAn0KHQu9C+0LbQvdC+0YHRgtGMJyxcbiAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgZGVmYXVsdFZhbHVlOiAnbWVkaXVtJyxcbiAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgeyBsYWJlbDogJ9Cb0LXQs9C60LDRjycsIHZhbHVlOiAnZWFzeScgfSxcbiAgICAgICAgeyBsYWJlbDogJ9Ch0YDQtdC00L3Rj9GPJywgdmFsdWU6ICdtZWRpdW0nIH0sXG4gICAgICAgIHsgbGFiZWw6ICfQodC70L7QttC90LDRjycsIHZhbHVlOiAnaGFyZCcgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAndGFncycsXG4gICAgICBsYWJlbDogJ9Ci0LXQs9C4JyxcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBsYWJlbHM6IHtcbiAgICAgICAgc2luZ3VsYXI6ICfQotC10LMnLFxuICAgICAgICBwbHVyYWw6ICfQotC10LPQuCcsXG4gICAgICB9LFxuICAgICAgZmllbGRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAndGFnJyxcbiAgICAgICAgICBsYWJlbDogJ9CX0L3QsNGH0LXQvdC40LUnLFxuICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncHJldmlld0ltYWdlJyxcbiAgICAgIGxhYmVsOiAn0J/RgNC10LLRjNGOLdC40LfQvtCx0YDQsNC20LXQvdC40LUnLFxuICAgICAgdHlwZTogJ3VwbG9hZCcsXG4gICAgICByZWxhdGlvblRvOiAnbWVkaWEnLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXR1cycsXG4gICAgICBsYWJlbDogJ9Ch0YLQsNGC0YPRgScsXG4gICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogJ2RyYWZ0JyxcbiAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgeyBsYWJlbDogJ9Cn0LXRgNC90L7QstC40LonLCB2YWx1ZTogJ2RyYWZ0JyB9LFxuICAgICAgICB7IGxhYmVsOiAn0J7Qv9GD0LHQu9C40LrQvtCy0LDQvdC+JywgdmFsdWU6ICdwdWJsaXNoZWQnIH0sXG4gICAgICBdLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncHVibGlzaGVkQXQnLFxuICAgICAgbGFiZWw6ICfQlNCw0YLQsCDQv9GD0LHQu9C40LrQsNGG0LjQuCcsXG4gICAgICB0eXBlOiAnZGF0ZScsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAndmlld3MnLFxuICAgICAgbGFiZWw6ICfQn9GA0L7RgdC80L7RgtGA0YsnLFxuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICBtaW46IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbGlrZXNDb3VudCcsXG4gICAgICBsYWJlbDogJ9Cb0LDQudC60LgnLFxuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICBtaW46IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnZGlzbGlrZXNDb3VudCcsXG4gICAgICBsYWJlbDogJ9CU0LjQt9C70LDQudC60LgnLFxuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICBtaW46IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnY29tbWVudHNDb3VudCcsXG4gICAgICBsYWJlbDogJ9Ca0L7QvNC80LXQvdGC0LDRgNC40LXQsicsXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgIG1pbjogMCxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdhdXRob3InLFxuICAgICAgbGFiZWw6ICfQkNCy0YLQvtGAJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ3VzZXJzJyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIGhvb2tzOiB7XG4gICAgYmVmb3JlQ2hhbmdlOiBbKHsgZGF0YSwgcmVxIH0pID0+IHtcbiAgICAgIGlmICghZGF0YSkgcmV0dXJuIGRhdGFcbiAgICAgIGlmIChkYXRhLnRpdGxlICYmICFkYXRhLnNsdWcpIHtcbiAgICAgICAgZGF0YS5zbHVnID0gc2x1Z2lmeShkYXRhLnRpdGxlKVxuICAgICAgfVxuICAgICAgaWYgKGRhdGEuc3RhdHVzID09PSAncHVibGlzaGVkJyAmJiAhZGF0YS5wdWJsaXNoZWRBdCkge1xuICAgICAgICBkYXRhLnB1Ymxpc2hlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9XG4gICAgICBpZiAoZGF0YS5zdGF0dXMgPT09ICdkcmFmdCcpIHtcbiAgICAgICAgZGF0YS5wdWJsaXNoZWRBdCA9IG51bGxcbiAgICAgIH1cbiAgICAgIGlmIChkYXRhLnRhZ3MgJiYgQXJyYXkuaXNBcnJheShkYXRhLnRhZ3MpKSB7XG4gICAgICAgIGRhdGEudGFncyA9IGRhdGEudGFncy5tYXAoKGVudHJ5OiBhbnkpID0+XG4gICAgICAgICAgdHlwZW9mIGVudHJ5ID09PSAnc3RyaW5nJyA/IHsgdGFnOiBlbnRyeSB9IDogZW50cnlcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKCFkYXRhLmF1dGhvciAmJiByZXEudXNlcikge1xuICAgICAgICBkYXRhLmF1dGhvciA9IHJlcS51c2VyLmlkXG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YVxuICAgIH1dLFxuICB9LFxufVxuIl0sIm5hbWVzIjpbInNsdWdpZnkiLCJBcnRpY2xlcyIsInNsdWciLCJsYWJlbHMiLCJzaW5ndWxhciIsInBsdXJhbCIsImFkbWluIiwidXNlQXNUaXRsZSIsImRlZmF1bHRDb2x1bW5zIiwiYWNjZXNzIiwicmVhZCIsImNyZWF0ZSIsInJlcSIsInVzZXIiLCJ1cGRhdGUiLCJkb2MiLCJyb2xlIiwiYXV0aG9yIiwiaWQiLCJkZWxldGUiLCJmaWVsZHMiLCJuYW1lIiwibGFiZWwiLCJ0eXBlIiwicmVxdWlyZWQiLCJ1bmlxdWUiLCJsb2NhbGl6ZWQiLCJkZWZhdWx0VmFsdWUiLCJvcHRpb25zIiwidmFsdWUiLCJyZWxhdGlvblRvIiwibWluIiwicmVhZE9ubHkiLCJob29rcyIsImJlZm9yZUNoYW5nZSIsImRhdGEiLCJ0aXRsZSIsInN0YXR1cyIsInB1Ymxpc2hlZEF0IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwidGFncyIsIkFycmF5IiwiaXNBcnJheSIsIm1hcCIsImVudHJ5IiwidGFnIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/Articles.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/CommentReactions.ts":
/*!*********************************************!*\
  !*** ./src/collections/CommentReactions.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CommentReactions: () => (/* binding */ CommentReactions)\n/* harmony export */ });\nconst CommentReactions = {\n    slug: 'comment-reactions',\n    labels: {\n        singular: 'Реакция на комментарий',\n        plural: 'Реакции на комментарии'\n    },\n    access: {\n        read: ({ req })=>!!req.user,\n        create: ({ req })=>!!req.user,\n        update: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id)\n    },\n    fields: [\n        {\n            name: 'comment',\n            label: 'Комментарий',\n            type: 'relationship',\n            relationTo: 'comments',\n            required: true\n        },\n        {\n            name: 'user',\n            label: 'Пользователь',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true\n        },\n        {\n            name: 'reaction',\n            label: 'Реакция',\n            type: 'select',\n            required: true,\n            options: [\n                {\n                    label: 'Лайк',\n                    value: 'like'\n                },\n                {\n                    label: 'Дизлайк',\n                    value: 'dislike'\n                }\n            ]\n        }\n    ],\n    indexes: [\n        {\n            fields: [\n                'comment',\n                'user'\n            ],\n            unique: true\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (!data.user && req.user) {\n                    data.user = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvQ29tbWVudFJlYWN0aW9ucy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsbUJBQXFDO0lBQ2hEQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsUUFBUTtRQUNOQyxNQUFNLENBQUMsRUFBRUMsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQzdCQyxRQUFRLENBQUMsRUFBRUYsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQy9CRSxRQUFRLENBQUMsRUFBRUgsR0FBRyxFQUFFSSxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNKLElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDSSxJQUFJLEtBQUssV0FBV0QsS0FBS0gsU0FBU0QsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO1FBQy9GQyxRQUFRLENBQUMsRUFBRVAsR0FBRyxFQUFFSSxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNKLElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDSSxJQUFJLEtBQUssV0FBV0QsS0FBS0gsU0FBU0QsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO0lBQ2pHO0lBQ0FFLFFBQVE7UUFDTjtZQUNFQyxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1lBQ1pDLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFlBQVk7WUFDWkMsVUFBVTtRQUNaO1FBQ0E7WUFDRUosTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkUsVUFBVTtZQUNWQyxTQUFTO2dCQUNQO29CQUFFSixPQUFPO29CQUFRSyxPQUFPO2dCQUFPO2dCQUMvQjtvQkFBRUwsT0FBTztvQkFBV0ssT0FBTztnQkFBVTthQUN0QztRQUNIO0tBQ0Q7SUFDREMsU0FBUztRQUNQO1lBQ0VSLFFBQVE7Z0JBQUM7Z0JBQVc7YUFBTztZQUMzQlMsUUFBUTtRQUNWO0tBQ0Q7SUFDREMsT0FBTztRQUNMQyxjQUFjO1lBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUVwQixHQUFHLEVBQUU7Z0JBQzNCLElBQUksQ0FBQ29CLE1BQU0sT0FBT0E7Z0JBQ2xCLElBQUksQ0FBQ0EsS0FBS25CLElBQUksSUFBSUQsSUFBSUMsSUFBSSxFQUFFO29CQUMxQm1CLEtBQUtuQixJQUFJLEdBQUdELElBQUlDLElBQUksQ0FBQ0ssRUFBRTtnQkFDekI7Z0JBQ0EsT0FBT2M7WUFDVDtTQUFFO0lBQ0o7QUFDRixFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvemltYmF6by9XZWJzdG9ybVByb2plY3RzL0FldGhlcmlzIHNoYWRjbi9wYXlsb2FkLWJhY2tlbmQvc3JjL2NvbGxlY3Rpb25zL0NvbW1lbnRSZWFjdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGNvbnN0IENvbW1lbnRSZWFjdGlvbnM6IENvbGxlY3Rpb25Db25maWcgPSB7XG4gIHNsdWc6ICdjb21tZW50LXJlYWN0aW9ucycsXG4gIGxhYmVsczoge1xuICAgIHNpbmd1bGFyOiAn0KDQtdCw0LrRhtC40Y8g0L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNC5JyxcbiAgICBwbHVyYWw6ICfQoNC10LDQutGG0LjQuCDQvdCwINC60L7QvNC80LXQvdGC0LDRgNC40LgnLFxuICB9LFxuICBhY2Nlc3M6IHtcbiAgICByZWFkOiAoeyByZXEgfSkgPT4gISFyZXEudXNlcixcbiAgICBjcmVhdGU6ICh7IHJlcSB9KSA9PiAhIXJlcS51c2VyLFxuICAgIHVwZGF0ZTogKHsgcmVxLCBkb2MgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIucm9sZSA9PT0gJ2FkbWluJyB8fCBkb2M/LnVzZXIgPT09IHJlcS51c2VyLmlkKSxcbiAgICBkZWxldGU6ICh7IHJlcSwgZG9jIH0pID0+ICEhcmVxLnVzZXIgJiYgKHJlcS51c2VyLnJvbGUgPT09ICdhZG1pbicgfHwgZG9jPy51c2VyID09PSByZXEudXNlci5pZCksXG4gIH0sXG4gIGZpZWxkczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdjb21tZW50JyxcbiAgICAgIGxhYmVsOiAn0JrQvtC80LzQtdC90YLQsNGA0LjQuScsXG4gICAgICB0eXBlOiAncmVsYXRpb25zaGlwJyxcbiAgICAgIHJlbGF0aW9uVG86ICdjb21tZW50cycsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICd1c2VyJyxcbiAgICAgIGxhYmVsOiAn0J/QvtC70YzQt9C+0LLQsNGC0LXQu9GMJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ3VzZXJzJyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3JlYWN0aW9uJyxcbiAgICAgIGxhYmVsOiAn0KDQtdCw0LrRhtC40Y8nLFxuICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgeyBsYWJlbDogJ9Cb0LDQudC6JywgdmFsdWU6ICdsaWtlJyB9LFxuICAgICAgICB7IGxhYmVsOiAn0JTQuNC30LvQsNC50LonLCB2YWx1ZTogJ2Rpc2xpa2UnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gIGluZGV4ZXM6IFtcbiAgICB7XG4gICAgICBmaWVsZHM6IFsnY29tbWVudCcsICd1c2VyJ10sXG4gICAgICB1bmlxdWU6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgaG9va3M6IHtcbiAgICBiZWZvcmVDaGFuZ2U6IFsoeyBkYXRhLCByZXEgfSkgPT4ge1xuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gZGF0YVxuICAgICAgaWYgKCFkYXRhLnVzZXIgJiYgcmVxLnVzZXIpIHtcbiAgICAgICAgZGF0YS51c2VyID0gcmVxLnVzZXIuaWRcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfV0sXG4gIH0sXG59XG4iXSwibmFtZXMiOlsiQ29tbWVudFJlYWN0aW9ucyIsInNsdWciLCJsYWJlbHMiLCJzaW5ndWxhciIsInBsdXJhbCIsImFjY2VzcyIsInJlYWQiLCJyZXEiLCJ1c2VyIiwiY3JlYXRlIiwidXBkYXRlIiwiZG9jIiwicm9sZSIsImlkIiwiZGVsZXRlIiwiZmllbGRzIiwibmFtZSIsImxhYmVsIiwidHlwZSIsInJlbGF0aW9uVG8iLCJyZXF1aXJlZCIsIm9wdGlvbnMiLCJ2YWx1ZSIsImluZGV4ZXMiLCJ1bmlxdWUiLCJob29rcyIsImJlZm9yZUNoYW5nZSIsImRhdGEiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/CommentReactions.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/Comments.ts":
/*!*************************************!*\
  !*** ./src/collections/Comments.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Comments: () => (/* binding */ Comments)\n/* harmony export */ });\nconst Comments = {\n    slug: 'comments',\n    labels: {\n        singular: 'Комментарий',\n        plural: 'Комментарии'\n    },\n    admin: {\n        defaultColumns: [\n            'article',\n            'author',\n            'createdAt'\n        ]\n    },\n    access: {\n        read: ()=>true,\n        create: ({ req })=>!!req.user,\n        update: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.author === req.user.id),\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.author === req.user.id)\n    },\n    fields: [\n        {\n            name: 'article',\n            label: 'Статья',\n            type: 'relationship',\n            relationTo: 'articles',\n            required: true\n        },\n        {\n            name: 'author',\n            label: 'Автор',\n            type: 'relationship',\n            relationTo: 'users',\n            required: false,\n            admin: {\n                readOnly: true\n            }\n        },\n        {\n            name: 'guestName',\n            label: 'Имя гостя',\n            type: 'text',\n            admin: {\n                condition: (_, siblingData)=>!siblingData?.author\n            }\n        },\n        {\n            name: 'parent',\n            label: 'Родительский комментарий',\n            type: 'relationship',\n            relationTo: 'comments'\n        },\n        {\n            name: 'text',\n            label: 'Текст',\n            type: 'textarea',\n            required: true\n        },\n        {\n            name: 'likesCount',\n            label: 'Лайки',\n            type: 'number',\n            defaultValue: 0,\n            min: 0\n        },\n        {\n            name: 'dislikesCount',\n            label: 'Дизлайки',\n            type: 'number',\n            defaultValue: 0,\n            min: 0\n        },\n        {\n            name: 'isEdited',\n            label: 'Редактировано',\n            type: 'checkbox',\n            defaultValue: false\n        },\n        {\n            name: 'editedAt',\n            label: 'Дата редактирования',\n            type: 'date'\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (req.user && !data.author) {\n                    data.author = req.user.id;\n                }\n                if (!data.author && !data.guestName) {\n                    data.guestName = 'Гость';\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvQ29tbWVudHMudHMiLCJtYXBwaW5ncyI6Ijs7OztBQUVPLE1BQU1BLFdBQTZCO0lBQ3hDQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsT0FBTztRQUNMQyxnQkFBZ0I7WUFBQztZQUFXO1lBQVU7U0FBWTtJQUNwRDtJQUNBQyxRQUFRO1FBQ05DLE1BQU0sSUFBTTtRQUNaQyxRQUFRLENBQUMsRUFBRUMsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO1FBQy9CQyxRQUFRLENBQUMsRUFBRUYsR0FBRyxFQUFFRyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNILElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDRyxJQUFJLEtBQUssV0FBV0QsS0FBS0UsV0FBV0wsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO1FBQ2pHQyxRQUFRLENBQUMsRUFBRVAsR0FBRyxFQUFFRyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNILElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDRyxJQUFJLEtBQUssV0FBV0QsS0FBS0UsV0FBV0wsSUFBSUMsSUFBSSxDQUFDSyxFQUFFO0lBQ25HO0lBQ0FFLFFBQVE7UUFDTjtZQUNFQyxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1lBQ1pDLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFlBQVk7WUFDWkMsVUFBVTtZQUNWbEIsT0FBTztnQkFDTG1CLFVBQVU7WUFDWjtRQUNGO1FBQ0E7WUFDRUwsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTmhCLE9BQU87Z0JBQ0xvQixXQUFXLENBQUNDLEdBQUdDLGNBQWdCLENBQUNBLGFBQWFaO1lBQy9DO1FBQ0Y7UUFDQTtZQUNFSSxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1FBQ2Q7UUFDQTtZQUNFSCxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNORSxVQUFVO1FBQ1o7UUFDQTtZQUNFSixNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOTyxjQUFjO1lBQ2RDLEtBQUs7UUFDUDtRQUNBO1lBQ0VWLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05PLGNBQWM7WUFDZEMsS0FBSztRQUNQO1FBQ0E7WUFDRVYsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTk8sY0FBYztRQUNoQjtRQUNBO1lBQ0VULE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1FBQ1I7S0FDRDtJQUNEUyxPQUFPO1FBQ0xDLGNBQWM7WUFBQyxDQUFDLEVBQUVDLElBQUksRUFBRXRCLEdBQUcsRUFBRTtnQkFDM0IsSUFBSSxDQUFDc0IsTUFBTSxPQUFPQTtnQkFDbEIsSUFBSXRCLElBQUlDLElBQUksSUFBSSxDQUFDcUIsS0FBS2pCLE1BQU0sRUFBRTtvQkFDNUJpQixLQUFLakIsTUFBTSxHQUFHTCxJQUFJQyxJQUFJLENBQUNLLEVBQUU7Z0JBQzNCO2dCQUNBLElBQUksQ0FBQ2dCLEtBQUtqQixNQUFNLElBQUksQ0FBQ2lCLEtBQUtDLFNBQVMsRUFBRTtvQkFDbkNELEtBQUtDLFNBQVMsR0FBRztnQkFDbkI7Z0JBQ0EsT0FBT0Q7WUFDVDtTQUFFO0lBQ0o7QUFDRixFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvemltYmF6by9XZWJzdG9ybVByb2plY3RzL0FldGhlcmlzIHNoYWRjbi9wYXlsb2FkLWJhY2tlbmQvc3JjL2NvbGxlY3Rpb25zL0NvbW1lbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5cbmV4cG9ydCBjb25zdCBDb21tZW50czogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgc2x1ZzogJ2NvbW1lbnRzJyxcbiAgbGFiZWxzOiB7XG4gICAgc2luZ3VsYXI6ICfQmtC+0LzQvNC10L3RgtCw0YDQuNC5JyxcbiAgICBwbHVyYWw6ICfQmtC+0LzQvNC10L3RgtCw0YDQuNC4JyxcbiAgfSxcbiAgYWRtaW46IHtcbiAgICBkZWZhdWx0Q29sdW1uczogWydhcnRpY2xlJywgJ2F1dGhvcicsICdjcmVhdGVkQXQnXSxcbiAgfSxcbiAgYWNjZXNzOiB7XG4gICAgcmVhZDogKCkgPT4gdHJ1ZSxcbiAgICBjcmVhdGU6ICh7IHJlcSB9KSA9PiAhIXJlcS51c2VyLFxuICAgIHVwZGF0ZTogKHsgcmVxLCBkb2MgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIucm9sZSA9PT0gJ2FkbWluJyB8fCBkb2M/LmF1dGhvciA9PT0gcmVxLnVzZXIuaWQpLFxuICAgIGRlbGV0ZTogKHsgcmVxLCBkb2MgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIucm9sZSA9PT0gJ2FkbWluJyB8fCBkb2M/LmF1dGhvciA9PT0gcmVxLnVzZXIuaWQpLFxuICB9LFxuICBmaWVsZHM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnYXJ0aWNsZScsXG4gICAgICBsYWJlbDogJ9Ch0YLQsNGC0YzRjycsXG4gICAgICB0eXBlOiAncmVsYXRpb25zaGlwJyxcbiAgICAgIHJlbGF0aW9uVG86ICdhcnRpY2xlcycsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdhdXRob3InLFxuICAgICAgbGFiZWw6ICfQkNCy0YLQvtGAJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ3VzZXJzJyxcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdndWVzdE5hbWUnLFxuICAgICAgbGFiZWw6ICfQmNC80Y8g0LPQvtGB0YLRjycsXG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICBhZG1pbjoge1xuICAgICAgICBjb25kaXRpb246IChfLCBzaWJsaW5nRGF0YSkgPT4gIXNpYmxpbmdEYXRhPy5hdXRob3IsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3BhcmVudCcsXG4gICAgICBsYWJlbDogJ9Cg0L7QtNC40YLQtdC70YzRgdC60LjQuSDQutC+0LzQvNC10L3RgtCw0YDQuNC5JyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ2NvbW1lbnRzJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGxhYmVsOiAn0KLQtdC60YHRgicsXG4gICAgICB0eXBlOiAndGV4dGFyZWEnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbGlrZXNDb3VudCcsXG4gICAgICBsYWJlbDogJ9Cb0LDQudC60LgnLFxuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICBtaW46IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnZGlzbGlrZXNDb3VudCcsXG4gICAgICBsYWJlbDogJ9CU0LjQt9C70LDQudC60LgnLFxuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICBtaW46IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnaXNFZGl0ZWQnLFxuICAgICAgbGFiZWw6ICfQoNC10LTQsNC60YLQuNGA0L7QstCw0L3QvicsXG4gICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdlZGl0ZWRBdCcsXG4gICAgICBsYWJlbDogJ9CU0LDRgtCwINGA0LXQtNCw0LrRgtC40YDQvtCy0LDQvdC40Y8nLFxuICAgICAgdHlwZTogJ2RhdGUnLFxuICAgIH0sXG4gIF0sXG4gIGhvb2tzOiB7XG4gICAgYmVmb3JlQ2hhbmdlOiBbKHsgZGF0YSwgcmVxIH0pID0+IHtcbiAgICAgIGlmICghZGF0YSkgcmV0dXJuIGRhdGFcbiAgICAgIGlmIChyZXEudXNlciAmJiAhZGF0YS5hdXRob3IpIHtcbiAgICAgICAgZGF0YS5hdXRob3IgPSByZXEudXNlci5pZFxuICAgICAgfVxuICAgICAgaWYgKCFkYXRhLmF1dGhvciAmJiAhZGF0YS5ndWVzdE5hbWUpIHtcbiAgICAgICAgZGF0YS5ndWVzdE5hbWUgPSAn0JPQvtGB0YLRjCdcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfV0sXG4gIH0sXG59XG4iXSwibmFtZXMiOlsiQ29tbWVudHMiLCJzbHVnIiwibGFiZWxzIiwic2luZ3VsYXIiLCJwbHVyYWwiLCJhZG1pbiIsImRlZmF1bHRDb2x1bW5zIiwiYWNjZXNzIiwicmVhZCIsImNyZWF0ZSIsInJlcSIsInVzZXIiLCJ1cGRhdGUiLCJkb2MiLCJyb2xlIiwiYXV0aG9yIiwiaWQiLCJkZWxldGUiLCJmaWVsZHMiLCJuYW1lIiwibGFiZWwiLCJ0eXBlIiwicmVsYXRpb25UbyIsInJlcXVpcmVkIiwicmVhZE9ubHkiLCJjb25kaXRpb24iLCJfIiwic2libGluZ0RhdGEiLCJkZWZhdWx0VmFsdWUiLCJtaW4iLCJob29rcyIsImJlZm9yZUNoYW5nZSIsImRhdGEiLCJndWVzdE5hbWUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/Comments.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/Media.ts":
/*!**********************************!*\
  !*** ./src/collections/Media.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Media: () => (/* binding */ Media)\n/* harmony export */ });\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ \"url\");\n/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst filename = (0,url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath)(\"file:///Users/zimbazo/WebstormProjects/Aetheris%20shadcn/payload-backend/src/collections/Media.ts\");\nconst dirname = path__WEBPACK_IMPORTED_MODULE_0___default().dirname(filename);\nconst Media = {\n    slug: 'media',\n    labels: {\n        singular: 'Медиа-файл',\n        plural: 'Медиа-файлы'\n    },\n    upload: {\n        staticDir: path__WEBPACK_IMPORTED_MODULE_0___default().resolve(dirname, '../../media'),\n        imageSizes: [\n            {\n                name: 'thumbnail',\n                width: 400,\n                height: 400,\n                position: 'centre'\n            }\n        ],\n        adminThumbnail: 'thumbnail'\n    },\n    access: {\n        read: ()=>true,\n        delete: ({ req })=>!!req.user && req.user.role === 'admin',\n        update: ({ req })=>!!req.user\n    },\n    fields: [\n        {\n            name: 'alt',\n            label: 'Alt-текст',\n            type: 'text'\n        }\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvTWVkaWEudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBdUI7QUFDWTtBQUduQyxNQUFNRSxXQUFXRCxrREFBYUEsQ0FBQyxtR0FBZTtBQUM5QyxNQUFNRyxVQUFVSixtREFBWSxDQUFDRTtBQUV0QixNQUFNRyxRQUEwQjtJQUNyQ0MsTUFBTTtJQUNOQyxRQUFRO1FBQ05DLFVBQVU7UUFDVkMsUUFBUTtJQUNWO0lBQ0FDLFFBQVE7UUFDTkMsV0FBV1gsbURBQVksQ0FBQ0ksU0FBUztRQUNqQ1MsWUFBWTtZQUNWO2dCQUNFQyxNQUFNO2dCQUNOQyxPQUFPO2dCQUNQQyxRQUFRO2dCQUNSQyxVQUFVO1lBQ1o7U0FDRDtRQUNEQyxnQkFBZ0I7SUFDbEI7SUFDQUMsUUFBUTtRQUNOQyxNQUFNLElBQU07UUFDWkMsUUFBUSxDQUFDLEVBQUVDLEdBQUcsRUFBRSxHQUFLLENBQUMsQ0FBQ0EsSUFBSUMsSUFBSSxJQUFJRCxJQUFJQyxJQUFJLENBQUNDLElBQUksS0FBSztRQUNyREMsUUFBUSxDQUFDLEVBQUVILEdBQUcsRUFBRSxHQUFLLENBQUMsQ0FBQ0EsSUFBSUMsSUFBSTtJQUNqQztJQUNBRyxRQUFRO1FBQ047WUFDRVosTUFBTTtZQUNOYSxPQUFPO1lBQ1BDLE1BQU07UUFDUjtLQUNEO0FBQ0gsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3ppbWJhem8vV2Vic3Rvcm1Qcm9qZWN0cy9BZXRoZXJpcyBzaGFkY24vcGF5bG9hZC1iYWNrZW5kL3NyYy9jb2xsZWN0aW9ucy9NZWRpYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5cbmNvbnN0IGZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpXG5jb25zdCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVuYW1lKVxuXG5leHBvcnQgY29uc3QgTWVkaWE6IENvbGxlY3Rpb25Db25maWcgPSB7XG4gIHNsdWc6ICdtZWRpYScsXG4gIGxhYmVsczoge1xuICAgIHNpbmd1bGFyOiAn0JzQtdC00LjQsC3RhNCw0LnQuycsXG4gICAgcGx1cmFsOiAn0JzQtdC00LjQsC3RhNCw0LnQu9GLJyxcbiAgfSxcbiAgdXBsb2FkOiB7XG4gICAgc3RhdGljRGlyOiBwYXRoLnJlc29sdmUoZGlybmFtZSwgJy4uLy4uL21lZGlhJyksXG4gICAgaW1hZ2VTaXplczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAndGh1bWJuYWlsJyxcbiAgICAgICAgd2lkdGg6IDQwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgIHBvc2l0aW9uOiAnY2VudHJlJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBhZG1pblRodW1ibmFpbDogJ3RodW1ibmFpbCcsXG4gIH0sXG4gIGFjY2Vzczoge1xuICAgIHJlYWQ6ICgpID0+IHRydWUsXG4gICAgZGVsZXRlOiAoeyByZXEgfSkgPT4gISFyZXEudXNlciAmJiByZXEudXNlci5yb2xlID09PSAnYWRtaW4nLFxuICAgIHVwZGF0ZTogKHsgcmVxIH0pID0+ICEhcmVxLnVzZXIsXG4gIH0sXG4gIGZpZWxkczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdhbHQnLFxuICAgICAgbGFiZWw6ICdBbHQt0YLQtdC60YHRgicsXG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgfSxcbiAgXSxcbn1cbiJdLCJuYW1lcyI6WyJwYXRoIiwiZmlsZVVSTFRvUGF0aCIsImZpbGVuYW1lIiwidXJsIiwiZGlybmFtZSIsIk1lZGlhIiwic2x1ZyIsImxhYmVscyIsInNpbmd1bGFyIiwicGx1cmFsIiwidXBsb2FkIiwic3RhdGljRGlyIiwicmVzb2x2ZSIsImltYWdlU2l6ZXMiLCJuYW1lIiwid2lkdGgiLCJoZWlnaHQiLCJwb3NpdGlvbiIsImFkbWluVGh1bWJuYWlsIiwiYWNjZXNzIiwicmVhZCIsImRlbGV0ZSIsInJlcSIsInVzZXIiLCJyb2xlIiwidXBkYXRlIiwiZmllbGRzIiwibGFiZWwiLCJ0eXBlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/Media.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/Notifications.ts":
/*!******************************************!*\
  !*** ./src/collections/Notifications.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Notifications: () => (/* binding */ Notifications)\n/* harmony export */ });\nconst Notifications = {\n    slug: 'notifications',\n    labels: {\n        singular: 'Уведомление',\n        plural: 'Уведомления'\n    },\n    access: {\n        read: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),\n        create: ({ req })=>!!req.user,\n        update: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id)\n    },\n    fields: [\n        {\n            name: 'user',\n            label: 'Пользователь',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true\n        },\n        {\n            name: 'type',\n            label: 'Тип',\n            type: 'text',\n            required: true\n        },\n        {\n            name: 'title',\n            label: 'Заголовок',\n            type: 'text',\n            required: true\n        },\n        {\n            name: 'message',\n            label: 'Сообщение',\n            type: 'textarea',\n            required: true\n        },\n        {\n            name: 'isRead',\n            label: 'Прочитано',\n            type: 'checkbox',\n            defaultValue: false\n        },\n        {\n            name: 'relatedArticle',\n            label: 'Связанная статья',\n            type: 'relationship',\n            relationTo: 'articles'\n        },\n        {\n            name: 'relatedComment',\n            label: 'Связанный комментарий',\n            type: 'relationship',\n            relationTo: 'comments'\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (!data.user && req.user) {\n                    data.user = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvTm90aWZpY2F0aW9ucy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsZ0JBQWtDO0lBQzdDQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsUUFBUTtRQUNOQyxNQUFNLENBQUMsRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNELElBQUlFLElBQUksSUFBS0YsQ0FBQUEsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLEtBQUssV0FBV0YsS0FBS0MsU0FBU0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO1FBQzdGQyxRQUFRLENBQUMsRUFBRUwsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJRSxJQUFJO1FBQy9CSSxRQUFRLENBQUMsRUFBRU4sR0FBRyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNELElBQUlFLElBQUksSUFBS0YsQ0FBQUEsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLEtBQUssV0FBV0YsS0FBS0MsU0FBU0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO1FBQy9GRyxRQUFRLENBQUMsRUFBRVAsR0FBRyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNELElBQUlFLElBQUksSUFBS0YsQ0FBQUEsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLEtBQUssV0FBV0YsS0FBS0MsU0FBU0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO0lBQ2pHO0lBQ0FJLFFBQVE7UUFDTjtZQUNFQyxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1lBQ1pDLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05FLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05FLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05FLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05HLGNBQWM7UUFDaEI7UUFDQTtZQUNFTCxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1FBQ2Q7UUFDQTtZQUNFSCxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1FBQ2Q7S0FDRDtJQUNERyxPQUFPO1FBQ0xDLGNBQWM7WUFBQyxDQUFDLEVBQUVDLElBQUksRUFBRWpCLEdBQUcsRUFBRTtnQkFDM0IsSUFBSSxDQUFDaUIsTUFBTSxPQUFPQTtnQkFDbEIsSUFBSSxDQUFDQSxLQUFLZixJQUFJLElBQUlGLElBQUlFLElBQUksRUFBRTtvQkFDMUJlLEtBQUtmLElBQUksR0FBR0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO2dCQUN6QjtnQkFDQSxPQUFPYTtZQUNUO1NBQUU7SUFDSjtBQUNGLEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvY29sbGVjdGlvbnMvTm90aWZpY2F0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuXG5leHBvcnQgY29uc3QgTm90aWZpY2F0aW9uczogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgc2x1ZzogJ25vdGlmaWNhdGlvbnMnLFxuICBsYWJlbHM6IHtcbiAgICBzaW5ndWxhcjogJ9Cj0LLQtdC00L7QvNC70LXQvdC40LUnLFxuICAgIHBsdXJhbDogJ9Cj0LLQtdC00L7QvNC70LXQvdC40Y8nLFxuICB9LFxuICBhY2Nlc3M6IHtcbiAgICByZWFkOiAoeyByZXEsIGRvYyB9KSA9PiAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8udXNlciA9PT0gcmVxLnVzZXIuaWQpLFxuICAgIGNyZWF0ZTogKHsgcmVxIH0pID0+ICEhcmVxLnVzZXIsXG4gICAgdXBkYXRlOiAoeyByZXEsIGRvYyB9KSA9PiAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8udXNlciA9PT0gcmVxLnVzZXIuaWQpLFxuICAgIGRlbGV0ZTogKHsgcmVxLCBkb2MgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIucm9sZSA9PT0gJ2FkbWluJyB8fCBkb2M/LnVzZXIgPT09IHJlcS51c2VyLmlkKSxcbiAgfSxcbiAgZmllbGRzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ3VzZXInLFxuICAgICAgbGFiZWw6ICfQn9C+0LvRjNC30L7QstCw0YLQtdC70YwnLFxuICAgICAgdHlwZTogJ3JlbGF0aW9uc2hpcCcsXG4gICAgICByZWxhdGlvblRvOiAndXNlcnMnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAndHlwZScsXG4gICAgICBsYWJlbDogJ9Ci0LjQvycsXG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICd0aXRsZScsXG4gICAgICBsYWJlbDogJ9CX0LDQs9C+0LvQvtCy0L7QuicsXG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtZXNzYWdlJyxcbiAgICAgIGxhYmVsOiAn0KHQvtC+0LHRidC10L3QuNC1JyxcbiAgICAgIHR5cGU6ICd0ZXh0YXJlYScsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdpc1JlYWQnLFxuICAgICAgbGFiZWw6ICfQn9GA0L7Rh9C40YLQsNC90L4nLFxuICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncmVsYXRlZEFydGljbGUnLFxuICAgICAgbGFiZWw6ICfQodCy0Y/Qt9Cw0L3QvdCw0Y8g0YHRgtCw0YLRjNGPJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ2FydGljbGVzJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdyZWxhdGVkQ29tbWVudCcsXG4gICAgICBsYWJlbDogJ9Ch0LLRj9C30LDQvdC90YvQuSDQutC+0LzQvNC10L3RgtCw0YDQuNC5JyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgcmVsYXRpb25UbzogJ2NvbW1lbnRzJyxcbiAgICB9LFxuICBdLFxuICBob29rczoge1xuICAgIGJlZm9yZUNoYW5nZTogWyh7IGRhdGEsIHJlcSB9KSA9PiB7XG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBkYXRhXG4gICAgICBpZiAoIWRhdGEudXNlciAmJiByZXEudXNlcikge1xuICAgICAgICBkYXRhLnVzZXIgPSByZXEudXNlci5pZFxuICAgICAgfVxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XSxcbiAgfSxcbn1cbiJdLCJuYW1lcyI6WyJOb3RpZmljYXRpb25zIiwic2x1ZyIsImxhYmVscyIsInNpbmd1bGFyIiwicGx1cmFsIiwiYWNjZXNzIiwicmVhZCIsInJlcSIsImRvYyIsInVzZXIiLCJyb2xlIiwiaWQiLCJjcmVhdGUiLCJ1cGRhdGUiLCJkZWxldGUiLCJmaWVsZHMiLCJuYW1lIiwibGFiZWwiLCJ0eXBlIiwicmVsYXRpb25UbyIsInJlcXVpcmVkIiwiZGVmYXVsdFZhbHVlIiwiaG9va3MiLCJiZWZvcmVDaGFuZ2UiLCJkYXRhIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/Notifications.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/RefreshTokens.ts":
/*!******************************************!*\
  !*** ./src/collections/RefreshTokens.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   RefreshTokens: () => (/* binding */ RefreshTokens)\n/* harmony export */ });\nconst RefreshTokens = {\n    slug: 'refresh-tokens',\n    labels: {\n        singular: 'Refresh токен',\n        plural: 'Refresh токены'\n    },\n    access: {\n        read: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),\n        create: ({ req })=>!!req.user,\n        update: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),\n        delete: ({ req, doc })=>!!req.user && (req.user.role === 'admin' || doc?.user === req.user.id)\n    },\n    fields: [\n        {\n            name: 'user',\n            label: 'Пользователь',\n            type: 'relationship',\n            relationTo: 'users',\n            required: true\n        },\n        {\n            name: 'jti',\n            label: 'JTI',\n            type: 'text',\n            required: true,\n            unique: true\n        },\n        {\n            name: 'expiresAt',\n            label: 'Истекает',\n            type: 'date',\n            required: true\n        },\n        {\n            name: 'revoked',\n            label: 'Отозван',\n            type: 'checkbox',\n            defaultValue: false\n        }\n    ],\n    hooks: {\n        beforeChange: [\n            ({ data, req })=>{\n                if (!data) return data;\n                if (!data.user && req.user) {\n                    data.user = req.user.id;\n                }\n                return data;\n            }\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvUmVmcmVzaFRva2Vucy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsZ0JBQWtDO0lBQzdDQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsUUFBUTtRQUNOQyxNQUFNLENBQUMsRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNELElBQUlFLElBQUksSUFBS0YsQ0FBQUEsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLEtBQUssV0FBV0YsS0FBS0MsU0FBU0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO1FBQzdGQyxRQUFRLENBQUMsRUFBRUwsR0FBRyxFQUFFLEdBQUssQ0FBQyxDQUFDQSxJQUFJRSxJQUFJO1FBQy9CSSxRQUFRLENBQUMsRUFBRU4sR0FBRyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNELElBQUlFLElBQUksSUFBS0YsQ0FBQUEsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLEtBQUssV0FBV0YsS0FBS0MsU0FBU0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO1FBQy9GRyxRQUFRLENBQUMsRUFBRVAsR0FBRyxFQUFFQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUNELElBQUlFLElBQUksSUFBS0YsQ0FBQUEsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLEtBQUssV0FBV0YsS0FBS0MsU0FBU0YsSUFBSUUsSUFBSSxDQUFDRSxFQUFFO0lBQ2pHO0lBQ0FJLFFBQVE7UUFDTjtZQUNFQyxNQUFNO1lBQ05DLE9BQU87WUFDUEMsTUFBTTtZQUNOQyxZQUFZO1lBQ1pDLFVBQVU7UUFDWjtRQUNBO1lBQ0VKLE1BQU07WUFDTkMsT0FBTztZQUNQQyxNQUFNO1lBQ05FLFVBQVU7WUFDVkMsUUFBUTtRQUNWO1FBQ0E7WUFDRUwsTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkUsVUFBVTtRQUNaO1FBQ0E7WUFDRUosTUFBTTtZQUNOQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkksY0FBYztRQUNoQjtLQUNEO0lBQ0RDLE9BQU87UUFDTEMsY0FBYztZQUFDLENBQUMsRUFBRUMsSUFBSSxFQUFFbEIsR0FBRyxFQUFFO2dCQUMzQixJQUFJLENBQUNrQixNQUFNLE9BQU9BO2dCQUNsQixJQUFJLENBQUNBLEtBQUtoQixJQUFJLElBQUlGLElBQUlFLElBQUksRUFBRTtvQkFDMUJnQixLQUFLaEIsSUFBSSxHQUFHRixJQUFJRSxJQUFJLENBQUNFLEVBQUU7Z0JBQ3pCO2dCQUNBLE9BQU9jO1lBQ1Q7U0FBRTtJQUNKO0FBQ0YsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3ppbWJhem8vV2Vic3Rvcm1Qcm9qZWN0cy9BZXRoZXJpcyBzaGFkY24vcGF5bG9hZC1iYWNrZW5kL3NyYy9jb2xsZWN0aW9ucy9SZWZyZXNoVG9rZW5zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5cbmV4cG9ydCBjb25zdCBSZWZyZXNoVG9rZW5zOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICBzbHVnOiAncmVmcmVzaC10b2tlbnMnLFxuICBsYWJlbHM6IHtcbiAgICBzaW5ndWxhcjogJ1JlZnJlc2gg0YLQvtC60LXQvScsXG4gICAgcGx1cmFsOiAnUmVmcmVzaCDRgtC+0LrQtdC90YsnLFxuICB9LFxuICBhY2Nlc3M6IHtcbiAgICByZWFkOiAoeyByZXEsIGRvYyB9KSA9PiAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8udXNlciA9PT0gcmVxLnVzZXIuaWQpLFxuICAgIGNyZWF0ZTogKHsgcmVxIH0pID0+ICEhcmVxLnVzZXIsXG4gICAgdXBkYXRlOiAoeyByZXEsIGRvYyB9KSA9PiAhIXJlcS51c2VyICYmIChyZXEudXNlci5yb2xlID09PSAnYWRtaW4nIHx8IGRvYz8udXNlciA9PT0gcmVxLnVzZXIuaWQpLFxuICAgIGRlbGV0ZTogKHsgcmVxLCBkb2MgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIucm9sZSA9PT0gJ2FkbWluJyB8fCBkb2M/LnVzZXIgPT09IHJlcS51c2VyLmlkKSxcbiAgfSxcbiAgZmllbGRzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ3VzZXInLFxuICAgICAgbGFiZWw6ICfQn9C+0LvRjNC30L7QstCw0YLQtdC70YwnLFxuICAgICAgdHlwZTogJ3JlbGF0aW9uc2hpcCcsXG4gICAgICByZWxhdGlvblRvOiAndXNlcnMnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnanRpJyxcbiAgICAgIGxhYmVsOiAnSlRJJyxcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgdW5pcXVlOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2V4cGlyZXNBdCcsXG4gICAgICBsYWJlbDogJ9CY0YHRgtC10LrQsNC10YInLFxuICAgICAgdHlwZTogJ2RhdGUnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncmV2b2tlZCcsXG4gICAgICBsYWJlbDogJ9Ce0YLQvtC30LLQsNC9JyxcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgIH0sXG4gIF0sXG4gIGhvb2tzOiB7XG4gICAgYmVmb3JlQ2hhbmdlOiBbKHsgZGF0YSwgcmVxIH0pID0+IHtcbiAgICAgIGlmICghZGF0YSkgcmV0dXJuIGRhdGFcbiAgICAgIGlmICghZGF0YS51c2VyICYmIHJlcS51c2VyKSB7XG4gICAgICAgIGRhdGEudXNlciA9IHJlcS51c2VyLmlkXG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YVxuICAgIH1dLFxuICB9LFxufVxuIl0sIm5hbWVzIjpbIlJlZnJlc2hUb2tlbnMiLCJzbHVnIiwibGFiZWxzIiwic2luZ3VsYXIiLCJwbHVyYWwiLCJhY2Nlc3MiLCJyZWFkIiwicmVxIiwiZG9jIiwidXNlciIsInJvbGUiLCJpZCIsImNyZWF0ZSIsInVwZGF0ZSIsImRlbGV0ZSIsImZpZWxkcyIsIm5hbWUiLCJsYWJlbCIsInR5cGUiLCJyZWxhdGlvblRvIiwicmVxdWlyZWQiLCJ1bmlxdWUiLCJkZWZhdWx0VmFsdWUiLCJob29rcyIsImJlZm9yZUNoYW5nZSIsImRhdGEiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/RefreshTokens.ts\n");

/***/ }),

/***/ "(rsc)/./src/collections/Users.ts":
/*!**********************************!*\
  !*** ./src/collections/Users.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Users: () => (/* binding */ Users)\n/* harmony export */ });\nconst Users = {\n    slug: 'users',\n    labels: {\n        singular: 'Пользователь',\n        plural: 'Пользователи'\n    },\n    auth: {\n        strategies: [\n            {\n                name: 'local'\n            },\n            {\n                name: 'google',\n                oauth: true,\n                credentials: {\n                    clientID: process.env.GOOGLE_CLIENT_ID ?? '',\n                    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''\n                },\n                authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',\n                tokenURL: 'https://oauth2.googleapis.com/token',\n                userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',\n                scope: [\n                    'openid',\n                    'email',\n                    'profile'\n                ],\n                mapUserInfo: ({ payload, userInfo })=>{\n                    const email = userInfo.email;\n                    const username = userInfo.name ?? userInfo.email?.split('@')[0] ?? 'user';\n                    return {\n                        email,\n                        username,\n                        isVerified: true\n                    };\n                }\n            }\n        ],\n        verify: true,\n        tokenExpiration: 15 * 60\n    },\n    admin: {\n        useAsTitle: 'username',\n        defaultColumns: [\n            'username',\n            'email',\n            'role'\n        ]\n    },\n    access: {\n        read: ({ req })=>!!req.user && (req.user.id === req.id || req.user.role === 'admin'),\n        update: ({ req, id })=>!!req.user && (req.user.id === id || req.user.role === 'admin'),\n        delete: ({ req, id })=>!!req.user && req.user.role === 'admin' && req.user.id !== id\n    },\n    fields: [\n        {\n            name: 'username',\n            label: 'Никнейм',\n            type: 'text',\n            required: true,\n            unique: true\n        },\n        {\n            name: 'email',\n            label: 'E-mail',\n            type: 'email',\n            required: true,\n            unique: true\n        },\n        {\n            name: 'bio',\n            label: 'О себе',\n            type: 'textarea'\n        },\n        {\n            name: 'avatar',\n            label: 'Аватар',\n            type: 'upload',\n            relationTo: 'media'\n        },\n        {\n            name: 'role',\n            label: 'Роль',\n            type: 'select',\n            defaultValue: 'user',\n            options: [\n                {\n                    label: 'Пользователь',\n                    value: 'user'\n                },\n                {\n                    label: 'Администратор',\n                    value: 'admin'\n                }\n            ],\n            required: true\n        },\n        {\n            name: 'isVerified',\n            label: 'Подтверждён',\n            type: 'checkbox',\n            defaultValue: false\n        },\n        {\n            name: 'isProfilePublic',\n            label: 'Профиль публичный',\n            type: 'checkbox',\n            defaultValue: true\n        }\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvY29sbGVjdGlvbnMvVXNlcnMudHMiLCJtYXBwaW5ncyI6Ijs7OztBQUVPLE1BQU1BLFFBQTBCO0lBQ3JDQyxNQUFNO0lBQ05DLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7SUFDQUMsTUFBTTtRQUNKQyxZQUFZO1lBQ1Y7Z0JBQ0VDLE1BQU07WUFDUjtZQUNBO2dCQUNFQSxNQUFNO2dCQUNOQyxPQUFPO2dCQUNQQyxhQUFhO29CQUNYQyxVQUFVQyxRQUFRQyxHQUFHLENBQUNDLGdCQUFnQixJQUFJO29CQUMxQ0MsY0FBY0gsUUFBUUMsR0FBRyxDQUFDRyxvQkFBb0IsSUFBSTtnQkFDcEQ7Z0JBQ0FDLGtCQUFrQjtnQkFDbEJDLFVBQVU7Z0JBQ1ZDLGFBQWE7Z0JBQ2JDLE9BQU87b0JBQUM7b0JBQVU7b0JBQVM7aUJBQVU7Z0JBQ3JDQyxhQUFhLENBQUMsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUU7b0JBQ2pDLE1BQU1DLFFBQVFELFNBQVNDLEtBQUs7b0JBQzVCLE1BQU1DLFdBQ0osU0FBVWpCLElBQUksSUFDYmUsU0FBU0MsS0FBSyxFQUF5QkUsTUFBTSxJQUFJLENBQUMsRUFBRSxJQUNyRDtvQkFFRixPQUFPO3dCQUNMRjt3QkFDQUM7d0JBQ0FFLFlBQVk7b0JBQ2Q7Z0JBQ0Y7WUFDRjtTQUNEO1FBQ0RDLFFBQVE7UUFDUkMsaUJBQWlCLEtBQUs7SUFDeEI7SUFDQUMsT0FBTztRQUNMQyxZQUFZO1FBQ1pDLGdCQUFnQjtZQUFDO1lBQVk7WUFBUztTQUFPO0lBQy9DO0lBQ0FDLFFBQVE7UUFDTkMsTUFBTSxDQUFDLEVBQUVDLEdBQUcsRUFBRSxHQUFLLENBQUMsQ0FBQ0EsSUFBSUMsSUFBSSxJQUFLRCxDQUFBQSxJQUFJQyxJQUFJLENBQUNDLEVBQUUsS0FBS0YsSUFBSUUsRUFBRSxJQUFJRixJQUFJQyxJQUFJLENBQUNFLElBQUksS0FBSyxPQUFNO1FBQ3BGQyxRQUFRLENBQUMsRUFBRUosR0FBRyxFQUFFRSxFQUFFLEVBQUUsR0FBSyxDQUFDLENBQUNGLElBQUlDLElBQUksSUFBS0QsQ0FBQUEsSUFBSUMsSUFBSSxDQUFDQyxFQUFFLEtBQUtBLE1BQU1GLElBQUlDLElBQUksQ0FBQ0UsSUFBSSxLQUFLLE9BQU07UUFDdEZFLFFBQVEsQ0FBQyxFQUFFTCxHQUFHLEVBQUVFLEVBQUUsRUFBRSxHQUFLLENBQUMsQ0FBQ0YsSUFBSUMsSUFBSSxJQUFJRCxJQUFJQyxJQUFJLENBQUNFLElBQUksS0FBSyxXQUFXSCxJQUFJQyxJQUFJLENBQUNDLEVBQUUsS0FBS0E7SUFDdEY7SUFDQUksUUFBUTtRQUNOO1lBQ0VqQyxNQUFNO1lBQ05rQyxPQUFPO1lBQ1BDLE1BQU07WUFDTkMsVUFBVTtZQUNWQyxRQUFRO1FBQ1Y7UUFDQTtZQUNFckMsTUFBTTtZQUNOa0MsT0FBTztZQUNQQyxNQUFNO1lBQ05DLFVBQVU7WUFDVkMsUUFBUTtRQUNWO1FBQ0E7WUFDRXJDLE1BQU07WUFDTmtDLE9BQU87WUFDUEMsTUFBTTtRQUNSO1FBQ0E7WUFDRW5DLE1BQU07WUFDTmtDLE9BQU87WUFDUEMsTUFBTTtZQUNORyxZQUFZO1FBQ2Q7UUFDQTtZQUNFdEMsTUFBTTtZQUNOa0MsT0FBTztZQUNQQyxNQUFNO1lBQ05JLGNBQWM7WUFDZEMsU0FBUztnQkFDUDtvQkFBRU4sT0FBTztvQkFBZ0JPLE9BQU87Z0JBQU87Z0JBQ3ZDO29CQUFFUCxPQUFPO29CQUFpQk8sT0FBTztnQkFBUTthQUMxQztZQUNETCxVQUFVO1FBQ1o7UUFDQTtZQUNFcEMsTUFBTTtZQUNOa0MsT0FBTztZQUNQQyxNQUFNO1lBQ05JLGNBQWM7UUFDaEI7UUFDQTtZQUNFdkMsTUFBTTtZQUNOa0MsT0FBTztZQUNQQyxNQUFNO1lBQ05JLGNBQWM7UUFDaEI7S0FDRDtBQUNILEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvY29sbGVjdGlvbnMvVXNlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGNvbnN0IFVzZXJzOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICBzbHVnOiAndXNlcnMnLFxuICBsYWJlbHM6IHtcbiAgICBzaW5ndWxhcjogJ9Cf0L7Qu9GM0LfQvtCy0LDRgtC10LvRjCcsXG4gICAgcGx1cmFsOiAn0J/QvtC70YzQt9C+0LLQsNGC0LXQu9C4JyxcbiAgfSxcbiAgYXV0aDoge1xuICAgIHN0cmF0ZWdpZXM6IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2xvY2FsJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdnb29nbGUnLFxuICAgICAgICBvYXV0aDogdHJ1ZSxcbiAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICBjbGllbnRJRDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCA/PyAnJyxcbiAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUID8/ICcnLFxuICAgICAgICB9LFxuICAgICAgICBhdXRob3JpemF0aW9uVVJMOiAnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL3YyL2F1dGgnLFxuICAgICAgICB0b2tlblVSTDogJ2h0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuJyxcbiAgICAgICAgdXNlckluZm9VUkw6ICdodHRwczovL29wZW5pZGNvbm5lY3QuZ29vZ2xlYXBpcy5jb20vdjEvdXNlcmluZm8nLFxuICAgICAgICBzY29wZTogWydvcGVuaWQnLCAnZW1haWwnLCAncHJvZmlsZSddLFxuICAgICAgICBtYXBVc2VySW5mbzogKHsgcGF5bG9hZCwgdXNlckluZm8gfSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVtYWlsID0gdXNlckluZm8uZW1haWwgYXMgc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICAgICAgY29uc3QgdXNlcm5hbWUgPVxuICAgICAgICAgICAgKHVzZXJJbmZvLm5hbWUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSA/P1xuICAgICAgICAgICAgKHVzZXJJbmZvLmVtYWlsIGFzIHN0cmluZyB8IHVuZGVmaW5lZCk/LnNwbGl0KCdAJylbMF0gPz9cbiAgICAgICAgICAgICd1c2VyJ1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVtYWlsLFxuICAgICAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgICAgICBpc1ZlcmlmaWVkOiB0cnVlLFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICB2ZXJpZnk6IHRydWUsXG4gICAgdG9rZW5FeHBpcmF0aW9uOiAxNSAqIDYwLFxuICB9LFxuICBhZG1pbjoge1xuICAgIHVzZUFzVGl0bGU6ICd1c2VybmFtZScsXG4gICAgZGVmYXVsdENvbHVtbnM6IFsndXNlcm5hbWUnLCAnZW1haWwnLCAncm9sZSddLFxuICB9LFxuICBhY2Nlc3M6IHtcbiAgICByZWFkOiAoeyByZXEgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIuaWQgPT09IHJlcS5pZCB8fCByZXEudXNlci5yb2xlID09PSAnYWRtaW4nKSxcbiAgICB1cGRhdGU6ICh7IHJlcSwgaWQgfSkgPT4gISFyZXEudXNlciAmJiAocmVxLnVzZXIuaWQgPT09IGlkIHx8IHJlcS51c2VyLnJvbGUgPT09ICdhZG1pbicpLFxuICAgIGRlbGV0ZTogKHsgcmVxLCBpZCB9KSA9PiAhIXJlcS51c2VyICYmIHJlcS51c2VyLnJvbGUgPT09ICdhZG1pbicgJiYgcmVxLnVzZXIuaWQgIT09IGlkLFxuICB9LFxuICBmaWVsZHM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAndXNlcm5hbWUnLFxuICAgICAgbGFiZWw6ICfQndC40LrQvdC10LnQvCcsXG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIHVuaXF1ZTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdlbWFpbCcsXG4gICAgICBsYWJlbDogJ0UtbWFpbCcsXG4gICAgICB0eXBlOiAnZW1haWwnLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICB1bmlxdWU6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnYmlvJyxcbiAgICAgIGxhYmVsOiAn0J4g0YHQtdCx0LUnLFxuICAgICAgdHlwZTogJ3RleHRhcmVhJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdhdmF0YXInLFxuICAgICAgbGFiZWw6ICfQkNCy0LDRgtCw0YAnLFxuICAgICAgdHlwZTogJ3VwbG9hZCcsXG4gICAgICByZWxhdGlvblRvOiAnbWVkaWEnLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3JvbGUnLFxuICAgICAgbGFiZWw6ICfQoNC+0LvRjCcsXG4gICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogJ3VzZXInLFxuICAgICAgb3B0aW9uczogW1xuICAgICAgICB7IGxhYmVsOiAn0J/QvtC70YzQt9C+0LLQsNGC0LXQu9GMJywgdmFsdWU6ICd1c2VyJyB9LFxuICAgICAgICB7IGxhYmVsOiAn0JDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YAnLCB2YWx1ZTogJ2FkbWluJyB9LFxuICAgICAgXSxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2lzVmVyaWZpZWQnLFxuICAgICAgbGFiZWw6ICfQn9C+0LTRgtCy0LXRgNC20LTRkdC9JyxcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2lzUHJvZmlsZVB1YmxpYycsXG4gICAgICBsYWJlbDogJ9Cf0YDQvtGE0LjQu9GMINC/0YPQsdC70LjRh9C90YvQuScsXG4gICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG4iXSwibmFtZXMiOlsiVXNlcnMiLCJzbHVnIiwibGFiZWxzIiwic2luZ3VsYXIiLCJwbHVyYWwiLCJhdXRoIiwic3RyYXRlZ2llcyIsIm5hbWUiLCJvYXV0aCIsImNyZWRlbnRpYWxzIiwiY2xpZW50SUQiLCJwcm9jZXNzIiwiZW52IiwiR09PR0xFX0NMSUVOVF9JRCIsImNsaWVudFNlY3JldCIsIkdPT0dMRV9DTElFTlRfU0VDUkVUIiwiYXV0aG9yaXphdGlvblVSTCIsInRva2VuVVJMIiwidXNlckluZm9VUkwiLCJzY29wZSIsIm1hcFVzZXJJbmZvIiwicGF5bG9hZCIsInVzZXJJbmZvIiwiZW1haWwiLCJ1c2VybmFtZSIsInNwbGl0IiwiaXNWZXJpZmllZCIsInZlcmlmeSIsInRva2VuRXhwaXJhdGlvbiIsImFkbWluIiwidXNlQXNUaXRsZSIsImRlZmF1bHRDb2x1bW5zIiwiYWNjZXNzIiwicmVhZCIsInJlcSIsInVzZXIiLCJpZCIsInJvbGUiLCJ1cGRhdGUiLCJkZWxldGUiLCJmaWVsZHMiLCJsYWJlbCIsInR5cGUiLCJyZXF1aXJlZCIsInVuaXF1ZSIsInJlbGF0aW9uVG8iLCJkZWZhdWx0VmFsdWUiLCJvcHRpb25zIiwidmFsdWUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/collections/Users.ts\n");

/***/ }),

/***/ "(rsc)/./src/utils/slugify.ts":
/*!******************************!*\
  !*** ./src/utils/slugify.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   slugify: () => (/* binding */ slugify)\n/* harmony export */ });\nfunction slugify(input) {\n    return input.toString().trim().toLowerCase().replace(/[^a-z0-9а-яё\\s-]/g, '').replace(/\\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvdXRpbHMvc2x1Z2lmeS50cyIsIm1hcHBpbmdzIjoiOzs7O0FBQU8sU0FBU0EsUUFBUUMsS0FBYTtJQUNuQyxPQUFPQSxNQUNKQyxRQUFRLEdBQ1JDLElBQUksR0FDSkMsV0FBVyxHQUNYQyxPQUFPLENBQUMscUJBQXFCLElBQzdCQSxPQUFPLENBQUMsUUFBUSxLQUNoQkEsT0FBTyxDQUFDLE9BQU8sS0FDZkEsT0FBTyxDQUFDLFVBQVU7QUFDdkIiLCJzb3VyY2VzIjpbIi9Vc2Vycy96aW1iYXpvL1dlYnN0b3JtUHJvamVjdHMvQWV0aGVyaXMgc2hhZGNuL3BheWxvYWQtYmFja2VuZC9zcmMvdXRpbHMvc2x1Z2lmeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gc2x1Z2lmeShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0XG4gICAgLnRvU3RyaW5nKClcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTnQsC3Rj9GRXFxzLV0vZywgJycpXG4gICAgLnJlcGxhY2UoL1xccysvZywgJy0nKVxuICAgIC5yZXBsYWNlKC8tKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tfC0kL2csICcnKVxufVxuIl0sIm5hbWVzIjpbInNsdWdpZnkiLCJpbnB1dCIsInRvU3RyaW5nIiwidHJpbSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/utils/slugify.ts\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fnode_modules%2F%40payloadcms%2Fnext%2Fdist%2Fprod%2Fstyles.css%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fnode_modules%2F%40payloadcms%2Fnext%2Fdist%2Fprod%2Fstyles.css%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "./work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "?32c4":
/*!****************************!*\
  !*** bufferutil (ignored) ***!
  \****************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?66e9":
/*!********************************!*\
  !*** utf-8-validate (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "@libsql/client":
/*!*********************************!*\
  !*** external "@libsql/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = import("@libsql/client");;

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "dns":
/*!**********************!*\
  !*** external "dns" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("dns");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs/promises");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "module":
/*!*************************!*\
  !*** external "module" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("module");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/@vercel/og/index.node.js":
/*!**************************************************************!*\
  !*** external "next/dist/compiled/@vercel/og/index.node.js" ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("next/dist/compiled/@vercel/og/index.node.js");;

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "next/dist/shared/lib/no-fallback-error.external":
/*!******************************************************************!*\
  !*** external "next/dist/shared/lib/no-fallback-error.external" ***!
  \******************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/no-fallback-error.external");

/***/ }),

/***/ "next/dist/shared/lib/router/utils/app-paths":
/*!**************************************************************!*\
  !*** external "next/dist/shared/lib/router/utils/app-paths" ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/app-paths");

/***/ }),

/***/ "node:assert":
/*!******************************!*\
  !*** external "node:assert" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:assert");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:console":
/*!*******************************!*\
  !*** external "node:console" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:console");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ }),

/***/ "node:diagnostics_channel":
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ "node:dns":
/*!***************************!*\
  !*** external "node:dns" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:dns");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ "node:fs/promises":
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs/promises");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:http2":
/*!*****************************!*\
  !*** external "node:http2" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http2");

/***/ }),

/***/ "node:module":
/*!******************************!*\
  !*** external "node:module" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:module");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:os":
/*!**************************!*\
  !*** external "node:os" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:os");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:perf_hooks":
/*!**********************************!*\
  !*** external "node:perf_hooks" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:perf_hooks");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "node:querystring":
/*!***********************************!*\
  !*** external "node:querystring" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:querystring");

/***/ }),

/***/ "node:sqlite":
/*!******************************!*\
  !*** external "node:sqlite" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:sqlite");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/web");

/***/ }),

/***/ "node:tls":
/*!***************************!*\
  !*** external "node:tls" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:tls");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:util/types":
/*!**********************************!*\
  !*** external "node:util/types" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util/types");

/***/ }),

/***/ "node:worker_threads":
/*!**************************************!*\
  !*** external "node:worker_threads" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:worker_threads");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "pino":
/*!***********************!*\
  !*** external "pino" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("pino");

/***/ }),

/***/ "pino-pretty":
/*!******************************!*\
  !*** external "pino-pretty" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("pino-pretty");

/***/ }),

/***/ "readline":
/*!***************************!*\
  !*** external "readline" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("readline");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/date-fns","vendor-chunks/@payloadcms","vendor-chunks/next","vendor-chunks/payload","vendor-chunks/undici","vendor-chunks/ajv","vendor-chunks/drizzle-orm","vendor-chunks/prompts","vendor-chunks/ws","vendor-chunks/image-size","vendor-chunks/qs-esm","vendor-chunks/jose","vendor-chunks/fast-uri","vendor-chunks/busboy","vendor-chunks/file-type","vendor-chunks/ipaddr.js","vendor-chunks/console-table-printer","vendor-chunks/pluralize","vendor-chunks/http-status","vendor-chunks/bson-objectid","vendor-chunks/croner","vendor-chunks/path-to-regexp","vendor-chunks/dotenv","vendor-chunks/dataloader","vendor-chunks/strtok3","vendor-chunks/simple-wcswidth","vendor-chunks/token-types","vendor-chunks/streamsearch","vendor-chunks/uint8array-extras","vendor-chunks/ci-info","vendor-chunks/peek-readable","vendor-chunks/@borewit","vendor-chunks/json-schema-traverse","vendor-chunks/deepmerge","vendor-chunks/dequal","vendor-chunks/uuid","vendor-chunks/kleur","vendor-chunks/fast-deep-equal","vendor-chunks/ieee754","vendor-chunks/resolve-pkg-maps","vendor-chunks/sanitize-filename","vendor-chunks/sisteransi","vendor-chunks/to-no-case","vendor-chunks/scmp","vendor-chunks/truncate-utf8-bytes","vendor-chunks/to-space-case","vendor-chunks/to-snake-case"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&page=%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2F(payload)%2Fapi%2F%5B...slug%5D%2Froute.ts&appDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fzimbazo%2FWebstormProjects%2FAetheris%20shadcn%2Fpayload-backend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!")));
module.exports = __webpack_exports__;

})();