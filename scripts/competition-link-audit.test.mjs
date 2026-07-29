import assert from 'node:assert/strict';
import test from 'node:test';
import {
  determineExitCode,
  isPrivateOrReservedAddress,
  parseArgs,
  validateNetworkTarget,
  validateUrlSyntax,
} from './competition-link-audit.mjs';

test('rejects non-http protocols, embedded credentials, local hosts, and nonstandard ports', () => {
  assert.throws(() => validateUrlSyntax('file:///etc/passwd'), /unsupported_protocol/);
  assert.throws(() => validateUrlSyntax('https://user:pass@example.com/'), /embedded_credentials/);
  assert.throws(() => validateUrlSyntax('http://localhost/'), /local_hostname/);
  assert.throws(() => validateUrlSyntax('https://service.internal/'), /local_hostname/);
  assert.throws(() => validateUrlSyntax('https://example.com:8443/'), /nonstandard_port/);
});

test('rejects private and reserved literal addresses', () => {
  for (const address of [
    '0.0.0.0',
    '10.1.2.3',
    '100.64.1.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '198.51.100.5',
    '203.0.113.9',
    '::',
    '::1',
    '::ffff:192.168.1.1',
    '::ffff:c0a8:1',
    'fc00::1',
    'fe80::1',
    '2001:db8::1',
  ]) {
    assert.equal(isPrivateOrReservedAddress(address), true, address);
  }
  assert.equal(isPrivateOrReservedAddress('8.8.8.8'), false);
  assert.equal(isPrivateOrReservedAddress('2606:4700:4700::1111'), false);
  assert.equal(validateUrlSyntax('https://[2606:4700:4700::1111]/').hostname, '[2606:4700:4700::1111]');
});

test('rejects a public-looking hostname when any DNS answer is private', async () => {
  const fakeLookup = async () => [
    { address: '93.184.216.34', family: 4 },
    { address: '10.0.0.8', family: 4 },
  ];
  await assert.rejects(
    validateNetworkTarget('https://example.com/', fakeLookup),
    /dns_resolves_private_or_reserved/,
  );
});

test('parses bounded audit options', () => {
  const options = parseArgs([
    '--dry-run',
    '--id', 'example',
    '--limit', '5',
    '--concurrency', '2',
    '--timeout-ms', '2500',
    '--max-bytes', '4096',
    '--max-redirects', '0',
    '--fail-on-dead',
  ]);
  assert.equal(options.dryRun, true);
  assert.deepEqual(options.ids, ['example']);
  assert.equal(options.limit, 5);
  assert.equal(options.concurrency, 2);
  assert.equal(options.timeoutMs, 2500);
  assert.equal(options.maxBytes, 4096);
  assert.equal(options.maxRedirects, 0);
  assert.equal(options.failOnDead, true);
});

test('returns non-zero for systemic uncertainty, no reachable evidence, and unsafe targets', () => {
  assert.equal(determineExitCode([{ status: 'ok' }, { status: 'uncertain' }], {}), 3);
  assert.equal(determineExitCode([{ status: 'dead' }], {}), 3);
  assert.equal(determineExitCode([
    { status: 'ok' },
    { status: 'uncertain', reason: 'unsafe_target_private_or_reserved_address' },
  ], {}), 2);
  assert.equal(determineExitCode([{ status: 'ok' }, { status: 'dead' }], { failOnDead: true }), 1);
  assert.equal(determineExitCode([{ status: 'ok' }, { status: 'dead' }], { failOnDead: false }), 0);
});
