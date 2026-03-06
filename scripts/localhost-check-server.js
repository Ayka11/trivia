const http = require('node:http');
const { URL } = require('node:url');
const { runHighValueChecks } = require('./check-utils');

const port = Number(process.env.CHECK_PORT || 8787);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);

  if (url.pathname === '/health') {
    return sendJson(res, 200, { ok: true, service: 'high-value-checks', port });
  }

  if (url.pathname === '/check') {
    const uid = url.searchParams.get('uid');
    const sessionId = url.searchParams.get('sessionId');

    if (!uid) {
      return sendJson(res, 400, {
        ok: false,
        error: 'Missing uid query param',
        example: `http://localhost:${port}/check?uid=USER_UID&sessionId=OPTIONAL_SESSION_ID`,
      });
    }

    try {
      const report = await runHighValueChecks({ uid, sessionId });
      return sendJson(res, report.ok ? 200 : 409, report);
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message });
    }
  }

  return sendJson(res, 404, {
    ok: false,
    routes: [`http://localhost:${port}/health`, `http://localhost:${port}/check?uid=USER_UID`],
  });
});

server.listen(port, () => {
  console.log(`Check server listening: http://localhost:${port}`);
});
