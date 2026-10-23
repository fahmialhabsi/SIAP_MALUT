import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alamatLan } from './alamat-lan.mjs';

const ipv4 = (address, internal = false) => ({ family: 'IPv4', address, internal });

test('KB-040: alamat Wi-Fi fisik didahulukan, adaptor virtual setelahnya', () => {
  const hasil = alamatLan({
    'vEthernet (WSL)': [ipv4('192.168.224.1')],
    'ZeroTier One': [ipv4('10.80.220.249')],
    'Wi-Fi': [ipv4('192.168.1.63')],
  });
  assert.equal(hasil[0].alamat, '192.168.1.63');
  assert.equal(hasil[0].kemungkinanFisik, true);
  assert.equal(hasil.length, 3);
});

test('KB-040: loopback, IPv6, dan alamat non-pribadi diabaikan', () => {
  const hasil = alamatLan({
    lo: [ipv4('127.0.0.1', true)],
    Wi: [{ family: 'IPv6', address: 'fe80::1', internal: false }, ipv4('8.8.8.8')],
  });
  assert.deepEqual(hasil, []);
});
