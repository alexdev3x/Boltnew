import { vitePlugin as remixVitePlugin } from '@remix-run/dev';
import { createReadableStreamFromReadable, createRequestHandler, writeReadableStreamToWritable } from '@remix-run/node';
import UnoCSS from 'unocss/vite';
import { defineConfig, type Connect, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((config) => {
  return {
    build: {
      target: 'esnext',
    },
    ssr: {
      // During local dev the Remix app runs on Node instead of workerd.
      // `entry.server.tsx` imports `renderToReadableStream`, which only exists in
      // the browser/edge build of `react-dom/server`. Resolving externalized
      // dependencies with the `worker`/`browser` conditions makes Node pick that
      // build (matching the production Cloudflare runtime) while still importing
      // it natively so its named exports are detected correctly.
      resolve: {
        externalConditions: ['worker', 'browser', 'module', 'node', 'default'],
      },
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      config.mode !== 'test' && nodeDevContextPlugin(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      UnoCSS(),
      tsconfigPaths({ ignoreConfigErrors: true }),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
  };
});

/**
 * Runs the Remix app on Node during local development and provides the same
 * `context.cloudflare.env` shape the app expects in production on Cloudflare.
 *
 * This replaces `@remix-run/dev`'s `cloudflareDevProxyVitePlugin`, which boots a
 * workerd/miniflare runtime that cannot start in this sandbox. Environment
 * variables (e.g. ANTHROPIC_API_KEY) are read from `process.env`.
 */
function nodeDevContextPlugin() {
  const serverBuildId = 'virtual:remix/server-build';

  return {
    name: 'node-dev-context',
    configureServer(viteDevServer: ViteDevServer) {
      const loadContext = {
        cloudflare: {
          env: process.env,
        },
      };

      return () => {
        if (viteDevServer.config.server.middlewareMode) {
          return;
        }

        viteDevServer.middlewares.use(async (nodeReq, nodeRes, next) => {
          try {
            const build = await viteDevServer.ssrLoadModule(serverBuildId);
            const handler = createRequestHandler(build as any, 'development');
            const request = toWebRequest(nodeReq, nodeRes);
            const response = await handler(request, loadContext as any);
            await sendWebResponse(nodeRes, response);
          } catch (error) {
            // The client aborting mid-stream surfaces here as a closed
            // controller/premature-close; that is expected and not an app error.
            if (isAbortError(error)) {
              return;
            }

            next(error);
          }
        });
      };
    },
  };
}

function toWebRequest(nodeReq: Connect.IncomingMessage, nodeRes: any): Request {
  const origin =
    nodeReq.headers['x-forwarded-proto'] || (nodeReq.socket && (nodeReq.socket as any).encrypted ? 'https' : 'http');
  const host = nodeReq.headers['x-forwarded-host'] ?? nodeReq.headers.host;
  const url = new URL((nodeReq as any).originalUrl || nodeReq.url || '/', `${origin}://${host}`);

  const controller = new AbortController();
  nodeRes.on('close', () => controller.abort());

  const headers = new Headers();

  for (const [key, value] of Object.entries(nodeReq.headers)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else {
      headers.set(key, value);
    }
  }

  const init: RequestInit = {
    method: nodeReq.method,
    headers,
    signal: controller.signal,
  };

  if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
    init.body = createReadableStreamFromReadable(nodeReq);
    (init as any).duplex = 'half';
  }

  return new Request(url.href, init);
}

async function sendWebResponse(nodeRes: any, response: Response): Promise<void> {
  nodeRes.statusCode = response.status;
  nodeRes.statusMessage = response.statusText;

  for (const [key, value] of response.headers.entries()) {
    nodeRes.setHeader(key, value);
  }

  const setCookie = (response.headers as any).getSetCookie?.();

  if (Array.isArray(setCookie) && setCookie.length > 0) {
    nodeRes.setHeader('set-cookie', setCookie);
  }

  if (response.body) {
    await writeReadableStreamToWritable(response.body, nodeRes);
  } else {
    nodeRes.end();
  }
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === 'AbortError' ||
    (error as NodeJS.ErrnoException).code === 'ERR_INVALID_STATE' ||
    (error as NodeJS.ErrnoException).code === 'ERR_STREAM_PREMATURE_CLOSE' ||
    error.message.includes('Controller is already closed')
  );
}

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}
